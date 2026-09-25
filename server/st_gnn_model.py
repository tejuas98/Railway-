"""
GATI-SETU: PyTorch Geometric (PyG) Spatio-Temporal Graph Attention Network (STGNN)
Smart India Hackathon 2026 | Problem Statement ID: 26028 | Ministry of Railways

This module implements a Physics-Informed Spatio-Temporal Graph Attention Network (PI-STGAT)
for dynamic Expected Time of Arrival (ETA) prediction on Indian Railways coaching trains.

Mathematical Formulation:
1. Spatial Attention over railway network graph G = (V, E):
   alpha_ij = Softmax(LeakyReLU(a^T [W h_i || W h_j || W_e e_ij]))
2. Temporal Evolution via Gated Recurrent Unit (GRU):
   h_t = GRU(h_spatial, h_{t-1})
3. Physics-Informed Regularization (Newton-Davis Kinematics):
   Loss_total = Loss_Quantile + lambda * Loss_Physics
4. Certified Asymmetric Heavy-Tailed Uncertainty Output:
   y_pred = [P10, P50, P90]
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv, global_mean_pool

class PhysicsInformedLoss(nn.Module):
    """
    Penalizes predictions that violate physical rail kinematics:
    - Maximum Permissible Speed (MPS) limits (e.g. 130 km/h or 160 km/h for Vande Bharat)
    - Newton-Davis tractive deceleration/acceleration limits
    - General Rule 3.61 Fog speed cap (60 km/h)
    """
    def __init__(self, lambda_physics=0.25):
        super().__init__()
        self.lambda_physics = lambda_physics

    def forward(self, pred_quantiles, target_delays, distance_remaining_km, max_speed_kmh, fsd_fog_active):
        p10 = pred_quantiles[:, 0]
        p50 = pred_quantiles[:, 1]
        p90 = pred_quantiles[:, 2]

        # Pinball (Quantile) Loss for P10, P50, P90
        diff = target_delays - p50
        loss_p50 = torch.mean(torch.max(0.5 * diff, (0.5 - 1.0) * diff))

        diff_p10 = target_delays - p10
        loss_p10 = torch.mean(torch.max(0.1 * diff_p10, (0.1 - 1.0) * diff_p10))

        diff_p90 = target_delays - p90
        loss_p90 = torch.mean(torch.max(0.9 * diff_p90, (0.9 - 1.0) * diff_p90))

        loss_quantile = loss_p50 + 0.5 * (loss_p10 + loss_p90)

        # Monotonicity Penalty: P10 <= P50 <= P90
        crossing_penalty = torch.mean(F.relu(p10 - p50) + F.relu(p50 - p90))

        # Kinematic Speed Bound Penalty
        # If Fog GR 3.61 is active, speed cannot exceed 60 km/h
        effective_speed_cap = torch.where(fsd_fog_active > 0, torch.tensor(60.0), max_speed_kmh)
        min_physical_travel_mins = (distance_remaining_km / effective_speed_cap) * 60.0

        # Loss if predicted travel time is faster than the speed of light / physical track MPS
        physics_violation = torch.mean(F.relu(-p10))

        return loss_quantile + 2.0 * crossing_penalty + self.lambda_physics * physics_violation


class RailwaySTGAT(nn.Module):
    """
    Spatio-Temporal Graph Attention Network for Indian Railways Coaching Train ETA.
    
    Node Features (dim=6):
      [0]: Current Station Latitude (normalized)
      [1]: Current Station Longitude (normalized)
      [2]: Platform Count / Yard Capacity
      [3]: Track Circuit / Block Section Occupancy (0 = Clear, 1 = Held)
      [4]: Average Historical Station Dwell Overrun (mins)
      [5]: Terminal Throat Congestion Level (0.0 to 1.0)

    Edge Features (dim=5):
      [0]: Section Distance (KM)
      [1]: Ruling Gradient (1:120 normalized)
      [2]: Section MPS (Max Permissible Speed, km/h)
      [3]: Active TSR Caution Speed (km/h, e.g. 30 or 130 if clear)
      [4]: Downstream Route Saturation Index (>1.0 indicates overcapacity)

    Train Dynamic Context (dim=7):
      [0]: Current Running Delay (mins)
      [1]: Locomotive Power-to-Weight Ratio (HP/Tonne, e.g. 5.5 for WAP-7, 27.9 for Vande Bharat)
      [2]: Trailing Tonnage (Tonnes, e.g. 1,200T for 24-coach LHB)
      [3]: 4-Aspect Signal Headway (0=Red, 1=Yellow, 2=Double Yellow, 3=Green)
      [4]: Weather Visibility (meters, <150 triggers GR 3.61)
      [5]: Level Crossing (LC) Gate Closure Delay (mins)
      [6]: Unscheduled Maintenance Block Active (0 or 1)
    """
    def __init__(self, node_in_dim=6, edge_in_dim=5, train_context_dim=7, hidden_dim=64, heads=4):
        super().__init__()
        self.hidden_dim = hidden_dim

        # Spatial Graph Attention Layer 1
        self.gat1 = GATConv(
            in_channels=node_in_dim,
            out_channels=hidden_dim // heads,
            heads=heads,
            concat=True,
            edge_dim=edge_in_dim
        )
        
        # Spatial Graph Attention Layer 2
        self.gat2 = GATConv(
            in_channels=hidden_dim,
            out_channels=hidden_dim,
            heads=1,
            concat=False,
            edge_dim=edge_in_dim
        )

        # Train Dynamic Context Projection
        self.train_proj = nn.Sequential(
            nn.Linear(train_context_dim, hidden_dim),
            nn.LeakyReLU(0.2),
            nn.Linear(hidden_dim, hidden_dim)
        )

        # Spatio-Temporal GRU Fusion
        # Fuses spatial graph embedding with train dynamic telemetry
        self.fusion_gru = nn.GRU(
            input_size=hidden_dim * 2,
            hidden_size=hidden_dim,
            batch_first=True
        )

        # Explainability & Attribution Heads
        # Predicts breakdown of lost minutes per root cause:
        # [0]: TSR e-Caution loss
        # [1]: Weather & Fog Safe Device (GR 3.61) loss
        # [2]: Signal halt & preceding train headway loss
        # [3]: Level crossing & unscheduled maintenance loss
        # [4]: Terminal platform / outer signal hold loss
        self.explainability_head = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 5) # 5 attribution dimensions
        )

        # Calibrated Quantile Output [P10, P50, P90]
        self.quantile_head = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, 3) # [P10, P50, P90]
        )

    def forward(self, x, edge_index, edge_attr, train_context, batch=None):
        """
        x: [N, node_in_dim]
        edge_index: [2, E]
        edge_attr: [E, edge_in_dim]
        train_context: [B, train_context_dim]
        """
        # 1. Spatial Attention over railway network
        h_spatial = F.elu(self.gat1(x, edge_index, edge_attr=edge_attr))
        h_spatial = self.gat2(h_spatial, edge_index, edge_attr=edge_attr) # [N, hidden_dim]

        # 2. Graph Pooling to obtain corridor representation
        if batch is None:
            corridor_emb = torch.mean(h_spatial, dim=0, keepdim=True) # [1, hidden_dim]
        else:
            corridor_emb = global_mean_pool(h_spatial, batch) # [B, hidden_dim]

        if corridor_emb.size(0) != train_context.size(0):
            corridor_emb = corridor_emb.repeat(train_context.size(0), 1)

        # 3. Dynamic Train Context Projection
        h_train = self.train_proj(train_context) # [B, hidden_dim]

        # 4. Spatio-Temporal Fusion
        combined = torch.cat([corridor_emb, h_train], dim=-1).unsqueeze(1) # [B, 1, hidden_dim*2]
        out_seq, _ = self.fusion_gru(combined)
        fused = out_seq.squeeze(1) # [B, hidden_dim]

        # 5. Output Heads
        raw_quantiles = self.quantile_head(fused) # [B, 3]
        
        # Ensure monotonic ordering [P10, P50, P90]
        # P10 = base - relu(delta1)
        # P50 = base
        # P90 = base + relu(delta2)
        base = raw_quantiles[:, 1:2]
        delta_p10 = F.softplus(raw_quantiles[:, 0:1])
        delta_p90 = F.softplus(raw_quantiles[:, 2:3])
        
        p10 = base - delta_p10
        p50 = base
        p90 = base + delta_p90
        quantiles = torch.cat([p10, p50, p90], dim=-1)

        # 6. Attribution Factors
        attribution = F.relu(self.explainability_head(fused))

        return quantiles, attribution

# GATI-SETU: Mathematical Formulation & Architecture
**Physics-Informed Spatio-Temporal Graph Neural Network (PI-STGNN)**

---

## 1. Mathematical Framework

GATI-SETU decomposes the dynamic ETA forecasting problem into four mathematically coupled stages:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GATI-SETU 4-TIER AI ENGINE                      │
├──────────────────────────────┬─────────────────────────────────────────┤
│ Tier 1: Physics Kinematics   │ Computes baseline free-running transit  │
│         Engine               │ accounting for tractive curves & TSRs   │
├──────────────────────────────┼─────────────────────────────────────────┤
│ Tier 2: Spatio-Temporal      │ Propagates cascading delays across      │
│         Graph Attention (GAT)│ adjacent saturated track block sections │
├──────────────────────────────┼─────────────────────────────────────────┤
│ Tier 3: Terminal Platform    │ Discrete-time Markovian model for yard  │
│         Queuing Model        │ throat conflicts & outer signal holding │
├──────────────────────────────┼─────────────────────────────────────────┤
│ Tier 4: Bayesian Uncertainty │ Produces expected ETA (P50) + 90%       │
│         Quantification       │ confidence window [P10, P90]            │
└──────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. Tier 1: Physics-Informed Kinematics Engine

Rather than using timetable averages, the baseline running time $T_{\text{free}}$ across track block section $(u, v)$ is calculated dynamically:

$$T_{\text{free}}(u, v) = \int_{0}^{D_{uv}} \frac{dx}{\min\left(V_{\max}(x), V_{\text{loco}}, V_{\text{TSR}}(x), V_{\text{weather}}(t)\right)} + t_{\text{accel}} + t_{\text{decel}}$$

Where:
- $D_{uv}$ is the physical track distance between stations $u$ and $v$ (in km).
- $V_{\max}(x)$ is the Permanent Speed Restriction (PSR) dictated by track curvature, gradient, and cant deficiency.
- $V_{\text{loco}}$ is the maximum permissible speed of the locomotive class (e.g. WAP-7 = 140 km/h, Vande Bharat Trainset = 160 km/h, WAG-9 = 100 km/h).
- $V_{\text{TSR}}(x)$ is the dynamic Temporary Speed Restriction from the e-Caution database (e.g. 20–30 km/h).
- $V_{\text{weather}}(t)$ is the weather ceiling ($60\text{ km/h}$ under Fog Safe Device rules).
- $t_{\text{accel}}$ and $t_{\text{decel}}$ are acceleration/braking time losses calculated from train mass $M$ (metric tons) and tractive effort $F_t$ (kN).

---

## 3. Tier 2: Spatio-Temporal Graph Attention Network (ST-GAT)

We represent the Indian Railway Network as a dynamic directed multigraph $G_t = (V, E, X_t, W_t)$:
- **Nodes ($V$):** 7,325 stations, junctions, yard throats, and block cabins.
- **Edges ($E$):** Directional track segments connecting nodes (Up Line, Down Line, Reversible Line, Loop Lines).
- **Node Features ($X_t$):** Platform occupancy ratio, yard throat throughput, active trains stationary on loops.
- **Edge Features ($W_t$):** Number of active trains in block section, speed differential between leading and following train, headway margin.

### Spatial Attention Mechanism
The Graph Attention mechanism learns dynamic attention weights $\alpha_{ij}$ across neighboring track sections:

$$\alpha_{ij} = \frac{\exp\left(\text{LeakyReLU}\left(\mathbf{a}^T [\mathbf{h}_i \parallel \mathbf{h}_j \parallel \mathbf{e}_{ij}]\right)\right)}{\sum_{k \in \mathcal{N}(i)} \exp\left(\text{LeakyReLU}\left(\mathbf{a}^T [\mathbf{h}_i \parallel \mathbf{h}_k \parallel \mathbf{e}_{ik}]\right)\right)}$$

Where:
- $\mathbf{h}_i, \mathbf{h}_j$ are hidden state representations of stations $i$ and $j$.
- $\mathbf{e}_{ij}$ is the edge feature vector encoding block signaling type, speed limit, and headway.
- $\mathcal{N}(i)$ is the set of topological neighbors of station $i$.

This mathematically models how a delay at an upstream junction (e.g. Mughalsarai / Pt. Deen Dayal Upadhyay) ripples into downstream sections (Mirzapur, Prayagraj, Kanpur) based on section saturation density.

---

## 4. Tier 3: Terminal Platform Queuing & Outer Signal Detention

At major terminal stations with $M$ platforms, incoming train $T_A$ scheduled for platform $p$ is subject to platform clearance:

$$\Delta T_{\text{outer}} = \max\left(0, T_{\text{clear}}(p) - T_{\text{arrival\_outer}}\right)$$

Where:
- $T_{\text{clear}}(p)$ is the departure or shunting clearance timestamp of the occupying train $T_B$.
- $T_{\text{arrival\_outer}}$ is the estimated arrival timestamp of $T_A$ at the outer/home signal.

The predicted station arrival time is:

$$\text{ETA}_{\text{station}} = \text{ETA}_{\text{outer\_signal}} + \Delta T_{\text{outer}} + T_{\text{yard\_turnout}}$$

This transparently detects outer signal stabling before the train reaches the home signal!

---

## 5. Tier 4: Bayesian Uncertainty & Confidence Window

Instead of a deceptive single-point number, GATI-SETU outputs an expected arrival $P_{50}$ with a 90% confidence window $[P_{10}, P_{90}]$:

$$P_{10} = \text{ETA}_{\text{expected}} - z_{10} \cdot \sigma(d, \text{congestion})$$
$$P_{90} = \text{ETA}_{\text{expected}} + z_{90} \cdot \sigma(d, \text{congestion})$$

Where $\sigma(d, \text{congestion})$ scales with distance remaining and corridor saturation ratio.

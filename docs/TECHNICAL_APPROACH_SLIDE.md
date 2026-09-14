# 🚆 Slide 3: Technical Approach (GATI-SETU)
**Smart India Hackathon 2026 | Problem Statement ID: 26028**  
**Organization:** Ministry of Railways | **Theme:** Smart Automation | **Category:** Software (100% Zero-Hardware)

---

## 📸 Slide Visual Preview
![Technical Approach Slide](file:///Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/screenshots/technical_approach_slide.png)
*Interactive Presentation Canvas: [`docs/technical_approach_slide.html`](file:///Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/technical_approach_slide.html)*

---

## 1. 👥 Multi-Stakeholder Operational Flowchart

The Problem Statement explicitly mandates three distinct primary user interfaces (**Mobile Apps**, **Control Room Dashboards**, and **Station Displays & Planning**). The operational flowchart models each user's real-time interaction, decision gateway, and automated system resolution:

### 📱 Lane 1: The Passenger (Mobile App & Real-Time Updates)
* **Action:** Passenger opens mobile app, enters PNR / Train #12301, or auto-detects boarding station via GPS.
* **Telemetry:** Ingests 30s BEL RTIS NavIC satellite stream; snaps coordinates strictly to track chainage KM (PostGIS LRS).
* **Decision Gateway:** *Delay > 5 mins Detected?*
  * **🟢 IF NO:** Displays smooth on-time track radar and next station countdown with verified green block headway.
  * **🔴 IF YES:** Delivers Conformal $[P_{10}, P_{50}, P_{90}]$ arrival window with plain root-cause breakdown (*"Delayed 18m: Held at Outer Signal for Platform 4 rake clearance"*) and auto-syncs connecting city Metro / Cab bookings.

### 🚦 Lane 2: The Section Controller (Control Room Dashboards)
* **Action:** Section Controller logs into COA Control Room Cockpit to supervise 60 km block section headway and active rakes.
* **Telemetry:** Ingests Form T/409 e-Caution speed orders, FOIS freight trailing tonnage, and S&T signal aspects.
* **Decision Gateway:** *Preceding Block Conflict Ahead?*
  * **🟢 IF NO:** Grants automatic through green aspect clearance without manual dispatcher intervention.
  * **🟣 IF YES:** Rule 401 Siding Precedence Engine advises: *Loop preceding freight train #BOXN into siding at KM 142* &rarr; keeps high-priority Rajdhani running unobstructed at 130 km/h.

### 🏢 Lane 3: Station Master & Platform Staff (Station Displays & Planning)
* **Action:** Station Master monitors live terminal berthing board, scanning inbound trains within 30 km ingress zone.
* **Telemetry:** Platform Occupancy Solver tracks preceding rake departure timestamp $T_{\text{dep}}$ and track circuit vacation.
* **Decision Gateway:** *Designated Platform Free?*
  * **🟢 IF YES:** Locks route to Platform 2, auto-triggers passenger boarding announcements, and dispatches station battery cars.
  * **🔴 IF NO:** Solves Outer Signal Detention ($\Delta T_{\text{outer}} = \max(0, T_{\text{dep}} + T_{\text{clear}} - T_{\text{arr}})$), updates Station Platform LED displays & audio PIDS 25m in advance, and schedules coaching depot (CDO) rake cleaning & loco pilot shift handovers.

---

## 2. 🛠️ Technology Stack Breakdown

| Domain / Layer | Technology & Framework | Purpose & Justification |
| :--- | :--- | :--- |
| **📱 Mobile / Client** | **React Native (iOS & Android native)**, Reanimated 3, MapLibre GL radar, MMKV, SQLite | Single 60 FPS codebase; sub-millisecond offline caching; native railway track radar map. |
| **⚡ Backend / API** | **Python 3.11 (FastAPI Async)**, Node.js Gateway, WebSockets (`WSS`), REST APIs | Non-blocking high-throughput telemetry ingestion; bi-directional live train sync. |
| **🧠 AI / ML & Graph DL** | **PyTorch Geometric (ST-GAT)**, ONNX Runtime (<10ms edge inference) | Spatio-Temporal Graph Attention Network models corridor-wide topological delay ripples. |
| **⚙️ Physics Kinematics** | **Newton-Davis Train Resistance Solver**, WAP-7 Tractive Curves, RK4 Integrator | Solves tractive effort curves, trailing weight inertia, grade, and aerodynamic drag. |
| **📡 Data Streaming Bus** | **Apache Kafka (KRaft)**, Redis 7.2 (Pub/Sub & In-Memory Cache) | Handles 100k+ events/sec across 20,000 active rakes without message loss. |
| **🗄️ Spatial & Time-Series DB** | **PostgreSQL 16 + PostGIS**, TimescaleDB | 1D linear rail chainage matching (LRS) and timestamped telemetry time-series storage. |
| **🛰️ Railway Ingestion (100% Zero-Hardware)** | **BEL RTIS (ISRO NavIC 30s GPS)**, CRIS FOIS, COA, e-Caution (T/409 TSR), IMD Doppler Radar | **Zero Hardware**: Taps statutory digital feeds already live on Indian Railways. |
| **🔒 Security & Cloud** | OAuth 2.0 / JWT, AES-256 GCM, Docker, Kubernetes on RailCloud / NIC | Strict Indian Railways / CRIS data governance and compartmentalized permissions. |

---

## 3. 📐 The 3 Core Processing Stages & Physics Formulations

### Stage 1: Ingestion Stage (100% Zero-Hardware)
* **BEL RTIS NavIC GPS:** 30s live coordinates across 8,000+ locomotives.
* **CRIS FOIS Freight Telemetry:** Preceding freight rake tonnage, speed, and section occupancy.
* **COA Dispatch Records:** Section Controller line clearance, loops, and crossovers.
* **e-Caution TSR Form T/409:** Civil engineering temporary speed restriction slow-orders.
* **IMD Doppler Radar:** Real-time fog visibility (<300m enforces General Rule 3.61 statutory 60 km/h cap).

### Stage 2: Processing Stage (Physics Kinematics & AI Core)
1. **Newton-Davis Dynamic Acceleration Engine:**
   $$a(t) = \frac{F_{\text{traction}}(v) - R_{\text{Davis}}(v) - F_{\text{gradient}}(\theta) - F_{\text{curve}}(D)}{M_{\text{effective}}}$$
2. **WAP-7 Tractive Effort & Modified Atmospheric Drag:**
   $$F_{\text{traction}} = \min\left(\mu M g, \frac{P_{\text{rated}} \eta}{v}\right), \quad R_{\text{Davis}}(v) = A + Bv + C \cdot \left[\frac{\rho(T,H)}{\rho_0}\right] v^2$$
3. **ST-GAT Spatial Graph Attention & Operating Rule 401 Precedence:**
   $$\alpha_{ij} = \text{Softmax}\left(\text{LeakyReLU}\left(\mathbf{a}^T[\mathbf{W}h_i \,\|\, \mathbf{W}h_j]\right)\right)$$
4. **Outer Signal Queuing & Platform Clearance Solver:**
   $$\Delta T_{\text{outer}} = \max\left(0, T_{\text{dep}}^{\text{preceding rake}} + T_{\text{clearance}} - T_{\text{arr}}^{\text{approaching train}}\right)$$

### Stage 3: Output Stage (Multi-User Delivery)
* **📱 Passenger Mobile Radar App:** Dynamic $[P_{10}, P_{50}, P_{90}]$ arrival window, live radar map, and plain-language root-cause delay badge.
* **🚦 Section Controller Cockpit:** Real-time headway warnings, automatic block clearance, and loop line overtake advisor.
* **🏢 Station Master Berthing Console:** Platform occupancy turnover scheduler, shunting engine, and loco pilot crew handover sync.
* **🚕 Urban Feeder Transport APIs:** Automated city metro, feeder bus, and ride-hailing sync triggered by high-precision $P_{50}$ ETA.

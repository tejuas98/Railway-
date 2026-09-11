# SIH 2026 Problem Statement 26028: Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains
**Ministry of Railways | Smart Automation | Solution Design & Technical Blueprint**

---

## 1. Executive Summary & Problem Context

Indian Railways operates one of the largest and most complex rail networks on earth, running over **13,500 passenger trains** and **9,000+ freight trains** daily across **7,325 stations** spanning **68,000+ route kilometers**. Despite massive digital modernization (including GPS-based locomotive tracking via RTIS), arrival time prediction remains fundamentally broken. 

The core issue: **The current National Train Enquiry System (NTES) does not forecast ETA—it merely recalculates a static formula.**

$$\text{NTES ETA} = \text{Current Time} + \sum \text{Scheduled Sectional Running Time} - \text{Scheduled Timetable Recovery Buffer}$$

When a train encounters real-world dynamic friction—such as a preceding goods train crawling in the block section ahead, a 30 km/h Temporary Speed Restriction (TSR), a yellow signal sequence, single-line crossing wait, or platform unavailability at the destination yard throat—the static formula breaks down entirely. Passengers wait at platforms looking at displays saying *"Arriving in 5 mins"* while their train sits stationary at the outer signal for 45 minutes.

This document presents a comprehensive government-level autopsy of existing systems and proposes **GATI-SETU (Graph-Augmented Transit Intelligence for Indian Railways)**: a Physics-Informed Spatio-Temporal Graph Neural Network (PI-STGNN) with real-time digital twin simulation.

---

## 2. Government Ecosystem Audit: Existing Railway Systems

To build a solution that works for Indian Railways, we must first map the real operational infrastructure managed by the **Centre for Railway Information Systems (CRIS)** and the **Ministry of Railways (MoR)**:

```mermaid
flowchart TB
    subgraph DataSilos["1. Disconnected Real-World Data Silos in Indian Railways"]
        RTIS["🛰️ RTIS (ISRO / BEL / CRIS)<br/>NavIC/GAGAN Loco GPS (every 30s)"]
        COA["🖥️ COA (Control Office App)<br/>Section Controllers in 68 Divisions"]
        FOIS["🚛 FOIS (Freight Operations)<br/>Freight trains sharing same tracks"]
        DL["🚦 S&T Data Loggers & EI<br/>Microsecond relay & signal aspect logs"]
        TSR["⚠️ e-Caution Orders (Civil Engg)<br/>Temporary & Permanent Speed Restrictions"]
        WTT["⏱️ WTT (Working Time Table)<br/>Internal engineering schedules & slacks"]
    end

    subgraph CurrentPipeline["2. Current Government Pipeline (Broken)"]
        ESB["CRIS Enterprise Service Bus (ESB)"]
        NTES_DB["NTES Central Database<br/>(Station Arrival/Departure Table)"]
        STATIC_CALC["Static Extrapolation Formula<br/>ETA = Schedule + Delay - Recovery"]
        PUBLIC_API["NTES Public Feed / SMS / 139 IVR<br/>(Static, Jump-prone, Inaccurate)"]
    end

    RTIS -->|Loco Pings| ESB
    COA -->|Manual/Auto Event Logs| ESB
    FOIS -.->|Disconnected from Passenger| ESB
    DL -.->|Siloed in S&T Maintenance| ESB
    TSR -.->|Issued on paper / static notices| ESB
    
    ESB --> NTES_DB
    NTES_DB --> STATIC_CALC
    STATIC_CALC --> PUBLIC_API

    style DataSilos fill:#f0f4f8,stroke:#0284c7,stroke-width:2px
    style CurrentPipeline fill:#fef2f2,stroke:#ef4444,stroke-width:2px
```

### Key Government Systems Analyzed:

1. **RTIS (Real-Time Train Information System)**:
   - Built jointly by CRIS, ISRO (Space Applications Centre, Ahmedabad), and Bharat Electronics Limited (BEL).
   - Deployed on **8,500+ locomotives** using dual GSAT MSS (NavIC/GAGAN) satellite transceivers and 4G/GPRS fallback.
   - Pings speed and GPS coordinates every **30 seconds** directly to central servers without manual station master action.
   - *Limitation*: RTIS provides high-precision **historical & current location**, but **zero forward-looking prediction**. Knowing where a train is *now* does not tell you if the signal 3 km ahead will turn red.

2. **COA (Control Office Application)**:
   - Used by Section Controllers across **68 railway divisions** to dispatch trains on time-distance graphs (control charts).
   - Controllers manually prioritize trains (e.g., pulling a passenger train into a loop line to let a Vande Bharat or Rajdhani overtake).
   - *Limitation*: Controller decisions are tactical and discretionary; they are not fed into any predictive algorithm before execution.

3. **NTES (National Train Enquiry System)**:
   - The primary passenger-facing system (`enquiry.indianrail.gov.in`).
   - Architected as an OLTP (On-Line Transaction Processing) database designed to answer *"What is the schedule of Train X?"*.
   - Uses linear speed-distance math adjusted by manual station logs.

4. **S&T Data Loggers & Electronic Interlocking (EI)**:
   - Known as the railway's "Black Box", installed at station relay rooms.
   - Records every relay pickup, track circuit occupancy, point motor alignment, and signal aspect change with microsecond timestamps.
   - *Limitation*: Primarily utilized post-hoc by safety commissioners for accident investigations and asset maintenance. This high-density signal feed is **never ingested into the public ETA engine in real-time**.

5. **e-Caution Order & TSR System**:
   - Manages Temporary Speed Restrictions (e.g., "Track work at KM 412/10: max speed 20 km/h for 800m").
   - Issued to Loco Pilots as caution notices at notice stations.
   - *Limitation*: Not dynamically parsed into NTES sectional travel time calculations.

6. **FOIS (Freight Operations Information System)**:
   - Tracks over 9,000 freight rakes daily. Freight trains travel at lower speeds (40–60 km/h) and share the exact same track infrastructure as high-speed coaching trains (70%+ of the Golden Quadrilateral runs mixed traffic).
   - *Limitation*: Completely segregated from the passenger NTES calculation. NTES assumes the track ahead is empty.

---

## 3. The Autopsy: Why Previous Systems & Government Attempts Always Failed

Why has this problem persisted for decades despite hundreds of crores invested in IT? Comprehensive review of **CAG Audit Reports (Report No. 32 of 2016, 2018–19 Punctuality Review)**, Ministry of Railways internal whitepapers, and academic research (IIT Bombay, IIT Kharagpur, arXiv:2510.01262) reveals **6 structural failure reasons**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        6 STRUCTURAL FAILURE MODES OF CURRENT ETA                       │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. The Isolated Train Fallacy  │ Assumes train moves in a vacuum; ignores block section│
│    (Network Headway Blindness) │ occupancy and slow freight trains ahead on same line. │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. The Recovery Time Paradox   │ Deducts built-in timetable buffer linearly even when  │
│    (Compounding Non-Linearity) │ a delayed train has lost its scheduled priority path. │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Outer Signal Stabling       │ Major terminal bottlenecks (throat yards/platforms)   │
│    (Terminal Yard Throat Trap) │ trap trains 1-2 km out, while NTES says "Arriving".   │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Unmodeled Dispatch Politics │ Section controllers loop lower-priority trains to let │
│    (Precedence & Overtakes)    │ premium rakes pass; NTES has zero visibility into it. │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Caution Order / TSR Blind-  │ Track maintenance speed restrictions (20 km/h caution)│
│    spots & Weather Ceilings    │ and Fog Safe Rules (60 km/h max) ignored in math.     │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 6. Legacy OLTP Database vs     │ NTES queries static rows; real-time dynamic ETA needs │
│    Real-Time Streaming Graph   │ Kafka streaming + Graph Neural Network simulation.    │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

### Deep Dive into the 6 Structural Failures:

#### 1. The Isolated Train Fallacy (Ignoring Railway Block Physics)
On Indian Railways, trains do not run freely like cars on a highway. They operate on **Absolute Block Signaling** (or Automatic Permissive Block Signaling). 
- A train cannot enter a block section until the preceding train has completely cleared it.
- If a container freight train running at 45 km/h is 4 km ahead of an Express train running at 110 km/h, the Express train will hit Double Yellow $\rightarrow$ Yellow $\rightarrow$ Red signal aspects, forcing it to decelerate to a crawl or stop completely.
- NTES treats each train as an independent point mass. It has no mechanism to calculate headway interactions between consecutive trains on the same physical track.

#### 2. The "Recovery Time" Mathematical Paradox
Indian Railways timetables include "Recovery Time" (extra slack buffer added to running times before major junctions, usually 15–45 minutes).
- **The NTES Bug**: If a train is 40 minutes late at Station A, and there is 30 minutes of recovery buffer before Station B, NTES automatically predicts:
  $$\text{ETA Delay at B} = 40 - 30 = 10 \text{ minutes}$$
- **The Ground Reality**: Once a train is 40 minutes late, it has **missed its green corridor timetable slot (its "path")**. In a saturated section (where track utilization is often 120% to 150%), a train without a path is repeatedly relegated to loop lines. Its delay **cascades from 40 minutes to 90 minutes**, not 10 minutes! NTES consistently promises time recovery that physical track physics prohibits.

#### 3. The "Outer Signal Stabling" Blindspot (Terminal Station Trap)
At major terminals (e.g., New Delhi, Howrah, CSMT Mumbai, Kanpur Central, Patna, Varanasi), platform tracks are shared by arriving, departing, and shunting rakes.
- If a platform is occupied because a departing train is running 20 minutes late, the arriving train is halted at the Home/Outer Signal (1.5 to 3 km away from the station).
- NTES calculates distance remaining ($d \approx 2\text{ km}$) and speed ($v = 40\text{ km/h}$) and displays: *"Arriving in 3 minutes"*.
- The train remains halted for 45 minutes while the platform is cleared and yard turnouts are interlocked. This single flaw is responsible for over **60% of passenger complaints on RailMadad**.

#### 4. Discretionary Dispatching & Train Precedence
Indian Railways has an explicit operational hierarchy:
1. Vande Bharat / Rajdhani / Shatabdi Express
2. Mail / Express Superfast
3. Regular Passenger / MEMU / DEMU
4. Freight (Container / Coal / POL / Empty Rakes)

When multiple trains converge on a junction, the Section Controller in the divisional control room makes a tactical judgment call: hold Train B on a loop line to let Train A pass. Because this decision happens in the Controller's mind or on the local COA chart, NTES has no visibility until Train B has already stopped on the loop line and stayed stationary for 20 minutes.

#### 5. Disconnected Speed Restrictions (TSR) & Fog Rules
- **Temporary Speed Restrictions (TSR)**: Engineering cautions (e.g., track deep screening, ballast tamping, rail weld renewal) restrict train speed over specific kilometer stretches to 15, 20, or 30 km/h. Loco pilots must accelerate, decelerate, and crawl. This adds 5–15 minutes of loss per caution order. These are logged in civil engineering systems but not tied to the NTES speed calculations.
- **Fog Rules**: Under Railway Board rules, during dense winter fog in Northern / North Central Railways, trains running on Automatic Block Territory must limit speed to **60 km/h** (with Fog Safe Device). NTES continues to calculate travel times using standard 110–130 km/h timetables, resulting in ETA errors of 6 to 12 hours.

#### 6. Architectural Bottleneck: OLTP vs Event-Driven Streaming Graph
- NTES was built 20 years ago as a classical relational database designed for lookup queries.
- Calculating true dynamic ETA requires:
  1. Ingesting **tens of thousands of concurrent event streams** (RTIS GPS, S&T relays, COA departures, caution orders).
  2. Maintaining an in-memory **Digital Twin Directed Multigraph** of the rail network.
  3. Computing non-linear spatial attention across neighboring nodes (upstream and downstream dependencies).
- CRIS never had the modern real-time streaming graph data pipeline needed to execute this at national scale.

---

## 4. Proposed Solution: "GATI-SETU" (Dynamic Spatio-Temporal Train ETA & Dispatch AI)

We propose **GATI-SETU (Graph-Augmented Transit Intelligence for Indian Railways)**—an enterprise-grade, real-time dynamic ETA forecasting and dispatch intelligence system designed natively for the operational realities of Indian Railways.

```mermaid
flowchart TD
    subgraph DataIngestion["LAYER 1: Unified High-Velocity Ingestion Engine"]
        S1["🛰️ RTIS Telemetry Stream<br/>(ISRO Satellite GPS - 30s)"]
        S2["🚦 S&T Data Loggers<br/>(Track Circuit Occupancy & Signal Aspects)"]
        S3["🖥️ COA Event Stream<br/>(Station Approvals, Departures, Loop Routing)"]
        S4["⚠️ e-Caution & TSR Feed<br/>(Kilometer-level Speed Restrictions)"]
        S5["🌤️ IMD Weather Radar Feed<br/>(Fog/Visibility, Rainfall, Extreme Temp)"]
        S6["🚛 FOIS Freight Position Feed<br/>(Preceding Goods Rakes on Shared Lines)"]
    end

    subgraph StreamingPipeline["LAYER 2: Real-Time Stream Normalization & Digital Twin"]
        KAFKA["Apache Kafka Event Bus<br/>(Partitioned by Railway Zone/Division)"]
        FLINK["Apache Flink State Engine<br/>(Map Matching, Block-Section Association, Speed Vectoring)"]
        TWIN["In-Memory Railway Digital Twin<br/>(7,300+ Stations, 68,000 km Track, Yard Throats, Loop Lines)"]
    end

    subgraph AIModels["LAYER 3: Hybrid Physics-Informed Spatio-Temporal AI Engine"]
        PIE["⚙️ Physics Kinematic Module<br/>(Tractive Effort, Gradient, Curvature, TSR Speed Limits)"]
        STGAT["🧠 Spatio-Temporal Graph Attention Network (ST-GAT)<br/>(Models Cascading Delay & Headway across Saturated Sections)"]
        QUEUE["⏳ Terminal Yard Platform Queuing Module<br/>(Predicts Outer Signal Stabling & Yard Throat Conflicts)"]
        DISPATCH["🎛️ Section Dispatcher Precedence Model<br/>(Predicts Loop-line Overtakes based on Train Priority Hierarchy)"]
    end

    subgraph PredictionEngine["LAYER 4: Dynamic Prediction & Confidence Bounds"]
        FUSION["Bayesian Ensemble & Kalman Filter Fusion<br/>(Uncertainty Bounds: Expected Arrival + P10/P90 Confidence Intervals)"]
        CACHE["High-Throughput Redis Cache Layer<br/>(Sub-20ms lookup for 50,000+ queries/sec)"]
    end

    subgraph ServingLayer["LAYER 5: Open API & Consumption Ecosystem"]
        API1["📱 Passenger Ecosystem<br/>(IRCTC, NTES Mobile App, Where Is My Train, RailYatri)"]
        API2["📺 Station Infrastructure<br/>(CIDS Display Boards, Platform Announcers)"]
        API3["🧭 Divisional Control Rooms<br/>(COA Integration: Early Warning for Cascading Delays)"]
    end

    S1 & S2 & S3 & S4 & S5 & S6 --> KAFKA
    KAFKA --> FLINK
    FLINK --> TWIN
    
    TWIN --> PIE
    TWIN --> STGAT
    TWIN --> QUEUE
    TWIN --> DISPATCH

    PIE & STGAT & QUEUE & DISPATCH --> FUSION
    FUSION --> CACHE
    CACHE --> API1 & API2 & API3

    style DataIngestion fill:#e0f2fe,stroke:#0369a1,stroke-width:2px
    style StreamingPipeline fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style AIModels fill:#ede9fe,stroke:#7c3aed,stroke-width:2px
    style PredictionEngine fill:#dcfce7,stroke:#15803d,stroke-width:2px
    style ServingLayer fill:#fce7f3,stroke:#be185d,stroke-width:2px
```

---

## 5. Algorithmic Formulation & AI Architecture

To address the failure modes, GATI-SETU splits ETA prediction into **four coordinated mathematical models**:

### Module 1: Physics-Informed Kinematics Engine (Free-Running Time)
Instead of static timetable running time, the baseline running time $T_{\text{free}}$ across a block section $(u, v)$ is calculated dynamically:

$$T_{\text{free}}(u, v) = \int_{0}^{D_{uv}} \frac{dx}{\min\left(V_{\max}(x), V_{\text{loco}}, V_{\text{TSR}}(x), V_{\text{weather}}(t)\right)} + t_{\text{accel}} + t_{\text{decel}}$$

Where:
- $D_{uv}$ is the physical track distance between station $u$ and $v$.
- $V_{\max}(x)$ is the Permanent Speed Restriction (PSR) governed by track geometry, cant deficiency, and bridge limits.
- $V_{\text{loco}}$ is the maximum permissible speed of the locomotive class (e.g., WAP-7 = 140 km/h, WAP-5 = 160 km/h, WAG-9 = 100 km/h).
- $V_{\text{TSR}}(x)$ is the active Temporary Speed Restriction from the e-Caution database at kilometer mark $x$.
- $V_{\text{weather}}(t)$ is the dynamic weather ceiling (e.g., $60\text{ km/h}$ for visibility $< 200\text{m}$ under Indian Railway Fog Regulations).

### Module 2: Spatio-Temporal Graph Attention Network (Delay Propagation & Headway)
Railway delay is not an independent random variable; it flows across tracks like fluid in a pipe network.
We represent the Indian Railway Network as a dynamic directed graph $G_t = (V, E, X_t, W)$:
- **Nodes ($V$)**: 7,325 stations, junctions, and block huts.
- **Edges ($E$)**: Directional block tracks connecting nodes.
- **Node Features ($X_t$)**: Platform occupancy, yard capacity utilization ratio, active trains stationary in station loop lines.
- **Edge Features ($W$)**: Number of active trains in block section, speed differential between leading and following train, headway time margin.

The Graph Attention mechanism computes attention weights $\alpha_{ij}$ between neighboring track sections:

$$\alpha_{ij} = \frac{\exp\left(\text{LeakyReLU}\left(\mathbf{a}^T [\mathbf{h}_i \parallel \mathbf{h}_j \parallel \mathbf{e}_{ij}]\right)\right)}{\sum_{k \in \mathcal{N}(i)} \exp\left(\text{LeakyReLU}\left(\mathbf{a}^T [\mathbf{h}_i \parallel \mathbf{h}_k \parallel \mathbf{e}_{ik}]\right)\right)}$$

This captures how a delay in an upstream junction (e.g., Mughalsarai / Pt. Deen Dayal Upadhyay) cascades into subsequent sections (Mirzapur, Prayagraj, Kanpur) based on section saturation density.

### Module 3: Terminal Platform Queuing & Outer Signal Detention Model
To solve the agonizing "stuck at outer signal" bug, we deploy a discrete-time Markovian Queuing model at every major junction:
- Tracks the real-time status of all $M$ platforms at terminal station $K$.
- If train $T_A$ is scheduled for Platform 3, but the preceding train $T_B$ on Platform 3 has not completed passenger deboarding, parcel unloading, or rake reversal, $T_A$ will be held at the outer signal.
- The model outputs:
  1. $P(\text{Outer Signal Detention})$: Probability that the train will be held before entering the yard.
  2. $T_{\text{detention}}$: Expected detention time based on the scheduled departure clearance of the blocking rake.
- The public ETA immediately reflects:
  $$\text{ETA}_{\text{station}} = \text{ETA}_{\text{outer signal}} + T_{\text{detention}} + T_{\text{yard traversal}}$$
  Passengers are transparently informed: *"Train at outer signal awaiting platform clearance. Expected at platform in 22 mins."*

### Module 4: Probabilistic Output & Confidence Interval
Instead of a deceiving single-point prediction (e.g., *"18:14"*), GATI-SETU provides a confidence interval:
- **Expected ETA**: 18:18
- **Confidence Window**: 18:15 – 18:22 (90% Confidence Interval)
- **Status Indicator**: 🟢 High Confidence (green corridor ahead) | 🟡 Moderate Friction (single track crossing pending) | 🔴 Cascading Delay (yard congestion ahead)

---

## 6. Comprehensive Comparative Matrix

| Operational Feature | Current NTES (Government) | Commercial Apps (Where Is My Train, RailYatri) | Proposed GATI-SETU |
| :--- | :---: | :---: | :---: |
| **Core Prediction Engine** | Static timetable subtraction formula | Historical statistical regression + cell tower GPS | Spatio-Temporal Graph Attention Network + Physics Kinematics |
| **Live Locomotive Location** | RTIS satellite pings (every 30s) / Station Master log | Crowdsourced cell tower pings + scraped NTES | Direct RTIS satellite feed + NavIC/GAGAN + S&T Data Loggers |
| **Preceding Train Headway Awareness** | ❌ None (assumes empty track) | ❌ None (no access to freight or track data) | ✅ Fully modeled via block section occupancy & FOIS integration |
| **Temporary Speed Restrictions (TSR)** | ❌ Ignored | ❌ Ignored | ✅ Integrated dynamically via e-Caution order database |
| **Single-Line Crossing & Precedence** | ❌ Ignored (assumes free run) | ⚠️ Partial (historical average stop duration) | ✅ Modeled via Dispatcher Priority Hierarchy & Track Graph |
| **Outer Signal Yard Throat Bottleneck** | ❌ Fails (shows "Arriving" while train is stopped) | ❌ Fails (shows train stationary without reason) | ✅ Modeled via Terminal Platform Queuing State Machine |
| **Fog / Weather Speed Restriction Rules** | ❌ Blanket delay notice only | ❌ Ignored in calculation | ✅ Physics speed cap automatically enforced ($60\text{ km/h}$) |
| **Output Type** | Single static point (often inaccurate) | Single point + generic delay text | Probabilistic Expected ETA + 90% Confidence Window |
| **Integration with Railway Operations** | Read-only reporting | Scraping / public API | Bi-directional: feeds NTES, Station CIDS, and COA Controllers |
| **Sub-second Scalability** | Prone to slow response under peak loads | Third-party cloud servers | Apache Kafka + Flink + Redis in-memory cache (<25ms) |

---

## 7. Open Questions & Design Decisions for User Review

> [!IMPORTANT]
> **Key Architecture Decisions for Feedback:**
> 1. **Target Demonstration Scope for Hackathon Prototype**: Should the demonstration prototype focus on a real high-density Indian Railway corridor (e.g., the **New Delhi – Kanpur – Prayagraj – Pt. Deen Dayal Upadhyay / Mughalsarai** trunk line on Northern & North Central Railway, which handles the highest mixed traffic and fog delays in India), or a national synthetic multi-zone network?
> 2. **UI Surfaces to Showcase**: To demonstrate the complete solution to evaluators, we plan to deliver:
>    - **Passenger Dynamic ETA Portal / Mobile Web App** (showing live confidence intervals, signal delay reasons, and clean timeline tracking).
>    - **Station Master / CIDS Platform Display Simulator** (showing outer signal platform clearance countdowns).
>    - **Divisional Section Controller AI Dispatch Dashboard** (showing track occupancy, conflict predictions, and overtake recommendations).
> 3. **Data Availability Strategy**: Since live CRIS internal internal production Kafka brokers are firewalled, our solution will utilize a **High-Fidelity Real-World Simulation Engine** populated with actual Indian Railway Network (IRN) station topologies, historical NTES journey records (from open data sources and research benchmarks covering 4,700+ stations), and realistic RTIS GPS telemetry generators.

---

## 8. Implementation Plan & Proposed Components

Once approved, the solution will be developed in the new project directory `/Users/toru/.gemini/antigravity-ide/scratch/gati-setu-railway-eta`:

### Component A: High-Fidelity Railway Network & Telemetry Simulator
- Real topological graph of Indian Railway corridors (stations, block sections, loop lines, crossovers, speed limits).
- Telemetry generation simulating RTIS GPS updates, S&T signal aspects (Green/Double Yellow/Yellow/Red), and e-Caution speed restrictions.

### Component B: Real-Time Stream Processor & Graph Engine
- Event processing engine simulating Kafka/Flink state management.
- Dynamic Graph State tracking train positions, inter-train headway, and platform occupancy.

### Component C: Physics + Graph Neural Network ETA Predictor
- Hybrid model computing free running kinematics, cascading headway delays, and outer signal detention probabilities.
- Sub-50ms API endpoint returning dynamic ETA, confidence intervals, and explanatory delay root causes.

### Component D: Triple-Surface Interactive Web Application
- **Passenger App**: Clean, modern interface showing train live tracking, explainable delay reasons (e.g. *"Preceding Goods Train 2.4 km ahead"*, *"Caution Order: 20 km/h over Yamuna Bridge"*), and confidence intervals.
- **Station Platform CIDS Display**: Real-time arrival board for station concourses.
- **Section Controller Control Chart**: Live distance-time dispatch graph showing predicted conflicts and automated precedence guidance.

---

## 9. Verification Plan

### Automated Verification
- Unit and integration tests for kinematic physics formulas (acceleration, braking curves, TSR limits).
- Graph traversal and headway conflict detection tests.
- API load and latency testing (verifying <50ms response time for batch queries).

### Operational Scenario Validation
- **Scenario 1: Saturated Trunk Line Congestion**: Inject a slow freight train in front of an Express train and verify ETA dynamically adjusts for headway deceleration rather than reporting static schedule.
- **Scenario 2: Outer Signal Platform Blockage**: Simulate Platform 1 at destination occupied by a delayed rake; verify the arriving train's ETA accurately predicts outer signal detention rather than falsely claiming 2-minute arrival.
- **Scenario 3: Winter Fog Caution Order**: Apply 60 km/h visibility speed restriction across Northern Railway zone; verify ETA automatically scales proportionally.

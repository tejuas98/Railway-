# GATI-SETU: Project State & Conversation Continuity Guide
**Smart India Hackathon 2026** | **Ministry of Railways (PS ID: 26028)** | **Team: Karasuno**

> **Purpose of this file**: This document permanently saves the complete state of work, architecture decisions, rendered assets, file paths, and exact instructions so that whenever you resume this chat or open a new window, the agent can instantly continue from where we left off.

---

## 1. Quick Resume Summary for Any AI Agent
If you are an AI assistant reading this after reopening the project:
- **Active Workspace**: `/Users/toru/.gemini/antigravity-ide/scratch/Railway-repo`
- **Active Running Services**:
  - **PyTorch Geometric ST-GAT Microservice**: Running on `http://localhost:8000` (docs at `http://localhost:8000/docs`)
  - **Vite React Interactive Cockpit**: Running on `http://localhost:5173`
  - **One-Click Startup Script**: `./start.sh` or `npm start`
- **Slide 3 (Technical Approach)** is **completed, verified, and rendered** in:
  - Source HTML: `docs/technical_approach_slide.html`
  - High-Res 1920×1080 Screenshot: `docs/screenshots/technical_approach_slide.png`
  - Print-Ready Vector PDF: `docs/technical_approach_slide.pdf`
- **Slide 6 (Research & References)** is **completed, verified, and rendered** in:
  - Source HTML: `docs/research_and_references_slide.html`
  - High-Res 1920×1080 Screenshot: `docs/screenshots/research_and_references_slide.png`
  - Print-Ready Vector PDF: `docs/research_and_references_slide.pdf`
- **All 17 Competitor Repositories & Datasets** cloned and audited in `/Users/toru/.gemini/antigravity-ide/scratch/sih-26028-competitor-repos/`.
- **15/15 Clauses of PS 26028** fully fulfilled with mathematical models, unit tests, and live UI screens.
---

## 2. Key Artifacts & File Directory
| File Path | Description |
| :--- | :--- |
| `docs/technical_approach_slide.html` | Master HTML template (1920×1080) containing the full Technical Approach slide. |
| `docs/screenshots/technical_approach_slide.png` | 1920×1080 rendered PNG image used for presentation decks and verification. |
| `docs/technical_approach_slide.pdf` | 1920×1080 vector PDF exported directly for official SIH idea submission. |
| `render_slide_direct.cjs` | Standalone Puppeteer script to render `technical_approach_slide.html` to PNG. |
| `export_pdf_direct.cjs` | Standalone Puppeteer script to export `technical_approach_slide.html` to PDF. |

---

## 3. Slide 3 (Technical Approach) Architecture Details

### Layout Structure (1920 × 1080)
- **Header (64px)**: Team Pill (`Karasuno`) • Title (`TECHNICAL APPROACH`) • SIH 2026 Logo + `Ministry of Railways • ID: 26028`.
- **Left Column (440px)**:
  - **Technology Stack**: Mobile App (React Native), Backend/API (Python 3.11 FastAPI), AI/ML (PyTorch Geometric ST-GAT), Physics Kinematics (Newton-Davis & RK4), Data Streaming (Apache Kafka & Redis), Spatial & Time-Series (PostGIS LRS & TimescaleDB), Ingestion (BEL RTIS NavIC & CRIS COA/TSR), Security/Hosting (Docker & Kubernetes on RailCloud/NIC).
  - **Zero-Hardware Banner**: `100% ZERO-HARDWARE` — taps statutory IR feeds, no locomotive modifications.
  - **Powered By (12 Logos)**: Python, PyTorch, React Native, Kafka, Redis, PostgreSQL, PostGIS, FastAPI, Docker, Kubernetes, ISRO NavIC, CRIS / IR.
- **Right Column (~1390px Master Card)**:
  - **Header Bar**: `⚡ GATI-SETU: Dynamic Closed-Loop Operational Decision Flowchart` + `Closed-Loop Ground Reality Engine` badge.
  - **Flowchart Canvas (18 interconnected nodes across 5 tiers)**:
    1. **Ingress**: Passenger & Section Controller Query (Train #12301 / Station Geofence).
    2. **Dual Ingestion**:
       - Left: Statutory BEL RTIS NavIC Feed (`100% Zero-Hardware`, 30s ISRO GSAT-15 GPS).
       - Right: CRIS COA Timetables & TSR Orders (Block occupancy, schedules, e-Caution speed restrictions).
    3. **Decision Gate 1**: `RTIS GPS Fix Valid? Line-of-Sight Satellite Handshake Check`
       - `❌ NO`: Newton-Davis Dead-Reckoning (RK4 numerical solver in tunnels/gorges).
       - `✅ YES`: PostGIS LRS 1D Rail-Snap (Snaps raw WGS84 coordinates to statutory IR chainage KM).
    4. **RDSO Dynamic Feature Alignment**: Fuses track chainage with 1:120 ruling gradient, curve radius, train tonnage, and live TSR limits.
    5. **Dual Computational Core (Side-by-Side)**:
       - Physics Engine: Newton-Davis Tractive Solver with equation $a(t) = \frac{F_{trac}(v) - R_{davis} - F_{grade}}{M_{eff}}$.
       - Graph AI Engine: Spatio-Temporal Graph Attention Network with equation $\alpha_{ij} = \text{Softmax}(\text{LeakyReLU}(a^T [Wh_i \parallel Wh_j]))$.
       - Uncertainty Engine: Inductive Conformal Uncertainty Calibration (`Certified [P10 • P50 • P90] ETA Window`).
    6. **Decision Gate 2**: `Schedule Delay > 5 Mins or Block Conflict? Section Capacity & Train Precedence Evaluation`.
    7. **Meshed Operational Outcomes (No Outer Container Boxes)**:
       - **Nominal On-Time Branch (`🟢 NO`)**:
         - Node 6A: Section Controller Automated 4-Aspect Headway (`Green Wave`, 130 km/h).
         - Node 6B: Passenger Mobile App Calibrated Arrival Window (`Live [P10–P90]` radar & coach guide).
         - Node 6C: Station Master Route Relay Lock & PIDS Sync (`Automated Sync` audio & LED).
       - **Delay Mitigation Branch (`🔴 YES`)**:
         - Node 7A: Section Bottleneck & Conflict Classifier (`Rule 401 Engine`).
         - Sub-branch 1 (Rule 401 Siding): Controller loops freight into loop siding at KM 142 $\rightarrow$ Express recovers ~22m delay on mainline.
         - Sub-branch 2 (Platform Shift): Station Master predicts outer hold time ($\Delta T_{outer}$) and shifts rake to vacant PF-2 $\rightarrow$ Passenger receives transparent alert (*"Held for PF-2"*) + 1-tap metro/cab re-route.
    8. **Feedback Loop Strip**: 30-second continuous feedback loop from BEL RTIS satellite telemetry.
- **Footer (34px)**: `@SIH Idea submission- Template` • Slide Number `3`.

---

## 4. Next Steps for Upcoming Session
When reopening this chat:
1. **Option A (Refine Stage Annotations)**: Add subtle `Input Stage` / `Processing Stage` / `Output Stage` visual markers if desired.
2. **Option B (Next Presentation Slides)**:
   - **Slide 1**: Idea Title, Problem Statement & Team Overview
   - **Slide 2**: Proposed Solution & Innovation Highlights
   - **Slide 4**: Feasibility, Potential Challenges & Risk Mitigation
   - **Slide 5**: Impact, Commercial Viability & Railway Operational Benefits
   - **Slide 6**: References & Team Credentials

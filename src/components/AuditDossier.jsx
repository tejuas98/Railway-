import React from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Network,
  Cpu,
  Layers,
  Database,
  Code,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export default function AuditDossier() {
  const comparisonData = [
    {
      feature: 'Core Prediction Core',
      ntes: 'Static timetable subtraction formula',
      commercial: 'Historical regression + cell tower GPS',
      gatiSetu: 'Physics Kinematics + Spatio-Temporal Graph Attention Network (ST-GAT)',
      ntesStatus: '❌',
      commercialStatus: '⚠️',
      gatiStatus: '✅'
    },
    {
      feature: 'Live Train Tracking Source',
      ntes: 'RTIS GPS (30s) / Station Master Manual log',
      commercial: 'Crowdsourced cell tower pings + scraped NTES',
      gatiSetu: 'Direct RTIS NavIC/GAGAN + S&T Relay Data Loggers',
      ntesStatus: '⚠️',
      commercialStatus: '⚠️',
      gatiStatus: '✅'
    },
    {
      feature: 'Preceding Train Headway Awareness',
      ntes: 'None (assumes empty track ahead)',
      commercial: 'None (no access to track or freight data)',
      gatiSetu: 'Full dynamic block section occupancy & FOIS freight tracking',
      ntesStatus: '❌',
      commercialStatus: '❌',
      gatiStatus: '✅'
    },
    {
      feature: 'Temporary Speed Restrictions (TSR)',
      ntes: 'Ignored (relies on standard sectional speed)',
      commercial: 'Ignored',
      gatiSetu: 'Ingested dynamically from e-Caution order database',
      ntesStatus: '❌',
      commercialStatus: '❌',
      gatiStatus: '✅'
    },
    {
      feature: 'Single-Track Crossing & Precedence',
      ntes: 'Ignored (assumes unhindered movement)',
      commercial: 'Partial (historical delay heuristic)',
      gatiSetu: 'Section Controller Priority Hierarchy & Loop-Line Simulation',
      ntesStatus: '❌',
      commercialStatus: '⚠️',
      gatiStatus: '✅'
    },
    {
      feature: 'Outer Signal Platform Bottleneck',
      ntes: 'Fails (claims "Arriving" while train is stabled)',
      commercial: 'Fails (reports stopped with no root cause)',
      gatiSetu: 'Terminal Platform Queuing Model (predicts clearance & holding delay)',
      ntesStatus: '❌',
      commercialStatus: '❌',
      gatiStatus: '✅'
    },
    {
      feature: 'Fog & Adverse Weather Ceilings',
      ntes: 'Blanket notice only; no physics adjustment',
      commercial: 'Ignored in transit math',
      gatiSetu: 'Automatic Fog Safe Device speed ceiling enforcement (60 km/h)',
      ntesStatus: '❌',
      commercialStatus: '❌',
      gatiStatus: '✅'
    },
    {
      feature: 'Output Predictability',
      ntes: 'Single static number (frequently wrong)',
      commercial: 'Single number + generic delay text',
      gatiSetu: 'Probabilistic Expected ETA + 90% Confidence Interval Window',
      ntesStatus: '❌',
      commercialStatus: '⚠️',
      gatiStatus: '✅'
    },
    {
      feature: 'Integration with Railway Operations',
      ntes: 'Read-only public database',
      commercial: 'Third-party web scraping / public API',
      gatiSetu: 'Bi-directional: feeds NTES, Station CIDS, and COA Section Controllers',
      ntesStatus: '⚠️',
      commercialStatus: '❌',
      gatiStatus: '✅'
    },
    {
      feature: 'Query Response Latency',
      ntes: 'Prone to timeouts during festive surges',
      commercial: 'Third-party cloud dependent',
      gatiSetu: 'Kafka + In-Memory Graph + Redis Cache (<25ms)',
      ntesStatus: '⚠️',
      commercialStatus: '⚠️',
      gatiStatus: '✅'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Executive Dossier Header */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono tracking-wider uppercase mb-1">
          <FileText className="w-4 h-4" />
          <span>MINISTRY OF RAILWAYS • SIH PROBLEM STATEMENT 26028 AUDIT DOSSIER</span>
        </div>
        <h2 className="text-2xl font-black text-white">
          Why Previous Solutions Failed & The Architectural Breakthrough
        </h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-4xl">
          A rigorous investigative analysis based on Comptroller and Auditor General (CAG) of India Audit Reports (Report No. 32 of 2016, 2018–19 Punctuality Review), Centre for Railway Information Systems (CRIS) technical documentation, and railway operational research (IIT Bombay, IIT Kharagpur, arXiv:2510.01262).
        </p>
      </div>

      {/* The 6 Structural Failures Matrix */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>The Autopsy: 6 Structural Failure Modes of Current NTES</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-mono text-xs font-bold text-amber-400 mb-1">FAILURE MODE 01</div>
            <div className="text-sm font-bold text-white mb-1">The Isolated Train Fallacy</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NTES treats each train as an independent point in a vacuum. On Indian Railways, trains run on <strong>Absolute Block Signaling</strong>. If a 45 km/h freight train is 3 km ahead, the following 130 km/h Superfast is physically restricted to caution signals. NTES has zero headway awareness.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-mono text-xs font-bold text-amber-400 mb-1">FAILURE MODE 02</div>
            <div className="text-sm font-bold text-white mb-1">The Recovery Time Fallacy</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NTES blindly subtracts timetable "recovery slack" (15-45 mins). But once a train loses its scheduled "path", it is repeatedly looped to give precedence to higher-priority rakes. Instead of recovering time, delay <strong>cascades non-linearly</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-mono text-xs font-bold text-amber-400 mb-1">FAILURE MODE 03</div>
            <div className="text-sm font-bold text-white mb-1">Outer Signal Stabling Trap</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trains arriving at major terminals (NDLS, CNB, HWH) wait at home/outer signals 2 km out because platforms are blocked. NTES calculates speed × distance and says *"Arriving in 3 mins"* while passengers wait 45 mins stranded outside the yard.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-mono text-xs font-bold text-amber-400 mb-1">FAILURE MODE 04</div>
            <div className="text-sm font-bold text-white mb-1">Unmodeled Dispatch Decisions</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Section Controllers frequently loop lower-priority trains (Mail/Express, Passenger) to let Vande Bharat or Rajdhani overtake. These tactical decisions happen in divisional control rooms and are totally invisible to NTES algorithms.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-mono text-xs font-bold text-amber-400 mb-1">FAILURE MODE 05</div>
            <div className="text-sm font-bold text-white mb-1">Caution Order & Weather Blindness</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              e-Caution Temporary Speed Restrictions (e.g. 20 km/h bridge cautions) and winter Fog Safe Device (FSD) rules capping speeds at 60 km/h are managed in separate civil engineering logs and never ingested into the public ETA physics engine.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-mono text-xs font-bold text-amber-400 mb-1">FAILURE MODE 06</div>
            <div className="text-sm font-bold text-white mb-1">Legacy OLTP Database vs Streaming Graph</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              NTES was built 20 years ago as a classical relational database for timetable lookups. Predicting dynamic delay across 7,300 stations and 13,000 trains requires an in-memory <strong>Spatio-Temporal Digital Twin Multigraph</strong> running on Kafka and Graph Neural Networks.
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Comparative Matrix */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <span>System Comparison: Legacy NTES vs Commercial Apps vs GATI-SETU</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <th className="py-3 px-3">Operational Capability</th>
                <th className="py-3 px-3 text-rose-400">Current NTES (Govt)</th>
                <th className="py-3 px-3 text-amber-400">Commercial Apps (WIMT / RailYatri)</th>
                <th className="py-3 px-3 text-emerald-400">GATI-SETU (Proposed Innovation)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-3 font-sans font-semibold text-slate-100">{row.feature}</td>
                  <td className="py-3.5 px-3 text-slate-400">
                    <span className="mr-1.5">{row.ntesStatus}</span>
                    <span className="font-sans text-[11px]">{row.ntes}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    <span className="mr-1.5">{row.commercialStatus}</span>
                    <span className="font-sans text-[11px]">{row.commercial}</span>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-300 font-medium">
                    <span className="mr-1.5">{row.gatiStatus}</span>
                    <span className="font-sans text-[11px]">{row.gatiSetu}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Architecture & Mathematical Formulation */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <span>GATI-SETU Mathematical Formulation & Spatio-Temporal Graph Engine</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-amber-400 font-bold">1. Physics-Informed Kinematics Model</div>
            <div className="text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
              T_free(u, v) = ∫ [dx / min(V_mps, V_loco, V_tsr(x), V_fog(t))] + t_accel + t_decel
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Dynamically computes instantaneous acceleration, gradient resistance, locomotive tractive curves, and kilometer-level Temporary Speed Restrictions (TSR) from e-Caution orders.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-emerald-400 font-bold">2. Spatio-Temporal Graph Attention (ST-GAT)</div>
            <div className="text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
              α_ij = exp(LeakyReLU(a^T [h_i || h_j || e_ij])) / Σ exp(...)
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Models the cascading delay propagation across adjacent saturated block sections as a fluid network flow, accounting for preceding freight train headway.
            </p>
          </div>
        </div>

        {/* REST API Endpoints Specification for Ministry of Railways Integration */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <Code className="w-4 h-4 text-sky-400" />
              <span>Production REST API Specifications for Ministry of Railways Integration</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OpenAPI 3.1 Ready
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold mr-2 text-[10px]">GET</span>
                <span className="text-slate-200">/api/v1/trains/{'{train_id}'}/dynamic-eta?target_station={'{code}'}</span>
              </div>
              <span className="text-[10px] text-slate-500">Returns Expected ETA + P10/P90 Confidence + Explainable Factors</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mr-2 text-[10px]">POST</span>
                <span className="text-slate-200">/api/v1/dispatch/simulate-overtake</span>
              </div>
              <span className="text-[10px] text-slate-500">Computes time savings for Section Controller precedence recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

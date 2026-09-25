import React from 'react';
import {
  Sliders,
  AlertOctagon,
  CloudFog,
  Construction,
  Sparkles,
  GitBranch,
  ArrowRight,
  TrendingUp,
  Cpu,
  RotateCcw,
  Zap,
  Activity,
  CheckCircle2,
  Wrench,
  Car
} from 'lucide-react';
import { CORRIDOR_STATIONS } from '../data/corridorData';

export default function SectionControllerCockpit({
  trains,
  disruptions,
  onToggleTsr,
  onToggleFog,
  onTogglePlatformHold,
  onToggleMaintenance,
  onToggleLcGate,
  onExecuteOvertake,
  onResetSimulation
}) {
  const tsrActive = disruptions.tsrOrders[0].active;
  const fogActive = disruptions.weatherConditions.fogActive;
  const platformHoldActive = disruptions.platformStatus.outerSignalHoldActive;
  const maintenanceActive = disruptions.maintenanceBlocks?.[0]?.active ?? false;
  const lcGateActive = disruptions.levelCrossingGates?.[0]?.activeHold ?? false;
  const precedence = disruptions.dispatchPrecedence;

  return (
    <div className="space-y-6">
      {/* Cockpit Title & Control Header */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono tracking-wider uppercase mb-1">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>MINISTRY OF RAILWAYS • DIVISIONAL CONTROL OFFICE APPLICATION (COA)</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Section Controller AI Dispatch & What-If Disruption Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Prayagraj (PRYJ) & Delhi (DLI) Divisions • Golden Quadrilateral Trunk Line (786 KM)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-reset-simulation"
            onClick={onResetSimulation}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Digital Twin Running (Kafka State Sync)</span>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Disruption Injector */}
      <div className="glass-panel-elevated p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Dynamic Ground Realities & Disruption Injector
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Toggle real-world operational friction to see GATI-SETU recompute ETAs dynamically
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Disruption 1: 30 km/h Caution Order at Panki */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            tsrActive ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Construction className="w-4 h-4" />
                <span>e-Caution TSR</span>
              </span>
              <button
                id="toggle-tsr-caution"
                onClick={onToggleTsr}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  tsrActive ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tsrActive ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="text-xs font-bold text-slate-100">30 km/h at Panki (KM 434)</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Track ballast tamping on Down Main. Adds +9m running lag.
            </div>
          </div>

          {/* Disruption 2: Winter Fog */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            fogActive ? 'bg-cyan-950/20 border-cyan-500/50 ring-1 ring-cyan-500/30' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <CloudFog className="w-4 h-4" />
                <span>Fog GR 3.61</span>
              </span>
              <button
                id="toggle-fog-ceiling"
                onClick={onToggleFog}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  fogActive ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  fogActive ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="text-xs font-bold text-slate-100">Visibility &lt; 150m (TDL-ETW)</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Fog Safe Device caps speed at 60 km/h under GR 3.61.
            </div>
          </div>

          {/* Disruption 3: Outer Signal Platform Blockage */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            platformHoldActive ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <AlertOctagon className="w-4 h-4" />
                <span>PF 1 Blockage</span>
              </span>
              <button
                id="toggle-platform-hold"
                onClick={onTogglePlatformHold}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  platformHoldActive ? 'bg-rose-500' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  platformHoldActive ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="text-xs font-bold text-slate-100">Kanpur PF 1 Hold</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rake cleaning delay holds incoming train at outer signal.
            </div>
          </div>

          {/* Disruption 4: Unscheduled Maintenance Block */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            maintenanceActive ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Wrench className="w-4 h-4" />
                <span>Maint. Block</span>
              </span>
              <button
                id="toggle-maintenance-block"
                onClick={onToggleMaintenance}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  maintenanceActive ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  maintenanceActive ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="text-xs font-bold text-slate-100">OHE Power Block (KM 412)</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Emergency traction wire adjustment. Adds +8m delay.
            </div>
          </div>

          {/* Disruption 5: Level Crossing Gate */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            lcGateActive ? 'bg-orange-950/20 border-orange-500/50 ring-1 ring-orange-500/30' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                <Car className="w-4 h-4" />
                <span>LC Gate #42-C</span>
              </span>
              <button
                id="toggle-lc-gate"
                onClick={onToggleLcGate}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  lcGateActive ? 'bg-orange-500' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  lcGateActive ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="text-xs font-bold text-slate-100">Road Traffic Gate Hold</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Vehicular queue prevents boom barrier close (+4m).
            </div>
          </div>
        </div>
      </div>

      {/* AI Precedence & Overtake Dispatch Advisor */}
      <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-amber-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>GATI-SETU AI DISPATCH ADVISORY • HEADWAY RESOLUTION</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Loop Coal Freight BOXN-8422 at Etawah Jn (ETW) Loop 2
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Shiv Ganga Express (12560) is running 3.5 km behind BOXN-8422 on the Down Main Line. Diverting the freight rake into Etawah Loop Line will eliminate yellow signal restrictions and save <strong className="text-emerald-400">19 minutes</strong> of delay for 1,800 coaching passengers.
            </p>
          </div>

          <div className="shrink-0">
            {precedence.status === 'Executed' ? (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Overtake Executed (19m Saved)</span>
              </div>
            ) : (
              <button
                id="btn-execute-overtake"
                onClick={onExecuteOvertake}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Authorize AI Loop Overtake</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Block Section Corridor Track Map */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              Corridor Digital Twin: Block Section Occupancy (786 KM Track)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Green (Clear)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Yellow (Caution)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Red (Occupied)
            </span>
          </div>
        </div>

        {/* The Track Representation */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-x-auto">
          <div className="min-w-[850px] relative py-6">
            {/* The Main Line Rails */}
            <div className="h-2 bg-slate-800 rounded-full relative mb-4">
              {/* Active TSR Caution Zone highlighted */}
              {tsrActive && (
                <div
                  className="absolute top-0 bottom-0 bg-amber-500/50 border-x-2 border-amber-400"
                  style={{
                    left: `${(434 / 786) * 100}%`,
                    width: `${((437.5 - 434) / 786) * 100 + 1}%`
                  }}
                  title="30 km/h Caution Order at Panki"
                />
              )}

              {/* Active Fog Zone highlighted */}
              {fogActive && (
                <div
                  className="absolute top-0 bottom-0 bg-cyan-500/30 border-x-2 border-cyan-400"
                  style={{
                    left: `${(209 / 786) * 100}%`,
                    width: `${((301 - 209) / 786) * 100}%`
                  }}
                  title="Fog Safe Zone (60 km/h)"
                />
              )}

              {/* Trains plotted on the track */}
              {trains.map(train => {
                const percent = Math.min(99, Math.max(1, (train.currentKm / 786) * 100));
                const isFreight = train.priority === 4;

                return (
                  <div
                    key={train.id}
                    className="absolute -top-3 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                    style={{ left: `${percent}%` }}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black font-mono border-2 shadow-lg transition-transform group-hover:scale-125 ${
                      isFreight
                        ? 'bg-slate-700 border-slate-400 text-white'
                        : train.priority === 1
                        ? 'bg-amber-500 border-white text-slate-950 animate-pulse'
                        : 'bg-sky-500 border-sky-200 text-white'
                    }`}>
                      {train.number.slice(-3)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 mt-1 whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800 shadow">
                      {train.number} ({train.currentSpeed} km/h)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Station Nodes along the bottom */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              {CORRIDOR_STATIONS.map(s => (
                <div key={s.code} className="flex flex-col items-center">
                  <span className="font-bold text-slate-200">{s.code}</span>
                  <span className="text-[9px] text-slate-500">{s.km}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

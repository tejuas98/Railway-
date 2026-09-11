import React, { useState } from 'react';
import {
  Monitor,
  Clock,
  AlertTriangle,
  Building2,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ArrowUpDown,
  Radio
} from 'lucide-react';
import { CORRIDOR_STATIONS } from '../data/corridorData';
import { calculateDynamicGatiSetuEta, calculateLegacyNtesEta } from '../engine/gatiSetuEngine';

export default function StationCidsDisplay({ trains, disruptions }) {
  const [selectedStationCode, setSelectedStationCode] = useState('CNB'); // Default to Kanpur Central

  const station = CORRIDOR_STATIONS.find(s => s.code === selectedStationCode) || CORRIDOR_STATIONS[6];

  // Map trains arriving or scheduled at this station
  const stationTrains = trains.filter(t => t.schedule.some(s => s.code === selectedStationCode) || t.targetStation === selectedStationCode);

  // Platform layout status for Kanpur Central (CNB)
  const platforms = [
    { num: 1, train: '14163 Sangam Exp', status: 'Occupied (Cleaning)', clearInMin: 24, badge: 'Blocked', color: 'rose' },
    { num: 2, train: '22436 Vande Bharat', status: 'Reserved / Incoming', clearInMin: 0, badge: 'Assigned', color: 'emerald' },
    { num: 3, train: '12418 Prayagraj Exp', status: 'Clear / Signal Ready', clearInMin: 0, badge: 'Clear', color: 'slate' },
    { num: 4, train: 'Empty', status: 'Clear', clearInMin: 0, badge: 'Clear', color: 'slate' },
    { num: 5, train: '12560 Shiv Ganga', status: 'Reserved (Trailing Freight)', clearInMin: 0, badge: 'Assigned', color: 'amber' },
    { num: 6, train: '12398 Mahabodhi Exp', status: 'Clear', clearInMin: 0, badge: 'Clear', color: 'slate' },
    { num: 7, train: 'Empty', status: 'Clear', clearInMin: 0, badge: 'Clear', color: 'slate' },
    { num: 8, train: 'Empty', status: 'Clear', clearInMin: 0, badge: 'Clear', color: 'slate' },
    { num: 9, train: 'Goods Loop', status: 'Freight Transit Line', clearInMin: 0, badge: 'Goods', color: 'slate' },
    { num: 10, train: 'Yard Shunt', status: 'Empty Rake Stabling', clearInMin: 0, badge: 'Shunting', color: 'slate' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Station Switcher */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono tracking-wider uppercase mb-1">
            <Monitor className="w-4 h-4" />
            <span>INDIAN RAILWAYS • CUSTOMER INFORMATION DISPLAY SYSTEM (CIDS)</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span>{station.name}</span>
            <span className="text-amber-400 font-mono text-xl">({station.code})</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal border border-slate-700">
              {station.division} Division • {station.zone} Zone
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Select Station:</span>
          {['NDLS', 'CNB', 'PRYJ', 'DDU'].map(code => (
            <button
              key={code}
              id={`btn-cids-station-${code}`}
              onClick={() => setSelectedStationCode(code)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                selectedStationCode === code
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Electronic Display Board (Concourse Yellow LED Matrix Style) */}
      <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-400 font-mono font-bold tracking-widest text-sm uppercase">
              LIVE ARRIVALS & FORECAST DISPLAY • {station.name.toUpperCase()}
            </span>
          </div>
          <div className="font-mono text-amber-400 text-sm font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>GATI-SETU DYNAMIC FEED ACTIVE</span>
          </div>
        </div>

        {/* Table of Arrivals */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="text-xs text-amber-300/70 border-b border-slate-800 uppercase tracking-wider">
                <th className="py-3 px-3">Train #</th>
                <th className="py-3 px-3">Train Name</th>
                <th className="py-3 px-3">From</th>
                <th className="py-3 px-3">Timetable Arr</th>
                <th className="py-3 px-3 text-red-400">NTES (Old)</th>
                <th className="py-3 px-3 text-emerald-400">GATI-SETU (Dynamic)</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Current Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {stationTrains.map(t => {
                const sched = t.schedule.find(s => s.code === selectedStationCode);
                const ntes = calculateLegacyNtesEta(t, selectedStationCode);
                const gati = calculateDynamicGatiSetuEta(t, selectedStationCode, disruptions, trains);
                const isHeld = gati.isHeldAtOuterSignal;

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      isHeld ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 font-bold text-amber-400">{t.number}</td>
                    <td className="py-3.5 px-3 font-sans font-semibold text-slate-100">{t.name}</td>
                    <td className="py-3.5 px-3 text-slate-400">{t.origin}</td>
                    <td className="py-3.5 px-3 text-slate-400">{sched ? sched.schArr : '--:--'}</td>
                    <td className="py-3.5 px-3 text-slate-400 line-through decoration-red-500/60">
                      {ntes.etaTime} (+{ntes.predictedDelayMin}m)
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-emerald-400 text-sm">
                        {gati.etaTime}
                      </span>
                      <span className="text-[10px] text-rose-400 block">
                        +{gati.totalDelayMin}m actual
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        t.targetPlatform === 'PF-1' && disruptions.platformStatus.outerSignalHoldActive
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {t.targetPlatform || 'PF-TBD'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {isHeld ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                          STALLED AT OUTER SIGNAL (PF 1 BLOCKED)
                        </span>
                      ) : gati.totalDelayMin > 15 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          Regulated by Signals (+{gati.totalDelayMin}m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle className="w-3 h-3" />
                          Running on Priority Green
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Real-Time Congestion Grid */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              {station.name} ({station.code}) Yard Platform Readiness State
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            10 Main & Loop Platform Lines Tracked in Real Time
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {platforms.map(pf => (
            <div
              key={pf.num}
              className={`p-3.5 rounded-2xl border transition-all ${
                pf.color === 'rose'
                  ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30'
                  : pf.color === 'emerald'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : pf.color === 'amber'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-black text-amber-400">PF-{pf.num}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  pf.color === 'rose'
                    ? 'bg-rose-500 text-white'
                    : pf.color === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {pf.badge}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 truncate">{pf.train}</div>
              <div className="text-[11px] text-slate-400 mt-1">{pf.status}</div>
              {pf.clearInMin > 0 && (
                <div className="text-[10px] font-mono text-rose-400 font-bold mt-1">
                  Clears in ~{pf.clearInMin} mins
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

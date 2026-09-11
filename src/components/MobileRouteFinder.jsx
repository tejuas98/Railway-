import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRightLeft,
  Clock,
  Calendar,
  IndianRupee,
  Navigation,
  MapPin,
  RefreshCw,
  Share2,
  Bell,
  SlidersHorizontal,
  Train,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Layers,
  Box,
  Eye,
  Zap,
  Gauge,
  Satellite,
  Compass,
  Volume2,
  Sparkles,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { POPULAR_STATIONS, RECENT_SEARCHES, ROUTE_TRAINS } from '../data/routesData';

export default function MobileRouteFinder({ onSelectCorridorTrain }) {
  // Screen Mode: 'search' | 'results' | 'live_status'
  const [screenMode, setScreenMode] = useState('search');
  
  // Search State
  const [fromStation, setFromStation] = useState('PUNE');
  const [toStation, setToStation] = useState('BSL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('All Dates');
  const [selectedQuota, setSelectedQuota] = useState('GN - Unreserved');
  const [selectedSort, setSelectedSort] = useState('departure');

  // Selected Train for Live Running Status
  const [activeTrain, setActiveTrain] = useState(ROUTE_TRAINS['PUNE_BSL'][0]);
  
  // View Mode in Live Running Status: 'timeline' | 'map2d' | 'view3d'
  const [viewMode, setViewMode] = useState('timeline');
  const [showIntermediateStations, setShowIntermediateStations] = useState(true);
  const [cameraMode3D, setCameraMode3D] = useState('cab'); // 'cab' | 'drone'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedSec, setLastUpdatedSec] = useState(4);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Auto-update counter
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec(prev => (prev >= 30 ? 2 : prev + 2));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Handle station swap
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    toast.success(`🔄 Swapped route: ${toStation} ⇋ ${temp}`);
  };

  // Compute available trains for current search
  const routeKey = `${fromStation}_${toStation}`;
  const reverseRouteKey = `${toStation}_${fromStation}`;
  const availableTrains = ROUTE_TRAINS[routeKey] || ROUTE_TRAINS[reverseRouteKey] || ROUTE_TRAINS['PUNE_BSL'];

  // Handle Find Trains click
  const handleFindTrains = () => {
    if (fromStation === toStation) {
      toast.error('Origin and Destination stations cannot be the same!');
      return;
    }
    setScreenMode('results');
    const fromName = POPULAR_STATIONS.find(s => s.code === fromStation)?.name || fromStation;
    const toName = POPULAR_STATIONS.find(s => s.code === toStation)?.name || toStation;
    toast.success(`🚆 Found ${availableTrains.length} trains between ${fromName} and ${toName}`);
  };

  // Open Train Live Running Status
  const handleOpenLiveStatus = (train) => {
    setActiveTrain(train);
    setScreenMode('live_status');
    toast.info(`📍 Tracking Train #${train.number} (${train.name})`);
  };

  // 3D Rail Corridor Canvas Simulation
  useEffect(() => {
    if (screenMode !== 'live_status' || viewMode !== 'view3d') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 420);

    let zOffset = 0;
    const speed = (activeTrain?.speedKmH || 75) * 0.15;

    const render3D = () => {
      ctx.clearRect(0, 0, width, height);

      // Sky & Horizon gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(0.7, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Distant mountains / terrain
      ctx.fillStyle = '#0a101d';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      for (let x = 0; x <= width; x += 40) {
        const my = height * 0.45 - Math.sin((x + zOffset * 0.2) * 0.015) * 25 - Math.cos(x * 0.03) * 15;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(width, height * 0.45);
      ctx.closePath();
      ctx.fill();

      // Ballast ground gradient
      const groundGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
      groundGrad.addColorStop(0, '#1e293b');
      groundGrad.addColorStop(0.3, '#182030');
      groundGrad.addColorStop(1, '#0b0f19');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);

      const vanishX = width / 2;
      const vanishY = height * 0.45;

      // Track Sleepers (Cross ties moving toward camera)
      zOffset = (zOffset + speed) % 60;
      const numSleepers = 32;

      ctx.lineWidth = 1.5;
      for (let i = numSleepers; i >= 1; i--) {
        const rawZ = i * 25 - zOffset;
        if (rawZ <= 5) continue;

        const scale = 320 / (rawZ + 80);
        const y = vanishY + (height - vanishY) * (1 - scale * 0.95);
        if (y < vanishY || y > height + 20) continue;

        const sleeperWidth = 140 * scale;
        const sleeperHeight = Math.max(3, 10 * scale);

        // Sleeper concrete block
        ctx.fillStyle = `rgba(100, 116, 139, ${Math.min(1, scale * 1.2)})`;
        ctx.fillRect(vanishX - sleeperWidth / 2, y, sleeperWidth, sleeperHeight);

        // Rail fastening clips
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(vanishX - sleeperWidth * 0.38, y - 1, 4 * scale, 3 * scale);
        ctx.fillRect(vanishX + sleeperWidth * 0.38 - 4 * scale, y - 1, 4 * scale, 3 * scale);
      }

      // Steel Rails (Perspective lines receding to vanishing point)
      const bottomRailSpacing = width * 0.32;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;

      // Left Rail
      ctx.beginPath();
      ctx.moveTo(vanishX - 8, vanishY);
      ctx.lineTo(vanishX - bottomRailSpacing, height);
      ctx.stroke();

      // Right Rail
      ctx.beginPath();
      ctx.moveTo(vanishX + 8, vanishY);
      ctx.lineTo(vanishX + bottomRailSpacing, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Overhead 25kV Catenary Wire & Contact Wire
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(vanishX, vanishY - 40);
      ctx.lineTo(vanishX, 0);
      ctx.stroke();

      // Catenary Mast Poles (receding into distance)
      for (let m = 5; m >= 1; m--) {
        const mastZ = m * 140 - (zOffset * 2.2);
        if (mastZ < 20) continue;
        const mScale = 320 / (mastZ + 100);
        const mX = vanishX + bottomRailSpacing * 1.35 * mScale;
        const mBaseY = vanishY + (height - vanishY) * (1 - mScale * 0.95);
        const mTopY = mBaseY - 180 * mScale;

        // Mast steel pillar
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = Math.max(2, 6 * mScale);
        ctx.beginPath();
        ctx.moveTo(mX, mBaseY);
        ctx.lineTo(mX, mTopY);
        ctx.lineTo(vanishX, mTopY + 15 * mScale);
        ctx.stroke();

        // Insulator
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(vanishX, mTopY + 15 * mScale, Math.max(2, 4 * mScale), 0, Math.PI * 2);
        ctx.fill();
      }

      // Live 4-Aspect Colour Light Signal Gantry ahead (at fixed distance)
      const signalZ = 280 - (zOffset % 280);
      const sScale = 320 / (signalZ + 80);
      const sX = vanishX - bottomRailSpacing * 1.25 * sScale;
      const sBaseY = vanishY + (height - vanishY) * (1 - sScale * 0.95);
      const sTopY = sBaseY - 160 * sScale;

      // Signal post
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(2, 5 * sScale);
      ctx.beginPath();
      ctx.moveTo(sX, sBaseY);
      ctx.lineTo(sX, sTopY);
      ctx.stroke();

      // Signal target head
      const targetW = 20 * sScale;
      const targetH = 50 * sScale;
      ctx.fillStyle = '#020617';
      ctx.fillRect(sX - targetW / 2, sTopY - targetH, targetW, targetH);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(sX - targetW / 2, sTopY - targetH, targetW, targetH);

      // Active Signal Aspect (Green or Yellow depending on train delay)
      const isYellow = activeTrain?.statusColor?.includes('red') || activeTrain?.statusColor?.includes('amber');
      ctx.fillStyle = isYellow ? '#f59e0b' : '#10b981';
      ctx.shadowColor = isYellow ? '#f59e0b' : '#10b981';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(sX, sTopY - (isYellow ? targetH * 0.5 : targetH * 0.8), Math.max(3, 6 * sScale), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Locomotive Front / Windshield Frame (if in Cab View)
      if (cameraMode3D === 'cab') {
        // Cab dashboard bottom
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(0, height - 85);
        ctx.lineTo(width * 0.2, height - 95);
        ctx.lineTo(width * 0.8, height - 95);
        ctx.lineTo(width, height - 85);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cab windshield wipers
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width * 0.35, height - 95);
        ctx.lineTo(width * 0.42, height - 160);
        ctx.stroke();

        // Twin headlight beams projecting onto track
        const beamGrad = ctx.createRadialGradient(
          vanishX, height - 95, 20,
          vanishX, height * 0.7, width * 0.4
        );
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        beamGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.12)');
        beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(width * 0.38, height - 95);
        ctx.lineTo(vanishX - bottomRailSpacing * 1.1, height);
        ctx.lineTo(vanishX + bottomRailSpacing * 1.1, height);
        ctx.lineTo(width * 0.62, height - 95);
        ctx.closePath();
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render3D);
    };

    render3D();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [screenMode, viewMode, activeTrain, cameraMode3D]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* ========================================================================= */}
      {/* SCREEN 1: "WHERE IS MY TRAIN" STATION-TO-STATION SEARCH (MATCHES SCREENSHOT 1) */}
      {/* ========================================================================= */}
      {screenMode === 'search' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Mobile Brand Header */}
          <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden border border-sky-600/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
                  <Train className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                    Where is My Train
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                      GATI-SETU AI
                    </span>
                  </h1>
                  <p className="text-xs text-sky-200 font-sans">
                    Real-Time GPS, Live Stoppages, 2D Timeline &amp; 3D Track Radar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>NavIC Sat Synced</span>
              </div>
            </div>

            {/* Express / Metro Segmented Switcher */}
            <div className="bg-black/30 backdrop-blur-md p-1 rounded-2xl flex items-center max-w-xs mx-auto border border-white/10 text-xs font-bold mb-4">
              <button className="flex-1 py-1.5 rounded-xl bg-white text-slate-900 shadow-sm text-center">
                EXPRESS
              </button>
              <button className="flex-1 py-1.5 rounded-xl text-sky-200 hover:text-white text-center">
                METRO
              </button>
            </div>

            {/* Station Input Card (Exact Where-Is-My-Train styling) */}
            <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-xl space-y-3 relative">
              {/* From Station Input */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">From Station</div>
                  <select
                    id="select-from-station"
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    className="w-full font-bold text-slate-900 bg-transparent text-sm focus:outline-none cursor-pointer"
                  >
                    {POPULAR_STATIONS.map((s) => (
                      <option key={`from-${s.code}`} value={s.code}>
                        {s.code} • {s.name} ({s.state})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-mono text-xs font-bold">
                  {fromStation}
                </span>
              </div>

              {/* Floating Swap Button */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
                <button
                  id="btn-swap-stations"
                  onClick={handleSwapStations}
                  className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 border-white"
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft className="w-4 h-4 rotate-90" />
                </button>
              </div>

              {/* To Station Input */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">To Station</div>
                  <select
                    id="select-to-station"
                    value={toStation}
                    onChange={(e) => setToStation(e.target.value)}
                    className="w-full font-bold text-slate-900 bg-transparent text-sm focus:outline-none cursor-pointer"
                  >
                    {POPULAR_STATIONS.map((s) => (
                      <option key={`to-${s.code}`} value={s.code}>
                        {s.code} • {s.name} ({s.state})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-xs font-bold">
                  {toStation}
                </span>
              </div>

              {/* Big Green "Find Trains" Button */}
              <button
                id="btn-find-trains"
                onClick={handleFindTrains}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Find trains</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Direct Search Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
              <Train className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <input
                id="input-train-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Train No. / Train Name (e.g. 12779, 12302, Goa Exp)"
                className="bg-transparent text-xs sm:text-sm text-white focus:outline-none flex-1 placeholder:text-slate-500"
              />
              <button
                onClick={() => {
                  const match = availableTrains.find(
                    (t) => t.number.includes(searchQuery) || t.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (match) {
                    handleOpenLiveStatus(match);
                  } else {
                    toast.info(`Searching Pan-India database for "${searchQuery}"...`);
                    handleFindTrains();
                  }
                }}
                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Popular Route Shortcuts */}
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              <span className="text-slate-400 text-[11px] self-center">Popular:</span>
              <button
                onClick={() => {
                  setFromStation('PUNE');
                  setToStation('BSL');
                  toast.success('Selected route: Pune ⇋ Bhusaval (Goa Express)');
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900 text-sky-300 border border-sky-800/40 text-[11px] font-mono font-semibold"
              >
                PUNE ➔ BSL (Goa Exp)
              </button>
              <button
                onClick={() => {
                  setFromStation('NDLS');
                  setToStation('CNB');
                  toast.success('Selected route: New Delhi ⇋ Kanpur Central (Rajdhani)');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/40 text-[11px] font-mono font-semibold"
              >
                NDLS ➔ CNB (Rajdhani)
              </button>
              <button
                onClick={() => {
                  setFromStation('BCT');
                  setToStation('ADI');
                  toast.success('Selected route: Mumbai Central ⇋ Ahmedabad');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40 text-[11px] font-mono font-semibold"
              >
                BCT ➔ ADI (Shatabdi)
              </button>
            </div>
          </div>

          {/* Search History List (Matches Screenshot 1) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
              <span>SEARCH HISTORY</span>
              <span className="text-[10px] text-slate-500 font-mono">Recent 6</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {RECENT_SEARCHES.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFromStation(item.fromCode);
                    setToStation(item.toCode);
                    const trainMatch = availableTrains.find(t => t.number === item.trainNo);
                    if (trainMatch) {
                      handleOpenLiveStatus(trainMatch);
                    } else {
                      handleFindTrains();
                    }
                  }}
                  className="py-3 flex items-center justify-between hover:bg-slate-800/50 px-2 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-sky-400 group-hover:text-amber-400">
                      {item.trainNo}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white">
                        {item.trainName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{item.fromCode} - {item.toCode}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: SEARCH RESULTS TRAIN LIST (MATCHES SCREENSHOT 4) */}
      {/* ========================================================================= */}
      {screenMode === 'results' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Results Navigation Top Bar */}
          <div className="bg-sky-800 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreenMode('search')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                title="Back to Station Search"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  Search results
                </h2>
                <p className="text-xs text-sky-200 font-mono">
                  {fromStation} • {POPULAR_STATIONS.find(s => s.code === fromStation)?.name} ➔ {toStation} • {POPULAR_STATIONS.find(s => s.code === toStation)?.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleSwapStations}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              title="Swap Route Direction"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Bar: All Dates / Quota / Sort (Matches Screenshot 4) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>{selectedDate}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            <button className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5">
              <span>{selectedQuota}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            <button className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Sort by</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* List of Trains (Matches Screenshot 4) */}
          <div className="space-y-3">
            {availableTrains.map((train) => (
              <div
                key={train.id}
                onClick={() => handleOpenLiveStatus(train)}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:shadow-amber-500/5 group space-y-3"
              >
                {/* Line 1: Train Number, Times, Duration, Fare */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-xs font-bold border border-sky-800/40">
                      {train.number}
                    </span>
                    <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {train.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-white">{train.fare}</span>
                    <div className="text-[10px] text-slate-400">{train.fareClass}</div>
                  </div>
                </div>

                {/* Line 2: Origin Dep — Duration — Dest Arr */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="text-base font-extrabold text-white font-mono">{train.depTime}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{fromStation}</div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <span className="text-[11px] font-mono text-slate-400">{train.duration}</span>
                    <div className="w-24 sm:w-32 h-0.5 bg-slate-700 relative my-1">
                      <div className="w-2 h-2 rounded-full bg-sky-400 absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10px] text-slate-500">Direct Route</span>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-white font-mono">{train.arrTime}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{toStation}</div>
                  </div>
                </div>

                {/* Line 3: Running Days + Live Status Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dIdx) => (
                      <span
                        key={dIdx}
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold ${
                          train.runningDays?.includes(day)
                            ? 'text-sky-300 bg-sky-950/80 border border-sky-800/40'
                            : 'text-slate-600 bg-slate-950'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                    {train.runsDaily && (
                      <span className="text-[10px] text-emerald-400 font-semibold ml-1.5">
                        Runs Daily
                      </span>
                    )}
                  </div>

                  {/* Live Status Pill */}
                  <div className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-semibold flex items-center gap-1.5 ${train.statusBg} ${train.statusColor}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span>{train.liveStatusText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Seat Availability Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-slate-400 shadow-md">
            <span>Check seat availability on IRCTC</span>
            <ChevronRight className="w-4 h-4 text-sky-400" />
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: LIVE RUNNING STATUS VIEW (TIMELINE, 2D MAP & 3D CAB VIEW) */}
      {/* ========================================================================= */}
      {screenMode === 'live_status' && activeTrain && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Live Tracker Header (Matches Screenshots 2 & 3) */}
          <div className="bg-gradient-to-r from-sky-800 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-sky-700/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScreenMode('results')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="Back to Search Results"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                    <span>{activeTrain.number} - {activeTrain.name}</span>
                  </h2>
                  <p className="text-xs text-sky-200 font-mono">
                    ({fromStation} ➔ {toStation})
                  </p>
                </div>
              </div>

              {/* Action Buttons: Alarm, Coach, Share */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => toast.info('🔔 Destination Alarm set for 15 mins before arrival')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200"
                  title="Set Station Alarm"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toast.success(`📋 Rake Composition: ${activeTrain.loco} • 24 Coaches`)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200"
                  title="Coach Layout"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('🔗 Live Train Running Link Copied to Clipboard!');
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200"
                  title="Share Live Status"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Status Pill & Tractive Physics Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-white/10">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-amber-300 font-bold">
                  {activeTrain.loco}
                </span>
                <span className="text-sky-200">
                  ⚡ {activeTrain.hpPerTonne} HP/T
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-300">
                <Satellite className="w-3.5 h-3.5" />
                <span>{activeTrain.satLock}</span>
              </div>
            </div>
          </div>

          {/* VIEW MODE SWITCHER TABS: 2D Timeline | 2D Map | 3D Rail Cab View */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center justify-between gap-2 shadow-xl">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                id="btn-tab-timeline"
                onClick={() => setViewMode('timeline')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  viewMode === 'timeline'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>2D Station Timeline</span>
              </button>

              <button
                id="btn-tab-map2d"
                onClick={() => setViewMode('map2d')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  viewMode === 'map2d'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>2D Track Map</span>
              </button>

              <button
                id="btn-tab-view3d"
                onClick={() => setViewMode('view3d')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  viewMode === 'view3d'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Rail Perspective</span>
              </button>
            </div>

            {/* Toggle Intermediate Pass-Through Stations in Timeline */}
            {viewMode === 'timeline' && (
              <button
                onClick={() => setShowIntermediateStations(!showIntermediateStations)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition-colors"
              >
                {showIntermediateStations ? 'Hide Non-Stop' : 'Show Non-Stop (Pass)'}
              </button>
            )}

            {/* 3D Camera Mode Toggle */}
            {viewMode === 'view3d' && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setCameraMode3D('cab')}
                  className={`px-2 py-0.5 rounded ${cameraMode3D === 'cab' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
                >
                  Cab HUD
                </button>
                <button
                  onClick={() => setCameraMode3D('drone')}
                  className={`px-2 py-0.5 rounded ${cameraMode3D === 'drone' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
                >
                  Trackside
                </button>
              </div>
            )}
          </div>

          {/* GATI-SETU AI Diagnosis Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>GATI-SETU Operational Delay Diagnosis:</span>
              </div>
              <span className="font-mono text-[11px] text-sky-400 font-semibold">
                Confidence: {activeTrain.confidenceWindow}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeTrain.delayReason}
            </p>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 border-t border-slate-800 pt-1.5">
              <span>Friction / Adhesion: {activeTrain.weatherImpact}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUB-VIEW 1: 2D VERTICAL TIMELINE (EXACT WHERE-IS-MY-TRAIN LAYOUT) */}
          {/* ========================================================================= */}
          {viewMode === 'timeline' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              {/* Table Column Header (Matches Screenshot 2) */}
              <div className="grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 font-mono">
                <div className="col-span-3 text-left">Arrival</div>
                <div className="col-span-6 text-center text-sky-400">Station / Distance / Platform</div>
                <div className="col-span-3 text-right">Departure</div>
              </div>

              {/* Stations Vertical Track */}
              <div className="relative space-y-6 pt-2 pb-4">
                {/* Continuous Vertical Blue Track Line */}
                <div className="absolute left-1/2 top-4 bottom-4 w-1.5 -translate-x-1/2 bg-sky-500 rounded-full z-0" />

                {activeTrain.stations
                  ?.filter(s => showIntermediateStations || !s.isIntermediate)
                  .map((station, idx) => {
                    const hasDelay = station.delayMin > 0;

                    return (
                      <div
                        key={station.code}
                        className={`relative z-10 grid grid-cols-12 items-center text-xs py-1 transition-all ${
                          station.isCurrent ? 'bg-sky-500/10 -mx-2 px-2 rounded-2xl border border-sky-500/30' : ''
                        }`}
                      >
                        {/* Arrival Column (Sch in Grey, Predicted in Green/Red) */}
                        <div className="col-span-3 text-left space-y-0.5">
                          <div className="font-mono text-slate-400 text-[11px]">
                            {station.schArr}
                          </div>
                          <div className={`font-mono font-bold text-xs ${
                            hasDelay ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {station.actArr}
                          </div>
                        </div>

                        {/* Station Name, Platform and Track Pin */}
                        <div className="col-span-6 flex flex-col items-center justify-center text-center relative">
                          
                          {/* Live Train Pin Icon if Current Station (Matches Screenshot 2/3) */}
                          {station.isCurrent ? (
                            <div className="relative my-1">
                              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/50 border-2 border-white animate-bounce">
                                <Train className="w-4 h-4" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                          ) : (
                            <div className={`w-3.5 h-3.5 rounded-full border-2 my-1 z-10 ${
                              station.isPassed
                                ? 'bg-sky-500 border-white'
                                : 'bg-slate-900 border-sky-400'
                            }`} />
                          )}

                          {/* Station Name */}
                          <div className={`font-bold mt-0.5 ${
                            station.isCurrent ? 'text-white text-sm' : station.isIntermediate ? 'text-slate-400 text-[11px]' : 'text-slate-200'
                          }`}>
                            {station.name}
                          </div>

                          {/* Distance & Platform Pill */}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>{station.km} km</span>
                            {station.platform !== '--' && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
                                PF {station.platform}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Departure Column (Sch in Grey, Predicted in Green/Red) */}
                        <div className="col-span-3 text-right space-y-0.5">
                          <div className="font-mono text-slate-400 text-[11px]">
                            {station.schDep}
                          </div>
                          <div className={`font-mono font-bold text-xs ${
                            hasDelay ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {station.actDep}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 2: 2D GEOGRAPHIC / TRACK SCHEMATIC MAP */}
          {/* ========================================================================= */}
          {viewMode === 'map2d' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                <span className="font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>2D Line Schematic &amp; Signal Aspect Progression</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold text-[11px]">
                  Speed: {activeTrain.speedKmH} km/h • Course: {activeTrain.heading}
                </span>
              </div>

              {/* SVG 2D Track Map */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 overflow-x-auto">
                <svg viewBox="0 0 800 240" className="w-full h-auto min-w-[650px]">
                  {/* Track Base Lines */}
                  <line x1="40" y1="120" x2="760" y2="120" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                  <line x1="40" y1="120" x2="760" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,4" />

                  {/* Station Nodes along the route */}
                  {activeTrain.stations
                    ?.filter(s => !s.isIntermediate)
                    .slice(0, 6)
                    .map((stn, sIdx, arr) => {
                      const x = 60 + sIdx * (680 / (arr.length - 1));
                      return (
                        <g key={stn.code} className="cursor-pointer">
                          <circle
                            cx={x}
                            cy="120"
                            r={stn.isCurrent ? "8" : "5"}
                            fill={stn.isCurrent ? "#f59e0b" : stn.isPassed ? "#38bdf8" : "#64748b"}
                            stroke="#0f172a"
                            strokeWidth="2"
                          />
                          <text x={x} y="95" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
                            {stn.name}
                          </text>
                          <text x={x} y="145" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                            {stn.km} KM
                          </text>
                          <text x={x} y="160" textAnchor="middle" fill={stn.delayMin > 0 ? "#f87171" : "#34d399"} fontSize="9" fontWeight="bold" fontFamily="monospace">
                            {stn.actArr}
                          </text>
                        </g>
                      );
                    })}

                  {/* Active Train Graphic Marker on 2D line */}
                  <g transform="translate(420, 120)">
                    {/* Glowing pulse ring */}
                    <circle cx="0" cy="0" r="16" fill="#38bdf8" fillOpacity="0.25" className="animate-ping" />
                    <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                    
                    {/* Direction arrow */}
                    <polygon points="12,0 4,-5 4,5" fill="#f59e0b" />

                    {/* Speed Tag Badge */}
                    <rect x="-35" y="-35" width="70" height="18" rx="5" fill="#020617" stroke="#f59e0b" strokeWidth="1.2" />
                    <text x="0" y="-23" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {activeTrain.speedKmH} km/h
                    </text>
                  </g>

                  {/* Signal Gantry Aspect indicator ahead */}
                  <g transform="translate(540, 120)">
                    <rect x="-4" y="-45" width="8" height="45" fill="#475569" />
                    <circle cx="0" cy="-35" r="5" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)" />
                    <text x="0" y="-52" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">GREEN</text>
                  </g>
                </svg>
              </div>

              {/* Station Countdown Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">NEXT SCHEDULED STOP</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activeTrain.nextStationName}</div>
                  <div className="text-xs font-mono text-amber-400">{activeTrain.distToNextKm} km remaining</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">ESTIMATED ARRIVAL (GATI-SETU)</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {activeTrain.stations?.find(s => s.isCurrent)?.actArr || 'On Time'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">Confidence: 94%</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">CURRENT SECTION HEADWAY</div>
                  <div className="text-sm font-bold text-sky-300 mt-0.5">Green Aspect Corridor</div>
                  <div className="text-[11px] font-mono text-slate-400">Block Clearance 4.2 km</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 3: 3D RAIL CORRIDOR & CAB PERSPECTIVE */}
          {/* ========================================================================= */}
          {viewMode === 'view3d' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="font-bold text-white text-sm">
                    3D Rail Perspective: {cameraMode3D === 'cab' ? "Loco Pilot Cab HUD View" : "Trackside Isometric View"}
                  </h3>
                </div>

                <span className="font-mono text-xs text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800/40">
                  Speed: {activeTrain.speedKmH} km/h • OHE 25kV 50Hz
                </span>
              </div>

              {/* Interactive 3D Canvas Viewport */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                <canvas ref={canvasRef} className="w-full block" />

                {/* Cab HUD Overlay (Speedometer, Throttle, Power) */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 font-mono text-xs">
                  <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl space-y-1 shadow-lg">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">DIGITAL SPEEDOMETER</div>
                    <div className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                      {activeTrain.speedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
                    </div>
                    <div className="text-[10px] text-emerald-400">MPS 130 km/h Allowed</div>
                  </div>

                  <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2 rounded-xl text-[11px] text-slate-300 space-y-0.5">
                    <div>Tractive Effort: <strong className="text-amber-400">{activeTrain.hpPerTonne} HP/T</strong></div>
                    <div>Next Station: <strong className="text-white">{activeTrain.nextStationName} ({activeTrain.distToNextKm} km)</strong></div>
                  </div>
                </div>

                {/* Bottom Center 3D Controls Tip */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-slate-300 font-mono border border-white/10">
                  🎮 Real-Time 3D Track Physics • 25kV OHE Catenary &amp; 4-Aspect Signal Gantry
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BOTTOM STICKY STATUS BAR (MATCHES SCREENSHOTS 2 & 3) */}
          {/* ========================================================================= */}
          <div className="bg-slate-950/95 border border-slate-800 p-3.5 px-5 rounded-2xl flex items-center justify-between shadow-2xl sticky bottom-4 z-40 backdrop-blur-xl">
            {/* Map Pin Button to Switch to Map/3D */}
            <button
              onClick={() => {
                if (viewMode === 'timeline') setViewMode('map2d');
                else if (viewMode === 'map2d') setViewMode('view3d');
                else setViewMode('timeline');
              }}
              className="p-2.5 rounded-2xl bg-white text-slate-950 shadow-md hover:bg-slate-200 transition-transform active:scale-95 flex items-center justify-center"
              title="Toggle Timeline / 2D Map / 3D View"
            >
              <MapPin className="w-5 h-5 text-red-600 fill-red-600" />
            </button>

            {/* Next Station Distance & Update Timestamp */}
            <div className="text-center">
              <div className="text-sm font-bold text-red-400 font-sans">
                {activeTrain.distToNextKm} km to {activeTrain.nextStationName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Updated {lastUpdatedSec} seconds ago via ISRO NavIC
              </div>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-live-telemetry"
              onClick={() => {
                setIsRefreshing(true);
                setLastUpdatedSec(1);
                setTimeout(() => {
                  setIsRefreshing(false);
                  toast.success(`🔄 Synced latest GPS ping for #${activeTrain.number}`);
                }, 600);
              }}
              className="p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-transform active:scale-95"
              title="Refresh Live Status"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

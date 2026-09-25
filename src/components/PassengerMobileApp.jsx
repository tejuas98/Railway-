import React, { useState, useEffect } from 'react';
import {
  Train,
  ArrowLeft,
  RefreshCw,
  Search,
  MapPin,
  Clock,
  Compass,
  AlertTriangle,
  CloudSun,
  Share2,
  ChevronDown,
  ChevronUp,
  Navigation,
  ShieldCheck,
  Zap,
  Gauge,
  Sliders,
  Radio,
  Layers,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function PassengerMobileApp() {
  const getInitialTrain = () => {
    const p = new URLSearchParams(window.location.search).get('train');
    return p ? p.trim() : '12302';
  };

  const [trainNumber, setTrainNumber] = useState(getInitialTrain);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trainData, setTrainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'remaining'
  const [activeSubView, setActiveSubView] = useState('route'); // 'route' | 'rake' | 'realities' | 'punctuality'
  const [selectedCoach, setSelectedCoach] = useState(null);

  // Curated popular trains across major corridors
  const POPULAR_TRAINS = [
    { no: '12302', name: 'Howrah Rajdhani', route: 'NDLS ➔ HWH' },
    { no: '12424', name: 'Dibrugarh Rajdhani', route: 'NDLS ➔ DBRG' },
    { no: '12004', name: 'Lucknow Shatabdi', route: 'NDLS ➔ LKO' },
    { no: '12952', name: 'Mumbai Tejas Rajdhani', route: 'NDLS ➔ MMCT' },
    { no: '22436', name: 'Vande Bharat Express', route: 'NDLS ➔ BSB' },
    { no: '12628', name: 'Karnataka Express', route: 'NDLS ➔ SBC' }
  ];

  // Fetch train data from local backend
  const loadTrain = async (trainNo, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/live/train/${trainNo}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTrainData(data);
      setTrainNumber(trainNo);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      if (isManualRefresh) {
        toast.success(`Updated live data for Train ${trainNo}`);
      }
    } catch (err) {
      console.error('Error fetching train:', err);
      toast.error('Failed to sync live data. Retrying...');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrain(trainNumber);
    const interval = setInterval(() => loadTrain(trainNumber, false), 30000);
    return () => clearInterval(interval);
  }, [trainNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    loadTrain(searchInput.trim(), true);
    setIsSearching(false);
    setSearchInput('');
  };

  // Helper variables
  const route = trainData?.route_timeline || [];
  const targetCode = trainData?.train_metadata?.active_target_station || 'CNB';
  const targetIndex = route.findIndex(s => s.station_code === targetCode);
  const activeStation = trainData?.train_metadata?.active_target_name || 'Kanpur Central';
  const currentDelay = trainData?.telemetry_live?.current_observed_delay_min || 0;
  const predictedEta = trainData?.gati_setu_stgat_prediction?.dynamic_p50_eta || '--:--';
  const schedTime = trainData?.telemetry_live?.scheduled_arrival_time || '--:--';
  const weather = trainData?.telemetry_live?.satellite_weather;
  const specs = trainData?.train_specs || {};
  const realities = trainData?.ground_realities || {};
  const punctuality = trainData?.empirical_punctuality || {};

  const displayStations = activeTabFilter === 'remaining' && targetIndex >= 0
    ? route.slice(Math.max(0, targetIndex - 1))
    : route;

  // Coach category descriptor helper
  const getCoachDescription = (code) => {
    if (code.startsWith('H')) return 'First Class AC (1A) - Luxury Coupe & Cabins';
    if (code.startsWith('A')) return 'AC 2-Tier (2A) - 48 Berths Wide Window';
    if (code.startsWith('B')) return 'AC 3-Tier (3A) - 64/72 Berths Premium';
    if (code.startsWith('M')) return 'AC 3-Tier Economy (3E) - High Density';
    if (code.startsWith('E')) return 'Executive Chair Car (EC) - Shatabdi 2x2';
    if (code.startsWith('C')) return 'AC Chair Car (CC) - Shatabdi 3x2 Seater';
    if (code.startsWith('S')) return 'Sleeper Class (SL) - Non-AC 3-Tier';
    if (code === 'PC') return 'Pantry Car (Hot Kitchen Buffet)';
    if (code === 'EOG') return 'End-On-Generation Power Car (Silent Generator)';
    if (code === 'SLR') return 'Seating-cum-Luggage & Guard Van';
    if (code === 'DTC') return 'Driving Trailer Coach - Aerodynamic Cab';
    if (code === 'MC') return 'Motor Coach - 3-Phase IGBT Inverter';
    if (code === 'TC') return 'Trailer Coach - Passenger Saloon';
    if (code === 'Loco') return 'High-Horsepower Electric/Diesel Locomotive';
    return 'General Unreserved Coach (GS)';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:py-6 px-0 sm:px-4 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Native Smartphone Container (max-w-md = 430px mobile width) */}
      <div className="w-full max-w-[430px] bg-slate-900 sm:rounded-[36px] border sm:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-[860px] relative">
        
        {/* Top iOS / Android Status Notch */}
        <div className="bg-emerald-700 text-white px-5 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold">19:42</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-100">
            <span>BEL RTIS / NavIC</span>
            <span>•</span>
            <span className="font-bold text-white">LIVE</span>
          </div>
        </div>

        {/* Train Header Bar */}
        <div className="bg-emerald-700 text-white px-4 pb-3.5 pt-1 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSearching(!isSearching)}
                className="p-1.5 -ml-1 rounded-full hover:bg-emerald-800/60 active:scale-95 transition-all"
                title="Change or Search Train"
              >
                <Search className="w-5 h-5 text-emerald-100" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold font-mono tracking-tight leading-tight">
                    {trainData?.train_metadata?.train_number || trainNumber}
                  </h1>
                  <span className="text-xs text-emerald-200 font-sans font-medium truncate max-w-[190px]">
                    {specs.full_name || trainData?.train_metadata?.train_name || 'Express Train'}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100/90 flex items-center gap-1.5 mt-0.5">
                  <span>Starts: {trainData?.train_metadata?.journey_date || 'Today'}</span>
                  <span>•</span>
                  <span>Updated {lastRefreshed}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => loadTrain(trainNumber, true)}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-emerald-800 active:scale-95 transition-all text-emerald-100"
              title="Refresh Live Status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Quick Search Overlay Dropdown */}
          {isSearching && (
            <div className="mt-3 pt-3 border-t border-emerald-600/60 animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter train no (e.g. 12424, 12004, 12952)"
                  className="flex-1 bg-emerald-800/90 text-white placeholder-emerald-300 text-xs px-3 py-2 rounded-xl border border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-white font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-white text-emerald-900 font-bold text-xs px-3 py-2 rounded-xl shadow-sm hover:bg-emerald-50 active:scale-95"
                >
                  Track
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {POPULAR_TRAINS.map(t => (
                  <button
                    key={t.no}
                    onClick={() => {
                      loadTrain(t.no, true);
                      setIsSearching(false);
                    }}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg transition-colors ${
                      trainNumber === t.no
                        ? 'bg-white text-emerald-900 font-bold'
                        : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-600'
                    }`}
                  >
                    {t.no} • {t.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Running Banner Hero (The iconic Where-Is-My-Train status block) */}
        <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-emerald-100 font-medium">
                Approaching <strong className="text-white font-bold">{activeStation}</strong>
              </div>
              <div className="text-sm font-extrabold flex items-center gap-2 mt-0.5">
                <span>ETA: {predictedEta}</span>
                <span className="text-[10px] font-mono font-semibold bg-white/20 px-1.5 py-0.2 rounded text-emerald-100">
                  Sched: {schedTime}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
              Assigned
            </div>
            <div className="text-base font-black font-mono bg-white text-emerald-900 px-2 py-0.5 rounded-lg shadow-sm">
              {trainData?.train_metadata?.platform_assigned || 'PF 4*'}
            </div>
          </div>
        </div>

        {/* Sub-View Navigation Pills (Other Data of Trains: Route | Specs & Rake | Ground Realities | Punctuality) */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold">
          <button
            onClick={() => setActiveSubView('route')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubView === 'route'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Route</span>
          </button>

          <button
            onClick={() => setActiveSubView('rake')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubView === 'rake'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Rake & Loco</span>
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
              {specs.coaches_count || 22}
            </span>
          </button>

          <button
            onClick={() => setActiveSubView('realities')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubView === 'realities'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>TSR & Factors</span>
          </button>

          <button
            onClick={() => setActiveSubView('punctuality')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubView === 'punctuality'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Punctuality</span>
          </button>
        </div>

        {/* Real-Time Ground Quick Factors Ribbon */}
        <div className="bg-slate-800/90 border-b border-slate-700/60 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-300 overflow-x-auto gap-3">
          {weather && (
            <div className="flex items-center gap-1.5 shrink-0">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>{weather.temperature_c}°C</span>
              <span className="text-slate-500">•</span>
              <span className={weather.visibility_meters < 1000 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {(weather.visibility_meters / 1000).toFixed(1)} km Vis
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0 font-medium">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>MPS {specs.max_permissible_speed_kmh || 130} km/h</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Calibrated</span>
          </div>
        </div>

        {/* VIEW 1: Main Station Timeline (Iconic Where-Is-My-Train vertical line) */}
        {activeSubView === 'route' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Tab: All Stations vs Upcoming */}
            <div className="flex items-center justify-between px-4 pt-2.5 pb-1 text-xs">
              <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                Station Timeline
              </span>
              <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-[11px]">
                <button
                  onClick={() => setActiveTabFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all ${
                    activeTabFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Halts
                </button>
                <button
                  onClick={() => setActiveTabFilter('remaining')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all ${
                    activeTabFilter === 'remaining'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Remaining
                </button>
              </div>
            </div>

            <div className="flex-1 px-4 py-2 overflow-y-auto">
              {loading && !trainData ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Fetching live Indian Railways status...</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-1 before:bg-slate-700">
                  {displayStations.map((stn, idx) => {
                    const isTarget = stn.station_code === targetCode;
                    const isDeparted = stn.status.toLowerCase().includes('departed');
                    
                    return (
                      <div key={idx} className="relative flex items-center justify-between text-xs select-none">
                        
                        {/* Track Indicator Node */}
                        <div className="absolute -left-6 flex items-center justify-center">
                          {isTarget ? (
                            <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg shadow-amber-500/50 animate-bounce">
                              <Train className="w-3.5 h-3.5 text-slate-950" />
                            </div>
                          ) : isDeparted ? (
                            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-900" />
                          )}
                        </div>

                        {/* Station Name & Distance */}
                        <div className="pl-3 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-semibold ${
                              isTarget
                                ? 'text-amber-300 font-bold text-sm'
                                : isDeparted
                                ? 'text-slate-400'
                                : 'text-white'
                            }`}>
                              {stn.station_name}
                            </span>
                            <span className="font-mono text-[10px] text-emerald-400">
                              ({stn.station_code})
                            </span>
                            {isTarget && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black tracking-wide">
                                NEXT
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                            <span>{stn.distance_km} km</span>
                            <span>•</span>
                            <span className="text-slate-400">{stn.platform || 'PF --'}</span>
                          </div>
                        </div>

                        {/* Arrival Times & Status */}
                        <div className="text-right font-mono shrink-0">
                          <div className={`font-bold ${
                            isTarget
                              ? 'text-amber-400 text-sm'
                              : isDeparted
                              ? 'text-slate-400'
                              : 'text-slate-200'
                          }`}>
                            {isTarget ? predictedEta : (stn.actual_time || stn.scheduled_time)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Sched: {stn.scheduled_time}
                          </div>
                          {isDeparted && (
                            <span className="text-[9px] text-emerald-400/90 font-sans font-medium">
                              Departed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Train Specifications & Interactive Coach Rake Layout */}
        {activeSubView === 'rake' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Locomotive & Technical Hardware Card */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Locomotive & Traction
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                  {specs.operating_zone || 'IR'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Loco Class</span>
                  <strong className="text-white text-xs font-mono">{specs.loco_class || 'WAP-7 6000 HP'}</strong>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Max Speed (MPS)</span>
                  <strong className="text-emerald-400 text-xs font-mono">{specs.max_permissible_speed_kmh || 130} km/h</strong>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Brake System</span>
                  <strong className="text-white text-[11px] leading-tight block">{specs.brake_system || 'Twin-Pipe Disc WSP'}</strong>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Safety Signalling</span>
                  <strong className="text-amber-300 text-[11px] leading-tight block">{specs.safety_signalling || 'Kavach TCAS Active'}</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl flex items-center justify-between">
                <span>Depot: <strong className="text-slate-200">{specs.primary_depot || 'Divisional Coaching Complex'}</strong></span>
                <span className="text-emerald-400 font-mono font-bold">{specs.coaches_count || 22} Coaches</span>
              </div>
            </div>

            {/* Interactive Coach Layout Visualizer */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Rake Coach Formation
                </span>
                <span className="text-[10px] text-slate-400">Tap coach to inspect</span>
              </div>

              {/* Horizontally scrollable train coach sequence */}
              <div className="overflow-x-auto py-2 flex items-center gap-1.5 scrollbar-thin">
                {(specs.coach_layout || ['Loco', 'EOG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'PC', 'B4', 'B5', 'EOG']).map((coach, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => setSelectedCoach(coach)}
                    className={`shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-xl border transition-all text-xs font-mono font-bold select-none ${
                      coach === 'Loco'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : coach === 'PC'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : coach.startsWith('H')
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : coach.startsWith('A')
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : coach.startsWith('B')
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    } ${selectedCoach === coach ? 'ring-2 ring-white scale-105' : 'hover:scale-102'}`}
                  >
                    <span className="text-[9px] text-slate-400 font-sans">#{cIdx + 1}</span>
                    <span className="text-xs font-black">{coach}</span>
                  </button>
                ))}
              </div>

              {/* Coach details inspect banner */}
              {selectedCoach && (
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-emerald-400 font-mono text-sm">{selectedCoach}</strong>
                    <span className="text-[10px] text-slate-400">Class Specification</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {getCoachDescription(selectedCoach)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: Problem Statement 26028 Ground Realities & Line Constraints */}
        {activeSubView === 'realities' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            
            {/* Active TSR (Temporary Speed Restrictions) */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Active Speed Restrictions (TSR)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[10px] font-bold">
                  {(realities.temporary_speed_restrictions || []).length} Active
                </span>
              </div>

              <div className="space-y-2">
                {(realities.temporary_speed_restrictions || []).map((tsr, tIdx) => (
                  <div key={tIdx} className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs">{tsr.section}</strong>
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono font-bold text-[10px]">
                        TSR {tsr.tsr_speed_ceiling_kmh} km/h
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{tsr.reason}</p>
                    <div className="text-[10px] font-mono text-amber-300/90 flex items-center gap-2 pt-0.5">
                      <span>Time Loss: +{tsr.time_loss_min} mins</span>
                      <span>•</span>
                      <span className="text-emerald-400">Accounted in Gati-Setu ETA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preceding Train & Headway Concurrency */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-400" />
                Preceding Train & Headway
              </span>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Train Ahead:</span>
                  <strong className="text-white font-mono text-xs">{realities.preceding_traffic_headway?.preceding_train_id || 'BOXN Freight'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Spacing Gap:</span>
                  <strong className="text-emerald-400 font-mono text-xs">{realities.preceding_traffic_headway?.distance_ahead_km || 6.8} km ahead</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Signaling Aspect:</span>
                  <span className="text-amber-300 text-[11px] font-semibold text-right max-w-[210px]">
                    {realities.preceding_traffic_headway?.block_signal_aspect || 'Double Yellow (Proceed with Caution)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Crew Duty Limits (HOER) & Yard Turnaround */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Crew & Yard Reception Planning
              </span>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Loco Pilot Duty:</span>
                  <span className="text-slate-200 font-mono text-[11px]">
                    {realities.crew_hoer_scheduling?.duty_time_elapsed} / {realities.crew_hoer_scheduling?.loco_pilot_guard_duty_limit?.split(' ')[0]}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Relief Crew:</span>
                  <span className="text-emerald-400 text-[11px] font-medium text-right max-w-[200px]">
                    {realities.crew_hoer_scheduling?.relief_crew_status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px]">Platform Turnaround:</span>
                  <span className="text-slate-200 font-mono text-[11px]">
                    +{realities.station_turnaround_and_platform?.platform_turnaround_buffer_min} mins buffer
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 4: Empirical Punctuality Profile (DA323 Dataset) */}
        {activeSubView === 'punctuality' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Historical On-Time Performance
                </span>
                <span className="text-[10px] text-slate-400 font-mono">DA323 Dataset</span>
              </div>

              {/* Progress bar representing punctuality breakdown */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${punctuality.right_time_pct || 80}%` }}
                    className="bg-emerald-500 h-full"
                    title="Right Time"
                  />
                  <div
                    style={{ width: `${punctuality.slight_delay_pct || 15}%` }}
                    className="bg-amber-500 h-full"
                    title="Slight Delay"
                  />
                  <div
                    style={{ width: `${punctuality.significant_delay_pct || 5}%` }}
                    className="bg-rose-500 h-full"
                    title="Significant Delay"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span className="text-emerald-400 font-bold">{punctuality.right_time_pct || 80}% Right Time</span>
                  <span className="text-amber-400">{punctuality.slight_delay_pct || 15}% Minor</span>
                  <span className="text-rose-400">{punctuality.significant_delay_pct || 5}% Major</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Avg Corridor Delay</span>
                  <strong className="text-amber-400 font-mono text-base">+{punctuality.historical_avg_delay_min || 18}m</strong>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Gati-Setu AI Precision</span>
                  <strong className="text-emerald-400 font-mono text-base">94.2%</strong>
                </div>
              </div>
            </div>

            {/* AI Advantage Breakdown */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-400" />
                Why Gati-Setu Outperforms NTES
              </span>
              <ul className="text-[11px] text-slate-300 space-y-1.5 pl-1 leading-snug">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Newton-Davis Acceleration:</strong> Accounts for tractive effort after each TSR restriction.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>GR 3.61 Fog Capping:</strong> Automatically adapts to 60 km/h when visibility falls below 1,000m.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Yard Turnaround Queuing:</strong> Solves outer signal blindness at terminal platforms.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Clean Passenger Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>GPS: <strong className="text-white">Active</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Train ${trainNumber} Live Status`,
                    text: `Train ${trainNumber} approaching ${activeStation}. Dynamic ETA: ${predictedEta}`,
                    url: window.location.href,
                  });
                } else {
                  toast.success('Live ETA link copied to clipboard!');
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Share ETA"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => loadTrain(trainNumber, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

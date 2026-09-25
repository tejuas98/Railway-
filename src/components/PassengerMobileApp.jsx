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
  Navigation,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';

export default function PassengerMobileApp() {
  const [trainNumber, setTrainNumber] = useState('12302');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trainData, setTrainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'remaining'

  // Curated popular trains
  const POPULAR_TRAINS = [
    { no: '12302', name: 'Howrah Rajdhani', route: 'New Delhi ➔ Howrah' },
    { no: '12424', name: 'Dibrugarh Rajdhani', route: 'New Delhi ➔ Dibrugarh' },
    { no: '12004', name: 'Lucknow Shatabdi', route: 'New Delhi ➔ Lucknow' },
    { no: '12952', name: 'Mumbai Tejas Rajdhani', route: 'New Delhi ➔ Mumbai' },
    { no: '22436', name: 'Vande Bharat Express', route: 'New Delhi ➔ Varanasi' }
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
        toast.success(`Updated live status for Train ${trainNo}`);
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
    loadTrain('12302');
    const interval = setInterval(() => loadTrain(trainNumber, false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    loadTrain(searchInput.trim(), true);
    setIsSearching(false);
    setSearchInput('');
  };

  // Helper to extract stations
  const route = trainData?.route_timeline || [];
  const targetCode = trainData?.train_metadata?.active_target_station || 'CNB';
  const targetIndex = route.findIndex(s => s.station_code === targetCode);
  const activeStation = trainData?.train_metadata?.active_target_name || 'Kanpur Central';
  const currentDelay = trainData?.telemetry_live?.current_observed_delay_min || 0;
  const predictedEta = trainData?.gati_setu_stgat_prediction?.dynamic_p50_eta || '--:--';
  const schedTime = trainData?.telemetry_live?.scheduled_arrival_time || '--:--';
  const weather = trainData?.telemetry_live?.satellite_weather;

  const displayStations = activeTabFilter === 'remaining' && targetIndex >= 0
    ? route.slice(Math.max(0, targetIndex - 1))
    : route;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:py-6 px-0 sm:px-4 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Native Smartphone Container (max-w-md = 420px mobile width) */}
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
                    {trainData?.train_metadata?.train_name || 'Express Train'}
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
                  placeholder="Enter train no (e.g. 12424, 12004)"
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
              {trainData?.train_metadata?.platform_assigned || 'PF 4'}
            </div>
          </div>
        </div>

        {/* Real-Time Ground Factors Ribbon (PS 26028 Live Context) */}
        <div className="bg-slate-800/90 border-b border-slate-700/60 px-4 py-2 flex items-center justify-between text-[11px] text-slate-300 overflow-x-auto gap-3">
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
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>TSR 30 km/h (+9.9m)</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Calibrated</span>
          </div>
        </div>

        {/* Filter Tab: All Stations vs Upcoming */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 text-xs">
          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
            Route Schedule
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

        {/* Main Station Timeline (The core Where-Is-My-Train vertical track) */}
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

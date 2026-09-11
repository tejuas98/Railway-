import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Train,
  Monitor,
  Cpu,
  FileText,
  Radio,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Satellite,
  CloudSun,
  RefreshCw,
  Compass,
  Search
} from 'lucide-react';

import { INITIAL_TRAINS } from './data/trainsData';
import { INITIAL_DISRUPTIONS } from './data/disruptionsData';
import { fetchLiveStationWeather } from './services/weatherService';
import PassengerTracker from './components/PassengerTracker';
import StationCidsDisplay from './components/StationCidsDisplay';
import SectionControllerCockpit from './components/SectionControllerCockpit';
import AuditDossier from './components/AuditDossier';
import PanIndiaLiveMap from './components/PanIndiaLiveMap';
import MobileRouteFinder from './components/MobileRouteFinder';

export default function App() {
  // Navigation tabs: 'route' | 'passenger' | 'station' | 'controller' | 'map' | 'dossier'
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (['route', 'passenger', 'station', 'controller', 'map', 'dossier'].includes(tabParam)) {
      return tabParam;
    }
    return 'route'; // Default to the Where-Is-My-Train Station-to-Station route finder!
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Core Simulation State
  const [trains, setTrains] = useState(INITIAL_TRAINS);
  const [selectedTrainId, setSelectedTrainId] = useState('12302'); // Default to Howrah Rajdhani
  const [disruptions, setDisruptions] = useState(INITIAL_DISRUPTIONS);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [telemetryTicks, setTelemetryTicks] = useState(184);

  // Live External Weather API State
  const [liveWeather, setLiveWeather] = useState({
    success: true,
    stationCode: 'CNB',
    stationName: 'Kanpur Central',
    temperature: 28.4,
    humidity: 68,
    visibilityMeters: 4500,
    windSpeed: 8.2,
    weatherCode: 1,
    isFoggy: false,
    isFsdRuleActive: false,
    fetchedAt: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    provider: 'Open-Meteo Live Satellite Grid (WMO Compliant)'
  });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const loadLiveWeather = async (silent = false, stationCode = 'CNB') => {
    setIsWeatherLoading(true);
    const data = await fetchLiveStationWeather(stationCode);
    setLiveWeather(data);
    setIsWeatherLoading(false);
    if (!silent) {
      toast.success(`🌤️ Live API Synced: ${data.stationName} (${data.stationCode}) • ${data.temperature}°C • ${(data.visibilityMeters/1000).toFixed(1)} km Visibility`);
    }
  };

  useEffect(() => {
    loadLiveWeather(true, 'CNB');
    const weatherInterval = setInterval(() => loadLiveWeather(true, liveWeather?.stationCode || 'CNB'), 60000); // 60s live weather sync
    return () => clearInterval(weatherInterval);
  }, []);

  // Live Simulation Clock & Movement Tick
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTelemetryTicks(prev => prev + 1);

      setTrains(prevTrains =>
        prevTrains.map(train => {
          // Freight speed varies based on section; passenger speed based on friction
          let speed = train.currentSpeed;
          let kmIncrement = (speed / 3600) * 3 * simSpeed; // 3-second tick

          // If Howrah Rajdhani is held at outer signal
          if (
            train.id === '12302' &&
            disruptions.platformStatus.outerSignalHoldActive &&
            train.currentKm >= 436.8
          ) {
            speed = 0;
            kmIncrement = 0;
          }

          // Advance kilometer position smoothly
          let newKm = train.currentKm + kmIncrement;
          if (newKm > 786) newKm = 0; // loop back for continuous simulation

          return {
            ...train,
            currentKm: newKm,
            currentSpeed: speed,
            rtisStatus: {
              ...train.rtisStatus,
              pingsReceived: train.rtisStatus.pingsReceived + 1,
              lastPingSecAgo: Math.floor(Math.random() * 4) + 1
            }
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, disruptions]);

  // Handlers for Disruption Toggles
  const handleToggleTsr = () => {
    setDisruptions(prev => {
      const updated = {
        ...prev,
        tsrOrders: prev.tsrOrders.map((t, idx) =>
          idx === 0 ? { ...t, active: !t.active } : t
        )
      };
      const isActive = updated.tsrOrders[0].active;
      toast(isActive ? '⚠️ 30 km/h Caution Order Applied at Panki' : '✅ Caution Order Cleared at Panki', {
        description: isActive
          ? 'e-Caution order activated. GATI-SETU adds 9-14m running loss.'
          : 'Permanent speed profile restored. Travel times recalibrated.'
      });
      return updated;
    });
  };

  const handleToggleFog = () => {
    setDisruptions(prev => {
      const updated = {
        ...prev,
        weatherConditions: {
          ...prev.weatherConditions,
          fogActive: !prev.weatherConditions.fogActive
        }
      };
      const isActive = updated.weatherConditions.fogActive;
      toast(isActive ? '🌫️ Fog Safe Device Speed Ceiling Imposed (60 km/h)' : '☀️ Fog Cleared: Normal 130 km/h MPS Restored', {
        description: isActive
          ? 'Visibility dropped < 150m in Tundla-Etawah sector. FSD rules enforced.'
          : 'Normal timetable speeds restored across Northern Railway.'
      });
      return updated;
    });
  };

  const handleTogglePlatformHold = () => {
    setDisruptions(prev => {
      const updated = {
        ...prev,
        platformStatus: {
          ...prev.platformStatus,
          outerSignalHoldActive: !prev.platformStatus.outerSignalHoldActive
        }
      };
      const isActive = updated.platformStatus.outerSignalHoldActive;
      toast(isActive ? '🛑 Platform 1 Blocked at Kanpur Central' : '🟢 Platform 1 Vacated & Signaled', {
        description: isActive
          ? 'Sangam Express cleaning delay traps incoming Rajdhani at outer signal.'
          : 'Interlocking set for Rajdhani entry. Outer signal holding released.'
      });
      return updated;
    });
  };

  const handleExecuteOvertake = () => {
    setDisruptions(prev => ({
      ...prev,
      dispatchPrecedence: {
        ...prev.dispatchPrecedence,
        status: 'Executed'
      }
    }));

    // Update trains to reflect freight looped and express cleared
    setTrains(prev =>
      prev.map(t => {
        if (t.id === 'BOXN-8422') {
          return { ...t, currentSpeed: 0, targetPlatform: 'ETW Loop-2 (Diverted)' };
        }
        if (t.id === '12560') {
          return { ...t, currentSpeed: 120, initialDelayMin: Math.max(3, t.initialDelayMin - 19) };
        }
        return t;
      })
    );

    toast.success('⚡ AI Dispatch Precedence Executed!', {
      description: 'BOXN Coal Rake diverted into Etawah Loop 2. Green corridor cleared for Shiv Ganga Express (saved 19 mins).'
    });
  };

  const handleResetSimulation = () => {
    setTrains(INITIAL_TRAINS);
    setDisruptions(INITIAL_DISRUPTIONS);
    toast.info('🔄 Simulation Reset to Baseline Corridor State');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Toaster position="top-right" richColors />

      {/* Top Ministry Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-sky-800 to-indigo-950 text-[11px] font-semibold py-1.5 px-4 text-center border-b border-amber-500/20 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-amber-300">
            SIH 2026 • Problem Statement ID: 26028
          </span>
          <span className="hidden sm:inline text-slate-200">
            Ministry of Railways | Smart Automation Software Theme
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <Satellite className="w-3.5 h-3.5" />
            ISRO NavIC / GAGAN Telemetry Synced
          </span>
          <span className="hidden md:inline text-amber-300">
            Ticks: #{telemetryTicks}
          </span>
        </div>
      </div>

      {/* Live External API & Weather Integration Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-500/30 text-sky-300 font-semibold">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span>LIVE METEOROLOGICAL API (Open-Meteo):</span>
          </span>
          {liveWeather ? (
            <span className="text-slate-300 font-mono flex items-center gap-2">
              <strong className="text-white">{liveWeather.stationName} ({liveWeather.stationCode})</strong>: 
              <span className="text-amber-400 font-bold">{liveWeather.temperature}°C</span>
              <span className="text-slate-500">•</span>
              <span>Humidity: <strong className="text-slate-200">{liveWeather.humidity}%</strong></span>
              <span className="text-slate-500">•</span>
              <span>Visibility: <strong className={liveWeather.visibilityMeters < 1000 ? "text-red-400" : "text-emerald-400"}>{(liveWeather.visibilityMeters / 1000).toFixed(1)} km</strong></span>
              {liveWeather.isFoggy && (
                <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800 text-[10px] font-bold">
                  ⚠️ FOG DETECTED (GR 3.61 SPEED CAP APPLIES)
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-500 italic">Connecting to Open-Meteo Satellite Feed...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Corridor Station Weather Selector */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            {['CNB', 'NDLS', 'PRYJ', 'DDU'].map((code) => (
              <button
                key={code}
                id={`btn-weather-stn-${code}`}
                onClick={() => loadLiveWeather(false, code)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                  liveWeather?.stationCode === code
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Fetch real live weather for ${code}`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadLiveWeather(false, liveWeather?.stationCode || 'CNB')}
            disabled={isWeatherLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs transition-colors"
            title="Re-sync live weather data from Open-Meteo"
          >
            <RefreshCw className={`w-3 h-3 ${isWeatherLoading ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span>{isWeatherLoading ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* Main Header & Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/30">
              <Train className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sketch text-2xl font-bold text-white tracking-wide">
                  GATI-SETU
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  v2.6 DYNAMIC ETA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Graph-Augmented Transit Intelligence for Indian Railways Coaching Trains
              </p>
            </div>
          </div>

          {/* Simulation Controls & Navigation Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Play/Pause & Speed Buttons */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 mr-2">
              <button
                id="btn-play-pause-sim"
                onClick={() => setIsSimulating(!isSimulating)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSimulating ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
                title={isSimulating ? 'Pause Telemetry' : 'Resume Telemetry'}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                id="btn-speed-toggle"
                onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
                className="px-2 py-1 text-[11px] font-mono font-bold text-slate-300 hover:text-amber-400"
                title="Simulation Speed Multiplier"
              >
                {simSpeed}x
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
              <button
                id="nav-tab-route"
                onClick={() => setActiveTab('route')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'route'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-emerald-300" />
                <span>Find Trains (2D/3D)</span>
              </button>

              <button
                id="nav-tab-passenger"
                onClick={() => setActiveTab('passenger')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'passenger'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Passenger Tracker</span>
              </button>

              <button
                id="nav-tab-station"
                onClick={() => setActiveTab('station')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'station'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Station CIDS Board</span>
              </button>

              <button
                id="nav-tab-controller"
                onClick={() => setActiveTab('controller')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'controller'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Controller Cockpit</span>
              </button>

              <button
                id="nav-tab-map"
                onClick={() => setActiveTab('map')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'map'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Pan-India Live Radar</span>
              </button>

              <button
                id="nav-tab-dossier"
                onClick={() => setActiveTab('dossier')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'dossier'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Audit &amp; Solution Dossier</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {activeTab === 'route' && (
          <MobileRouteFinder
            onSelectCorridorTrain={(trainId) => {
              setSelectedTrainId(trainId);
              setActiveTab('passenger');
            }}
          />
        )}

        {activeTab === 'passenger' && (
          <PassengerTracker
            trains={trains}
            selectedTrainId={selectedTrainId}
            onSelectTrain={setSelectedTrainId}
            disruptions={disruptions}
            liveWeather={liveWeather}
          />
        )}

        {activeTab === 'station' && (
          <StationCidsDisplay
            trains={trains}
            disruptions={disruptions}
            liveWeather={liveWeather}
          />
        )}

        {activeTab === 'controller' && (
          <SectionControllerCockpit
            trains={trains}
            disruptions={disruptions}
            liveWeather={liveWeather}
            onToggleTsr={handleToggleTsr}
            onToggleFog={handleToggleFog}
            onTogglePlatformHold={handleTogglePlatformHold}
            onExecuteOvertake={handleExecuteOvertake}
            onResetSimulation={handleResetSimulation}
          />
        )}

        {activeTab === 'map' && (
          <PanIndiaLiveMap />
        )}

        {activeTab === 'dossier' && (
          <AuditDossier />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-sketch font-bold text-slate-300 text-base">GATI-SETU</span>
            <span>• SIH 2026 Problem Statement 26028</span>
            <span>• Ministry of Railways</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>ISRO NavIC / GAGAN</span>
            <span>•</span>
            <span>CRIS RTIS & COA Engine</span>
            <span>•</span>
            <span>Spatio-Temporal Graph Neural Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

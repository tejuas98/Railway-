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
  VolumeX,
  Sparkles,
  ArrowLeft,
  Filter,
  Sun,
  Moon,
  CloudSun,
  CloudRain,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';
import { toast } from 'sonner';
import { POPULAR_STATIONS, RECENT_SEARCHES, ROUTE_TRAINS } from '../data/routesData';
import { fetchLiveStationWeather } from '../services/weatherService';

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
  
  // 3D Perspective & Simulator States (Defaults to 3/4 Side Profile as requested!)
  const [cameraMode3D, setCameraMode3D] = useState('side'); // 'side' (Default!) | 'drone' | 'cab'
  const [timeOfDay, setTimeOfDay] = useState('dusk'); // 'day' | 'dusk' | 'night'
  const [customSpeed, setCustomSpeed] = useState(74); // dynamic speed slider
  const [isHornActive, setIsHornActive] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedSec, setLastUpdatedSec] = useState(4);

  // Live Open-Meteo Weather State & Adhesion Metrics
  const [stationWeather, setStationWeather] = useState(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Function to fetch live meteorological data from Open-Meteo
  const loadWeatherForTrain = async (train, silent = true) => {
    if (!train) return;
    setIsWeatherLoading(true);
    // Find active station code or fallback to 'HD' (Harda)
    const currentStnObj = train.stations?.find(s => s.isCurrent) || train.stations?.[train.stations.length - 1];
    const stnCode = currentStnObj?.code || 'HD';
    
    const wData = await fetchLiveStationWeather(stnCode);
    setStationWeather(wData);
    setIsWeatherLoading(false);

    setActiveTrain(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        weatherImpact: `${wData.railHeadCondition} • ${wData.temperature}°C • ${wData.adhesionText}`,
        weatherAdhesionMu: wData.adhesionMu,
        weatherAdvisory: wData.advisoryText,
        weatherData: wData
      };
    });

    if (!silent) {
      toast.success(`🌤️ Synced Open-Meteo Weather: ${wData.stationName} (${wData.temperature}°C, ${wData.humidity}% Hum) • ${wData.adhesionText}`);
    }
  };

  // Sync live weather on train change & every 45 seconds
  useEffect(() => {
    if (activeTrain?.number) {
      loadWeatherForTrain(activeTrain, true);
    }
    const wInterval = setInterval(() => {
      if (activeTrain?.number) {
        loadWeatherForTrain(activeTrain, true);
      }
    }, 45000);
    return () => clearInterval(wInterval);
  }, [activeTrain?.number]);

  // Sync customSpeed when activeTrain changes
  useEffect(() => {
    if (activeTrain?.speedKmH !== undefined) {
      setCustomSpeed(activeTrain.speedKmH);
    }
  }, [activeTrain?.number]);

  // REAL-TIME DISTANCE COUNTDOWN & STATION PROGRESSION ENGINE
  // Solves the problem where the train distance was stuck at the same KM!
  useEffect(() => {
    if (screenMode !== 'live_status') return;

    const interval = setInterval(() => {
      setLastUpdatedSec(prev => (prev >= 30 ? 2 : prev + 1));

      if (customSpeed <= 0) return; // Train is halted at station

      setActiveTrain(prev => {
        if (!prev) return prev;

        // Delta km per second = (speed in km/h) / 3600
        // e.g. at 74 km/h, train moves 0.0205 km per second (20.5 meters/sec)
        const deltaKm = (customSpeed / 3600) * 1.0;
        const currentDist = typeof prev.distToNextKm === 'number' ? prev.distToNextKm : 2.0;
        const newDist = Math.max(0, currentDist - deltaKm);

        // If distance reaches 0 (or within 20 meters), train arrives at the station!
        if (newDist <= 0.02) {
          const currentIdx = prev.stations?.findIndex(s => s.isCurrent) ?? -1;
          if (currentIdx !== -1 && currentIdx < prev.stations.length - 1) {
            const nextIdx = currentIdx + 1;
            const reachedStation = prev.stations[currentIdx];
            const nextStation = prev.stations[nextIdx];
            const interDist = Math.max(8.0, nextStation.km - reachedStation.km);

            toast.success(`🏁 #${prev.number} arrived at ${reachedStation.name}! Now departing towards ${nextStation.name} (${interDist} km)`);

            const updatedStations = prev.stations.map((s, idx) => {
              if (idx === currentIdx) {
                return { ...s, isCurrent: false, isPassed: true, status: 'Departed' };
              }
              if (idx === nextIdx) {
                return { ...s, isCurrent: true, isPassed: false, status: 'Arriving' };
              }
              return s;
            });

            // Trigger weather update for newly reached station
            loadWeatherForTrain({ ...prev, stations: updatedStations }, true);

            return {
              ...prev,
              distToNextKm: interDist,
              nextStationName: nextStation.name,
              currentStation: `Departed ${reachedStation.name}`,
              liveStatusText: `${interDist.toFixed(1)} km to ${nextStation.name} • Speed ${customSpeed} km/h`,
              stations: updatedStations
            };
          }
        }

        return {
          ...prev,
          distToNextKm: newDist,
          liveStatusText: `${newDist.toFixed(2)} km to ${prev.nextStationName} • Speed ${customSpeed} km/h`
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screenMode, customSpeed]);

  // Web Audio API Indian Railways Pneumatic Air Horn (311 Hz + 370 Hz dual-tone)
  const playAirHorn = () => {
    setIsHornActive(true);
    setTimeout(() => setIsHornActive(false), 1200);
    toast.info(`📢 Indian Railways Pneumatic Horn: 311 Hz + 370 Hz Air Blast!`);

    if (isSoundMuted) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(311, t); // D#4 tone (WAP-7 low horn)

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(370, t); // F#4 tone (WAP-7 high horn)

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.08);
      gain.gain.setValueAtTime(0.35, t + 0.75);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 1.25);
      osc2.stop(t + 1.25);
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  };

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
    setCustomSpeed(train.speedKmH || 74);
    setScreenMode('live_status');
    loadWeatherForTrain(train, false);
    toast.info(`📍 Tracking Train #${train.number} (${train.name})`);
  };

  // Helper function to draw a rotating steel wheel with spokes and counterweight
  const drawWheel = (ctx, cx, cy, radius, angle, speed) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Flanged steel wheel rim
    const rimGrad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
    rimGrad.addColorStop(0, '#475569');
    rimGrad.addColorStop(0.7, '#94a3b8');
    rimGrad.addColorStop(0.9, '#cbd5e1');
    rimGrad.addColorStop(1, '#334155');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner wheel disc
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Rotating spokes (6 spokes)
    ctx.strokeStyle = speed > 80 ? 'rgba(203, 213, 225, 0.4)' : '#94a3b8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const spkAngle = angle + (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(spkAngle) * radius * 0.68, Math.sin(spkAngle) * radius * 0.68);
      ctx.stroke();
    }

    // Axle center hub & brass cap
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Helper to draw a heavy 3-axle Co-Co locomotive bogie or 2-axle coach bogie
  const drawBogie = (ctx, x, y, width, wheelRadius, wheelAngle, speed, numAxles = 3) => {
    // Bogie cast steel frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y - 10, width, 12);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y - 10, width, 12);

    // Axles & suspension helical springs
    const spacing = width / (numAxles + 1);
    for (let i = 1; i <= numAxles; i++) {
      const wx = x + i * spacing;
      // Primary coil springs
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(wx - 4, y - 15, 8, 6);

      // Rotating Wheel
      drawWheel(ctx, wx, y, wheelRadius, wheelAngle, speed);
    }
  };

  // Helper to draw the authentic Indian Railways Electric Locomotive (WAP-7 / Vande Bharat)
  const drawLocomotive = (
    ctx,
    x,
    y,
    w,
    h,
    frontX,
    wheelAngle,
    contactWireY,
    speed,
    timeOfDay,
    isVandeBharat,
    train,
    isHornActive,
    frame
  ) => {
    ctx.save();

    // 1. Underframe & Heavy Co-Co Bogies (Front & Rear Bogies)
    const bogieW = 95;
    const wheelR = 15;
    const bogieY = y - wheelR;

    // Rear Bogie (3 Axles)
    drawBogie(ctx, x + 18, bogieY, bogieW, wheelR, wheelAngle, speed, 3);
    // Front Bogie (3 Axles)
    drawBogie(ctx, x + w - bogieW - 22, bogieY, bogieW, wheelR, wheelAngle, speed, 3);

    // Fuel/Battery and Transformer Under-slung Equipment between bogies
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + bogieW + 24, y - 28, w - (bogieW * 2 + 48), 16);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(x + bogieW + 24, y - 28, w - (bogieW * 2 + 48), 16);

    // 2. Locomotive Main Chasis Deck (Floor)
    const deckY = y - 30;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 6, deckY, w + 16, 6);

    // Cowcatcher (Cattle Guard) at the bottom front
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(frontX - 4, deckY + 6);
    ctx.lineTo(frontX + 16, y - 4);
    ctx.lineTo(frontX - 8, y - 4);
    ctx.closePath();
    ctx.fill();
    // Hazard diagonal stripes on cowcatcher
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(frontX, deckY + 10);
    ctx.lineTo(frontX + 10, y - 6);
    ctx.moveTo(frontX - 5, deckY + 12);
    ctx.lineTo(frontX + 4, y - 6);
    ctx.stroke();

    // Screw Coupler & Buffer beam
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(frontX - 2, deckY - 6, 8, 12);
    ctx.fillStyle = '#475569';
    ctx.fillRect(frontX + 6, deckY - 3, 10, 6);

    // 3. Main Locomotive Body Shell
    const bodyTop = deckY - h + 18;
    const bodyH = h - 24;

    if (isVandeBharat) {
      // Sleek Aerodynamic Bullet Nose (White & Navy Blue)
      const vGrad = ctx.createLinearGradient(x, bodyTop, frontX, bodyTop + bodyH);
      vGrad.addColorStop(0, '#f8fafc');
      vGrad.addColorStop(0.7, '#ffffff');
      vGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = vGrad;

      ctx.beginPath();
      ctx.moveTo(x, deckY);
      ctx.lineTo(frontX - 50, deckY);
      // Aerodynamic curved nose
      ctx.quadraticCurveTo(frontX + 10, deckY, frontX + 12, bodyTop + bodyH * 0.45);
      ctx.quadraticCurveTo(frontX - 10, bodyTop, frontX - 55, bodyTop);
      ctx.lineTo(x, bodyTop);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Royal Navy Blue Streak
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(x, bodyTop + bodyH * 0.45);
      ctx.lineTo(frontX - 40, bodyTop + bodyH * 0.45);
      ctx.quadraticCurveTo(frontX + 6, bodyTop + bodyH * 0.5, frontX + 8, bodyTop + bodyH * 0.7);
      ctx.lineTo(x, bodyTop + bodyH * 0.7);
      ctx.closePath();
      ctx.fill();
    } else {
      // Classic Indian Railways WAP-7 Locomotive Body (Red & Cream Livery)
      // Main Body Fill
      const locoGrad = ctx.createLinearGradient(x, bodyTop, frontX, bodyTop + bodyH);
      locoGrad.addColorStop(0, '#ffffff');
      locoGrad.addColorStop(0.5, '#f8fafc');
      locoGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = locoGrad;

      ctx.beginPath();
      ctx.moveTo(x, deckY);
      ctx.lineTo(frontX - 25, deckY);
      // Raked cab nose
      ctx.lineTo(frontX + 6, deckY - bodyH * 0.45);
      ctx.lineTo(frontX - 35, bodyTop);
      ctx.lineTo(x, bodyTop);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Iconic Central Crimson Red Stripe
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x, bodyTop + bodyH * 0.35);
      ctx.lineTo(frontX - 20, bodyTop + bodyH * 0.35);
      ctx.lineTo(frontX - 6, bodyTop + bodyH * 0.65);
      ctx.lineTo(x, bodyTop + bodyH * 0.65);
      ctx.closePath();
      ctx.fill();

      // Golden pinstripes
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, bodyTop + bodyH * 0.35);
      ctx.lineTo(frontX - 20, bodyTop + bodyH * 0.35);
      ctx.moveTo(x, bodyTop + bodyH * 0.65);
      ctx.lineTo(frontX - 6, bodyTop + bodyH * 0.65);
      ctx.stroke();

      // Indian Railways Stencil Markings
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('भारतीय रेल • INDIAN RAILWAYS', x + w * 0.42, bodyTop + bodyH * 0.54);

      // Locomotive Class Plate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + w * 0.28, bodyTop + bodyH * 0.72, 65, 12);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('WAP-7 #30412', x + w * 0.28 + 32, bodyTop + bodyH * 0.72 + 9);
    }

    // 4. Cab Windshield & Loco Pilot (Driver)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(frontX - 35, bodyTop + 4);
    ctx.lineTo(frontX - 2, bodyTop + bodyH * 0.38);
    ctx.lineTo(frontX - 25, bodyTop + bodyH * 0.38);
    ctx.lineTo(frontX - 45, bodyTop + 4);
    ctx.closePath();
    ctx.fill();

    // Windshield glass tint & reflection
    const glassGrad = ctx.createLinearGradient(frontX - 45, bodyTop, frontX - 2, bodyTop + bodyH * 0.38);
    glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    glassGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.4)');
    glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
    ctx.fillStyle = glassGrad;
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Loco Pilot Silhouette in Cab
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(frontX - 28, bodyTop + 16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(frontX - 33, bodyTop + 21, 10, 9);

    // Cab Windshield Wiper
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(frontX - 16, bodyTop + bodyH * 0.36);
    ctx.lineTo(frontX - 24, bodyTop + bodyH * 0.16);
    ctx.stroke();

    // 5. Dual High-Intensity Headlights
    const headlightX = frontX + 2;
    const headlightY = deckY - bodyH * 0.38;

    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(headlightX, headlightY, 6, 0, Math.PI * 2);
    ctx.arc(headlightX - 4, headlightY + 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 6. Rooftop Equipment & Raised Electric Pantograph
    // Roof AC pods & dynamic brake resistor bank
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 25, bodyTop - 6, 65, 6);
    ctx.fillRect(x + 110, bodyTop - 6, 80, 6);

    // Single-Arm High-Speed Pantograph (Reaching up to 25kV Catenary Contact Wire)
    const pantoBaseX = x + 60;
    const pantoBaseY = bodyTop;
    const pantoKneeX = pantoBaseX + 18;
    const pantoKneeY = bodyTop - (bodyTop - contactWireY) * 0.55;
    const pantoHeadX = pantoBaseX + 4;
    const pantoHeadY = contactWireY;

    // Lower & Upper Pantograph Arms (Orange / Red steel tubing)
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pantoBaseX, pantoBaseY);
    ctx.lineTo(pantoKneeX, pantoKneeY);
    ctx.lineTo(pantoHeadX, pantoHeadY);
    ctx.stroke();

    // Pantograph Collector Pan (Carbon strip sliding on contact wire)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pantoHeadX - 18, pantoHeadY);
    ctx.lineTo(pantoHeadX + 18, pantoHeadY);
    ctx.stroke();

    // Dynamic High-Speed Electrical Spark at Pantograph Contact Point!
    if (speed > 15 && Math.sin(frame * 0.6) > 0.4) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(pantoHeadX + (Math.random() * 6 - 3), pantoHeadY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 7. Roof Pneumatic Horn & Horn Audio Shockwaves
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(frontX - 48, bodyTop - 7, 14, 4);

    if (isHornActive) {
      // Golden animated soundwave rings expanding from horn!
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 2;
      for (let s = 1; s <= 3; s++) {
        ctx.beginPath();
        ctx.arc(frontX - 40, bodyTop - 8, s * 14 + (frame % 8) * 2, -Math.PI * 0.6, Math.PI * 0.1);
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  // Helper to draw coupled trailing LHB passenger coaches
  const drawLhbCoach = (ctx, x, y, w, h, wheelAngle, timeOfDay, isVandeBharat, coachIndex) => {
    ctx.save();

    // Underframe Bogies (2 FIAT bogies per coach, 2 axles each)
    const wheelR = 13;
    const bogieW = 55;
    const bogieY = y - wheelR;

    // Left Bogie
    drawBogie(ctx, x + 16, bogieY, bogieW, wheelR, wheelAngle, 80, 2);
    // Right Bogie
    drawBogie(ctx, x + w - bogieW - 16, bogieY, bogieW, wheelR, wheelAngle, 80, 2);

    // Coach Base Deck
    const deckY = y - 28;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, deckY, w, 5);

    // Coach Body Box
    const bodyTop = deckY - h + 22;
    const bodyH = h - 22;

    if (isVandeBharat) {
      // White and Blue Vande Bharat coach livery
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, bodyTop, w, bodyH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, bodyTop, w, bodyH);

      // Blue window band
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x, bodyTop + 14, w, 28);
    } else {
      // Classic Indian Railways Red & Grey LHB Coach livery
      ctx.fillStyle = '#e2e8f0'; // Silver-grey stainless steel body
      ctx.fillRect(x, bodyTop, w, bodyH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, bodyTop, w, bodyH);

      // Crimson Red Window Band (LHB Rajdhani style)
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x, bodyTop + 14, w, 28);

      // Yellow pinstripe
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, bodyTop + 12, w, 2);
      ctx.fillRect(x, bodyTop + 42, w, 2);
    }

    // Longitudinal corrugated roof ribs
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, bodyTop + 4);
    ctx.lineTo(x + w, bodyTop + 4);
    ctx.moveTo(x, bodyTop + 7);
    ctx.lineTo(x + w, bodyTop + 7);
    ctx.stroke();

    // Passenger Tinted Windows with warm interior lighting
    const numWindows = 6;
    const winW = (w - 30) / numWindows;
    for (let i = 0; i < numWindows; i++) {
      const winX = x + 15 + i * winW;
      const winY = bodyTop + 17;

      // Window Frame
      ctx.fillStyle = '#020617';
      ctx.fillRect(winX + 2, winY, winW - 6, 22);

      // Glowing Interior Glass
      ctx.fillStyle = timeOfDay === 'night' ? '#fef08a' : '#fef9c3';
      ctx.fillRect(winX + 3, winY + 1, winW - 8, 20);

      // Passenger silhouettes inside
      if (i % 2 === 0) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(winX + winW * 0.45, winY + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(winX + winW * 0.35, winY + 12, 7, 8);
      }
    }

    // Coach Type Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`LHB AC-3T • COACH B${coachIndex}`, x + w * 0.5, bodyTop + bodyH - 5);

    ctx.restore();
  };

  // Helper to draw flexible rubber vestibule bellows
  const drawVestibule = (ctx, x, y, w, h) => {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x, y - h - 6, w, h);
    // Accordion folds
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (let f = 0; f < w; f += 4) {
      ctx.beginPath();
      ctx.moveTo(x + f, y - h - 6);
      ctx.lineTo(x + f, y - 6);
      ctx.stroke();
    }
  };

  // Helper to draw Loco Pilot Cab Driver HUD View
  const drawCabDriverView = (ctx, width, height, speed, train, timeOfDay, frame, isHornActive) => {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    skyGrad.addColorStop(0, timeOfDay === 'night' ? '#020617' : timeOfDay === 'dusk' ? '#431407' : '#0284c7');
    skyGrad.addColorStop(1, timeOfDay === 'night' ? '#0f172a' : timeOfDay === 'dusk' ? '#ea580c' : '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.45);

    // Ground
    ctx.fillStyle = timeOfDay === 'night' ? '#0b0f19' : '#1e293b';
    ctx.fillRect(0, height * 0.45, width, height * 0.55);

    const vanishX = width / 2;
    const vanishY = height * 0.45;
    const bottomSpacing = width * 0.32;

    // Moving Sleepers
    const zOffset = (frame * speed * 0.15) % 60;
    for (let i = 28; i >= 1; i--) {
      const rawZ = i * 25 - zOffset;
      if (rawZ <= 5) continue;
      const scale = 320 / (rawZ + 80);
      const y = vanishY + (height - vanishY) * (1 - scale * 0.95);
      if (y < vanishY || y > height - 60) continue;
      const sleeperWidth = 140 * scale;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(vanishX - sleeperWidth / 2, y, sleeperWidth, Math.max(3, 8 * scale));
    }

    // Steel Rails converging to vanishing point
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(vanishX - 6, vanishY);
    ctx.lineTo(vanishX - bottomSpacing, height);
    ctx.moveTo(vanishX + 6, vanishY);
    ctx.lineTo(vanishX + bottomSpacing, height);
    ctx.stroke();

    // Headlight cone on track
    const beamGrad = ctx.createRadialGradient(vanishX, height - 90, 30, vanishX, height * 0.65, width * 0.4);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, height * 0.45, width, height * 0.55);

    // Driver Cab Dashboard Bottom
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, height - 90);
    ctx.lineTo(width * 0.2, height - 105);
    ctx.lineTo(width * 0.8, height - 105);
    ctx.lineTo(width, height - 90);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Windshield Wipers
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height - 105);
    ctx.lineTo(width * 0.42, height - 170);
    ctx.stroke();

    // Signal Gantry ahead (Green aspect)
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(vanishX - bottomSpacing * 0.8, vanishY - 20, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // 3D Rail Corridor Canvas Simulation Engine
  useEffect(() => {
    if (screenMode !== 'live_status' || viewMode !== 'view3d') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 440);

    let frame = 0;
    let wheelAngle = 0;
    let trackOffset = 0;
    let mountainOffset = 0;
    let treesOffset = 0;
    let catenaryOffset = 0;

    const render = () => {
      frame++;
      const currentSpd = customSpeed;
      const step = currentSpd * 0.14;

      // Continuous rotation & parallax scrolling based on actual speed
      wheelAngle = (wheelAngle + currentSpd * 0.08) % (Math.PI * 2);
      trackOffset = (trackOffset + step) % 36;
      catenaryOffset = (catenaryOffset + step) % 260;
      treesOffset = (treesOffset + step * 0.35) % width;
      mountainOffset = (mountainOffset + step * 0.08) % width;

      ctx.clearRect(0, 0, width, height);

      if (cameraMode3D === 'side' || cameraMode3D === 'drone') {
        // =======================================================
        // 3/4 SIDE-PROFILE CINEMATIC TRACKSIDE CAMERA (USER REQUESTED!)
        // =======================================================
        const isDrone = cameraMode3D === 'drone';
        const trackY = isDrone ? 340 : 315;
        const horizonY = isDrone ? 150 : 175;

        // 1. Sky Gradient based on timeOfDay
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        if (timeOfDay === 'day') {
          skyGrad.addColorStop(0, '#0284c7');
          skyGrad.addColorStop(0.6, '#38bdf8');
          skyGrad.addColorStop(1, '#bae6fd');
        } else if (timeOfDay === 'dusk') {
          skyGrad.addColorStop(0, '#0f172a');
          skyGrad.addColorStop(0.3, '#312e81');
          skyGrad.addColorStop(0.6, '#7c2d12');
          skyGrad.addColorStop(0.85, '#ea580c');
          skyGrad.addColorStop(1, '#fbbf24');
        } else {
          // Night
          skyGrad.addColorStop(0, '#020617');
          skyGrad.addColorStop(0.7, '#090d16');
          skyGrad.addColorStop(1, '#111827');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Celestial Body (Sun / Moon)
        if (timeOfDay === 'day') {
          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(width * 0.82, 45, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (timeOfDay === 'dusk') {
          ctx.fillStyle = '#fb923c';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.arc(width * 0.85, horizonY - 15, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Crescent Moon
          ctx.fillStyle = '#f8fafc';
          ctx.shadowColor = '#e2e8f0';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(width * 0.85, 45, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // 2. Parallax Distant Mountains (Deccan Plateau / Vindhya Range)
        ctx.fillStyle = timeOfDay === 'night' ? '#0b1120' : timeOfDay === 'dusk' ? '#2e1065' : '#0369a1';
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = 0; x <= width + 40; x += 30) {
          const mx = (x + mountainOffset) % (width + 60);
          const mh = Math.sin(mx * 0.008) * 35 + Math.cos(mx * 0.02) * 18 + 25;
          ctx.lineTo(x, horizonY - mh);
        }
        ctx.lineTo(width, horizonY);
        ctx.closePath();
        ctx.fill();

        // 3. Midground: Trees & Electrical Transmission Pylons
        ctx.fillStyle = timeOfDay === 'night' ? '#060a12' : timeOfDay === 'dusk' ? '#1c1917' : '#065f46';
        for (let t = -60; t < width + 60; t += 70) {
          const tx = (t - treesOffset + width + 140) % (width + 140) - 70;
          const treeH = 35 + Math.sin(tx * 0.1) * 12;
          ctx.beginPath();
          ctx.arc(tx, horizonY - treeH * 0.6, treeH * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(tx - 3, horizonY - treeH * 0.6, 6, treeH * 0.6);
        }

        // 4. Ground / Embankment below horizon
        const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
        if (timeOfDay === 'night') {
          groundGrad.addColorStop(0, '#0a0f1d');
          groundGrad.addColorStop(0.4, '#111827');
          groundGrad.addColorStop(1, '#05070c');
        } else if (timeOfDay === 'dusk') {
          groundGrad.addColorStop(0, '#292524');
          groundGrad.addColorStop(0.4, '#1c1917');
          groundGrad.addColorStop(1, '#0c0a09');
        } else {
          groundGrad.addColorStop(0, '#15803d');
          groundGrad.addColorStop(0.3, '#166534');
          groundGrad.addColorStop(0.6, '#334155');
          groundGrad.addColorStop(1, '#1e293b');
        }
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, horizonY, width, height - horizonY);

        // 5. Ballast Bed (Crushed granite stone trackbed)
        ctx.fillStyle = timeOfDay === 'night' ? '#182030' : '#334155';
        ctx.beginPath();
        ctx.moveTo(0, trackY - 20);
        ctx.lineTo(width, trackY - (isDrone ? 26 : 20));
        ctx.lineTo(width, trackY + 55);
        ctx.lineTo(0, trackY + 55);
        ctx.closePath();
        ctx.fill();

        // Ballast texture grain
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let bx = 0; bx < width; bx += 18) {
          ctx.fillRect(bx + (frame % 7), trackY - 15, 8, 45);
        }

        // 6. Concrete Monoblock Sleepers (Moving left at actual train speed!)
        const sleeperSpacing = 36;
        for (let sx = -sleeperSpacing; sx < width + sleeperSpacing; sx += sleeperSpacing) {
          const sleeperX = sx - trackOffset;
          ctx.fillStyle = '#64748b';
          ctx.fillRect(sleeperX, trackY - (isDrone ? 6 : 4), 16, isDrone ? 32 : 26);
          // Pandrol clip fastenings
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(sleeperX + 3, trackY - 2, 4, 3);
          ctx.fillRect(sleeperX + 9, trackY + (isDrone ? 18 : 14), 4, 3);
        }

        // 7. Dual Continuous Polished Steel Rails
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, trackY);
        ctx.lineTo(width, trackY - (isDrone ? 6 : 0));
        ctx.stroke();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, trackY + (isDrone ? 20 : 16));
        ctx.lineTo(width, trackY + (isDrone ? 14 : 16));
        ctx.stroke();

        // Top rail metallic specular highlight
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, trackY - 2);
        ctx.lineTo(width, trackY - (isDrone ? 8 : 2));
        ctx.stroke();

        // 8. 25kV Overhead Catenary System (Portal Masts + Contact Wire)
        const contactWireY = trackY - 145;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, contactWireY);
        ctx.lineTo(width, contactWireY);
        ctx.stroke();

        // Catenary Messenger Wire & Droppers
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, contactWireY - 22);
        for (let wx = 0; wx <= width; wx += 50) {
          const sag = Math.sin((wx - catenaryOffset) * 0.02) * 8;
          ctx.lineTo(wx, contactWireY - 22 + sag);
        }
        ctx.stroke();

        // Catenary Portal Masts passing by
        const mastDist = 260;
        for (let mx = -mastDist; mx < width + mastDist; mx += mastDist) {
          const mastX = mx - catenaryOffset;
          // Steel girder lattice pole
          ctx.fillStyle = '#475569';
          ctx.fillRect(mastX - 4, contactWireY - 50, 8, trackY - (contactWireY - 50) + 20);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.strokeRect(mastX - 4, contactWireY - 50, 8, trackY - (contactWireY - 50) + 20);

          // Cantilever horizontal bracket arm
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(mastX - 25, contactWireY - 32, 25, 4);

          // Porcelain insulator discs
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(mastX - 18, contactWireY - 26, 6, 8);
        }

        // Kilometer Marker Stone on the trackside (reflecting real remaining distance!)
        const kmStoneX = (width * 0.78 - (frame * currentSpd * 0.12) % (width * 2) + width * 2) % (width * 2) - 50;
        if (kmStoneX >= -50 && kmStoneX <= width + 50) {
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(kmStoneX, trackY + 22, 28, 32, [10, 10, 2, 2]);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(kmStoneX, trackY + 22, 28, 10);
          ctx.fillStyle = '#020617';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          const distNum = typeof activeTrain?.distToNextKm === 'number' ? activeTrain.distToNextKm : 2;
          const displayKm = distNum < 1 ? `${Math.round(distNum * 1000)}m` : `${distNum.toFixed(1)}k`;
          ctx.fillText(displayKm, kmStoneX + 14, trackY + 30);
          ctx.fillText('NEXT', kmStoneX + 14, trackY + 44);
        }

        // =======================================================
        // 9. THE ACTUAL TRAIN (LOCOMOTIVE + 2 LHB COACHES!)
        // =======================================================
        // Suspension vertical bounce based on speed
        const suspensionBounce = Math.sin(frame * 0.4) * (currentSpd > 0 ? 0.9 : 0);
        const trainY = trackY - 2 + suspensionBounce;

        // Train X position: centered with front at 70% width
        const locoFrontX = width * 0.68;
        const locoW = 280;
        const locoH = 92;
        const locoX = locoFrontX - locoW;

        const isVandeBharat = activeTrain.name?.includes('Vande Bharat');

        // --- TRAILING LHB COACH 2 (Partially visible on far left) ---
        const coach2W = 220;
        const coach2X = locoX - 440;
        if (coach2X + coach2W > 0) {
          drawLhbCoach(ctx, coach2X, trainY, coach2W, locoH - 4, wheelAngle, timeOfDay, isVandeBharat, 2);
        }

        // Vestibule Bellows between Coach 2 and Coach 1
        drawVestibule(ctx, locoX - 220, trainY, 18, locoH - 12);

        // --- TRAILING LHB COACH 1 ---
        const coach1W = 210;
        const coach1X = locoX - 202;
        drawLhbCoach(ctx, coach1X, trainY, coach1W, locoH - 4, wheelAngle, timeOfDay, isVandeBharat, 1);

        // Vestibule Bellows between Coach 1 and Locomotive
        drawVestibule(ctx, locoX - 14, trainY, 14, locoH - 12);

        // --- THE MAIN ELECTRIC LOCOMOTIVE (WAP-7 / TRAIN-18) ---
        drawLocomotive(
          ctx,
          locoX,
          trainY,
          locoW,
          locoH,
          locoFrontX,
          wheelAngle,
          contactWireY,
          currentSpd,
          timeOfDay,
          isVandeBharat,
          activeTrain,
          isHornActive,
          frame
        );

        // Headlight Beam illumination on track (cone of light)
        if (timeOfDay !== 'day' || currentSpd > 0) {
          const beamLength = 340;
          const beamY = trainY - 32;
          const beamGrad = ctx.createLinearGradient(locoFrontX, beamY, locoFrontX + beamLength, beamY + 40);
          beamGrad.addColorStop(0, timeOfDay === 'night' ? 'rgba(254, 240, 138, 0.7)' : 'rgba(254, 240, 138, 0.45)');
          beamGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.2)');
          beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(locoFrontX, beamY - 6);
          ctx.lineTo(locoFrontX + beamLength, beamY - 40);
          ctx.lineTo(locoFrontX + beamLength, trackY + 45);
          ctx.lineTo(locoFrontX, beamY + 20);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        // =======================================================
        // LOCO PILOT CAB DRIVER HUD VIEW
        // =======================================================
        drawCabDriverView(ctx, width, height, customSpeed, activeTrain, timeOfDay, frame, isHornActive);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [screenMode, viewMode, activeTrain, cameraMode3D, timeOfDay, customSpeed, isHornActive]);

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

            {/* Quick Status Pill, Weather & Tractive Physics Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-white/10">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-amber-300 font-bold">
                  {activeTrain.loco}
                </span>
                <span className="text-sky-200">
                  ⚡ {activeTrain.hpPerTonne} HP/T
                </span>
              </div>

              {/* Dynamic Live Weather Badge */}
              <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/10">
                <CloudSun className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-sky-200">
                  {stationWeather ? (
                    <span>
                      {stationWeather.stationName}: <strong className="text-white">{stationWeather.temperature}°C</strong> ({stationWeather.humidity}% Hum) • <strong className="text-emerald-300">{stationWeather.adhesionText}</strong>
                    </span>
                  ) : (
                    <span>Syncing Live Open-Meteo Weather...</span>
                  )}
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
                  id="btn-cam-side-header"
                  onClick={() => setCameraMode3D('side')}
                  className={`px-2 py-0.5 rounded transition-all ${cameraMode3D === 'side' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  🚂 Side View
                </button>
                <button
                  id="btn-cam-drone-header"
                  onClick={() => setCameraMode3D('drone')}
                  className={`px-2 py-0.5 rounded transition-all ${cameraMode3D === 'drone' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  🚁 Drone
                </button>
                <button
                  id="btn-cam-cab-header"
                  onClick={() => setCameraMode3D('cab')}
                  className={`px-2 py-0.5 rounded transition-all ${cameraMode3D === 'cab' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  🧑‍✈️ Cab
                </button>
              </div>
            )}
          </div>

          {/* GATI-SETU AI Diagnosis Card with Live Open-Meteo Weather */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-xl">
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

            {/* Live Atmospheric Conditions & Wheel Rail Friction */}
            <div className="border-t border-slate-800 pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CloudSun className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>{stationWeather?.stationName || 'Harda'} Station:</strong>{' '}
                  {stationWeather ? `${stationWeather.temperature}°C • ${stationWeather.humidity}% Humidity • Visibility ${(stationWeather.visibilityMeters / 1000).toFixed(1)} km` : 'Open-Meteo Satellite Feed Connecting...'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-bold">
                {stationWeather?.adhesionText || 'μ = 0.38 (High Adhesion)'}
              </span>
            </div>

            {stationWeather?.advisoryText && (
              <div className="text-[10px] font-mono text-sky-300 bg-sky-950/40 p-2 rounded-xl border border-sky-800/30 flex items-center justify-between">
                <span>ℹ️ <strong>Railway Advisory:</strong> {stationWeather.advisoryText}</span>
                <span className="text-slate-400 text-[9px]">{stationWeather.provider}</span>
              </div>
            )}
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
                  <div className="text-xs font-mono text-amber-400">
                    {typeof activeTrain.distToNextKm === 'number' ? activeTrain.distToNextKm.toFixed(2) : activeTrain.distToNextKm} km remaining
                  </div>
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
          {/* SUB-VIEW 3: REALISTIC 3/4 SIDE PROFILE TRAIN SIMULATION & SPEED CONTROLS */}
          {/* ========================================================================= */}
          {viewMode === 'view3d' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              
              {/* Header with Camera View & Live Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      {cameraMode3D === 'side' && '🚂 3/4 Trackside Side Profile (WAP-7 + LHB Coaches)'}
                      {cameraMode3D === 'drone' && '🚁 Elevated Trackside Drone Camera'}
                      {cameraMode3D === 'cab' && '🧑‍✈️ Loco Pilot Forward Cab HUD'}
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono">
                        #{activeTrain.number}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Real-time physics simulation • Rotating steel flanged wheels • 25kV OHE catenary
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-800/50 flex items-center gap-1.5 shadow-inner">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>{customSpeed} km/h</span>
                  </span>
                  <span className="font-mono text-xs text-sky-400 bg-sky-950 px-2.5 py-1 rounded-xl border border-sky-800/40 hidden sm:inline-block">
                    25kV AC 50Hz
                  </span>
                </div>
              </div>

              {/* Simulation Toolbar: Camera Angles, Time of Day & Air Horn */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2.5">
                
                {/* Camera Angles */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 hidden md:inline">Camera:</span>
                  <button
                    id="btn-cam-side-panel"
                    onClick={() => setCameraMode3D('side')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      cameraMode3D === 'side'
                        ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🚂</span>
                    <span>Side Profile</span>
                  </button>
                  <button
                    id="btn-cam-drone-panel"
                    onClick={() => setCameraMode3D('drone')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      cameraMode3D === 'drone'
                        ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🚁</span>
                    <span>Drone</span>
                  </button>
                  <button
                    id="btn-cam-cab-panel"
                    onClick={() => setCameraMode3D('cab')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      cameraMode3D === 'cab'
                        ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🧑‍✈️</span>
                    <span>Cab HUD</span>
                  </button>
                </div>

                {/* Time of Day Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 hidden lg:inline">Atmosphere:</span>
                  <button
                    id="btn-tod-day"
                    onClick={() => setTimeOfDay('day')}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      timeOfDay === 'day' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Bright Daylight"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Day</span>
                  </button>
                  <button
                    id="btn-tod-dusk"
                    onClick={() => setTimeOfDay('dusk')}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      timeOfDay === 'dusk' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Golden Sunset"
                  >
                    <span>🌅</span>
                    <span>Sunset</span>
                  </button>
                  <button
                    id="btn-tod-night"
                    onClick={() => setTimeOfDay('night')}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      timeOfDay === 'night' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Night with Headlight Beam"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Night</span>
                  </button>
                </div>

                {/* Indian Railways Air Horn & Sound Toggle */}
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-play-air-horn"
                    onClick={playAirHorn}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
                      isHornActive
                        ? 'bg-red-500 text-white animate-bounce shadow-red-500/50'
                        : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white'
                    }`}
                    title="Synthesize 311Hz + 370Hz pneumatic twin horns"
                  >
                    <span className="text-sm">📢</span>
                    <span>Air Horn</span>
                  </button>
                  <button
                    id="btn-toggle-sound"
                    onClick={() => {
                      setIsSoundMuted(!isSoundMuted);
                      toast.info(isSoundMuted ? '🔊 Audio Unmuted' : '🔇 Audio Muted');
                    }}
                    className={`p-2 rounded-xl border transition-all ${
                      isSoundMuted
                        ? 'bg-slate-900 border-slate-700 text-slate-500'
                        : 'bg-slate-800 border-slate-700 text-emerald-400'
                    }`}
                    title={isSoundMuted ? 'Unmute audio' : 'Mute audio'}
                  >
                    {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Interactive 3D Canvas Viewport */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                <canvas ref={canvasRef} className="w-full block" />

                {/* High-Tech Telemetry Overlay (Top Left) */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 font-mono text-xs">
                  <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl space-y-1 shadow-lg">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Gauge className="w-3 h-3 text-sky-400" />
                      <span>ACTUAL SPEEDOMETER</span>
                    </div>
                    <div className="text-3xl font-black text-white flex items-baseline gap-1">
                      {customSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
                    </div>
                    <div className="text-[10px] flex items-center gap-2">
                      <span className={customSpeed > 130 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                        MPS: 130 km/h
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-sky-300">
                        {customSpeed === 0 ? "Station Dwell" : customSpeed < 40 ? "Loop Line Caution" : customSpeed < 100 ? "Cruising Mainline" : "Maximum Permissible Speed"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2 rounded-xl text-[11px] text-slate-300 space-y-0.5 shadow-md">
                    <div>Tractive Effort: <strong className="text-amber-400">{activeTrain.hpPerTonne} HP/T</strong></div>
                    <div>Next Stoppage: <strong className="text-white">{activeTrain.nextStationName} ({typeof activeTrain.distToNextKm === 'number' ? activeTrain.distToNextKm.toFixed(2) : activeTrain.distToNextKm} km)</strong></div>
                  </div>
                </div>

                {/* Live Air Horn Blast Notification Overlay */}
                {isHornActive && (
                  <div className="absolute top-3 right-3 z-20 bg-red-600/90 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-xl border border-red-400 animate-pulse shadow-lg flex items-center gap-2">
                    <span className="animate-spin text-sm">⚠️</span>
                    <span>311Hz + 370Hz DUAL AIR BLAST!</span>
                  </div>
                )}

                {/* Bottom Center 3D Mode Label */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] text-slate-300 font-mono border border-white/10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {cameraMode3D === 'side'
                      ? '🚂 Side View • Parallax Scenery • Flanged Wheel Physics'
                      : cameraMode3D === 'drone'
                      ? '🚁 Drone View • Trackside Elevation'
                      : '🧑‍✈️ Loco Pilot Cab • Forward 4-Aspect Signal HUD'}
                  </span>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* SPEED CONTROLLER CONSOLE (THROTTLE SLIDER & ONE-TAP SPEED PRESETS) */}
              {/* ===================================================================== */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-white font-mono">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>TRACTION MOTOR THROTTLE &amp; SPEED CONTROLLER:</span>
                  </div>
                  <div className="font-mono text-slate-400 text-xs">
                    Current Notch: <strong className="text-amber-400">{Math.round((customSpeed / 160) * 32)}/32 Notch</strong> ({customSpeed} km/h)
                  </div>
                </div>

                {/* Dynamic Speed Slider (0 to 160 km/h) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 w-12 text-right">0 km/h</span>
                    <input
                      id="input-speed-slider"
                      type="range"
                      min="0"
                      max="160"
                      step="1"
                      value={customSpeed}
                      onChange={(e) => setCustomSpeed(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <span className="font-mono text-xs font-bold text-amber-400 w-16">160 km/h</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 px-12">
                    <span>🛑 Halt</span>
                    <span>⚠️ Caution (30)</span>
                    <span>⚡ Live GPS ({activeTrain.speedKmH})</span>
                    <span>🚀 Fast (110)</span>
                    <span>🚄 MPS (130)</span>
                    <span>🚅 VB (160)</span>
                  </div>
                </div>

                {/* Quick Speed Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                  <button
                    id="btn-speed-stop"
                    onClick={() => {
                      setCustomSpeed(0);
                      toast.info('🛑 Loco Throttle 0: Full Service Brake Applied');
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      customSpeed === 0
                        ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🛑</span>
                    <span>Stop (0)</span>
                  </button>

                  <button
                    id="btn-speed-caution"
                    onClick={() => {
                      setCustomSpeed(30);
                      toast.info('⚠️ Loop Line Speed Limit: 30 km/h');
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      customSpeed === 30
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>⚠️</span>
                    <span>Caution (30)</span>
                  </button>

                  <button
                    id="btn-speed-live"
                    onClick={() => {
                      setCustomSpeed(activeTrain.speedKmH);
                      toast.success(`⚡ Synced to live GPS speed: ${activeTrain.speedKmH} km/h`);
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      customSpeed === activeTrain.speedKmH
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Live GPS ({activeTrain.speedKmH} km/h)</span>
                  </button>

                  <button
                    id="btn-speed-110"
                    onClick={() => {
                      setCustomSpeed(110);
                      toast.info('🚀 Fast Section Run: 110 km/h');
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      customSpeed === 110
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🚀</span>
                    <span>110 km/h</span>
                  </button>

                  <button
                    id="btn-speed-130"
                    onClick={() => {
                      setCustomSpeed(130);
                      toast.success('🚄 Maximum Permissible Speed (MPS): 130 km/h');
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      customSpeed === 130
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🚄</span>
                    <span>130 MPS</span>
                  </button>

                  <button
                    id="btn-speed-160"
                    onClick={() => {
                      setCustomSpeed(160);
                      toast.success('🚅 Vande Bharat / Gatimaan Express: 160 km/h Top Speed');
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      customSpeed === 160
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🚅</span>
                    <span>160 VB Max</span>
                  </button>
                </div>

                {/* Locomotive Engineering Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">LOCOMOTIVE</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {activeTrain.name?.includes('Vande Bharat') ? 'Train-18 EMU' : 'WAP-7 #30412'}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">OHE CURRENT DRAW</div>
                    <div className="font-bold text-amber-400 mt-0.5">
                      {customSpeed === 0 ? '42 A (Aux)' : `${Math.round((customSpeed / 130) * 440 + 60)} Amps`}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">BRAKE CYLINDER</div>
                    <div className="font-bold text-emerald-400 mt-0.5">
                      {customSpeed === 0 ? '3.8 kg/cm² (Full)' : '0.0 kg/cm² (Released)'}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">ADHESION COEFFICIENT</div>
                    <div className="font-bold text-sky-400 mt-0.5">
                      {stationWeather?.adhesionText || 'μ = 0.38 (High Adhesion)'}
                    </div>
                  </div>
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
              <div className="text-sm font-bold text-red-400 font-sans flex items-center justify-center gap-1.5">
                <span>
                  {typeof activeTrain.distToNextKm === 'number'
                    ? activeTrain.distToNextKm.toFixed(2)
                    : activeTrain.distToNextKm}{' '}
                  km to {activeTrain.nextStationName}
                </span>
                {customSpeed > 0 && (
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">
                    (-{(customSpeed / 3600).toFixed(3)} km/s)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-center gap-2">
                <span>Updated {lastUpdatedSec}s ago via NavIC</span>
                {stationWeather && (
                  <span className="text-sky-300">
                    • 🌤️ {stationWeather.temperature}°C ({stationWeather.railHeadCondition})
                  </span>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-live-telemetry"
              onClick={async () => {
                setIsRefreshing(true);
                setLastUpdatedSec(1);
                await loadWeatherForTrain(activeTrain, false);
                setIsRefreshing(false);
              }}
              className="p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-transform active:scale-95 flex items-center justify-center"
              title="Refresh Live GPS & Weather Telemetry"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

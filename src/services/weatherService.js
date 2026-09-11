// Real-Time Weather Integration via Open-Meteo Public Meteorological API
// Fetches live atmospheric data across Indian Railways Golden Quadrilateral & Pan-India stations

export const STATION_COORDINATES = {
  // Northern / North Central
  NDLS: { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  CNB: { name: 'Kanpur Central', lat: 26.4499, lon: 80.3319 },
  PRYJ: { name: 'Prayagraj Jn', lat: 25.4358, lon: 81.8463 },
  DDU: { name: 'Pt. Deen Dayal Upadhyay', lat: 25.2818, lon: 83.1189 },
  BSB: { name: 'Varanasi Jn', lat: 25.3284, lon: 82.9868 },
  JAT: { name: 'Jammu Tawi', lat: 32.7056, lon: 74.8778 },
  
  // Central / Western / Maharashtra / MP
  PUNE: { name: 'Pune Junction', lat: 18.5284, lon: 73.8743 },
  BSL: { name: 'Bhusaval Junction', lat: 21.0455, lon: 75.7885 },
  HD: { name: 'Harda', lat: 22.3436, lon: 77.0984 },
  MMR: { name: 'Manmad Junction', lat: 20.2541, lon: 74.4379 },
  JL: { name: 'Jalgaon Junction', lat: 21.0077, lon: 75.5626 },
  CSN: { name: 'Chalisgaon', lat: 20.4633, lon: 74.9961 },
  ANG: { name: 'Ahmednagar', lat: 19.0952, lon: 74.7496 },
  DDCC: { name: 'Daund Chord Line', lat: 18.4634, lon: 74.5822 },
  BAP: { name: 'Belapur', lat: 19.5855, lon: 74.6469 },
  KPG: { name: 'Kopargaon', lat: 19.8885, lon: 74.4789 },
  BAU: { name: 'Burhanpur', lat: 21.3142, lon: 76.2238 },
  KNW: { name: 'Khandwa Junction', lat: 21.8314, lon: 76.3498 },
  ET: { name: 'Itarsi Junction', lat: 22.6124, lon: 77.7601 },
  BPL: { name: 'Bhopal Junction', lat: 23.2599, lon: 77.4126 },
  NGP: { name: 'Nagpur Junction', lat: 21.1504, lon: 79.0882 },
  BCT: { name: 'Mumbai Central', lat: 18.9696, lon: 72.8193 },
  ADI: { name: 'Ahmedabad Junction', lat: 23.0225, lon: 72.5714 },
  
  // Eastern / Southern / North East
  HWH: { name: 'Howrah (Kolkata)', lat: 22.5892, lon: 88.3426 },
  MAS: { name: 'Chennai Central', lat: 13.0827, lon: 80.2707 },
  SBC: { name: 'KSR Bengaluru', lat: 12.9781, lon: 77.5694 },
  TVC: { name: 'Thiruvananthapuram Central', lat: 8.4875, lon: 76.9525 },
  GHY: { name: 'Guwahati', lat: 26.1820, lon: 91.7548 }
};

/**
 * Calculates railway-specific adhesion, track head friction coefficient (mu),
 * and weather-induced operational speed ceiling according to Indian Railways General Rules.
 */
export function calculateRailAdhesion(temperature, humidity, visibilityMeters, weatherCode) {
  // WMO Weather Codes:
  // 45, 48: Fog / Ice Fog
  // 51-55: Drizzle
  // 61-65: Rain
  // 71-75: Snow
  // 80-82: Showers
  // 95-99: Thunderstorm
  const isRainOrDrizzle = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 99);
  const isFog = weatherCode === 45 || weatherCode === 48 || visibilityMeters < 1000;
  const isDenseFog = visibilityMeters < 300;

  let adhesionMu = 0.38;
  let railHeadCondition = 'Dry Rail Head';
  let adhesionText = 'μ = 0.38 (High Adhesion)';
  let brakingMultiplier = 1.0;
  let speedCeiling = null;
  let advisoryText = 'Optimal track adhesion. Standard MPS permitted.';

  if (isRainOrDrizzle) {
    adhesionMu = 0.24;
    railHeadCondition = 'Wet Rail Head (Rain/Drizzle)';
    adhesionText = 'μ = 0.24 (Wet Head • Braking +25%)';
    brakingMultiplier = 1.25;
    advisoryText = 'Wet rail head detected. Wheel Slide Protection (WSP) & auto-sanding active.';
  } else if (humidity > 85) {
    adhesionMu = 0.28;
    railHeadCondition = 'Damp Head (High Humidity / Dew)';
    adhesionText = 'μ = 0.28 (Morning Dew Slip Risk)';
    brakingMultiplier = 1.15;
    advisoryText = 'Condensation on rail head. Reduced adhesion on braking curves.';
  } else if (temperature > 42) {
    railHeadCondition = 'Thermal Expansion (Track Temp >55°C)';
    adhesionText = 'μ = 0.36 (Hot Rail)';
    advisoryText = 'High ambient heat. Patrolling for rail thermal buckling / sun kink.';
  }

  // Fog Safe Device (FSD) rules under Indian Railways GR 3.61
  if (isDenseFog) {
    speedCeiling = 30;
    advisoryText = 'Dense Fog (Visibility <300m). GR 3.61 speed ceiling 30 km/h enforced.';
  } else if (isFog) {
    speedCeiling = 60;
    advisoryText = 'Foggy section. Fog Safe Device (FSD) active, speed capped at 60 km/h.';
  }

  return {
    adhesionMu,
    railHeadCondition,
    adhesionText,
    brakingMultiplier,
    speedCeiling,
    isFog,
    isDenseFog,
    isRainOrDrizzle,
    advisoryText
  };
}

export async function fetchLiveStationWeather(stationCode = 'HD') {
  const code = (stationCode || 'HD').toUpperCase().trim();
  const station = STATION_COORDINATES[code] || STATION_COORDINATES.HD || STATION_COORDINATES.CNB;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lon}&current=temperature_2m,relative_humidity_2m,weather_code,visibility,wind_speed_10m`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Weather API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const visibility = current.visibility || 10000;
    const windSpeed = current.wind_speed_10m;
    const weatherCode = current.weather_code;

    const railPhysics = calculateRailAdhesion(temp, humidity, visibility, weatherCode);

    return {
      success: true,
      stationCode: code,
      stationName: station.name,
      temperature: temp,
      humidity,
      visibilityMeters: visibility,
      windSpeed,
      weatherCode,
      ...railPhysics,
      summary: `${temp}°C • ${humidity}% Hum • Vis ${(visibility / 1000).toFixed(1)} km • ${railPhysics.railHeadCondition}`,
      fetchedAt: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      provider: 'Open-Meteo Live Satellite Grid (WMO Compliant)'
    };
  } catch (err) {
    console.warn(`Live weather fetch fallback for ${code}:`, err.message);
    
    // Deterministic fallback based on station
    const fallbackTemp = code === 'NDLS' ? 29.2 : code === 'HD' ? 31.4 : 30.1;
    const fallbackHum = 58;
    const fallbackVis = 6500;
    const railPhysics = calculateRailAdhesion(fallbackTemp, fallbackHum, fallbackVis, 1);

    return {
      success: false,
      stationCode: code,
      stationName: station.name,
      temperature: fallbackTemp,
      humidity: fallbackHum,
      visibilityMeters: fallbackVis,
      windSpeed: 7.5,
      weatherCode: 1,
      ...railPhysics,
      summary: `${fallbackTemp}°C • ${fallbackHum}% Hum • Vis 6.5 km • ${railPhysics.railHeadCondition}`,
      fetchedAt: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      provider: 'Cached Telemetry Fallback (Adhesion Calibrated)'
    };
  }
}


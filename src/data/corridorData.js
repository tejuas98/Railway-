// Corridor topology for the high-density Golden Quadrilateral trunk line
// Northern Railway (NR) & North Central Railway (NCR)
// New Delhi (NDLS) to Pt. Deen Dayal Upadhyay Jn / Mughalsarai (DDU) via Kanpur Central

export const CORRIDOR_STATIONS = [
  {
    code: 'NDLS',
    name: 'New Delhi',
    km: 0,
    platforms: 16,
    zone: 'NR',
    division: 'Delhi (DLI)',
    type: 'Terminal',
    tracks: 4,
    hasYards: true,
    avgDwellMin: 0
  },
  {
    code: 'GZB',
    name: 'Ghaziabad Jn',
    km: 25,
    platforms: 6,
    zone: 'NR',
    division: 'Delhi (DLI)',
    type: 'Junction',
    tracks: 4,
    hasYards: true,
    avgDwellMin: 2
  },
  {
    code: 'ALJN',
    name: 'Aligarh Jn',
    km: 131,
    platforms: 7,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Junction',
    tracks: 3,
    hasYards: false,
    avgDwellMin: 3
  },
  {
    code: 'TDL',
    name: 'Tundla Jn',
    km: 209,
    platforms: 5,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Junction',
    tracks: 3,
    hasYards: true,
    avgDwellMin: 3
  },
  {
    code: 'ETW',
    name: 'Etawah Jn',
    km: 301,
    platforms: 5,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Junction',
    tracks: 3,
    hasYards: false,
    avgDwellMin: 2
  },
  {
    code: 'PNKD',
    name: 'Panki Dham',
    km: 432,
    platforms: 3,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Intermediate / Outer Yard',
    tracks: 3,
    hasYards: true,
    avgDwellMin: 0
  },
  {
    code: 'CNB',
    name: 'Kanpur Central',
    km: 440,
    platforms: 10,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Terminal / Major Junction',
    tracks: 4,
    hasYards: true,
    avgDwellMin: 7
  },
  {
    code: 'FTP',
    name: 'Fatehpur',
    km: 518,
    platforms: 4,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Station',
    tracks: 3,
    hasYards: false,
    avgDwellMin: 2
  },
  {
    code: 'PRYJ',
    name: 'Prayagraj Jn',
    km: 634,
    platforms: 10,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Terminal / Major Junction',
    tracks: 4,
    hasYards: true,
    avgDwellMin: 8
  },
  {
    code: 'MZP',
    name: 'Mirzapur',
    km: 723,
    platforms: 4,
    zone: 'NCR',
    division: 'Prayagraj (PRYJ)',
    type: 'Station',
    tracks: 3,
    hasYards: false,
    avgDwellMin: 2
  },
  {
    code: 'DDU',
    name: 'Pt. Deen Dayal Upadhyay Jn',
    km: 786,
    platforms: 8,
    zone: 'ECR',
    division: 'Pt. Deen Dayal Upadhyay',
    type: 'Major Interchange / Freight Yard',
    tracks: 4,
    hasYards: true,
    avgDwellMin: 10
  }
];

export const CORRIDOR_SECTIONS = [
  { from: 'NDLS', to: 'GZB', distanceKm: 25, mpsKmH: 110, signaling: 'Automatic (4-Aspect)', tracks: 4 },
  { from: 'GZB', to: 'ALJN', distanceKm: 106, mpsKmH: 130, signaling: 'Automatic (4-Aspect)', tracks: 3 },
  { from: 'ALJN', to: 'TDL', distanceKm: 78, mpsKmH: 130, signaling: 'Automatic (4-Aspect)', tracks: 3 },
  { from: 'TDL', to: 'ETW', distanceKm: 92, mpsKmH: 130, signaling: 'Automatic (4-Aspect)', tracks: 3 },
  { from: 'ETW', to: 'PNKD', distanceKm: 131, mpsKmH: 130, signaling: 'Automatic (4-Aspect)', tracks: 3 },
  { from: 'PNKD', to: 'CNB', distanceKm: 8, mpsKmH: 60, signaling: 'Absolute Yard Throat', tracks: 4 },
  { from: 'CNB', to: 'FTP', distanceKm: 78, mpsKmH: 130, signaling: 'Automatic (4-Aspect)', tracks: 3 },
  { from: 'FTP', to: 'PRYJ', distanceKm: 116, mpsKmH: 130, signaling: 'Automatic (4-Aspect)', tracks: 3 },
  { from: 'PRYJ', to: 'MZP', distanceKm: 89, mpsKmH: 130, signaling: 'Automatic (4-Aspect)', tracks: 3 },
  { from: 'MZP', to: 'DDU', distanceKm: 63, mpsKmH: 120, signaling: 'Automatic (4-Aspect)', tracks: 4 }
];

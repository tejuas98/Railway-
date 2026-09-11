// Active coaching and freight trains running on the New Delhi - Kanpur - Mughalsarai corridor

export const INITIAL_TRAINS = [
  {
    id: '12302',
    number: '12302',
    name: 'Howrah Rajdhani Express',
    type: 'Super Premium',
    priority: 1,
    loco: 'WAP-7 #30452 (Ghaziabad Shed)',
    rakeLength: '22 LHB Coaches',
    maxSpeed: 140,
    currentKm: 435.5, // 4.5 km before Kanpur Central, approaching outer signal
    currentSpeed: 28, // slowed down due to caution order & outer signal
    direction: 'Down',
    origin: 'NDLS',
    destination: 'HWH',
    targetStation: 'CNB',
    targetPlatform: 'PF-1',
    initialDelayMin: 18,
    rtisStatus: {
      connected: true,
      satellite: 'NavIC / GSAT-7A',
      pingsReceived: 1420,
      hdop: 0.8,
      lastPingSecAgo: 4
    },
    schedule: [
      { code: 'NDLS', schArr: '16:50', schDep: '16:55', actArr: '16:50', actDep: '16:55' },
      { code: 'GZB', schArr: '17:28', schDep: '17:30', actArr: '17:30', actDep: '17:32' },
      { code: 'ALJN', schArr: '18:40', schDep: '18:42', actArr: '18:48', actDep: '18:50' },
      { code: 'TDL', schArr: '19:40', schDep: '19:42', actArr: '19:52', actDep: '19:54' },
      { code: 'ETW', schArr: '20:45', schDep: '20:47', actArr: '21:01', actDep: '21:03' },
      { code: 'CNB', schArr: '21:35', schDep: '21:40', actArr: null, actDep: null }, // Scheduled at 21:35
      { code: 'PRYJ', schArr: '23:43', schDep: '23:45', actArr: null, actDep: null },
      { code: 'DDU', schArr: '01:42', schDep: '01:52', actArr: null, actDep: null }
    ]
  },
  {
    id: '22436',
    number: '22436',
    name: 'Vande Bharat Express',
    type: 'Semi-High Speed',
    priority: 1,
    loco: 'Vande Bharat Trainset 2.0 (16 Coaches)',
    rakeLength: '16 Aerodynamic EMU Carsets',
    maxSpeed: 160,
    currentKm: 312.0, // Past Etawah, accelerating on cleared track
    currentSpeed: 128,
    direction: 'Down',
    origin: 'NDLS',
    destination: 'BSB',
    targetStation: 'CNB',
    targetPlatform: 'PF-2',
    initialDelayMin: 4,
    rtisStatus: {
      connected: true,
      satellite: 'GAGAN / GSAT-8',
      pingsReceived: 980,
      hdop: 0.7,
      lastPingSecAgo: 2
    },
    schedule: [
      { code: 'NDLS', schArr: '06:00', schDep: '06:00', actArr: '06:00', actDep: '06:00' },
      { code: 'GZB', schArr: '06:30', schDep: '06:32', actArr: '06:31', actDep: '06:33' },
      { code: 'ALJN', schArr: '07:35', schDep: '07:37', actArr: '07:38', actDep: '07:40' },
      { code: 'TDL', schArr: '08:25', schDep: '08:27', actArr: '08:29', actDep: '08:31' },
      { code: 'ETW', schArr: '09:20', schDep: '09:22', actArr: '09:25', actDep: '09:27' },
      { code: 'CNB', schArr: '10:08', schDep: '10:10', actArr: null, actDep: null },
      { code: 'PRYJ', schArr: '12:08', schDep: '12:10', actArr: null, actDep: null },
      { code: 'DDU', schArr: '13:50', schDep: '13:55', actArr: null, actDep: null }
    ]
  },
  {
    id: '12560',
    number: '12560',
    name: 'Shiv Ganga Express',
    type: 'Superfast',
    priority: 2,
    loco: 'WAP-7 #30211 (Kanpur Shed)',
    rakeLength: '24 LHB Coaches',
    maxSpeed: 130,
    currentKm: 218.0, // Just past Tundla, trailing behind coal freight
    currentSpeed: 52, // restricted by yellow signal
    direction: 'Down',
    origin: 'NDLS',
    destination: 'BSBS',
    targetStation: 'CNB',
    targetPlatform: 'PF-5',
    initialDelayMin: 22,
    rtisStatus: {
      connected: true,
      satellite: 'NavIC / GSAT-7A',
      pingsReceived: 760,
      hdop: 0.9,
      lastPingSecAgo: 6
    },
    schedule: [
      { code: 'NDLS', schArr: '20:05', schDep: '20:05', actArr: '20:05', actDep: '20:05' },
      { code: 'CNB', schArr: '01:40', schDep: '01:45', actArr: null, actDep: null },
      { code: 'PRYJ', schArr: '03:45', schDep: '03:55', actArr: null, actDep: null },
      { code: 'DDU', schArr: '06:10', schDep: '06:20', actArr: null, actDep: null }
    ]
  },
  {
    id: '12418',
    number: '12418',
    name: 'Prayagraj Express',
    type: 'Superfast',
    priority: 2,
    loco: 'WAP-7 #30588 (Prayagraj Shed)',
    rakeLength: '24 LHB Coaches',
    maxSpeed: 130,
    currentKm: 145.0, // Near Aligarh
    currentSpeed: 108,
    direction: 'Down',
    origin: 'NDLS',
    destination: 'PRYJ',
    targetStation: 'CNB',
    targetPlatform: 'PF-3',
    initialDelayMin: 8,
    rtisStatus: {
      connected: true,
      satellite: 'NavIC / GSAT-7A',
      pingsReceived: 512,
      hdop: 0.8,
      lastPingSecAgo: 5
    },
    schedule: [
      { code: 'NDLS', schArr: '22:10', schDep: '22:10', actArr: '22:10', actDep: '22:10' },
      { code: 'GZB', schArr: '22:42', schDep: '22:44', actArr: '22:44', actDep: '22:46' },
      { code: 'ALJN', schArr: '23:55', schDep: '23:57', actArr: '00:04', actDep: '00:06' },
      { code: 'CNB', schArr: '03:50', schDep: '03:55', actArr: null, actDep: null },
      { code: 'PRYJ', schArr: '07:00', schDep: '07:00', actArr: null, actDep: null }
    ]
  },
  {
    id: '12398',
    number: '12398',
    name: 'Mahabodhi Express',
    type: 'Mail / Express',
    priority: 3,
    loco: 'WAP-7 #30691',
    rakeLength: '22 ICF/LHB Coaches',
    maxSpeed: 110,
    currentKm: 48.0, // Delhi-Aligarh stretch
    currentSpeed: 96,
    direction: 'Down',
    origin: 'NDLS',
    destination: 'GAYA',
    targetStation: 'CNB',
    targetPlatform: 'PF-6',
    initialDelayMin: 35,
    rtisStatus: {
      connected: true,
      satellite: 'NavIC / GSAT-7A',
      pingsReceived: 380,
      hdop: 1.1,
      lastPingSecAgo: 8
    },
    schedule: [
      { code: 'NDLS', schArr: '12:50', schDep: '12:50', actArr: '12:50', actDep: '12:50' },
      { code: 'ALJN', schArr: '14:30', schDep: '14:32', actArr: null, actDep: null },
      { code: 'CNB', schArr: '17:55', schDep: '18:00', actArr: null, actDep: null },
      { code: 'PRYJ', schArr: '20:15', schDep: '20:20', actArr: null, actDep: null }
    ]
  },
  {
    id: 'BOXN-8422',
    number: 'BOXN-8422',
    name: 'Coal Freight (Anpara Power Rake)',
    type: 'Heavy Freight',
    priority: 4,
    loco: 'Twin WAG-9 #31189 + #31190',
    rakeLength: '58 BOXNHL Loaded Coal Wagons (4,800 Tons)',
    maxSpeed: 75,
    currentKm: 221.5, // 3.5 km ahead of 12560 Shiv Ganga on Down Main Line
    currentSpeed: 48,
    direction: 'Down',
    origin: 'DDU',
    destination: 'PNKD',
    targetStation: 'ETW',
    targetPlatform: 'Loop-1',
    initialDelayMin: 55,
    rtisStatus: {
      connected: true,
      satellite: 'FOIS RTIS / GSAT',
      pingsReceived: 620,
      hdop: 1.2,
      lastPingSecAgo: 10
    },
    schedule: []
  },
  {
    id: 'BCN-9104',
    number: 'BCN-9104',
    name: 'Container Express (CONCOR)',
    type: 'Container Freight',
    priority: 4,
    loco: 'WAG-9 #31402',
    rakeLength: '45 BLC Flats (Containerized)',
    maxSpeed: 100,
    currentKm: 550.0, // Between Fatehpur & Prayagraj
    currentSpeed: 64,
    direction: 'Down',
    origin: 'TKD',
    destination: 'CTCS',
    targetStation: 'PRYJ',
    targetPlatform: 'Goods Bypass Line',
    initialDelayMin: 40,
    rtisStatus: {
      connected: true,
      satellite: 'FOIS RTIS / GSAT',
      pingsReceived: 410,
      hdop: 0.9,
      lastPingSecAgo: 12
    },
    schedule: []
  }
];

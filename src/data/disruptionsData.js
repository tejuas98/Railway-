// Real-world dynamic ground realities and operational disruptions on Indian Railways

export const INITIAL_DISRUPTIONS = {
  // 1. Temporary Speed Restrictions (TSR from e-Caution Orders)
  tsrOrders: [
    {
      id: 'TSR-CNB-435',
      code: 'CO-NCR-PRYJ-2026/891',
      startKm: 434.0,
      endKm: 437.5,
      section: 'Panki Dham (PNKD) - Kanpur Central (CNB)',
      cause: 'Track Ballast Tamping & Switch Renewal on Down Main Line',
      maxSpeedKmH: 30, // Normal MPS is 130 km/h, reduced to 30 km/h
      active: true,
      impactDesc: 'Adds 9-14 minutes lost time for all arriving coaching trains'
    },
    {
      id: 'TSR-GZB-023',
      code: 'CO-NR-DLI-2026/412',
      startKm: 22.5,
      endKm: 25.0,
      section: 'New Delhi - Ghaziabad (Yamuna River Bridge #249)',
      cause: 'Structural Girder Ultrasonic Flaw Testing (USFD)',
      maxSpeedKmH: 20,
      active: false,
      impactDesc: 'Adds 5-7 minutes lost time over Yamuna Bridge'
    }
  ],

  // 2. Weather & Visibility Rules (Railway Board Fog Regulations)
  weatherConditions: {
    fogActive: true,
    affectedSector: 'Tundla Jn (KM 209) - Etawah Jn (KM 301)',
    visibilityMeters: 140, // < 200m triggers Fog Safe Device (FSD) rule
    fsdSpeedCapKmH: 60, // Maximum permissible speed during dense fog
    normalMpsKmH: 130,
    impactDesc: 'Northern fog ceiling limits maximum speed to 60 km/h under GR 3.61 rules'
  },

  // 3. Terminal Platform & Yard Throat Congestion (Outer Signal Stabling)
  platformStatus: {
    stationCode: 'CNB',
    stationName: 'Kanpur Central',
    outerSignalHoldActive: true,
    blockedPlatform: 'PF-1',
    blockingTrainId: '14163',
    blockingTrainName: 'Sangam Express (Delayed Rake Cleaning)',
    clearingInMinutes: 24, // Platform 1 will clear in 24 minutes
    affectedIncomingTrain: '12302', // Howrah Rajdhani scheduled for PF-1
    outerSignalKm: 437.8, // Home signal 2.2 km before station platform
    impactDesc: 'Rajdhani held at Kanpur Outer Signal until Platform 1 is vacated'
  },

  // 4. Single Line & Headway Conflicts (Trailing behind slow freight)
  headwayConflicts: {
    active: true,
    fastTrainId: '12560', // Shiv Ganga Express (130 km/h)
    slowTrainId: 'BOXN-8422', // Coal Freight Rake (48 km/h)
    distanceGapKm: 3.5, // Less than 4 km (within 2 block sections)
    currentSignalAspect: 'Yellow', // Caution aspect
    effectiveSpeedLimitKmH: 45,
    impactDesc: 'Shiv Ganga Express trailing heavy freight; held by successive yellow signals'
  },

  // 5. Section Controller Dispatch Precedence (Loop line overtake)
  dispatchPrecedence: {
    recommendedOvertake: true,
    loopStation: 'ETW', // Etawah Jn Loop line 2
    trainToLoop: 'BOXN-8422', // Push freight into loop
    priorityTrainPassing: '12560', // Let Shiv Ganga Express run through main line
    timeSavedMinutes: 19,
    status: 'Pending Controller Execution'
  }
};

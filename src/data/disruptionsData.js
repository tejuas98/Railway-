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
  },

  // 6. Unscheduled Maintenance Blocks (Engineering & OHE Power Blocks)
  maintenanceBlocks: [
    {
      id: 'MB-NCR-402',
      section: 'Rura - Panki Dham (KM 412 - 418)',
      type: 'Unscheduled OHE Traction Inspection Block',
      active: true,
      maxAllowedSpeedKmH: 45,
      delayPenaltyMin: 8,
      cause: 'Emergency contact wire tensioning following temperature drop',
      impactDesc: 'Traction speed restricted to 45 km/h; adds +8m delay to trailing coaching trains'
    }
  ],

  // 7. Level Crossing (LC) Gates (Road Traffic & Gate Closure Holds)
  levelCrossingGates: [
    {
      id: 'LC-42-C',
      name: 'Panki Bypass Level Crossing #42-C',
      km: 432.4,
      interlocked: false,
      activeHold: true,
      roadTrafficHoldMin: 4,
      affectedTrain: '12302',
      cause: 'Heavy vehicular queue on State Highway 5; gateman delayed closing boom barrier',
      impactDesc: 'Outer caution aspect approach; adds +4m lost time'
    }
  ],

  // 8. Crew Scheduling & HOER (Hours of Employment Regulations) Watch
  crewScheduling: {
    trainNumber: '12302',
    locoPilotName: 'R. K. Sharma (HQ: TDL)',
    guardName: 'A. K. Srivastava (HQ: TDL)',
    dutyCommencedAt: '14:30',
    maxStatutoryDutyHours: 8.0, // Indian Railways HOER 8-hour shift ceiling
    currentDutyElapsedHours: 6.75, // 6h 45m
    predictedDutyAtArrivalHours: 7.58, // 7h 35m
    dutyStatus: 'Approaching Statutory Limit',
    reliefCrewStandbyStation: 'CNB Platform 2',
    impactDesc: 'Relief crew must be alerted at Kanpur Central to prevent duty breach detention'
  },

  // 9. Downstream Feeder Transport & Logistics Integration
  feederTransit: {
    stationCode: 'CNB',
    stationName: 'Kanpur Central',
    services: [
      {
        type: 'METRO',
        agency: 'UPMRC Kanpur Metro',
        route: 'Orange Line (IIT Kanpur - Naubasta)',
        gate: 'Gate 1 Concourse Walkway',
        scheduledDeparture: '23:15',
        syncStatus: 'Synced with GATI-SETU ETA (22:45 arrival allows 30m buffer)',
        connectProbability: '96.4%'
      },
      {
        type: 'PREPAID_CAB_AUTO',
        agency: 'Kanpur Traffic Police Pre-Paid Booth',
        gate: 'Gate 3 City Side',
        surgeAlert: 'High Demand Surge (+1,400 passengers) at 22:45',
        syncStatus: 'Fleet Queue Buffer Expanded by 45 vehicles'
      },
      {
        type: 'PARCEL_LOGISTICS',
        agency: 'IR Cargo Express & India Post Nodal',
        bay: 'Parcel Shed Bay 4',
        loadingSlot: '23:00 - 23:40',
        syncStatus: 'Forklift & Labor Dispatch Delayed by 25m to match actual rake birth'
      }
    ]
  }
};


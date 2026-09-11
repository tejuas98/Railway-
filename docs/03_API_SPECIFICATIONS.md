# GATI-SETU: REST & WebSocket API Specifications
**OpenAPI 3.1 Specification for Indian Railways CRIS Integration**

---

## 1. Public Passenger Dynamic ETA Endpoint

### `GET /api/v1/trains/{train_id}/dynamic-eta`
Fetches real-time dynamic arrival forecast with confidence intervals and explainability factors.

#### Request Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `train_id` | string | Yes | 5-digit Indian Railways train number | `12302` |
| `target_station`| string | Yes | 3-4 letter Indian Railways station code | `CNB` |

#### Response Schema (`200 OK`)
```json
{
  "train_number": "12302",
  "train_name": "Howrah Rajdhani Express",
  "target_station": "CNB",
  "station_name": "Kanpur Central",
  "scheduled_arrival": "21:35",
  "forecast": {
    "dynamic_eta": "22:19",
    "expected_delay_minutes": 44,
    "confidence_window": {
      "p10_early": "22:19",
      "p90_late": "22:21"
    },
    "confidence_percentage": 90,
    "distance_remaining_km": 4.5
  },
  "legacy_comparison": {
    "ntes_predicted_eta": "21:38",
    "ntes_error_minutes": 41,
    "ntes_flaw_summary": "Falsely deducted 15m recovery time; blind to outer signal platform blockage"
  },
  "explainability_factors": [
    {
      "type": "OUTER_SIGNAL_HOLD",
      "badge": "🛑 Outer Signal Stabled",
      "title": "Home Signal Detention at KM 437.8",
      "impact_minutes": "+24m",
      "description": "Platform 1 blocked by Train 14163 (cleaning turnaround)"
    },
    {
      "type": "TSR_CAUTION",
      "badge": "⚠️ Caution Order (TSR)",
      "title": "30 km/h Caution Order at KM 434.0-437.5",
      "impact_minutes": "+11m",
      "description": "Track ballast tamping on Down Main Line"
    }
  ],
  "telemetry": {
    "locomotive_id": "WAP-7 #30452",
    "current_speed_kmh": 28,
    "current_km": 435.5,
    "satellite_source": "NavIC / GSAT-7A",
    "hdop": 0.8,
    "last_ping_seconds_ago": 4
  }
}
```

---

## 2. Divisional Dispatch & Precedence Advisor Endpoint

### `POST /api/v1/dispatch/simulate-overtake`
Evaluates precedence and calculates system delay savings if a lower-priority rake is looped.

#### Request Body
```json
{
  "section_id": "TDL-ETW",
  "priority_train_id": "12560",
  "preceding_train_id": "BOXN-8422",
  "loop_station": "ETW",
  "loop_line_number": 2
}
```

#### Response Schema (`200 OK`)
```json
{
  "recommendation": "EXECUTE_LOOP_DIVERSION",
  "diverting_train": "BOXN-8422 (Coal Freight)",
  "overtaking_train": "12560 (Shiv Ganga Express)",
  "net_system_delay_savings_minutes": 19,
  "passenger_minutes_saved": 34200,
  "signal_aspect_cleared": "GREEN_CLEAR",
  "execution_status": "READY_FOR_CONTROLLER_AUTHORIZATION"
}
```

---

## 3. Real-Time Telemetry WebSocket Stream

### `WS /ws/v1/corridor/telemetry`
Subscribes to live 30-second RTIS satellite pings and block section state updates partitioned by railway division.

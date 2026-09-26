from server.live_gov_service import live_gov_service
import sys

trains = ["12004", "12424", "12952", "22436", "12628", "12301", "12302"]
for t in trains:
    res = live_gov_service.fetch_live_ntes_train(t)
    name = res.get("train_name")
    count = len(res.get("route_timeline", []))
    act = res.get("active_station", {})
    fb = res.get("is_fallback")
    print(f"Train {t}: {name} | Stations: {count} | Active: {act.get('station_code')} ({act.get('station_name')}) | Delay: {act.get('delay_min')}m | PF: {act.get('platform')} | Fallback: {fb}")

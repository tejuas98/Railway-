# Railway- · SIH Problem Statement 26028

**Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains**

| | |
|---|---|
| **Problem ID** | 26028 |
| **Organization** | Ministry of Railways |
| **Department** | Ministry of Railways |
| **Category** | Software |
| **Theme** | Smart Automation |

---

## 📖 Start here

| Document | What's inside |
|---|---|
| **[docs/00-PROBLEM-EXPLAINED-SIMPLY.md](docs/00-PROBLEM-EXPLAINED-SIMPLY.md)** | The full explainer, written for a 5th-standard reader. Every keyword decoded, the build checklist, ML explained with a cricket example, what Category *Software* and Theme *Smart Automation* demand from you, a demo script, and the mistakes that lose marks. **Read this first.** |
| **[docs/01-KEYWORD-GLOSSARY.md](docs/01-KEYWORD-GLOSSARY.md)** | A–Z one-line definitions of every railway and ML term. Scan it right before your presentation Q&A. |

---

## The problem in one line

> Train arrival times are guessed from an old timetable instead of what's
> actually happening on the tracks — so they're wrong, and nobody trusts them.

## The solution in one line

> A self-updating, self-learning software brain that watches live GPS, traffic,
> weather and history to predict — every 30 seconds, for every upcoming station,
> for thousands of trains at once — exactly when each train will arrive, served
> through APIs to phones, platform displays and control rooms.

## The formula shift

```
❌ OLD:  ETA = timetable + current delay − hidden recovery time
✅ NEW:  ETA = live position + learned section times + congestion ahead
               + weather + signals + history + cascade effects
               ... recomputed every 30 seconds, forever
```

## The 14-point build checklist

- [ ] Real-time ETA prediction for coaching trains
- [ ] Data-driven models (not `schedule + delay`)
- [ ] Live train location data (GPS / RTIS-style feed)
- [ ] Operational parameters (train type, priority, max speed, stops)
- [ ] Historical delay trends
- [ ] Network conditions (congestion, blocks, weather)
- [ ] Forecast at **all** upcoming stations, not just the destination
- [ ] Updates dynamically on real-time events
- [ ] ML or statistical forecasting
- [ ] Accuracy improves over time (feedback loop)
- [ ] APIs for integration
- [ ] Serves mobile app + station display + control room dashboard
- [ ] Scales to thousands of trains
- [ ] Adapts across diverse railway zones

## Five words for every slide

`Dynamic` · `Real-time` · `Data-driven` · `Self-learning` · `Automated`

---

> ⚠️ **Theme note:** official SIH listings for 26028 are inconsistent — the master
> catalogue shows **Smart Automation**, some portal pages show **Disaster
> Management**. This repo builds for *Smart Automation* and keeps a disaster-mode
> slide as cover. Confirm on sih.gov.in before final submission.

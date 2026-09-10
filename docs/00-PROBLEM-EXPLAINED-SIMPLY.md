# SIH Problem 26028 — Explained Like You're in 5th Standard

**Title:** Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains
**Organization:** Ministry of Railways · **Department:** Ministry of Railways
**Category:** Software · **Theme:** Smart Automation

> Read this top to bottom once. By the end, every single word in the official
> problem statement will make sense to you.

---

## Part 1 — The whole problem in one story

Imagine you ordered a pizza. 🍕

The pizza shop says: **"It will reach you at 8:00 PM."**

How did they decide 8:00 PM? They just looked at a chart on the wall that says
*"Delivery to your area = 30 minutes"*. They wrote that chart **one year ago**.
They did **not** look outside.

But right now, outside:
- There is a **traffic jam** on the main road.
- It is **raining heavily**.
- The delivery boy's scooter is stuck behind a **slow truck**.
- There is a **wedding procession** blocking the lane.

So the pizza actually arrives at **8:45 PM**. You waited outside your gate for
45 extra minutes. You are angry. You feel cheated. You will not trust that shop's
timing again.

**Now replace "pizza" with "train", and "you" with 8 billion passengers a year.**

That is exactly the problem. 🚆

Indian Railways today mostly tells you a train's arrival time using an **old
printed timetable + how late the train is right now**. It does not properly
look at what is actually happening on the tracks ahead — the jams, the rain, the
red signals, the slow zones.

**Our job:** build a smart computer system that behaves like Google Maps for
trains. Google Maps does not say "it always takes 30 minutes." It says *"22
minutes, heavy traffic ahead, ETA 8:22 PM"* — and it keeps changing that number
as you drive. **We must do that for every train in India.**

---

## Part 2 — What is "ETA"? (the most important word)

**ETA = Expected Time of Arrival.**

It means: *"At what clock time will this train reach my station?"*

Three words, each important:

| Word | Kid meaning |
|---|---|
| **Expected** | It's a guess, not a promise. A *smart* guess. |
| **Time of** | An actual clock time — "reaches at 4:35 PM", not "35 minutes late". |
| **Arrival** | When the train physically reaches the platform. |

**Important difference to remember:**

- **Delay** = "This train is 40 minutes late." (a *duration*)
- **ETA** = "This train will reach Kanpur at 4:35 PM." (a *clock time*)

Passengers care about **ETA**. Railways currently talks a lot about **delay**.
Our system must convert messy reality → a trustworthy clock time.

---

## Part 3 — How Railways guesses the time TODAY (and why it breaks)

Today's formula is roughly:

```
ETA  =  Scheduled arrival time  +  Current delay  −  Recovery time
```

Let's decode with a real example. Train from Delhi to Patna:

| Thing | Meaning in kid language | Example |
|---|---|---|
| **Scheduled time** | The time printed in the timetable book, decided months ago | Reaches Kanpur at **3:00 PM** |
| **Current delay** | How late it is right now | It is **60 min late** |
| **Recovery time** | Extra "bonus" minutes secretly hidden in the timetable so a late train can catch up | **15 min** of padding ahead |

So today's system says: `3:00 PM + 60 min − 15 min = 3:45 PM`.

**Why this is a bad guess:** this maths is completely *blind*. It never asked:

- Is there a **traffic jam of trains** ahead near Kanpur? (there is)
- Is there a **slow-speed zone** because of track repair? (there is, 20 km of it)
- Is it **raining / foggy**? (dense fog, December)
- Does this train **always** lose 25 minutes on this stretch every winter? (yes,
  history says so — but nobody looked at history)

Actual arrival: **4:40 PM.** The official guess was wrong by ~55 minutes.

> 🔑 **This is the core of the problem statement.** The current method uses
> *static* (fixed, unchanging) information. Reality is *dynamic* (always
> changing). We must move from **static → dynamic**.

---

## Part 4 — Every keyword in the problem statement, decoded

This is your dictionary. The official text is full of railway jargon. Here is
every term, in kid language.

### 4.1 — Words about trains

| Keyword | Explained simply |
|---|---|
| **Coaching train** | A train that carries **people** (Rajdhani, Shatabdi, Express, Passenger, MEMU). The opposite is a **goods/freight train**, which carries coal, cement, etc. "Coaching stock" = passenger carriages. **We only care about people-carrying trains.** |
| **Rake** | The full set of coaches joined together = the train body. |
| **Loco / Locomotive** | The engine that pulls the train. GPS boxes are fitted **on the engine**. |
| **Loco Pilot** | The train driver. |
| **Run-through** | The train passes a station **without stopping**. |
| **Halt / Stoppage** | The train stops at a station. |
| **Dwell time** | How long the train **stands** at a platform (e.g. 2 minutes at a small station, 10 at a junction). |
| **Intermediate station** | Any station **in the middle** of the journey (Kanpur, on a Delhi→Patna run). |
| **Destination station** | The **last** station, where the journey ends (Patna). |
| **Multi-day journey** | A train that runs for more than 24 hours (e.g. Dibrugarh→Kanyakumari takes ~3.5 days). |

### 4.2 — Words about the track and network

| Keyword | Explained simply |
|---|---|
| **Section** | A stretch of track between two stations. Like "one road between two traffic signals". |
| **Block section** | A safety chunk of track. **Rule: only ONE train allowed inside at a time.** If a train is inside, everyone else waits outside. This is the #1 cause of trains standing still in the middle of nowhere. |
| **Sectional running time** | The normal number of minutes a train takes to cross one section. Like "this road usually takes 12 minutes". |
| **Average sectional running time** | The *average* of that, taken over many past days — a much more honest number than the timetable's number. |
| **Downstream tracks** | The tracks **ahead** of the train (where it is going). Opposite = upstream (already crossed). Think of a river: downstream = where the water is heading. |
| **Congestion** | A **traffic jam of trains** — too many trains wanting the same track. |
| **Operational bottleneck** | A narrow spot where jams always happen — e.g. a busy junction, a single-line stretch, a bridge where 4 tracks squeeze into 2. Like a 4-lane road becoming 1 lane. |
| **Level crossing gate** | The gate on a road where cars wait for the train. Sometimes the gate can't close in time (traffic, faulty gate), so the train must **slow down or stop**. |
| **Zone** | Indian Railways is divided into **~19 big regions** (Northern, Western, South Central...). Each has different terrain, weather and habits. |
| **Division** | A smaller piece inside a zone (~70 divisions). |
| **Junction** | A station where multiple routes meet — jams are common here. |

### 4.3 — Words about delays and signals

| Keyword | Explained simply |
|---|---|
| **Signal aspect** | The **colour showing on the signal light**. Simple version: 🔴 **Red** = stop. 🟡 **Yellow** = slow down, next signal is red. 🟡🟡 **Double yellow** = get ready to slow. 🟢 **Green** = go full speed, road is clear. If our system sees a red signal ahead, it knows a delay is coming **before** it happens. |
| **Signal halt** | The train stopped because the signal was red — not because a station was there. Very common, very annoying, invisible in the timetable. |
| **Speed restriction (TSR)** | "Drive slowly here!" — usually because the track is being repaired or is weak. **TSR = Temporary Speed Restriction.** A 130 km/h train may be forced to crawl at 30 km/h for 10 km. That single order can add 20+ minutes. |
| **Unscheduled stoppage** | The train stopped somewhere it was **not** supposed to stop. (Red signal, chain pulling, cattle on track, gate problem.) |
| **Unscheduled maintenance block** | Railways suddenly closes a track for emergency repair. A "block" = a booked time window where **no trains** may pass. Trains get held or diverted. |
| **Delays in preceding trains** | The train **in front of you** is slow, so you are stuck behind it. You cannot overtake — there's only one track. This is called **knock-on delay**. |
| **Recovery time / slack / EA / TRT** | Hidden spare minutes deliberately added into the timetable so a late train can catch up. Real names in the working timetable: **EA** (Extra time Allowed) and **TRT** (Traffic Recovery Time). This is why a train that's 40 min late can still arrive "on time". |
| **Cascade** | One small delay causing a chain of bigger delays. Like one domino knocking down 20 dominoes. On a 3-day journey, a 20-minute morning delay can become 4 hours by day three. |
| **Punctuality** | The official score of how many trains arrived on time. |

### 4.4 — Words about data (what our system will eat 🍽️)

| Keyword | Explained simply |
|---|---|
| **Real-time data feed** | Information arriving **live, right now**, every few seconds — not a file from last month. |
| **GPS-based location data** | The satellite location of the train engine: latitude, longitude, speed, direction. Real system name: **RTIS**, built with ISRO, fitted on locomotives — it sends an update roughly **every 30 seconds**. |
| **Live train location data** | Same as above + which station the train last crossed and at what time. |
| **Operational parameters** | The train's "settings": max permitted speed, number of coaches, engine type, priority level, planned stops. (A Rajdhani is given priority over a passenger train — it gets green signals first.) |
| **Historical delay patterns / trends** | What happened **on past days**. "This train loses 18 minutes at this spot every Monday morning." "December fog adds 90 minutes on this route." The system *learns from the past*. |
| **Network conditions** | The health of the whole railway "road network" right now — how many trains, where the jams are, which tracks are blocked. |
| **Weather conditions** | Fog (biggest killer — trains must crawl), heavy rain, storms, extreme heat (rails can bend). |
| **Congestion levels on downstream tracks** | How jammed the road **ahead** is. The single most useful signal for predicting future delay. |

### 4.5 — Words about the solution we must build

| Keyword | Explained simply |
|---|---|
| **Dynamic** | Keeps changing by itself as new facts arrive. Opposite of static. Our ETA must **refresh again and again**, not be calculated once. |
| **Data-driven** | Decisions made from **real numbers and evidence**, not from someone's assumption or an old rulebook. |
| **Forecast / Prediction** | An educated guess about the future, made by a computer using patterns. |
| **Machine Learning (ML)** | Teaching a computer using examples instead of writing rules by hand. Show it 5 lakh past journeys; it figures out the patterns itself. See Part 7. |
| **Statistical model** | Maths-based prediction using averages, probabilities and trends (simpler, faster and often surprisingly good). |
| **Continuously refine its predictions** | The system must get **better over time** — it checks yesterday's guesses against what really happened and corrects itself. Also called *"learning from mistakes"*. |
| **Temporal variability** | Things change **with time**. Same train, different behaviour at 6 AM vs 6 PM, Monday vs Sunday, summer vs foggy December. (*Temporal = time.*) |
| **Spatial variability** | Things change **with place**. Mumbai suburban ≠ Rajasthan desert ≠ Assam hills. (*Spatial = space/location.*) |
| **Scalable** | Works fine even when the load becomes huge. Must handle **thousands of trains at once** without slowing down or crashing. |
| **API** | A "plug point" / socket that lets other apps get our data. Like an electric socket — we don't care what you plug in (mobile app, TV display, dashboard), the socket gives the same power. See Part 8. |
| **Control room dashboard** | The big screen used by railway controllers who manage trains. Shows all trains, all jams, all alerts. |
| **Station display** | Those yellow/black LED boards on platforms showing "Train 12345 arriving at 4:35 PM". |
| **Feeder transport services** | Buses, autos, taxis, metro that **feed** passengers to and from the station. If they know the true ETA, they can arrive at the right time. |
| **Downstream logistics services** | Businesses that depend on the train arriving: parcel vans, catering, courier, milk supply, connecting transport. |
| **Crew scheduling** | Planning which driver and guard work which train. Drivers have legal duty-hour limits — a late train wrecks the roster. |
| **Platform allocation** | Deciding which platform number a train will use. A late train can end up with **two trains fighting for one platform**. |
| **Delay management** | Actively *doing something* about delays (reordering trains, changing priority) instead of just watching them happen. |

---

## Part 5 — Who is hurting? (Why this problem matters)

The problem statement lists many victims. Here they are as real people:

| Person | Their pain today |
|---|---|
| 👵 **Grandmother travelling alone** | Family reaches station at 3 PM. Train comes at 5 PM. Two hours standing on a crowded platform. |
| 🚕 **Taxi driver / feeder bus** | Waits 90 minutes for a train that "was about to arrive". Loses money and other trips. |
| 🧹 **Cleaning staff** | Coach cleaning crew booked for 2 PM. Train arrives 4 PM. Staff idle, then rushed — dirty coaches go out. |
| 🧑‍✈️ **Crew (driver/guard)** | Duty hours run out mid-journey; a replacement crew must be arranged in panic. |
| 🎛️ **Station master / controller** | Cannot decide platform allocation. Two trains, one platform, five minutes to decide. |
| 📦 **Parcel & courier company** | Truck and loaders booked for the wrong hour. |
| 📱 **App user** | Sees "arriving 4:05" for 40 minutes while nothing moves. **Loses trust.** |

> 💡 **Say this line in your presentation:** *"An inaccurate ETA doesn't just
> waste time — it destroys trust. And once trust is gone, people stop looking at
> the app at all."*

---

## Part 6 — What exactly must we BUILD? (the checklist)

The "Expected Solution" paragraph is really a **checklist for judges**. Here it
is broken into tick-boxes. Your project must be able to demo **every single one**.

- [ ] **1. Real-time ETA prediction system** for coaching trains
- [ ] **2. Uses data-driven models** (not `scheduled_time + delay`)
- [ ] **3. Integrates live train location data** (GPS / RTIS-style feed)
- [ ] **4. Integrates operational parameters** (train type, priority, max speed, stops)
- [ ] **5. Integrates historical delay trends** (learns from the past)
- [ ] **6. Integrates network conditions** (congestion, blocks, weather)
- [ ] **7. Forecasts arrival at ALL upcoming stations** — not just the destination
- [ ] **8. Updates dynamically** when a new event happens (must visibly change on screen)
- [ ] **9. Uses ML or statistical forecasting**
- [ ] **10. Improves accuracy over time** (feedback loop / retraining)
- [ ] **11. Exposes APIs** for integration
- [ ] **12. Serves 3 audiences:** 📱 mobile app · 🖥️ station display · 🎛️ control room dashboard
- [ ] **13. Scales to thousands of trains simultaneously**
- [ ] **14. Adapts to diverse zones** (works in Mumbai *and* in Assam)

> ⭐ Items **7, 8, 10, 11, 12, 13** are the ones most teams forget. They are the
> easiest places to win marks.

---

## Part 7 — The "brain" (Machine Learning) explained with a cricket example 🏏

You don't need to be scared of ML. Here's the whole idea.

**How a human expert guesses:** An old station master looks at a train and says
*"this one will be 50 minutes late."* How does he know? Because he has watched
**thousands of trains for 30 years**. His brain stored patterns.

**Machine Learning = giving a computer those 30 years in 30 seconds.**

We show the computer lakhs of past journeys, like flash cards:

| Train | Where | Day | Time | Weather | Traffic ahead | Late by now | ➡️ **Actual extra delay added** |
|---|---|---|---|---|---|---|---|
| 12345 | Kanpur→Allahabad | Monday | 8 AM | Foggy | High | 30 min | ➡️ **+22 min** |
| 12345 | Kanpur→Allahabad | Sunday | 2 PM | Clear | Low | 30 min | ➡️ **+3 min** |
| 12801 | Kanpur→Allahabad | Monday | 8 AM | Foggy | High | 10 min | ➡️ **+19 min** |

After seeing lakhs of these rows, the computer discovers rules **by itself**, like:

> *"Fog + Monday morning + jam ahead + already late ⇒ add about 20 more minutes."*

Now when a **new** train shows up in those same conditions, the computer applies
the pattern and predicts the delay. **That's it. That's machine learning.**

### The 3-level brain we should build

Build it in layers so you always have something working:

1. **Level 1 — Baseline (must have, 1 hour of work).**
   `ETA = now + historical average running time of each remaining section`.
   Simple, and already better than the timetable. Use it as your comparison
   benchmark: *"we beat the baseline by X%"*.

2. **Level 2 — ML model (the main dish).**
   A **Gradient Boosting** model (XGBoost / LightGBM) that predicts *"how many
   extra minutes will be added in the next section"*. These models are the
   proven winners for table-shaped data like this — fast, accurate, and they run
   on a laptop.

3. **Level 3 — Sequence model (the showstopper).**
   An **LSTM / Transformer** that treats the journey as a *sequence* of stations
   and predicts the delay for **all remaining stations at once**, capturing how a
   delay **cascades** forward.

### Two extra tricks that impress judges

- **Predict a range, not a single number.** Say *"arrives 4:35 PM, most likely
  between 4:28 and 4:52 (80% confident)"*. This is called a **confidence
  interval / prediction interval**. It is honest, and control rooms love it.
- **Explain the reason.** Show *"+18 min because of congestion at Junction X, +7
  min due to fog"*. This is **explainability**, and it turns a black box into a
  tool people trust.

### How we prove it works (evaluation metrics)

| Metric | Kid meaning |
|---|---|
| **MAE** (Mean Absolute Error) | "On average, our guess is wrong by **6 minutes**." Lower is better. **This is your headline number.** |
| **RMSE** | Same idea, but punishes huge misses more. |
| **Accuracy within ±5 / ±15 min** | "82% of our guesses were within 15 minutes." Easy for judges to grasp. |
| **Baseline comparison** | "The current static method's MAE is 27 min. Ours is 8 min. **A 70% improvement.**" ← *say this sentence on stage.* |

---

## Part 8 — What is an API? (asked for explicitly, so don't skip it)

Think of a **water tap**. 🚰

The water tank is on the roof (that's our prediction engine — complicated,
hidden). You don't climb the roof. You just open a tap and water comes.

An **API** is that tap. Any app can "open the tap" and get the ETA.

The same tap serves three very different customers:

```
                    ┌─────────────────────────┐
                    │   OUR ETA ENGINE (ML)   │
                    └────────────┬────────────┘
                                 │  API  (the tap)
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
   📱 Mobile app           🖥️ Station display        🎛️ Control room
   "Your train             "12345 arriving           "17 trains at risk,
    reaches at 4:35"        Platform 3, 4:35"         reorder at Junction X"
```

A sample API call looks like this — plain, boring, and exactly what judges want:

```http
GET /api/v1/trains/12345/eta

{
  "train_no": "12345",
  "current_location": { "lat": 26.44, "lon": 80.33, "speed_kmph": 62 },
  "last_updated": "2026-01-14T14:32:10Z",
  "predictions": [
    { "station": "CNB", "name": "Kanpur Central",
      "scheduled": "15:00", "predicted_eta": "15:47",
      "confidence_low": "15:40", "confidence_high": "16:02",
      "delay_min": 47,
      "reasons": ["congestion_ahead", "fog", "temporary_speed_restriction"] },
    { "station": "ALD", "name": "Prayagraj Jn",
      "scheduled": "17:30", "predicted_eta": "18:25",
      "confidence_low": "18:05", "confidence_high": "18:55",
      "delay_min": 55, "reasons": ["cascade_from_upstream"] }
  ]
}
```

Also add a **push/streaming** channel (WebSocket) so screens update **by
themselves** when the ETA changes — nobody should press refresh. That single
detail is what makes the demo feel *dynamic*.

---

## Part 9 — CATEGORY: Software 💻 (what this means for you)

The category is **Software**, not Hardware. This changes your whole strategy:

**✅ What you WILL be judged on:**
- Working code, running live
- System design (how the pieces fit)
- The ML model and its accuracy numbers
- APIs, dashboards, database design
- Scalability (can it handle 3,000 trains?)
- A clean, working demo

**❌ What you must NOT do:**
- Don't build a GPS device. Don't buy sensors. Don't design a circuit.
  **Assume the data already exists** — because it genuinely does. Indian Railways
  already runs **RTIS** (built with ISRO) which streams GPS from thousands of
  locomotives every 30 seconds into the **Control Office Application (COA)**, and
  **NTES** is the public train-enquiry system.

**🎯 Your positioning line:**
> *"Indian Railways already HAS the data. What's missing is the intelligence
> layer on top of it. We are building that layer — pure software, deployable on
> existing infrastructure."*

**⚠️ The data problem, and how to solve it honestly:**
You will not get live Railways feeds during a hackathon. So:
1. Build a **simulator** that produces a realistic RTIS-style GPS feed (train
   positions every 30s, plus injectable events: fog, red signal, TSR, block).
2. Use **public/historical datasets** of Indian train running data for training.
3. Keep the data-input layer **pluggable** — so swapping the simulator for the
   real COA/RTIS feed is a config change, not a rewrite.
4. **Say this out loud to judges.** Honesty about the data source + a clean
   adapter design reads as engineering maturity, not as a shortcut.

---

## Part 10 — THEME: Smart Automation 🤖 (this is where teams lose marks)

> ⚠️ **First, a housekeeping note:** the official SIH listings for 26028 are
> inconsistent — the master catalogue shows **Smart Automation**, while some
> portal pages show **Disaster Management**. Your brief says *Smart Automation*,
> so build for that. **Please confirm on sih.gov.in before submitting**, and keep
> one slide that covers the disaster angle (Part 10.3) so you're safe either way.

### 10.1 — What "Smart Automation" actually means

Break the two words apart:

- **Automation** = it happens **by itself**. No human clicks a button.
- **Smart** = it also **thinks and adapts**. Not a dumb timer, but something that
  reacts to conditions and gets better with experience.

A washing machine on a fixed 40-minute cycle = *automation*.
A washing machine that senses how dirty the clothes are and adjusts = **smart
automation**. Be the second one.

### 10.2 — How to prove "Smart Automation" in your demo

Every one of these should be visible on screen:

| Requirement | How you show it |
|---|---|
| **No human in the loop** | ETAs recompute automatically every 30 seconds. Nobody presses anything. |
| **Reacts to events** | On stage, inject "fog at Kanpur" → the whole downstream ETA chain visibly shifts. This is your **money moment**. 🎬 |
| **Self-improving** | Show the feedback loop: actual arrivals are recorded, error is measured, the model retrains nightly. Show an accuracy graph going up. |
| **Automated decisions, not just numbers** | Don't stop at prediction — **act** on it. Auto-alert the control room, auto-flag missed connections, auto-suggest platform reallocation, auto-push notifications to passengers. |
| **Zero manual maintenance** | Models retrain on a schedule; the system detects when a train's behaviour has drifted and adapts. |
| **Scale as automation** | 3,000 trains handled at once, by a machine, with no operator. |

> 🔥 **Killer feature for this theme:** an **automated cascade-alert engine**.
> When train A gets delayed, the system automatically works out *which other
> trains, platforms, crews and passenger connections will be affected*, and
> notifies each of them — with **no human involved**. That is textbook Smart
> Automation, and very few teams will build it.

### 10.3 — Keep a "disaster" slide in your pocket

Since some listings tag this as **Disaster Management**, add one slide showing
the system in crisis mode: floods/cyclone/fog wipe out a section → the system
instantly re-forecasts every affected train, flags stranded passengers, and feeds
relief/diversion planning. One slide. Costs you nothing. Covers both themes.

---

## Part 11 — How the system works, drawn simply

```
   ┌──────────── 1. DATA COMING IN (the eyes 👀) ─────────────┐
   │  GPS from engines (every 30s) · Station arrival/departure │
   │  Signal aspects · Weather · Speed restrictions · Blocks   │
   │  Positions of other trains ahead · The timetable          │
   └────────────────────────────┬──────────────────────────────┘
                                ▼
   ┌──────── 2. CLEAN & COMBINE (the kitchen 🔪) ──────────────┐
   │  Fix bad/missing GPS · Map train to its section           │
   │  Build features: delay so far, congestion ahead, fog?,    │
   │  day of week, hour, train priority, history on this leg   │
   └────────────────────────────┬──────────────────────────────┘
                                ▼
   ┌──────── 3. THE BRAIN (ML model 🧠) ───────────────────────┐
   │  Predicts extra delay for EACH remaining station          │
   │  Adds a confidence range and the top reasons              │
   └────────────────────────────┬──────────────────────────────┘
                                ▼
   ┌──────── 4. GIVING IT OUT (the tap 🚰) ────────────────────┐
   │  REST API · WebSocket push · Dashboard · Display · App    │
   └────────────────────────────┬──────────────────────────────┘
                                ▼
   ┌──────── 5. LEARNING LOOP (the report card 📈) ────────────┐
   │  Compare prediction vs what really happened               │
   │  Measure error · Retrain nightly · Get better forever ♻️  │
   └───────────────────────────────────────────────────────────┘
```

**Step 5 is the one everybody forgets — and it's the one the problem statement
explicitly demands** ("continuously refine its predictions", "improve accuracy
over time"). Draw it in your architecture diagram. Judges look for it.

---

## Part 12 — Your 5-minute demo script 🎬

1. **(30s) The pain.** Show today's NTES-style "expected 4:05 PM" that never
   changes while the train hasn't moved. *"This is what 8 billion journeys a year
   rely on."*
2. **(60s) The map.** Live map, trains moving, each with a predicted ETA and a
   confidence band. Point out it's updating on its own.
3. **(60s) THE MONEY MOMENT.** Inject an event — *"fog rolls into Kanpur"*.
   Watch every downstream ETA shift automatically, in front of the judges.
   Nobody touched anything. **This is your winning 30 seconds.**
4. **(45s) The cascade alert.** Show the system automatically notifying the
   control room, the platform allocator, and passengers with missed connections.
5. **(45s) The numbers.** *"Static method MAE = 27 min. Our system = 8 min. 70%
   better. 84% of predictions within 15 minutes."*
6. **(45s) The scale + API.** Show 3,000 simulated trains running, then hit the
   API live with curl/Postman and show the JSON. Mention it plugs into
   NTES/COA-style feeds without a rewrite.
7. **(15s) The close.** *"Same engine, three screens: passenger's phone, station
   display, control room. Automatic, self-improving, zone-agnostic."*

---

## Part 13 — Mistakes that will cost you the win ❌

1. **Only predicting the final destination.** The statement says *"at various
   points in their journey"* and *"upcoming stations"* — **plural**. Predict for
   every remaining station.
2. **A static demo.** If nothing changes on screen by itself, you have failed the
   word *"Dynamic"* — which is literally the first word of the title.
3. **No feedback loop.** *"Continuously refine"* and *"improve accuracy over
   time"* are explicit requirements, not bonuses.
4. **A pretty UI with no model.** Judges will ask *"what algorithm, what
   features, what error?"* Have exact numbers ready.
5. **Ignoring scale.** Show it working for thousands of trains, even simulated.
   Talk about your queue/stream design.
6. **Forgetting the three audiences.** Passenger app, station display, control
   room dashboard. All three are named in the statement.
7. **No baseline comparison.** Without *"better than what?"*, your accuracy
   number is meaningless.
8. **Ignoring the theme.** If your pitch never uses the words *automatic*,
   *self-learning*, *no human intervention* — you missed **Smart Automation**.
9. **Pretending you have live Railways data.** Be honest, show the adapter.
10. **Predicting only a single number.** Ranges + reasons show real maturity.

---

## Part 14 — One-page cheat sheet 📌

**The problem in one line:**
> Train arrival times are guessed from an old timetable instead of what's
> actually happening on the tracks, so they're wrong and nobody trusts them.

**The solution in one line:**
> A self-updating, self-learning software brain that watches live GPS, traffic,
> weather and history to predict — every 30 seconds, for every upcoming station,
> for thousands of trains at once — exactly when each train will arrive, and
> serves it through APIs to phones, platform displays and control rooms.

**The 5 words that must be in every slide:**
`Dynamic` · `Real-time` · `Data-driven` · `Self-learning` · `Automated`

**The formula shift:**
```
❌ OLD:  ETA = timetable + current delay − hidden recovery time
✅ NEW:  ETA = live position + learned section times + congestion ahead
               + weather + signals + history + cascade effects
               ... recomputed every 30 seconds, forever
```

**Your headline claim (fill in your own numbers):**
> *"We reduced ETA error from 27 minutes to 8 minutes — a 70% improvement —
> across 3,000 simultaneously tracked trains, fully automatically."*

---

## Part 15 — Real systems worth name-dropping (shows homework) 📚

Mentioning these makes you sound like you've done your research:

| Name | What it is |
|---|---|
| **NTES** | National Train Enquiry System — the public "where is my train" service. |
| **COA** | Control Office Application — the software railway controllers use; train charts get plotted here. |
| **RTIS** | Real Time Train Information System — built with **ISRO**, GPS units on locomotives sending **30-second** updates straight into COA. Thousands of locos are already fitted. |
| **FOIS** | Freight Operations Information System — the goods-train counterpart. |
| **Working Timetable** | The internal timetable containing the real running times, **EA** and **TRT** recovery allowances. |

> 💬 Use this in your pitch: *"RTIS already delivers 30-second GPS from thousands
> of locomotives into COA. The pipe exists. What's missing is the predictive
> intelligence at the other end — and that's exactly what we built."*

---

### ✅ Final check: do you now understand every word?

Try explaining these to a friend without looking: *coaching train, block section,
signal aspect, TSR, recovery time, downstream congestion, cascade, temporal vs
spatial variability, sectional running time, API, MAE, Smart Automation.*

If yes — you understand problem statement 26028 better than most teams
attempting it. Now go build it. 🚂

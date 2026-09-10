# A–Z Keyword Glossary — Problem 26028

Quick lookup for presentation Q&A. Every term that appears in the official
problem statement, plus the ones judges tend to ask about.
One line each. Scan it right before you go on stage.

---

**API** — A "socket" other apps plug into to get our data. Mobile app, station display and control room all use the same socket.

**Average sectional running time** — The *typical* minutes a train really takes between two stations, averaged over past days. More honest than the timetable number.

**Baseline** — The simple method you compare against (`timetable + current delay`). Without it, your accuracy number means nothing.

**Block / Maintenance block** — A booked window when a track is closed for repair. No trains may pass. Causes holds and diversions.

**Block section** — A safety chunk of track where only **one** train is allowed at a time. The main reason trains stand still in the middle of nowhere.

**Cascade** — One small delay creating a chain of bigger delays, like dominoes. On multi-day trains, 20 minutes can grow into hours.

**Coaching train** — A train that carries **people** (Rajdhani, Shatabdi, Express, Passenger). Opposite of goods/freight. **This is our only scope.**

**COA (Control Office Application)** — The software railway controllers use; train movements get charted here automatically.

**Confidence interval** — Giving a range instead of one number: *"4:35, likely between 4:28 and 4:52"*. Honest, and control rooms prefer it.

**Congestion** — A traffic jam of trains — too many trains wanting the same track.

**Continuously refine** — The system checks yesterday's guesses against reality and corrects itself. Explicitly demanded by the problem statement.

**Control room dashboard** — The big screen for railway controllers showing all trains, jams and alerts.

**Crew scheduling** — Planning which driver/guard works which train. Drivers have legal duty-hour limits, so delays wreck the roster.

**Data-driven** — Decisions from real numbers and evidence, not from an old rulebook or someone's assumption.

**Delay** — How late a train is, in minutes (a *duration*). Different from ETA, which is a *clock time*.

**Delay management** — Actively doing something about delays (reordering, re-prioritising), not just watching them.

**Destination station** — The last station of the journey.

**Division** — A sub-region inside a zone (~70 across Indian Railways).

**Downstream** — The tracks **ahead** of the train, where it's going. (Upstream = already crossed.)

**Downstream logistics services** — Businesses depending on the train arriving: parcels, courier, catering, connecting transport.

**Dwell time** — How long a train stands at a platform.

**Dynamic** — Keeps changing by itself as new facts arrive. The **first word of the title** — your demo must visibly do this.

**EA (Extra time Allowed)** — Spare minutes deliberately padded into the working timetable so a late train can catch up.

**ETA (Expected Time of Arrival)** — The predicted **clock time** the train reaches a station. The whole point of the project.

**Explainability** — Showing *why*: "+18 min congestion, +7 min fog". Turns a black box into a tool people trust.

**Feature** — One input fact the model uses (hour of day, fog yes/no, trains ahead, delay so far).

**Feedback loop** — Recording what actually happened, measuring the error, retraining. The step most teams forget.

**Feeder transport services** — Buses, autos, taxis, metro that bring passengers to/from the station.

**FOIS** — Freight Operations Information System — the goods-train counterpart to coaching systems.

**Forecast** — An educated guess about the future based on patterns.

**GPS-based location data** — Satellite position, speed and direction of the locomotive.

**Gradient Boosting (XGBoost / LightGBM)** — The go-to ML model for table-shaped data like this. Fast, accurate, runs on a laptop.

**Historical delay patterns** — What happened on past days. *"This train always loses 18 minutes here on Monday mornings."*

**Intermediate station** — Any station in the middle of the journey. **We must predict for all of these, not just the destination.**

**Junction** — Station where multiple routes meet. Jam-prone.

**Knock-on delay** — You're stuck because the train **in front** of you is slow, and you can't overtake.

**Level crossing gate** — Road gate where vehicles wait for trains. If it can't close in time, the train slows or stops.

**Loco / Locomotive** — The engine. GPS units are fitted here.

**Loco Pilot** — The train driver.

**LSTM / Transformer** — Sequence models that treat the journey as an ordered chain of stations and predict all remaining stops at once, capturing cascades.

**MAE (Mean Absolute Error)** — "On average our guess is off by *N* minutes." **Your headline accuracy number.** Lower is better.

**Machine Learning (ML)** — Teaching a computer with examples instead of hand-written rules.

**Multi-day journey** — A train running more than 24 hours, where small delays compound badly.

**Network conditions** — Live health of the whole rail network: train density, jams, blocked tracks.

**NTES** — National Train Enquiry System — the public "where is my train" service.

**Operational bottleneck** — A narrow spot where jams always occur (busy junction, single-line stretch, bridge).

**Operational parameters** — The train's settings: max speed, coach count, engine type, priority, planned stops.

**Platform allocation** — Deciding which platform a train uses. Late trains cause two-trains-one-platform conflicts.

**Preceding train** — The train ahead of you on the same track — its delay becomes your delay.

**Punctuality** — The official on-time score. Often flattered by recovery time padding.

**Rake** — The full set of coaches making up the train.

**Real-time data feed** — Information arriving live, every few seconds — not a file from last month.

**Recovery time** — Hidden spare minutes in the timetable that let a late train catch up. Part of the *current* (weak) ETA formula.

**RMSE** — Like MAE, but punishes big misses more heavily.

**RTIS (Real Time Train Information System)** — Built with **ISRO**; GPS units on locomotives streaming **~30-second** updates into COA. Proves the data pipe already exists.

**Run-through** — The train passes a station without stopping.

**Scalable** — Still works when thousands of trains run at once. Explicitly required.

**Section** — Track stretch between two stations.

**Sectional running time** — Normal minutes to cross one section.

**Signal aspect** — The colour showing on the signal: 🔴 stop · 🟡 caution · 🟡🟡 preliminary caution · 🟢 clear. Seeing red ahead predicts a delay *before* it happens.

**Signal halt** — Stopping because of a red signal, not a station. Common and invisible in the timetable.

**Smart Automation** — **Our theme.** Runs by itself (automation) *and* adapts and learns (smart). No human clicks anything.

**Spatial variability** — Behaviour changes with **place**: Mumbai suburban ≠ Rajasthan desert ≠ Assam hills.

**Static** — Fixed, unchanging. The thing we are replacing.

**Station display** — Platform LED boards showing arrival info.

**Statistical model** — Prediction from averages, probabilities and trends. Simpler than ML, often surprisingly strong.

**Temporal variability** — Behaviour changes with **time**: 6 AM vs 6 PM, Monday vs Sunday, summer vs foggy December.

**TRT (Traffic Recovery Time)** — Recovery minutes specifically for traffic/block-occupancy delays.

**TSR (Temporary Speed Restriction)** — "Drive slowly here" order, usually for track work. Can force 130 km/h down to 30 km/h and add 20+ minutes.

**Unscheduled stoppage** — Stopping where the train wasn't meant to stop (red signal, chain pulling, cattle, gate fault).

**Working Timetable** — The internal railway timetable with real running times and the EA/TRT allowances.

**Zone** — One of ~19 big regions of Indian Railways, each with its own terrain, weather and operating habits.

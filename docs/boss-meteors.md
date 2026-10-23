# Awakened Boss meteor rain

Second-phase activation starts one cancellable recursive 2-second timeout. The
first wave launches two seconds after awakening; lead impact is 420 ms later.
Five short staggered meteors descend from stage upper right toward the hero at
lower left. A whole wave deducts exactly 5 HP once at lead contact, not per sprite.
Meteor damage is independent of question countdown and weapon/counterattack motion.
It does not count as a wrong answer or remove courage. Standard wrong-answer
counterattacks remain 20 HP; phase-two answer time remains five seconds.

stop() cancels the next wave, removes transient nodes and invalidates in-flight
impact callbacks. Stop at level/retry, menu exit, Boss death, hero death and victory.
Battle-generation guards prevent delayed attacks/questions/rewards from applying
to a dead hero or a new attempt. Simultaneous lethal events follow callback order:
if the Boss dies first its meteors stop; if the hero dies first the pending weapon
impact is cancelled and no victory reward is granted. HP is clamped at zero.
No persistent particles or frame-loop DOM allocation. Hidden tabs skip waves with
no catch-up burst. Reduced motion uses two brief stationary glow indicators and
the same damage/timing. No saved keys, prices or equipment stats are changed.

Validation: node tests/meteors.cjs covers phase-one inactivity, cadence, contact
sync, one hit per wave, menu exit, in-flight retry, victory stop, lethal meteor,
death during player attack, reduced motion and runtime errors. Also rerun the
53 existing regression checks and 19 adventure checks. Screenshots are local
ignored tests/*.png. Physical devices and live Pages deployment remain unverified.

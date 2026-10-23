# Chapter Boss special attacks

Easy Boss Royal Jelly Ball: once HP <=50% (and alive), start one five-second
cadence. At each tick show an 800 ms warning and squash/glow pose, then a 600 ms
right-to-left two-bounce jelly projectile. One contact deducts 3 HP, adds leaf/juice
colored hit particles and a floating number. Charge, launch, bounce and hero-hit
Foley use the original Web Audio engine. The first warning begins after the full
five seconds; damage occurs 1.4 seconds later.

Medium Boss Double Tidal Wave: half-HP activation, four-second cadence, one-second
warning/charge, then two waves launched 400 ms apart. Each crosses the lower half
of the battle stage in 450 ms and deducts 3 HP at its own contact (6 total). The
first warning begins after four seconds, contacts at 5.45/5.85 seconds after phase
entry. Two water/impact cues distinguish the contacts.

Both keep seven-second questions and regular 20 HP counterattacks. Special hits
do not count as wrong answers or change accuracy/stars. They run during questions
and weapon animations. Dragon retains its separate half-HP transformation,
five-second questions and three-second/6 HP meteor waves.

BossSpecials owns one recursive timer, a generation token, temporary nodes,
Web Animations and cancellable delays. Stop on retry, level entry, menu exit,
Boss death, hero death and victory. Death on wave one prevents wave two. Existing
battle-generation guards cancel stale attacks/questions/rewards. Reduced motion
replaces travel with brief opacity feedback without changing damage or timing.
Hidden tabs skip new casts without a catch-up burst. No new save keys or assets.

Validation: tests/boss-specials.cjs verifies activation, warnings, projectile timing,
3/3+3 HP, accuracy unaffected, in-charge retry, exit between waves, lethal first
wave, Boss defeat during charge, reduced motion and cleanup. Also run existing
regression/adventure/difficulty/meteor/audio suites. Screenshots live under
ignored tests/*.png. Physical devices and live deployment remain unverified.

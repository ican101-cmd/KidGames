# Adventure progression upgrade

## Answer feedback
Courage energy and finishers were removed. Correct answers trigger only the
equipped weapon attack. Stars use accuracy rather than consecutive answers.

## Enemy chapters
Five attack profiles: grass hop, forest leaf charge, coast glide, canyon stomp,
castle star lunge. The current purchased background still chooses the monster art
and HP/reward multiplier. New traits change anticipation/movement/VFX, not damage.
The Boss enters phase two exactly once at living HP <= 50%. Phase two adds a warm
aura and two feints before a lunge. Every regular enemy counterattack still deducts 20 HP once, at
animation contact. Defeated bosses never enter a new phase or gain extra HP.
Reduced motion keeps anticipation/feedback with no large enemy translation.

## Map and save compatibility
Five scene thumbnails and three independent difficulty routes. Clear a chapter to
unlock the next map node. Existing mode entry buttons remain available. Replays
are allowed; Boss route still requires the original unlock flag.
Stars: one for clear, one for >=80% accuracy, one for perfect accuracy in that level. No speed scoring. Keep the best star count; repeats cannot downgrade.
No retroactive stars are invented for old saves.

New localStorage key: fruit_adventure_v1. All 14 original keys remain unchanged.
player.adventure is included in existing JSON exports. Legacy JSON without this
field preserves current route data; missing/corrupt values default to empty,
star counts clamp to 0..3 integers. Full reset clears all routes and original gear.
No remote dependencies, build step, recurring DOM timers or new art downloads.

## Validation
node tests/adventure.cjs: charging, finisher cleanup, unchanged damage, partial
energy retention, map locking/click navigation, per-level scoring, best records,
reload, export/legacy import, Boss transition and contact timing, reduced motion,
375/390/430/768/1280 layouts, corrupted data normalization and full reset.
Also rerun tests/regression.cjs, tests/armor.cjs and tests/audio.cjs.
Screenshots live in ignored tests/*.png. Physical mobile devices and live Pages
are not verified locally. High damage weapons can earn all three stars through a perfect clear.

## Boss second-phase timer
The next question after a living half-HP awakening uses five seconds instead of
seven. There is no interruption to the already answered question or its attack.
The original countdown callback still triggers one 20 HP counterattack on timeout.
Question number ranges, weapon damage, enemy HP and other modes' time limits
remain unchanged. New run/retry returns the Boss to phase one and seven seconds.
The enemy trait label explicitly announces the five-second limit.

Second-phase meteors additionally deal 6 HP per wave every three seconds; see boss-meteors.md.

Easy and medium chapter-five bosses now have 150/180 base HP respectively;
see difficulty-bosses.md. Earlier HP-preservation notes refer to normal chapters.

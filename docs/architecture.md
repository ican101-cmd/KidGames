# Visual combat upgrade

## Original architecture review

The source repository contained README.md and a single index.html. HTML, CSS,
weapon catalog, audio, localStorage, shop, questions and combat were inline.
The HTML also began with a Markdown fence. All six weapons used the same fixed
170px dash; damage applied immediately while hits happened 250ms later. Enemy
damage had the same mismatch. Background FX, combatants and HP shared the stage
without a dedicated transient effects layer. Fixed dimensions risked overlap on
phones. Death only scheduled an overlay; the victory sequence referenced missing
keyframes. Gender selection changed an emoji but not the battle SVG. The diamond
sword and dragon included third-party game references. Save parsing used a single
try/catch and reset cleared the entire origin's storage.

## Current responsibilities

- index.html: existing screens, original SVG scenery/heroes/dragon, semantic answers.
- css/game.css: extracted original styles.
- css/animations.css: RPG presentation, responsive layout, effects and reduced motion.
- js/weapons.js: stable catalog and animation configuration, original SVG weapons.
- js/effects.js: WeaponAnimationSystem and reusable BattleEffects. WAAPI transforms,
  timed projectiles, slash trails, six hit presets, floating damage, shake, death.
- js/game.js: existing questions, economy, armor, shop, audio, saves and progression.
  Correct answers await animation; its impact callback applies damage exactly once.

Stage stacking is background-layer / character-layer / effect-layer. HP panels live
with combatant anchors, above backgrounds. Temporary VFX remove themselves after
their animation; no animation interval is added. Travel distance derives from
combatant bounds. Ranged weapons stay at their starting position. Diamond's three
visual slashes preserve one original 100-damage hit. Critical styling is available
but no new critical chance changes the original balance.

## Save contract

All 14 existing fruit_* keys and item IDs are unchanged. Existing JSON export/import
uses the original player object shape. No animation fields enter saves. The new
catalog preserves every price and damage amount; armor HP and background reward
multipliers are unchanged. Equipped items in older saves can be re-equipped without
paying again if their unlock array omitted them. Reset now removes fruit_* keys only.
Gender was not persisted in the original localStorage schema; selection remains at
startup. Continue means loading equipment/economy, not resuming a mid-battle state.

## Verification

Run `node tests/regression.cjs` with Playwright installed (set PLAYWRIGHT_MODULE for
its module location and TEST_BROWSER to chrome/msedge). The test serves the static
project over localhost, uses isolated browser storage, tests real DOM and animation
timing, writes results.json and screenshots. It covers viewport widths 375, 390,
430, 768 and 1280. These are desktop Chromium viewport tests, not physical iOS/
Android/Safari device certification. No build or server dependency is needed for
GitHub Pages: all runtime assets use repository-relative paths.

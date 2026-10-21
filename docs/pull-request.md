# Upgrade original RPG presentation and weapon combat animations

Correct answers previously deducted HP immediately and played the same fixed dash
for every weapon. This change preserves the existing game rules, math questions,
damage, prices, armor, reward multipliers and save keys while applying damage at
the weapon animation's impact callback.

The six weapon configurations now drive distinct melee, thrust, magic projectile,
arrow and three-slash diamond effects. Reusable hit effects, floating damage,
bounded shake, HP ghosts, enemy counterattack timing and death animation share a
dedicated VFX layer. Original SVG heroes, scenery, equipment and a fantasy dragon
replace the previous referenced diamond sword/dragon design. Static relative assets
remain compatible with GitHub Pages.

Validation: 28 browser regression checks passed on local Microsoft Edge/Chromium,
including all weapons, impact timing, cleanup, shop buy/equip, 14 legacy storage
keys, reload, JSON import/export, reward code, both characters, timeout/wrong-answer
counterattacks, boss unlock/victory, death/retry, reduced motion and five viewport
widths (375/390/430/768/1280). Screenshots were visually inspected at 390px.
Real iOS/Android/Safari testing remains outstanding. No new critical chance or
damage multiplier is introduced; critical number styling is available for future use.

Upload destination: https://github.com/ican101-cmd/KidGames (a fork preserving
the original source and history). The upgraded files are uploaded through the
authenticated GitHub web interface on feature/visual-combat-upgrade because the
terminal does not share browser authentication. Remote upload commits therefore
have different SHAs from the four original local implementation commits.
Main is unchanged; merge and Pages publication remain separate follow-up actions.

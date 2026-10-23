# Weapon-specific ultimate visual effects

Presentation metadata lives in weapons[id].animation.ultimate. Six styles:
- Wood: 烈焰勇者斬 / flame aura, curved fire tongues and a burning dash trail.
- Iron: 閃電拔刀斬 / silver-blue lightning aura and a jagged path across the dash.
- Wand: 星環魔力洪流 / violet rune ring, enlarged magic orb and orbital shell.
- Spear: 雷霆貫穿 / narrow blue lightning line and concentrated piercing impact.
- Bow: 烈陽穿雲箭 / solar ring, larger gold arrow and orange fire trail.
- Diamond: 星晶極光連斬 / cyan-violet aura, two equipped-hero afterimages,
  layered slash effects and crystalline shards.

js/ultimate-vfx.js owns each attack's temporary nodes, timers and Web Animations.
Auras receive the same movement keyframes/offsets as the hero, including spear
recovery. No per-frame DOM allocation, intervals or remote assets. cancelAll is
called by BattleEffects.reset; invalid attack impacts cancel their own session.
Afterimages clone the existing equipped hero SVG, remove IDs and preserve gender.
Ranged attacks remain stationary and use an enhanced real moving projectile.
Reduced motion omits travelling particles, traces and ghosts, retaining a soft
aura/impact color. Full effect sessions expire within attack duration +650 ms.

The manual three-number/two-choice challenge, button, remaining answer seconds,
exact double damage, original impact delays, prices, save keys and Boss skills
are unchanged. Screen shake remains a short 4 px maximum stage motion and is
suppressed under reduced motion.

Validation: node tests/weapon-ultimate-vfx.cjs covers six styles, real ranged
projectiles, damage at impact, node cleanup, five viewport widths, in-flight retry
and reduced motion. Also rerun tests/ultimate.cjs (11 scenarios) and the 53-check
regression suite. Physical device/live Pages verification remains outstanding.

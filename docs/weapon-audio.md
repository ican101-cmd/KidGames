# Weapon audio
Original Web Audio procedural Foley, not recorded samples. Reuses the existing
user-gesture-unlocked AudioContext; no network resources or save-key changes.
Filtered noise models moving air and contact; damped oscillators model string,
wood, metal and crystal resonances. Six profiles follow animation timing.
Bow release at 230 ms matches projectile launch. Impact layers run directly
from the same event as damage application. Sources stop and disconnect.

Validation: node tests/audio.cjs renders six OfflineAudioContext waveforms,
checks signal energy, unclipped peak, distinct output and clean tails.
node tests/regression.cjs passes 51 gameplay/layout checks.
Listening on physical phones and deployed-site testing remain outstanding.

## Hero feedback
HeroAudio uses the shared WeaponAudio.hero entry point. Hit Foley runs in the
same callback as the 20 HP deduction. A defeat motif runs once after the enemy
attack finishes and HP is confirmed zero, before the existing game-over panel.
There are no voices, external recordings, new save keys or balance changes.
Offline tests now cover eight sounds. Gameplay checks assert hit/HP synchronization
and the ordered hit/death events on a lethal strike. Actual device listening
and deployed-site validation remain outstanding.

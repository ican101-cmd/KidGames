# Add original illustrated heroes, monsters and five-stage world art

The first upgrade used small vector characters and a shared simplified landscape.
This change adds reference-inspired original boy/girl adventurers, an illustrated
Duskstar Dragon and three painted monsters, plus five distinct battle backgrounds:
meadow, ancient forest, coastal ruins, sunset canyon and moonlit castle courtyard.
11 local WebP assets total about 2.4 MB, preserving real character transparency.

WorldArt selects scenes by the existing level number. Purchased pink/blue themes
still apply their tint, monster type and unchanged multiplier. Hero equipment and
separate weapon animation remain visible, with larger responsive character boxes
and adjusted armor overlays. Reset now cancels only transient WAAPI animations,
preserving CSS monster idle animations between levels.

Validation: 50 local Edge/Chromium checks passed, covering the prior combat/save
suite, all 11 art assets under /KidGames/, 15 theme/scene combinations, idle reset
and Boss layouts at 375/390/430/768/1280px. Screenshots were visually inspected.
No physical iOS/Android/Safari certification. No changes to balance or saved IDs.

Upload status: GitHub browser origin access was declined in this session. This
branch is committed locally; no PR is created and the deployed site stays on PR #1.

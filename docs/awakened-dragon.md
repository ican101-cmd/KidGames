# Awakened dragon

Generated with built-in image_gen, using assets/art/dragon.webp as the identity
and style reference. Transparent RGBA WebP, 640x640, stored at
assets/art/dragon-awakened.webp. The original remains unchanged.

Final prompt:

Create one original awakened second-phase dragon game sprite using the provided dragon as the identity and art style reference. Same recognizable purple dusk dragon, left-facing three-quarter full-body view, curved ivory crown horns, turquoise forehead gem, cream segmented chest, clawed feet and curled tail. Keep hand-inked watercolor/gouache storybook JRPG rendering and confident dark outlines matching the reference, not photorealistic and not pixel art. Awakening: majestic wider raised wings with glowing amber-gold vein patterns on the violet membranes, horn tips lit warm gold, brighter turquoise gem, thin luminous orange-gold flame runes along chest and shoulder scales, gold-orange eyes, a few controlled flame wisps near the wing edges and tail tip. Clearly visually transformed but still the same dragon. Heroic fantasy boss, children-friendly, no gore, no extra heads or limbs. Composition: entire dragon fits within frame including horns wings claws and tail, ten percent clear padding around silhouette, approximately square framing, feet on same horizontal baseline, centered body. TRUE TRANSPARENT background and transparent holes between limbs/wings. No scenery, ground, cast shadow, text, border or watermark. Keep all glow tight to the dragon for clean layered game compositing, no full-screen effects.

Integration: preload on Boss entry; use the awakened sprite in the living half-HP
phase and victory scene. Reset to the original sprite on level entry/retry.
No changes to damage, HP, prices, unlocks or save format.

High-resolution transparent PNG source: assets/art/dragon-awakened.png (1254x1254).
Runtime WebP is 246936 bytes. Verified true alpha via canvas readback, half-HP
switch, retry reset, matching victory art, and containment at five viewport sizes.
Validation: 53 regression checks and 16 adventure checks pass locally. No live
GitHub Pages deployment or physical device check has been performed for this build.

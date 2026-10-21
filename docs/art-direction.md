# Illustrated world art direction

Generated using the built-in image_gen tool. The supplied reference informed the
boy hero's adventurous silhouette, spiky dark hair, blue tunic and purple cape.
The new faces, leaf-shaped amber circlets, round wooden shields, costumes and poses
are original designs. The reference image itself is not included in this repository.

## Final prompt set

Shared visual language: cheerful children's classic Japanese fantasy RPG;
hand-inked manga contours, watercolor and opaque gouache shading, subtle paper
texture, expressive readable silhouettes, no UI, text, watermark or franchise logos.

- hero-boy: original black-haired adventurer, bronze circlet with leaf-shaped amber
  jewel, teal tunic, mustard undershirt and leggings, plum scarf/cape, brown boots,
  round wood-and-bronze shield; full body facing right, empty forward hand for the
  game's separate weapon, true transparent background. Reference is general outfit
  mood rather than an exact reproduction.
- hero-girl: matching companion using the generated boy as costume/style reference;
  swept dark-brown bangs and short tied ponytail, same blue/gold/plum outfit,
  confident expressive eyes, full-body right-facing empty-hand stance, transparent.
- dragon: original Duskstar Dragon, indigo/violet scales, pale lavender armored
  belly, branching ivory crescent horns, amber eyes, teal forehead scale, wine-purple
  wing membranes, curled tail, left-facing crouched battle stance, transparent;
  formidable and child-friendly, no blood/horror or existing dragon design.
- slime: original glossy two-lobed apple-shaped green jelly with leaf sprout,
  golden jelly flecks, round pseudopods, cocoa eyes and apricot cheeks, left-facing,
  transparent; not a pointed teardrop or an existing game's slime face.
- flower-spirit: moss-green seed body, coral-pink petal bonnet, pointed leaf ears,
  pollen freckles, leaf arms and curled root feet, left-facing, transparent.
- reef-fish: rounded turquoise fish, peach fan fins, golden spiral crest, pale belly,
  expressive eyes and curled ribbon tail, left-facing, transparent, no water backdrop.

All scenes: wide 3:2 original hand-painted storybook landscape, eye-level viewpoint,
layered depth, clear unobstructed battle ground in lower 35%, landmarks mainly in
middle/top, no characters, monsters or recreation of an existing game's map.

1. stage-1-meadow: sunlit fruit kingdom meadow; orchards, lime hills, cream dirt
   road, ivory castle with blue towers, distant mountains, luminous sky and flowers.
2. stage-2-forest: ancient forest sanctuary; arching oaks, mossy roots, sun shafts,
   old stone shrine and rope bridge, emerald canopy and clear woodland battle trail.
3. stage-3-coast: turquoise coast ruins; cream sand, flowering ivory arches, islands,
   distant lighthouse and sails, waterfall, azure sky, aquamarine/coral palette.
4. stage-4-canyon: amber canyon at sunset; terracotta plateau, sandstone arches,
   blue river below, watchtower/bridge, golden grasses, peach sky, lavender shadows.
5. stage-5-castle: moonlit Duskstar castle; broad slate courtyard, violet towers,
   fruit-carved stone, amber windows, crescent moon, indigo sky and cyan crystals;
   majestic but welcoming, no skeletons or horror.

## Delivery and integration

All 11 final assets are committed under assets/art/ as WebP (about 2.4 MB total).
Characters/monsters preserve genuine alpha; scenes are 1280x853. Metadata and byte
sizes are in art-assets.json. Original full-resolution generated PNGs remain in the
generation library; runtime references never depend on that external folder.

js/art.js selects five scenes by the existing level number, in all difficulty modes.
Purchased pink/blue themes retain their tint, monster choice and reward multiplier.
No saved equipment IDs, storage keys, damage, prices or mathematical rules change.
SVG equipment overlays and the existing separate weapon animation remain layered
over the illustrated hero. The battle stage has more room for larger silhouettes.

Art QA checks image delivery, all 15 scene/theme combinations, both heroes,
armor overlays and five Boss viewport widths in addition to combat regression.

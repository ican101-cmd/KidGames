# Illustrated armor overlays

Generated with the built-in image_gen tool using hero-boy.webp and hero-girl.webp
as style and three-quarter-view references. Original fantasy equipment, transparent
background, ink outlines and watercolor material shading. No third-party assets.

## Production prompt
Create ONE production game equipment sprite atlas on a truly transparent background,
square canvas, exactly 4 columns by 4 rows evenly spaced grid. Reference images are
STYLE AND THREE QUARTER VIEW references only: original hand inked watercolor
storybook JRPG, dark brown fine outlines, subtle painted shading, friendly heroic
equipment that matches those teal tunic plum cape heroes. NO characters, NO skin,
NO mannequins, NO background, NO labels/text, NO shadows outside the objects,
NO weapons. Each of the 16 equal cells contains one centered isolated armor piece
fitting entirely inside its cell with generous clear padding. Columns materials
left to right: dark iron steel with bronze rivets; bright cool silver with blue
trim; warm gold with brown leather trim; pale cyan faceted diamond armor with
violet silver trim. Rows top to bottom: ROW1 open-face helmet, rounded cap with
subtle leaf crest, three-quarter facing viewer right, open face has transparent
hole and no neck no hair, not full face mask; ROW2 compact torso breastplate only,
fitted chest cuirass without arms or shoulders or skirt, three-quarter view right,
diagonal leather strap painted on breastplate matching reference; ROW3 single
leather-and-metal forearm bracer, diagonally slanted from upper right to lower left
about 35 degrees off vertical, cuff only no hand, decorated layered plates;
ROW4 SINGLE boot, tall cuff and armored shin, three-quarter view with foot pointing
lower left, no leg above cuff. Exact strict row and column order. All pieces
readable at 32 pixels tall, strong material color separation, painted highlights
with no glow extending outside. Original fantasy designs, not replicas of existing
franchise armor. Same art quality as reference. 4x4 evenly spaced atlas with
transparent gutters.

## Integration
16 trimmed alpha WebP sprites in assets/art/armor. js/armor-art.js maps the stable
helmet/chest/gloves/boots and iron/silver/gold/diamond IDs to existing 100x150
hero SVG coordinates. Gender-specific fitting positions are editable in fits.
The shield hides the far arm; the visible bracer overlays the near forearm.
Boots use two placements. Chest does not replace the cape or tunic skirt.
Existing head hair remains behind an open-face helmet.
Both the battle and inspector render through the same function. Boss victory
clones the equipped hero SVG. Shop cards show the matching armor sprite.
Mixed tiers remain independent; none removes only that slot. Save keys, price,
unlocks and HP values are unchanged. No runtime image generation or remote assets.

Validation: tests/armor.cjs checks 16 asset URLs and alpha metadata, both genders,
all tiers, unequipped state, mixed-tier inspector, legacy save reload and HP.
Gameplay regression checks include five viewport sizes and Boss battles.
Real-device and deployed-site verification remain outstanding.

## Boot pose correction
The far foot points right, but the generated single boot points left. Boot
placements now include an optional horizontal mirror about their own center.
Near and far boots retain independent width/height/position for each hero.
The shared SVG coordinates apply equally to battle, inspection and Boss clones.
The original painted leather remains beneath the armor; no character pixels or
save data are altered. tests/armor.cjs checks all four tiers and both genders,
opposite orientation, and stage containment at 375/390/430/768/1280 pixels.
Comparison screenshot: tests/boot-alignment-comparison.png (original/before/fixed).

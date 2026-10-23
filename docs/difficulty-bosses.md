# Difficulty Bosses and courage removal

Ordinary/easy chapter 5: Apple Pudding Monarch (蘋果布丁王), base 150 HP,
royal bounce counterattack, green-gold VFX and soft jelly resonance.
Intermediate/medium chapter 5: Azure Tide Armored Tortoise (蒼潮甲龜),
base 180 HP, longer shell charge and stomp, blue VFX and water/low impact Foley.
Purchased theme HP/reward multipliers still apply. Both counterattacks retain
20 HP damage; chapter answer time remains 7 seconds. Existing 10/20 coin rewards
and medium-mode dragon unlock remain intact. No meteor rain or dragon transformation in these
two modes. Half-HP chapter skills are documented in chapter-boss-specials.md. Dragon mode retains 200 base HP, awakening, five-second phase-two
questions and two-second meteor waves.

The courage bar, charge/ready/consume API and finisher effects are removed.
Stars now mean clear / >=80% accuracy / perfect accuracy. No streak requirement.
Old best star records, all original save keys, exports/imports, gear and map
unlock progress are preserved. No new storage format or migration required.

Assets generated using the built-in image_gen tool, using existing hand-painted
slime/dragon sprites as style references. Runtime alpha WebP sprites are saved at
assets/art/boss-apple-king.webp and assets/art/boss-tide-tortoise.webp.

## Apple Monarch final prompt

Create ONE original full-body game boss sprite on TRUE TRANSPARENT background. Reference slime is style and species inspiration; reference dragon is ink/watercolor quality only, do not draw dragon. Subject: Apple Pudding Monarch, a large cute apple-shaped jelly king for a children's math JRPG beginner difficulty final boss. Three-quarter facing left toward player. Rich translucent lime-green and honey-yellow jelly with watercolor highlights, two leaf fins and stem, a small ornate bronze/gold crown with amber fruit jewel, determined friendly expressive eyes and confident smile, pudgy jelly hands and wide soft feet, a few suspended golden fruit seeds inside body. A small plum royal cape behind its body adds adventure character. Strong compact silhouette distinct from ordinary slime, regal but not scary. Hand-inked dark brown outlines, painted watercolor/gouache shading matching provided art, original storybook JRPG, no pixel art, no photorealism, no existing franchise characters. Whole creature visible with 8% transparent padding, feet on same baseline, approximately square canvas. No text, background, floor, cast shadow, border, extra characters or weapons. Preserve genuine alpha including holes around cape.

## Tide Tortoise final prompt

Create ONE original full-body game boss sprite with TRUE TRANSPARENT background. The reference dragon gives ONLY hand-inked watercolor style and quality; create a completely different creature, NOT another dragon. Subject: Azure Tide Armored Tortoise, intermediate final boss for a friendly children's fantasy math JRPG. Massive squat sapphire/teal turtle in left-facing three-quarter stance, four sturdy clawed feet, broad expressive amber eyes with a determined but not scary expression, short beaked snout, magnificent layered shell of blue-green crystalline stone plates with ivory and bronze rims, an aqua crystal crest atop the shell and curling small seafoam/fin ornaments, cream scaled underbelly, tail curling right. A few small blue water wisps close to feet suggest tidal power but no scenery or puddle. Visually reads as a heroic fantasy armored turtle boss with a clear heavy shell silhouette, not a fish, not humanoid. Dark brown ink contour and painterly watercolor/gouache texture, readable at 140px, original storybook JRPG art matching reference, no pixel art, no photorealism, no existing franchise designs. Keep entire shell, crest, feet, snout and tail inside canvas with 8% transparent margin, centered roughly square composition and feet grounded on same baseline. No text, floor, cast shadow, background, border or additional creatures.

## Validation

tests/difficulty-bosses.cjs covers artwork/HP/theme selection, five responsive
widths, counterattacks, normal weapon damage, rewards, star persistence and no
courage API/UI. Existing gameplay, adventure, meteor, armor and audio suites are
also run. Physical mobile hardware and live Pages deployment remain unverified.

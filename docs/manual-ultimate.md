# Manual ultimate attack

A native button at the bottom of the battle screen switches the active question
to three-number addition and two unique choices. Terms use the existing mode
ranges: easy 1..9, medium 11..20, dragon 20..69. Exactly one option is correct.
The remaining answer seconds are retained; clicking does not grant a fresh timer.
The button locks until the question resolves and cannot reroll or cancel a skill
question. It also locks during attacks, counterattacks, death and victory.

Correct ultimate answers use a temporary copy of the equipped weapon with dmg*2.
Apply damage once at the existing weapon impact timestamp. Keep the weapon's
melee/cast/thrust/bow/combo motion; add gold/cyan energy arcs, burst particles,
a banner, enlarged damage text and a 240 ms stage shake (maximum 4 px).
Reduced motion omits the stage shake and keeps basic visual feedback.
No charge meter, courage streak, consumable, cooldown or saved gear mutation.
A new normal question re-enables the button. Wrong answers/timeouts cause the
existing 20 HP counterattack and then return to normal three-choice questions.

Boss hazards continue while selecting/answering/casting. Existing battle tokens
cancel damage if the hero dies first. A lethal ultimate grants the ordinary coin
reward once, records accuracy stars and stops remaining Boss hazards.
Retry resets the question mode. All existing save keys and export formats remain.

Validation: tests/ultimate.cjs checks term ranges/options, no timer reset/reroll,
all six weapons' doubled impact damage and ranged flight, wrong answers, timeout,
375/390/430/768/1280 layout, reduced motion, Boss hazard persistence, Boss rewards,
meteor death during attack and retry state. Existing regression, adventure and
chapter Boss suites are rerun. Physical devices and deployed Pages are unverified.

## Relic button styling
The primary label is now always 啟動必殺題. A separate hint switches between the
three-number/double-damage description and the instruction to choose an answer.
The emblem is original inline SVG: a cyan crystal over a sword/shield, bronze/gold
fittings and plum/teal colors matching the hero's cape and equipment. The button
has touch-pressed, hover, focus and readable disabled states. No gameplay rules
changed. Reran all 11 manual-ultimate scenarios including five viewport sizes.

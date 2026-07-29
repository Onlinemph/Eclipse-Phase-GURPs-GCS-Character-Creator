# Eclipse Phase / GURPS: Final Audit

Findings from a full pass over the guide, the quick reference, and all eight data files. Ranked by whether it can bite someone at the table.

---

## Blockers

**1. Will is priced at 5/level in the libraries and 15/level everywhere else.**

`EP_ATT.attr` sets Will at 15/point. The guide's attribute table says 15/level. The quick reference says 15. But the `Increased Will` trait in `Eclipse_Phase_Morphs.adq` and `Eclipse_Phase_Mods_Traits.adq` carries `points_per_level: 5`, in 13 places. GCS charges what the trait says, so every Will-bearing morph is undercosted by 10 per level:

| Morph | Will | Charged | Should be | Total |
|---|---|---|---|---|
| Faust | +7 | 35 | 105 | 600 → 670 |
| Fury | +3 | 15 | 45 | 725 → 755 |
| Futura | +6 | 30 | 90 | 504 → 564 |
| Ghost | +3 | 15 | 45 | 630 → 660 |
| Grey | +3 | 15 | 45 | 390 → 420 |
| Hazer | +3 | 15 | 45 | 479 → 509 |
| Hulder | +6 | 30 | 90 | 510 → 570 |
| Hyperbright | +4 | 20 | 60 | 685 → 725 |
| Menton | +3 | 15 | 45 | 524 → 554 |
| Theseus | +3 | 15 | 45 | 435 → 465 |

It also breaks the customization menu: Part III prices the WIL pick at 45 points of value, and as the library is actually built, a player who takes it gets 15 points of value for the same free slot. Every other attribute trait in the library matches the attribute file exactly (DX 20, IQ 20, Per 5, HT 10, HP 2, Basic Speed 5/quarter, ST 8 net), so this is an isolated typo, not a design position. Recommendation: set the 13 nodes to 15 and leave every document alone.

**2. All 96 customization slots are empty placeholders.**

Part III says each slot "becomes a Choose One Aptitude (+5) slot offering exactly seven options," and each slot's own notes say "Enable exactly one option." Every one of the 96 slot nodes in the library has zero children. The player has to read the note, go find the right trait, and hand-enter it, and the one thing they'll get wrong is the Basic Speed step count that Part I specifically warns about. Populating each slot with seven disabled children (IQ+2, DX+2, Increased Basic Speed 8, Will+3, ST+4, Smooth Operator 2, Per+3) makes chargen a click and makes the warning unnecessary.

**3. Eleven morphs have empty notes, and they're the eleven people actually use.**

Splicer, Exalt, Menton, Faust, Fury, Bruiser, Hyperbright, Synth, Steel Morph, Sam's Steel Morph, Daitya. Part III promises every morph's notes carry CP cost, chargen price, converted stat line, slot count, canon disadvantages, and a page reference. The other 92 have them. These are the ones whose prose write-up got written instead, so the data never got backfilled. Anyone browsing the library in GCS rather than reading the guide sees nothing on the flagship morphs.

---

## Guide disagrees with the files

**4. The appendix runs on stale numbers.** "Flat vs. Generic" states Flat 200 / Generic 324. Part III says 216 / 340, and 216 / 340 is what GCS computes. The appendix number came from the file's cached totals (see #8), not from the build.

**5. Steel Morph slot count.** The appendix cites "the Steel Morph's two" customization slots as intentional. The library gives it one. Remade is the two-slot morph, and the library agrees, but Remade's Part III paragraph manages to say "two customization slots" and "One slot" in the same entry.

**6. Two wrong endpoints in the catalog range table.** Biomorphs are listed as running from "Flat (2 pts)"; the Flat is 0. Uplifts from "Neo-Porpoise (9 pts)"; the cheapest uplift is Neo-Pig at 5.

**7. The Async template's arithmetic.** Part I: "Psychic Stab at full price [16] with Thought Browse [4], Drive Emotion [4], and Ego Sense [2] enabled as alternatives, plus Psi Shield [9]... Twenty-five points of traits." That's 35. All five individual prices match the sleight library exactly, so only the sum is wrong.

**8. Forty-four morphs carry stale cached totals in the .adq.** GCS recomputes on load, so nothing at the table breaks, but any script reading `calc.points` gets the old number, which is exactly how the appendix ended up citing 324. The guide's figures are the correct ones in all nine cases I spot-checked (Case 236, Daitya 687, Dragonfly 331, Flexbot 408, Slitheroid 428, Swarmanoid 263, Arachnoid 639, Reaper 924, Generic 340). One open-and-save pass through GCS fixes the whole class, including the five biomod packages in #13.

**9. Filename drift.** The guide and the quick reference both instruct you to load `EP_Attributes.attr` first. The file is `EP_ATT.attr`. Also, the file list in "Using This Document" reads "...and **Eclipse_Phase_Bestiary.adq** (57 threats), and **Templates/**".

**10. Four referenced files aren't in this set.** `Eclipse_Phase_Ego_Packages.adq`, `Eclipse_Phase_Bestiary.adq`, `Templates/`, and `EP_Morph_Stats_Reference.md`. Ego_Packages matters most: Part I sends players there for all 15 backgrounds and all 19 factions with their traits built out, and without it the chargen chapter is a table of point costs with no way to spend them.

---

## Mechanics and canon

**11. Synth ST 16, canon SOM +5.** By the project's own curve that's ST 14. It's the only unexplained deviation from the aptitude conversion in 103 morphs, which makes it look like drift rather than a decision. If it's deliberate (a 30 CP synthmorph reading as a working chassis), say so in its notes.

**12. Faust Will +7 and Hyperbright Will +4** sit one above the canon curve, both because of a morph augmentation stacking on the base bonus. Correct, but only the guide's prose explains it; the notes should.

**13. The sleepless five.** Crasher, Faust, Hibernoid, Hyperbright, and Remade correctly drop Less Sleep 4 from the Basic Biomod Package and take Doesn't Sleep instead, and the note explaining why is right there on the node. The package's cached total still reads 103 rather than 95. Same stale-cache class as #8.

**14. Part IX overstates the sleight rule.** "Every active sleight is leveled and has its own Hard skill" isn't what the library does. Seven leveled sleights have no skill (Downtime, Emotion Control, Grok, Heightened Awareness, Qualia, Sensory Boost, Psi Shield) and five skilled ones aren't leveled (the three Bursts, Invigorate, Restorative Fugue). Both groups are defensible: the first are passives that scale, the second are one-shots that don't. The sentence just needs to admit the two cases.

**15. Four augmentation gaps.** Skinlink is priced with no trait. Radar, Pneumatic Limbs, and Wrist-Mounted Tools exist as traits with no price. The last two are both installed on the Daitya, so a player who wants either can't buy one. Also, Neurachem is a single trait node against two priced entries (Neurachem (1) and Neurachem (2)); worth splitting to match.

**16. "Roll the better of HT or HT-based Jumping"** in the low-gravity rule. Jumping is DX/Easy.

**17. Sixty-three of 103 morphs have no in-play price.** Reasonable as scoping, but the acquisition table reads like a complete list. Either say it covers the common cases, or add a formula: the 41 listed track roughly $4,000 per CP, with restricted models running two to four times that.

**18. Fourteen Essentials items have no tech level.** Set them to 10 so GCS filters don't hide them.

**19. The quick reference has a rule the guide doesn't.** Psi inhibitor: HT vs. potency 14 or lose all sleights for 1d hours, and −4 even on a success. Good rule, and Part IX's "suppress an async's sleights for hours per dose" should be it.

---

## Verified clean

So you don't audit these twice:

- All eight files parse as valid GCS v5 JSON.
- 103 morphs, and the canon audit came back near-perfect: HP equals DUR × 0.6 exactly on all 102 entries with a canon Durability; slot counts match canon free-pick counts on all 103; the COO, COG, INT, and REF conversions are exact everywhere; the only SOM deviations are Synth (#11) and two false positives where ST is legitimately split across the chassis and Hardened Skeleton (Bruiser, Daitya).
- All 103 `Increased Strength` entries carry the −1 HP/level canceling feature. Zero exceptions, which is the load-bearing trick of the whole ST/HP split.
- `EP_ATT.attr` matches the guide's attribute table line for line, including the derived senses and the FP/HP threshold ladders.
- Gear: 1,007 items across 15 categories, matching the guide's count exactly, with zero duplicate entries and 96 items at TL11–12 against the guide's "about ninety."
- Augmentations: all 72 priced entries sit exactly on the four tiers, no strays. Every priced augmentation except Skinlink has a matching trait.
- Sleights: 68 entries, Async −25% on all of them, Ally-Only −20% on exactly the nine support sleights the guide names, and the 42 carrying the disabled −80% alternative-ability modifier are the active ones while the 26 without are passives.
- The quick reference's resleeving, forking, psychosurgery, hacking, and reputation tables match the guide row for row.

---

## Order to finish in

1. Will to 15/level (13 nodes). One find-and-replace, and it's the only thing here that changes a number a player pays.
2. Populate the 96 slots.
3. Backfill the 11 empty note fields.
4. Open and save the morph library in GCS to refresh 44 stale caches, then correct the appendix's Flat/Generic and Steel Morph lines against the refreshed numbers.
5. The small text fixes: #6, #7, #9, #14, #16, #19.
6. Price Pneumatic Limbs, Wrist-Mounted Tools, and Radar; add a Skinlink trait or drop it to pure equipment.
7. Ship Ego_Packages, or cut Part I's promise of it.

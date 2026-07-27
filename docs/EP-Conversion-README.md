# GURPS Eclipse Phase

A conversion of *Eclipse Phase* 1st edition to GURPS 4th edition, packaged as GCS libraries plus documentation. Assembled 26 July 2026.

Characters are built on 250 points. The conversion's central structure is the split between the Ego, which holds the mind and everything learned, and the morph, which holds the body and is replaceable. That split is what the libraries enforce.

---

## What's here

**`Documents/`**

`Character-Creation.pdf` is the player-facing procedure: eleven steps from loading the libraries to the final point check, with the Eclipse Phase to GURPS skill mapping and worked costs. Nine pages, US Letter. `Character-Creation.md` is the same document as markdown if you want to edit it.

`Conversion-Guide.md` is the full conversion in eleven parts: Ego construction, skills, the 103 morphs, resleeving, forks and psychosurgery, gear, mesh and hacking, reputation, async psi, GM material, and setting rules. This is the reference document, not the tutorial.

`Quick-Reference.md` is the mid-session sheet: every table a GM needs at speed, including the resleeving rolls, fork and merge procedures, hacking contests, rep costs, and habitat gravity.

**`GCS-Library/`**

Eight files to add to GCS's Library view. Load `EP_ATT.attr` first; the other files compute incorrectly without it.

| File | Contents |
|---|---|
| `EP_ATT.attr` | Attribute definitions. ST, HT, HP, and FP start at 0 because the morph supplies them |
| `Eclipse_Phase_Skills.skl` | Setting skills and four techniques |
| `Eclipse_Phase_Ego_Packages.adq` | 15 backgrounds, 19 factions, 8 reputation networks |
| `Eclipse_Phase_Morphs.adq` | 103 morphs in five categories, each priced to its chargen cost |
| `Eclipse_Phase_Mods_Traits.adq` | Augmentations as traits, for building or modifying morphs |
| `Eclipse_Phase_Mods_Equipment.eqp` | The same augmentations with cash prices, plus drugs |
| `Eclipse_Phase_Gear.eqp` | 1,007 items from *Ultra-Tech*, filtered to 10 AF |
| `Eclipse_Phase_Psi_Sleights.adq` | 68 async sleights, built as Alternative Abilities |

**`Reference/`**

`EP_Morph_Stats_Reference.json` holds the canon stat lines extracted from the *Morph Recognition Guide*, with the conversion conventions used (Durability × 0.6 for HP, armor × 0.75 for DR, and the aptitude mappings). Useful for checking a conversion or building a morph the library doesn't cover.

**`_project-notes/`**

`Audit-and-Open-Items.md` is a development document, not player material. It lists what's been verified and what's still outstanding. Delete the folder before distributing to players if you'd rather they didn't see the workings.

---

## How morph pricing works

This is the part most likely to surprise someone reading the library cold.

Every morph carries a **Morph Price Adjustment** trait, a negative value sized so the morph nets out to its cost at character creation: its Eclipse Phase Customization Point cost divided by four. A 100 CP morph is one tenth of a 1,000 CP Eclipse Phase character, so it costs 25 points, one tenth of 250.

Adding a Fury to a sheet therefore costs 19 points, not the 755 its package is worth. The package total describes what the body can do; the chargen price is what a player pays. The adjustment is bookkeeping and does not count against the −50 disadvantage limit, though GCS will include it in the disadvantage tally.

The seven customization slot options are priced at 0 for the same reason: the slot is free, so the choice never changes the morph's cost.

---

## Requirements

GURPS Basic Set: Characters and Campaigns. *Ultra-Tech* for gear, which the gear library indexes rather than reproduces. *Bio-Tech* for augmentations, *Psionic Powers* for async sleights, *Social Engineering* for the reputation rules, and *Spaceships* or *Space* for habitats and transit.

GCS 5.x for the library files. All eight are version 5 JSON.

Eclipse Phase 1st edition, which Posthuman Studios releases under Creative Commons, along with the *Morph Recognition Guide*, *Transhuman*, and *X-Risks*.

---

## Two filename notes

`EP_ATT.attr` is referred to as `EP_Attributes.attr` in a few places in the guide and quick reference. Same file. The character creation document uses the real name.

`Eclipse_Phase_Psi_Sleights.adq` shipped in earlier drafts with a `.txt` extension. It has been renamed here so GCS will load it. The contents are unchanged.

---

## Known gaps

The bestiary (57 threats converted from *X-Risks*) and the `Templates/` folder are referenced by the conversion guide but are not in this package.

Lost Generation Trauma is a −15 trait inside the Lost Generation background. Its own notes say it falls outside the campaign disadvantage limit, but GCS will still include it in the disadvantage tally.

Four augmentations still need work: Radar, Pneumatic Limbs, and Wrist-Mounted Tools exist as traits with no cash price, and Skinlink is priced with no trait. Pneumatic Limbs and Wrist-Mounted Tools are both installed on the Daitya, so a player wanting either will need a GM ruling on price.

Fenrir's Customization Point cost is missing from the Recognition Guide extraction and has been estimated at 80 CP, placing it between the Arachnoid at 45 and the Reaper at 100. Both its morph note and its price adjustment note flag the estimate. Correct it against the book if you have it.

The remaining items are in `_project-notes/`.

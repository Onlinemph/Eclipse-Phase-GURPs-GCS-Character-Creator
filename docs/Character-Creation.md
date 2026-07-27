# Character Creation
### GURPS Eclipse Phase, player procedure

Characters are built on 250 points, covering both the Ego and the chargen cost of a starting morph. The steps below are ordered because each one constrains the next. All point costs and prices are drawn from the project's GCS libraries.

---

## Step 0. Load the libraries

In GCS, open the Library view and add the following files. Load order matters only for the attribute file.

| File | Contents |
|---|---|
| `EP_ATT.attr` | Attribute definitions. Load first; other files compute incorrectly without it |
| `Eclipse_Phase_Skills.skl` | Setting-specific skills and four techniques |
| `Eclipse_Phase_Morphs.adq` | 103 morphs, priced to chargen cost |
| `Eclipse_Phase_Mods_Traits.adq` | Augmentations as traits |
| `Eclipse_Phase_Mods_Equipment.eqp` | Augmentations and drugs with cash prices |
| `Eclipse_Phase_Gear.eqp` | 1,007 items of general equipment |
| `Eclipse_Phase_Psi_Sleights.adq` | Async abilities; required only for async characters |

The conversion guide and quick reference refer to the attribute file as `EP_Attributes.attr`. The file on disk is `EP_ATT.attr`.

Two referenced files may be absent from your copy: `Eclipse_Phase_Ego_Packages.adq`, which holds backgrounds and factions prebuilt, and the `Templates/` folder. Steps 3 and 4 include the information needed to build backgrounds and factions by hand if the package file is unavailable. The bestiary is GM material.

Begin a new character sheet. The attribute panel should show DX 11, IQ 11, ST 0, and HT 0. If it does, the libraries are loaded correctly.

---

## Step 1. Division between Ego and morph

The Ego holds DX, IQ, Will, Per, all skills and techniques, and all mental and social traits. These persist through death, backup, transmission, and resleeving.

The morph holds ST, HT, HP, FP, damage, DR, physical advantages and disadvantages, and appearance. These change entirely when the character changes bodies. The starting morph is paid for once, at creation.

Consequently, do not purchase ST, HT, HP, or FP. They read as 0 on a sheet with no morph attached, which is correct. The morph supplies all four in Step 6, and points spent on them at this stage are lost.

---

## Step 2. Attributes

Costs are defined in `EP_ATT.attr`:

| Attribute | Base | Cost | Owner |
|---|---|---|---|
| DX | 11 | 20/level | Ego |
| IQ | 11 | 20/level | Ego |
| Will | 10 | 15/level | Ego |
| Per | 10 | 5/level | Ego |
| ST, HT, HP, FP | 0 | — | Morph |
| Basic Speed | (DX + HT) / 4 | 20/level | Both |

DX 11 and IQ 11 represent the post-Fall transhuman baseline rather than a below-average character. Attribute costs are paid relative to those values.

Will and Per are independent of IQ in this conversion and cannot be bought against it. Will is priced at 15 per level because the setting resolves a large proportion of its threats through Will rolls: psychosurgery, sleights, interrogation, and the resleeving stress rolls in Step 11. Per is priced at 5 per level.

Sample costs: IQ 13 is 40 points, Will 12 is 30, Per 13 is 15, DX 12 is 20. That combination totals 105 points and leaves 145 for skills, background, faction, and a morph.

Basic Speed will display an incomplete value until a morph is attached, because it derives from the character's DX and the morph's HT.

---

## Step 3. Background

Each character takes one background, representing their circumstances before play. Costs are from Part I of the conversion guide.

| Background | Points | Background | Points |
|---|---|---|---|
| Earthborn (Fall Survivor) | 2 | Scum / Drifter | 11 |
| Earthborn (Hyperelite) | 25 | Original Space Colonist | 10 |
| Lunar Colonist | 10 | Re-instantiated | 1 |
| Martian Settler | 2 | Lost Generation | −10 |
| Orbital / Hypercorp Colonist | 10 | Uplift | −1 |
| Autonomist Colonist | 5 | Infolife (AGI) | 5 |
| Jovian | 2 | Indenture | −5 |
| Venusian Aerostat | 10 | | |

If `Eclipse_Phase_Ego_Packages.adq` is available, drag the package onto the sheet. Otherwise, consult the background's description in the conversion guide and purchase the traits it lists from the standard GCS library, typically Status, Wealth, Contacts, and Social Stigma.

Backgrounds hold Ego-side traits only. Anything physical belongs to the morph.

Two backgrounds carry setting-level consequences. **Uplift** holds Social Stigma (Uplift), which reflects restricted legal standing across the inner system; it sits on the character rather than on any uplift morph, since a human Ego wearing an uplift morph attracts attention but not the same legal treatment. **Infolife (AGI)** is the origin for characters that were compiled rather than born. AGI characters take Digital Mind and can never use psi in any morph.

Negative-cost backgrounds are not free points. Lost Generation includes 15 points of mandatory trauma that fall outside the disadvantage limit.

---

## Step 4. Faction and reputation

Faction is optional; a character may be unaffiliated. Nineteen options are available, ranging from Firewall Sentinel at −9 points to Lunar-Orbital Oligarch at 20. Most include a starting reputation network at level 2.

Low-cost and negative-cost factions carry offsetting obligations. Firewall Sentinel provides proxy support and i-rep access against a hazardous Duty and a Secret. Jovian Republic provides military contacts and supply against an ongoing Duty and bioconservative intolerance detectable by uplifts and AGIs.

Reputation networks cost 3 points per level to a maximum of 8, purchased per network. The character's level in a network functions as Courtesy Rank for the Pulling Rank rules in *GURPS Social Engineering* (SE20–24). Members of a rep network are never obligated to help, but they are inclined to in proportion to standing, since assisting high-rep members raises their own.

| Network | Community |
|---|---|
| @-rep, The @-List | Anarchists, scum, Titanian mutualists, autonomists |
| c-rep, CivicNet | Hypercorp employees, Consortium citizens, the LLA |
| e-rep, EcoWave | Nano-ecologists, preservationists, reclaimers |
| f-rep, Fame | Media, socialites, artists, XP stars |
| g-rep, Guanxi | Criminals, smugglers, fixers |
| r-rep, RNA | Scientists, argonauts, open-source engineers |
| x-rep, Explore-Net | Gatecrashers and first-in explorers |
| i-rep, The Eye | Firewall sentinels and proxies |

Two or three networks consistent with the character's background is standard. Rep in a network whose community the character has never engaged with requires an explanation.

Levels 1 to 2 indicate a member in good standing, 3 to 4 a known contributor, 5 to 6 a respected fixture whose requests take priority, and 7 to 8 a network celebrity whose failures are equally visible.

In anarchist and autonomist habitats, rep replaces both Wealth and Status, including for morph access.

---

## Step 5. Skills

Skills belong to the Ego permanently. This section covers what skill numbers mean, what they cost, and how the Eclipse Phase skill list maps onto GURPS.

### Skill ratings

GURPS skills are rolled on 3d6, attempting to roll the skill level or lower. The following approximate equivalence may be useful to players familiar with Eclipse Phase's percentile ratings:

| EP rating | GURPS skill | Description |
|---|---|---|
| 30 | 10–11 | Basic training |
| 40–50 | 12–13 | Employable |
| 60 | 13–14 | Competent professional |
| 70–80 | 15–16 | Notable |
| 90+ | 18+ | Recognized authority |

This is an approximation for orientation only, not a conversion formula. A skill of 14 succeeds roughly 90% of the time on an unopposed roll.

### Skill costs

Points spent determine how far a skill sits above or below its controlling attribute, modified by difficulty:

| Points | Easy | Average | Hard | Very Hard |
|---|---|---|---|---|
| 1 | attribute | −1 | −2 | −3 |
| 2 | +1 | attribute | −1 | −2 |
| 4 | +2 | +1 | attribute | −1 |
| 8 | +3 | +2 | +1 | attribute |
| 12 | +4 | +3 | +2 | +1 |

For example, Computer Hacking (IQ/Very Hard) at IQ 13 costs 8 points to reach 13 and 12 points to reach 14. Stealth (DX/Average) at DX 12 costs 4 points to reach 13.

Any skill may be attempted at its default, generally attribute−4 or −5, so no task is inaccessible to an unskilled character.

### Skills held at no cost

Every transhuman raised after the Fall has Computer Operation at IQ, literacy, and Area Knowledge of their home habitat at no point cost.

Free Fall and Environment Suit (Vacc Suit) distinguish characters raised off a planetary surface from those raised on one. Characters with a spacer upbringing are assumed to have points in both. Using either at default in the presence of spacers is treated as a one-task Social Stigma.

### Skills that do not exist in this conversion

**Fray** is not a skill. It corresponds to Dodge, which derives from Basic Speed and cannot be purchased directly. Combat Reflexes and a morph with high Basic Speed are the available improvements.

**Networking: [rep]** is not a skill. It is handled by the character's Rep level and the Pulling Rank rules described in Step 4. Current Affairs may be rolled as a complementary skill.

### Skill mapping

`Eclipse_Phase_Skills.skl` supplies the skills this conversion adds. All other skills are used as printed in the Basic Set at TL10.

| Task | Skill | Notes |
|---|---|---|
| Network intrusion, counter-intrusion, spoofing | Computer Hacking (IQ/VH) | Eclipse Phase's Infosec. Resolved as a Quick Contest against the defender |
| Writing intrusion tools; evaluating unfamiliar code | Computer Programming (IQ/H) | |
| Routine mesh and AR use | Computer Operation (IQ/E) | Held at no cost |
| Locating information in the mesh | Research (IQ/A) | Complements Computer Hacking for target identification; +4 to find open-source blueprints |
| Cameras, locks, sensor grids at the physical layer | Electronics Operation (Security) (IQ/A) | As distinct from the network above them |
| Firearms | Guns, by type (DX/E) | The assault carbine, 7mmCL in the gear file is 6d pi, Acc 4, RoF 15, ST 9†, defaulting to Guns (Rifle) or DX−4 |
| Laser, blaster, and electrolaser weapons | Beam Weapons, by type (DX/E) | Eclipse Phase's beam weapons |
| Shard and spray weapons | Liquid Projector (DX/E) | |
| Unarmed combat | Brawling, Karate, Judo, Wrestling | Eclipse Phase's single Unarmed Combat maps to four skills with different applications; Judo and Wrestling cover grappling |
| Melee weapons | Knife, Broadsword, Axe/Mace, etc. | By weapon type |
| Movement in microgravity | Free Fall (DX/A) | See techniques below |
| Vacc suits, hardsuits, battlesuits | Environment Suit (DX/A) | Specialties: Vacc Suit, Battlesuit, Diving Suit |
| Moving unseen | Stealth (DX/A) | Eclipse Phase's Infiltration |
| Concealing and removing small objects | Pickpocket, Filch (DX/H) | Eclipse Phase's Palming |
| Short-term persuasion under pressure | Fast-Talk (IQ/A) | Eclipse Phase's Deception |
| Sustained, good-faith negotiation | Diplomacy (IQ/H) | |
| Maintaining a false identity | Acting (IQ/A) | With Disguise for appearance, or Electronics Operation (Media) for AR-layer disguise |
| Reading intent and emotion | Body Language (Per/A), Detect Lies (Per/H) | Eclipse Phase's Kinesics, split into passive and active use |
| Coercion | Intimidation (Will/A) | Will-based |
| Correct conduct in an unfamiliar polity | Savoir-Faire (IQ/E) | Eclipse Phase's Protocol; specialized by culture |
| Locating fixers, fences, and body banks | Streetwise (IQ/A) | Pairs with g-rep |
| Field treatment of injuries | First Aid (IQ/E) | |
| Sustained medical care | Physician (IQ/H) | With Diagnosis (IQ/H) and Surgery (IQ/VH) |
| Genetic work, tissue growth, drug synthesis | Biology (Genetics), Bioengineering, Pharmacy | Eclipse Phase's Medicine: Biotech |
| Repairing synthmorphs | Mechanic, Electronics Repair | Synthmorphs do not heal and must be repaired |
| Weapon maintenance and modification | Armoury (IQ/A) | Specialized by class |
| Vehicles and drones | Piloting, Driving, Boating, Submarine, by type | Eclipse Phase's Pilot |
| Course plotting | Navigation (Space) (IQ/A) | A Mesh specialty may be added for navigating data topologies |
| Academic and scientific fields | The corresponding science or humanities skill | Xenobiology is Biology (Exotic); astrophysics is Astronomy with Physics |
| Noticing and searching | Per rolls; Observation (Per/A), Search (IQ/A) | |
| Demolition | Explosives (Demolition) (IQ/A) | |
| Locating scarce materials | Scrounging (Per/E) | |
| Acclimating to a new body | Professional Skill (Resleeving) (HT/A) | See below |
| Editing digitized minds | Psychosurgery (IQ/VH) | Prerequisite Psychology; see below |

### Skills added by this conversion

**Professional Skill (Resleeving)**, HT/Average, default HT−5. Rolled twice on every change of body: HT-based for Integration and IQ-based for Alienation, in both cases using the new morph's HT (Step 11). Defaulting the skill imposes −5 on both rolls. Body banks employ acclimation coaches with this skill at 14 or better.

**Psychosurgery**, IQ/Very Hard, no default, prerequisite Psychology. Specialized by mind architecture: Human (covering transhumans and neanderthals), Neo-Hominid, Neo-Pig, Neo-Avian, Neo-Cetacean, Neo-Octopode, or AGI. Specialties default to each other at −4, or −2 between Human, Neo-Hominid, and Neo-Pig. The AGI specialty defaults to Computer Programming−6. Required for creating forks, reconciling merges, and interrogating a stored mind.

**Free Fall**, DX/Average, default DX−5, governing all deliberate movement in microgravity.

**Environment Suit**, DX/Average, default DX−5, specialized as Vacc Suit, Battlesuit, or Diving Suit.

**Research**, IQ/Average, default IQ−5.

**Psychology (Psychiatry)**, an IQ/Hard specialty covering treatment of resleeving stress, fork merges, and exsurgent exposure.

**Dreaming**, Will/Hard, default Will−6, optional. A successful roll converts a night's sleep into useful mental work. Available only to biomorphs that still sleep conventionally.

### Techniques

Four techniques are supplied in the skills file.

**Free Fall Training** and **Environment Suit Training** are Average techniques that default to the base skill and cannot exceed it. Each covers one specific skill drilled for one condition. A character with Free Fall Training (Guns (Rifle)) rolls the technique when firing a rifle weightless rather than capping at their raw Free Fall level. One technique is required per skill and per suit specialty.

**Penetration** reduces the effect of Psi Shields. **Hide Signature** conceals an async from other asyncs. Both are Hard techniques and apply only to async characters.

---

## Step 6. Morph

`Eclipse_Phase_Morphs.adq` contains 103 morphs in five categories: Biomorphs (40), Pod Morphs (16), Uplift Biomorphs (11), Synthmorphs (35), and the Infomorph.

Each morph's cost at character creation is its Eclipse Phase Customization Point cost divided by four, rounded up. A 100 CP morph is one tenth of a 1,000 CP Eclipse Phase character and therefore costs 25 points, one tenth of 250. The library applies this automatically through a Morph Price Adjustment trait, so adding a Fury to a sheet costs 19 points rather than its 755-point package value.

Package totals quoted in the conversion guide describe what a morph is capable of. They are not charged to the character.

| Chargen cost | Representative morphs |
|---|---|
| 0 | Flat (no stack, no biomods, no cortical backup); Infomorph (no body) |
| 2–3 | Case, Basic Pod, Generic, Splicer |
| 5–10 | Worker Pod, Dragonfly, Ruster, Neotenic, Bouncer, Synth, Exalt, Menton, Sylph, Olympian, most uplifts |
| 12–15 | Arachnoid, Steel Morph, Octomorph, Bruiser, Remade |
| 18–22 | Hyperbright, Ghost, Fury, Daitya, Faust |

The Reaper is not available at character creation.

Points spent on a morph are points not spent on skills, which are permanent while the morph is not. A Splicer at 3 points leaves 16 more points for skills than a Fury at 19.

Each morph's notes list its converted stat line, slot count, canon disadvantages, and a page reference to the *Morph Recognition Guide*. Several morphs carry costs beyond their price: pods and the Neotenic have their own Social Stigma, synthmorphs take the Clanking Masses stigma and cannot heal naturally, the Case adds −5 to one aptitude and has the Lemon disadvantage, and the Hyperbright includes a permanent drug dependency.

### Customization slots

Most morphs include one **Choose One Aptitude (+5)** slot. The Exalt has three, the Remade two, and the Case, Reaper, and Arachnoid have none. Each slot contains seven options, all disabled. Enable exactly one option per slot.

| Option | Effect |
|---|---|
| COG | IQ +2 |
| COO | DX +2 |
| REF | Basic Speed +2.00 |
| WIL | Will +3 |
| SOM | ST +4 |
| SAV | Smooth Operator 2 (+2 to thirteen social skills, +2 reactions) |
| INT | Per +3 |

All seven options cost 0 points, because the slot is free and the morph's price is unchanged by the selection. The options are not equivalent in value and are not intended to be: IQ and DX raise entire skill lists, Will affects resistance to most of the setting's threats to the mind, and Per is inexpensive in GURPS terms.

### After the morph is attached

ST, HT, HP, and FP populate from the morph package, and Basic Speed recomputes from the character's DX and the morph's HT. Verify Dodge on the sheet before continuing.

---

## Step 7. Augmentations

Augmentations appear in two files. `Eclipse_Phase_Mods_Traits.adq` holds them as traits, for building or modifying a morph. `Eclipse_Phase_Mods_Equipment.eqp` holds the same list with cash prices.

Augmentations installed in a morph are part of the morph. They are purchased with money, they raise the morph's package total, and they remain with the body when the Ego leaves it. Character points are never spent on them.

Prices use four tiers matching Eclipse Phase's cost categories:

| Tier | Price | Examples |
|---|---|---|
| Low | $1,500 | Grip Pads, Enhanced Vision, Mnemonic Augmentation, Medichines, gills, claws |
| Moderate | $6,250 | Puppet Sock, Cyberlimb, Adrenal Boost, Carapace Armor, Skinlink, Ghostrider Module |
| High | $31,250 | Muscle Augmentation (+3 ST), Neurachem 1, Multi-Tasking, Hardened Skeleton |
| Expensive | $125,000 | Neurachem 2, Reflex Booster, Emergency Farcaster |

Installation costs 10% of the augmentation's price at a licensed clinic and requires a Surgery or Electronics Operation roll by the installer. Anarchist habitats provide installation free or cheaply in exchange for standing. Other arrangements are handled through Streetwise.

Compatibility restrictions apply. Bioware fits biomorphs; cyberware fits any chassis that supports it. The traits file includes an explicit "Bioware that works with Synthmorphs" group covering the exceptions, including Grip Pads, Muscle Augmentation, Neurachem, Eelware, Chameleon Skin, and the mental and sensory suites. Bioware outside that group cannot be installed in a synthmorph.

At starting wealth, most characters purchase nothing in this step. Medichines at $1,500 is the most commonly affordable option.

---

## Step 8. Equipment

Starting wealth is $50,000 at TL10. `Eclipse_Phase_Gear.eqp` contains 1,007 items in fifteen categories, drawn from *GURPS Ultra-Tech* and filtered to what exists in 10 AF.

The Eclipse Phase Essentials category covers hardware specific to the setting:

| Item | Price |
|---|---|
| Ecto (flexible tablet) | $250 |
| Utilitool | $1,500 |
| Cortical stack, replacement | $1,500 |
| Gnat surveillance drone | $1,500 |
| Backup insurance, one year | $6,250 |
| Servitor drone | $6,250 |
| Ego bridge | $31,250 |
| Healing vat | $31,250 |
| Cornucopia machine | $125,000 |

Backup insurance determines whether the character's Ego can be restored when a cortical stack is not recovered (Step 11). Anarchist habitats provide an equivalent service as mutual aid, which functions as a rep obligation rather than a contract; autonomist characters should confirm coverage with the GM.

Representative prices from the wider catalog:

| Item | Price | LC |
|---|---|---|
| Monocrys vest | $300 | 3 |
| Monocrys suit | $1,200 | 4 |
| Monocrys tacsuit | $3,000 | 2 |
| Smart vacc suit | $5,000 | — |
| Civilian vacc suit | $10,000 | — |
| Combat hardsuit | $10,000 | 2 |
| Holdout pistol, 7.5mmCLP | $240 | 3 |
| Heavy pistol, 10mmCLP | $540 | 3 |
| Assault carbine, 7mmCL | $1,600 | 2 |
| Blaster pistol | $2,200 | 3 |
| Sonic stunner | $120 | — |
| First aid kit | $50 | — |
| Surgical instruments | $300 | — |
| Trauma maintenance system | $2,000 | — |
| TacNet software | $1,000 | 3 |
| Variable lockpick | $50 | 2 |
| Electronic lockpick | $1,500 | 2 |

Legality class governs what a polity permits civilians to carry. LC 2 and below is restricted in most inner-system habitats, and habitat mesh systems track carried equipment. Confirm local restrictions with the GM before finalizing purchases.

Characters in biomorphs should budget for vacuum protection before weapons.

---

## Step 9. Muse

Every character has a muse, a personal AI that has accompanied them since childhood and handles scheduling, mesh traffic, and AR filtering.

Two treatments are available. Purchased as an Ally for 5 points, built on 25% of the character's points and constantly available, the muse rolls dice and can act. Treated as a setting conceit at 0 points, it functions as narrative convenience only.

The mechanical argument for purchasing it: a muse on overwatch rolls as a complementary skill when its owner's systems are attacked, or contests an intruder directly at skill 12. This matters most for characters in synthmorphs, pods, or infomorphs, whose brains are computers and can be hacked directly.

---

## Step 10. Async characters (optional)

Async characters use `Eclipse_Phase_Psi_Sleights.adq` and the Async Skills group in the skills file. This step changes the shape of the character substantially and should be discussed with the GM.

Psi is not purchased as a package. **Watts-MacLeod Infection [−10]** is the prerequisite trait. It carries at least 15 points of mandatory mental disorders, chosen with the GM, which fall outside the disadvantage limit. It also grants +4 to resist further exsurgent infection and makes the character detectable by Sense Infection. The infection is part of the Ego's structure and survives every resleeve, fork, and backup.

**Async Talent** costs 5 points per level to a maximum of 4, and adds to every sleight skill and to the async's side of every sleight contest.

Sleights are purchased as Alternative Abilities (*GURPS Powers* p. 11): full price for the most expensive sleight, one fifth for each other active sleight. Only one may be in use at a time, and switching requires a Ready maneuver. In GCS, enable the disabled −80% Alternative Ability modifier on each secondary sleight. Always-on passive sleights cannot be alternatives and are purchased at full price.

Each active sleight requires its own Hard skill from the Async Skills group, based on Will, IQ, or Per as listed in the library.

A representative async totals approximately 45 points net: Infection [−10] plus disorders, Async Talent 2 [10], one primary sleight at full price, three or four alternatives at one fifth each, and one or two passives.

Four rules govern sleight use:

- **Proximity.** Sleights reach to touch and no further than 10 yards, at −1 per yard beyond touch. Touching the target negates range penalties; bare skin contact gives +3.
- **Substrate.** Digital minds (cyberbrains, synthmorphs, pods, infomorphs) can be reached at a flat −8.
- **Contested.** Every use against an unwilling mind is a Quick Contest of the sleight skill against the target's Will. A target who succeeds on their roll perceives something regardless.
- **Strain.** Each use costs 2 FP. Sustained sleights cost 1 FP per minute and impose a cumulative −2 to all the async's other rolls while held.

An async's own brain must be biological. Asyncs in synthmorphs or infomorphs cannot use sleights at all.

---

## Step 11. Final checks

The disadvantage limit is −50, and only mental and social traits count against it. Physical disadvantages belong to the morph and do not count.

The Morph Price Adjustment trait will appear in GCS's disadvantage total. It is a bookkeeping trait that sets the morph to its chargen price and does not count against the −50 limit.

Before finalizing:

- ST, HT, HP, and FP are supplied by the morph and were not purchased.
- Exactly one option is enabled per customization slot, and none if the morph has no slots.
- Basic Speed and Dodge have recomputed since the morph was attached.
- Professional Skill (Resleeving) has points assigned, or the −5 default penalty is accepted.
- Free Fall and Environment Suit have points assigned if the character was raised off a planetary surface.
- Backup insurance is purchased or deliberately declined.
- The total is 250 points, including the morph.

---

## Reference: the first resleeve

Not part of character creation, but the procedure the sheet is built to support.

Recovery depends on what survives. If the cortical stack is recovered, the character returns with memories intact to the moment of death. If it is not but backup insurance is current, the character returns from their last backup, missing everything since. If neither, the death is permanent.

Three rolls follow, in order.

**Integration.** HT-based Professional Skill (Resleeving), using the new morph's HT. Success imposes −1 to DX-based rolls for 24 hours. Failure imposes −2 and −1 to Basic Speed, with an HT roll each morning to end the penalties.

**Alienation.** IQ-based Professional Skill (Resleeving). Modifiers reflect the distance between the new body and the character's self-image: +6 for a morph occupied six months or more, −2 for a first synthmorph, −4 for moderate physiological change, −6 for a radically nonhuman body plan, −4 if the character is a fork.

**Continuity.** A Will roll, skipped entirely if the character resleeved with continuity, meaning they went under in one body and woke in another. Otherwise the base stress depends on how the death is remembered and how old the backup is.

Failed Alienation and Continuity rolls produce temporary mental disadvantages in 5-point increments, fading over 1d weeks, or Derangement points if the table uses *GURPS Horror*. This is the recurring cost of death in the setting: the body is replaceable, and the accumulated mental damage is not.

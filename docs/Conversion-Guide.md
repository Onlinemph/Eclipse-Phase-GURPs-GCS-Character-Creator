# GURPS: Eclipse Phase — A Literal Conversion

*A conversion guide for running Eclipse Phase with GURPS 4th Edition, built to match the accompanying GCS libraries (Eclipse_Phase_Morphs.adq, Eclipse_Phase_Mods_Traits.adq, Eclipse_Phase_Mods_Equipment.eqp, EP_Attributes.attr).*

## Using This Document

Characters are built on **250 points** covering the Ego and the chargen cost of a starting morph. EP statistics map onto GURPS directly: a morph's Somatics is its ST, its Durability is its HP, and point totals are whatever the math says they are.

Companion GCS libraries: **EP_Attributes.attr** (attribute definitions — load first), **Eclipse_Phase_Ego_Packages.adq** (backgrounds, factions, rep networks), **Eclipse_Phase_Morphs.adq** (all 103 morphs), **Eclipse_Phase_Mods_Traits.adq** (augmentations as traits), **Eclipse_Phase_Mods_Equipment.eqp** (augmentations and drugs as purchases), **Eclipse_Phase_Gear.eqp** (1,007 items of general gear), **Eclipse_Phase_Psi_Sleights.adq** (async abilities), **Eclipse_Phase_Skills.skl** (setting skills and techniques), and **Eclipse_Phase_Bestiary.adq** (57 threats), and **Templates/** (eight ready-built characters). **EP_GURPS_Quick_Reference.md** collects every mid-session table in one printable page. **EP_Morph_Stats_Reference.md/.json** holds the canonical Eclipse Phase statistics for all 104 morphs in the *Morph Recognition Guide*, with the conversion conventions attached — check any new morph against it.

Books: *Eclipse Phase Core Rulebook*, *GURPS Basic Set*, *GURPS Ultra-Tech*, *GURPS Social Engineering* (for Part VIII), *GURPS Psionic Powers* (for Part IX), and optionally *GURPS Horror* (stress rules referenced in Part IV).

---

# Part I: The Ego

Every player character is an Ego: a mind that can be digitized, copied, transmitted, and installed in bodies. The Ego owns everything mental and social. The morph owns everything physical.

## What the Ego Owns

- **Attributes:** DX, IQ, Will, and Per, plus the secondary characteristics derived from them (Fright Check, Vision, Hearing, Taste & Smell, Touch).
- **Skills and techniques**, all of them. A Fury doesn't know how to fight; *you* do. The Fury just makes it land harder.
- **Mental and social advantages and disadvantages**: Charisma, Combat Reflexes, Intuition, Bad Temper, Code of Honor, Reputation, Contacts, Rank, and so on.
- **Languages and Cultural Familiarities.**

## What the Ego Does Not Own

ST, HT, HP, FP, Basic Lift, damage, and physical appearance all belong to the morph. An unsleeved Ego has ST 0 and HT 0 — it can't lift, endure, or take damage because there's nothing there to do it with. Physical advantages and disadvantages (DR, Flight, Bad Sight, One Arm) are morph traits, with one class of exceptions: neurological traits that live in the mind's wiring rather than the body's, which travel with the Ego at the GM's discretion.

## Custom Attribute Rules

This conversion replaces the Basic Set attribute framework with the definitions in `EP_Attributes.attr`. The differences matter, so read this table carefully:

| Attribute | Base | Cost | Owned By | Notes |
|---|---|---|---|---|
| ST | 0 | 10/level* | Morph | *See "Strength, Unbundled" below — effective cost 8/level |
| DX | 11 | 20/level | Ego | Morphs may add bonuses |
| IQ | 11 | 20/level | Ego | Morphs may add bonuses |
| HT | 0 | 10/level | Morph | |
| Will | 10 | 15/level | Ego | Fully independent of IQ |
| Per | 10 | 5/level | Ego | Fully independent of IQ |
| Fright Check | Will | 2/level | Ego | |
| Vision/Hearing/Taste & Smell/Touch | Per | 2/level | Ego | Morph senses add on top |
| Basic Speed | (DX + HT)/4 | 20/level | Both | Changes when you resleeve |
| Basic Move | floor(Basic Speed) | 5/level | Both | |
| HP | ST | 2/level | Morph | Bought explicitly per morph |
| FP | HT | 3/level | Morph | |

Points to notice:

**DX and IQ start at 11, not 10.** A DX 11, IQ 11 character is the transhuman baseline; attribute costs are paid relative to 11.

**Will and Per are standalone.** They don't ride on IQ and can't be bought against it: Will is 15/level, Per is 5/level.

**Basic Speed mixes Ego and morph.** Your reflexes are half nervous system (DX, yours) and half body (HT, the morph's). Resleeving from a Splicer into a Fury genuinely makes you faster. Morphs that buy Increased Basic Speed (the Fury's +2.00, the Bruiser's Adrenal Boost) add it on top of the computed base. Buy it in quarter-level steps and count the steps, not the displayed value: canon REF +5 is Basic Speed +2.00, which is **8** levels of Increased Basic Speed at 5 points each, and REF +10 is 16. Entering 2 and 4 there is the single easiest way to quietly cripple a morph.

## Strength, Unbundled

**ST covers striking and lifting only, at 8 points per level.** It sets damage, Basic Lift, and everything else ST does *except* Hit Points. (In the GCS files: Increased Strength at 8/level with a hidden −1 HP per level feature canceling the sheet's automatic derivation.)

**HP is bought separately at 2 points per level.** Every morph lists its HP purchase explicitly. The ±30% HP-to-ST cap does not apply to morphs. Morph HP runs at 0.6 × the morph's canon Durability, which is where every figure in Part III comes from: Durability 30 is HP 18, Durability 60 is HP 36. **DR runs at 0.75 × canon Armor**, rounding half to even: Armor 8 is DR 6, Armor 6 is DR 4, Armor 10 is DR 8. On synthmorphs the meta-trait supplies the standard DR 4 chassis and anything above that goes in an Armor Plating mod; a morph canon armors *below* 4 lowers the meta-trait's own DR line instead.

**Striking ST (5/level) and Lifting ST (3/level)** remain available for augmentations that push one half only, like the Daitya's Pneumatic Limbs.

## Building an Ego

Recommended budget: **250 points**, covering the Ego *and* the chargen cost of your starting morph (see Acquiring Morphs — morphs cost EP CP ÷ 4, from 0 for a Flat to 22 for a Faust). A Fury pilot spends 19 of those points on the privilege of starting in a Fury and builds their Ego on the remaining 231; a Flat starts with all 250 in mind and skills and a body worth exactly what it costs. Disadvantage limit −50, drawn from mental and social traits only.

Every Ego gets the following for free as setting conceits, costing 0 points:

- **Digital existence.** Your mind can be scanned, stored, copied, and run on hardware. (Do not buy Digital Mind; its costs and benefits are properties of whatever you're sleeved in. The exception is the Infolife background below, where it describes an origin rather than a current body.)
- **Functional immortality.** Extra Life (Copy; Requires Body) via cortical stack and backups, priced into every morph's Basic Biomod Package or Synthmorph meta-trait rather than the Ego.
- **Unaging.** Egos don't degrade. Bodies do, and it's their problem.

Muse: every character has a muse, a personal AI assistant. Treat it as an Ally (built on 25% of your points, constantly available) bought at chargen for 5 points, or handwave it as pure convenience if your table doesn't want the bookkeeping.

## Background

Where you were before the campaign starts. Pick one; it costs points from the 250 like anything else. All fifteen are in **Eclipse_Phase_Ego_Packages.adq** with their traits built out, and each lists suggested skills in its notes. Backgrounds hold Ego-side traits only — anything physical belongs to your morph.

| Background | Points | What it buys you |
|---|---|---|
| Earthborn (Fall Survivor) | 2 | You got off Earth. Nightmares, evacuee contacts, and obsolete cultural familiarity with a dead world |
| Earthborn (Hyperelite) | 25 | Status 2, Wealthy, a family with expectations |
| Lunar Colonist | 10 | Status 1, clan patronage, and the assumption that indenture happens to other people |
| Martian Settler | 2 | Terraforming trade, an indenture number in your file |
| Orbital / Hypercorp Colonist | 10 | Status 1, corporate contacts, performance reviews since age nine |
| Autonomist Colonist | 5 | Mutual aid anywhere in the outer system, and visible contempt for the inner |
| Jovian | 2 | Military training, a bioconservative upbringing that shows |
| Venusian Aerostat | 10 | Status 1, Morningstar society, impeccable manners |
| Scum / Drifter | 11 | A berth in any swarm, a stigma everywhere else, and nothing shocks you |
| Original Space Colonist | 10 | Pre-Fall spacer credentials and the regard of everyone who works vacuum |
| Re-instantiated | 1 | You died in the Fall. Missing time, a patron who paid to restore you, and no fear of death |
| Lost Generation | −10 | Simulspace-native genius, −15 in trauma outside the disadvantage limit, and a stigma the public earned honestly |
| **Uplift** | −1 | Non-human ancestry: heavy legal stigma, Mercurial standing, and cognition that resists human-shaped manipulation |
| **Infolife (AGI)** | 5 | Born digital: Digital Mind, heavy stigma, native simulspace mastery, no psi ever |
| Indenture | −5 | Someone owns your contract, and it is legal, transferable, and long |

Two of these carry weight the others don't. **Uplift** is where Social Stigma (Uplift) lives — on the character's background rather than on any uplift morph, because a human sleeved into an octomorph gets stared at while an actual uplift faces restricted legal standing across the inner system. **Infolife (AGI)** is the origin for characters who were compiled rather than born; they take Digital Mind despite the free-conceit rule, because for them it isn't describing their current body, it's describing the only kind of body they can ever have. An AGI cannot use psi in any morph. Both packages include Mercurial standing, since uplifts and AGIs recognize each other as the same argument.

## Faction

Who you answer to now. Pick one, or none if your character is unaffiliated; most include a starting reputation network at level 2.

| Faction | Points | | Faction | Points |
|---|---|---|---|---|
| Anarchist | 10 | | Nano-Ecologist | 5 |
| Argonaut | 10 | | Reclaimer | 11 |
| Barsoomian | 4 | | Preservationist | 5 |
| Brinker | 9 | | Scum | 16 |
| Criminal | 1 | | Singularity Seeker | 0 |
| Extropian | 12 | | Titanian | 10 |
| Hypercorp | 5 | | Ultimate | 0 |
| Jovian Republic | −5 | | Venusian (Morningstar) | 15 |
| Lunar-Orbital Oligarch | 20 | | Firewall Sentinel | −9 |
| Mercurial | 0 | | | |

The cheap ones are cheap because they cost you something else. **Firewall Sentinel** buys proxy support and i-rep against a −15 Duty that is extremely hazardous and a −10 Secret whose exposure ends you three different ways; it's the campaign-defining pick and it should be. **Ultimate** and **Singularity Seeker** net to zero because their conditioning and fork discipline are paid for in obsession and contempt. **Jovian Republic** goes negative: military supply and contacts don't cover a hazardous Duty the Republic considers ongoing plus intolerance that uplifts and AGIs can read on you immediately.

Reputation network traits are in the same file at 3 points/level, maximum 8 — see Part VIII for how spending them works.

## Focus

Eclipse Phase's third chargen axis is *focus*: what you actually do. This conversion handles focus through skills rather than packages, since GURPS skill lists already do that job. Part II maps the professions.

## Templates

Eight ready-built characters live in the **Templates/** folder as GCS `.gct` files, each combining a background, a faction, focus traits, and a skill spread. Load one, add the suggested morph from the morph library, and spend the remainder however you like.

| Template | Built | Suggested Morph | The pitch |
|---|---|---|---|
| Firewall Sentinel | 181 | Splicer / Exalt | The default PC: a competent generalist who knew too much and got recruited |
| Infosec Hacker | 170 | Menton / Infomorph | Owns the network, and everything in this setting is on the network |
| Face | 184 | Sylph | Works rep networks; in a favor economy, the party's actual funding |
| Soldier | 195 | Fury / Steel Morph | For when it comes through the door, which it will |
| Async | 150 | Exalt / Faust | Lost Generation psi, sleights pre-configured as Alternative Abilities |
| Scientist | 176 | Menton / Hyperbright | Argonaut researcher; knows what the thing in the vat is |
| Gatecrasher | 176 | Ruster / Bouncer | Steps through wormholes onto worlds nobody has named |
| Medic & Genehacker | 178 | Exalt | Decides whether a bad day costs the party a morph or a mind |

Totals sit at 150–195 deliberately. Add a morph (3–22 points), take some disadvantages against the −50 limit, and you have 60–100 points of room to make the character yours — which is what separates a template from a pregen.

The Async template is worth opening even if you're not playing one, because it demonstrates the Alternative Ability setup working: Psychic Stab at full price [16] with Thought Browse [4], Drive Emotion [4], and Ego Sense [2] enabled as alternatives, plus Psi Shield [9] as a passive that can't be one. Twenty-five points of traits for a functioning async, gated behind a −10 Infection and −15 in Lost Generation trauma that sit outside the disadvantage limit.

---

# Part II: Skills

Skills belong to the Ego and never leave it. The morph decides how hard your punch lands; whether you know how to punch is yours forever. This chapter maps Eclipse Phase's skill list onto GURPS and defines the handful of skills this conversion adds. Anything not mentioned works straight out of the Basic Set at TL10.

## Baseline Competence

Every transhuman raised after the Fall has, at no point cost: **Computer Operation** at IQ, literacy, and Area Knowledge of their home hab. These are the reading-and-writing of 10 AF. Two skills mark the difference between spacers and the groundborn: **Free Fall** and **Environment Suit (Vacc Suit)**. Everyone raised off a planetary surface has points in both; using either at default in front of spacers earns the look reserved for adults who move their lips while reading — treat it as a one-task Social Stigma with any spacer who watches you fumble.

## EP-to-GURPS Skill Mapping

| EP Skill | GURPS Skill(s) |
|---|---|
| Academics: [field] | The matching science or humanities skill (Physics, History, Xenobiology as Biology (Exotic), etc.) |
| Animal Handling | Animal Handling, specialized by smart-animal type |
| Art / Interest | Artist, Musical Instrument, Hobby Skill, etc. |
| Beam Weapons | Beam Weapons (Pistol or Rifle) |
| Blades / Clubs / Exotic Melee | Broadsword, Knife, Axe/Mace, or the matching Melee Weapon skill |
| Climbing / Swimming | Climbing, Swimming |
| Deception / Impersonation | Fast-Talk, Acting |
| Demolitions | Explosives (Demolition) |
| Disguise | Disguise; Electronics Operation (Media) for AR-layer disguises |
| Flight | Flight (HT/A) — winged and thrust-borne morphs only |
| Fray | Not a skill: this is your Dodge |
| Free Fall / Freerunning | Free Fall; Acrobatics and Jumping |
| Gunnery / Seeker Weapons | Gunner (by type); Artillery (Guided Missile) for indirect seekers; Guns (Gyroc/LAW) for hand launchers |
| Hardware: [field] | Mechanic, Armoury, Electronics Repair, Machinist by field |
| Infiltration / Palming | Stealth; Sleight of Hand, Pickpocket, Filch |
| Infosec | Computer Hacking (see Part VII) |
| Interfacing / Programming | Computer Operation; Computer Programming |
| Intimidation / Persuasion / Protocol | Intimidation; Diplomacy and Fast-Talk; Savoir-Faire |
| Investigation / Research | Criminology, Search; Research (see below) |
| Kinesics | Body Language, Detect Lies |
| Kinetic Weapons / Spray Weapons / Throwing | Guns (by type); Liquid Projector; Thrown Weapon |
| Medicine: [field] | First Aid, Physician, Surgery, Diagnosis, Pharmacy by field |
| Navigation | Navigation (Space, Hyperspace doesn't exist; add Mesh as a specialty for finding things in ugly data topologies) |
| Networking: [rep] | Not a skill: Pulling Rank via your Rep (Part VIII); Current Affairs complements |
| Pilot: [type] | Piloting, Driving, Boating, Submarine by type |
| Psychosurgery | Psychosurgery (new, below) |
| Scrounging | Scrounging |
| Unarmed Combat | Brawling, Karate, Judo, Wrestling |

## New and Redefined Skills

### Professional Skill (Resleeving) — HT/Average, default HT−5
The learned knack of moving in. Rolled HT-based for Integration and IQ-based for Alienation (Part IV), using the *new* morph's HT. Body banks employ acclimation coaches with this at 14+; mercenaries and Firewall sentinels train it like a weapon skill, because for them it is one.

### Psychosurgery — IQ/Very Hard, no default, prerequisite Psychology
Editing digitized minds: memories, behaviors, skills, personalities (Part V). Specialize by mind architecture — Human (covering transhumans and neanderthals), Neo-Hominid, Neo-Pig, Neo-Avian, Neo-Cetacean, Neo-Octopode, or AGI — with specialties defaulting to each other at −4 (−2 between Human, Neo-Hominid, and Neo-Pig; AGI defaults to Computer Programming−6 instead). The tools matter as much as the skill: simulspace suites, nanosurgery, or transcranial stimulators, per the equipment modifiers.

### Free Fall — DX/Average, default DX−5
All deliberate movement in microgravity, per Part XI. **Free Fall Training** (Technique, Average, defaults to the base skill, cannot exceed it): you've drilled one specific skill in zero g — Guns (Rifle), Surgery, whatever — and roll against this technique instead of capping at your raw Free Fall when using that skill weightless. Buy it for anything your life will depend on doing in microgravity.

### Environment Suit — DX/Average, default DX−5
Specialized as **Vacc Suit** (spacesuits and hostile-atmosphere suits), **Battlesuit** (powered armor), or **Diving Suit** (hardsuits for Europa, Ceres, and the other ocean worlds). **Environment Suit Training** works exactly like Free Fall Training, per suit specialty. A skilled operator in an MCP suit loses almost nothing; an unskilled one in a hardsuit is cargo.

### Research — IQ/Average, default IQ−5
Finding things in the mesh's oceans of data — the difference between a search query and an answer. Complements Computer Hacking for locating targets, and rolls at +4 to find open-source blueprints for everyday goods (Part VI).

### Psychology (Psychiatry) — IQ/Hard specialty
Diagnosing and treating mental disorders, which this setting manufactures at industrial scale: resleeving stress, fork merges, exsurgent exposure. Uses the treatment framework in *GURPS Horror* if you're running Derangement, or grants recovery rolls for temporary mental disadvantages if you're not. Psychosurgery can do in hours what Psychiatry does in months — at the cost of someone else editing your mind.

### Dreaming — Will/Hard, default Will−6 (Optional)
Lucid-dream productivity for biomorphs that still sleep the old way: a successful roll converts a night's dreams into useful mental work — analysis, design, writing, planning. Mostly obsolete among the augmented, which is exactly why certain flats and rusters are better at it than any Menton. A little dignity for the cheap seats.

# Part III: Morphs

A morph is a trait package with two compartments:

- **Advantages** — the chassis: ST, HT, HP, attribute bonuses, and structural traits like extra arms or Injury Tolerance.
- **Mods** — the installed augmentations: the Basic Biomod Package or Synthmorph meta-trait, mesh inserts, and whatever bioware, cyberware, or nanoware the model ships with.

When you sleeve into a morph, its entire package applies. When you leave, it all goes with the body. Skills stay; augmented dice do not.

## The Customization Slot

Most morphs' canon advantage lines end with "+5 to one aptitude of the player's choice" — sometimes two or three. Each of those becomes a **Choose One Aptitude (+5)** slot carrying seven attached options, one per Eclipse Phase aptitude, all disabled in the library. Enable exactly one. Each converts at the project's standard rate:

| Pick | Converts to | Worth | What it does |
|---|---|---|---|
| **+5 COG** | IQ +2 | 40 | Every IQ-based skill rises with it |
| **+5 COO** | DX +2 | 40 | Every DX-based skill rises with it |
| **+5 REF** | Basic Speed +2.00 | 40 | Dodge and initiative |
| **+5 WIL** | Will +3 | 45 | Sleights, psychosurgery, interrogation, Fright Checks, Continuity |
| **+5 SOM** | ST +4 | 32 | Striking and lifting; HP is bought separately |
| **+5 SAV** | Smooth Operator 2 | 30 | +2 to all thirteen social skills, +2 reactions |
| **+5 INT** | Per +3 | 15 | Noticing things |

**The options are deliberately not point-matched.** An earlier draft forced all of them to 20 points, which turned out to be balancing a currency nobody spends: the slot is free, and a morph's chargen price is its EP CP ÷ 4 no matter what you pick. Worse, half-rating the player's pick made the same +5 worth 40 points when the designer chose it and 20 when the player did, and gutted the Exalt, whose entire selling point is three flexible picks.

So each option converts at full rate and the spread runs 15 to 45. Nothing dominates: IQ and DX buy whole skill lists, Will buys survival against everything this setting does to minds, and Per is cheap because GURPS correctly prices Perception as doing less. A player taking Per +3 to spot things isn't falling for a trap.

Slot counts follow canon: the Exalt carries three, most morphs carry one, and a few — the Case, the Reaper, the Arachnoid — carry none, and the Case takes a −5 to one aptitude on top.

## Core Packages

**Basic Biomod Package [103]** — standard in every biomorph: Regrowth, cortical stack (Extra Life 1, Requires Body), Unaging, Regeneration (Slow), Immunity to Disease, Less Sleep 4.

**Synthmorph Meta-Trait [36]** — standard in every synthmorph: Access Jack, DR 4, Photographic Memory, Injury Tolerance (No Blood, Unliving), no fatigue points, Immunity to Metabolic Hazards, plus the drawbacks: Electrical [−20] and Unhealing (Total) [−30]. Synthmorphs don't heal; they get repaired.

**Basic Mesh Inserts [21]** — standard in everything: implanted computer and secure radio telecommunication with sensie capability.

Two stacking rules the library now enforces. **Photographic Memory is not cumulative**, so a synthmorph carrying a Mnemonic Augmentation on top of the meta-trait's copy pays for it once, not twice. **Less Sleep caps at four levels** (B65), which is the Basic Biomod Package's allowance; a morph with Circadian Regulation or Endocrine Control takes Doesn't Sleep [20] instead and drops the superseded Less Sleep 4, so its biomod package runs 95 rather than 103. GURPS has no tier between the two, so the Crasher, Hibernoid, and Remade round up from canon's hour or two a night to none.

## Morph Catalog

The library holds **103 morphs** — every entry in the *Morph Recognition Guide* with a usable stat block, converted by the conventions above and audited against canon aptitudes, Durability, and slot counts.

| Category | Count | Range |
|---|---|---|
| Biomorphs | 40 | Flat (2 pts) to Crasher (18 pts) |
| Synthmorphs | 35 | Spare and Griefer (2 pts) to Nautiloid (39 pts) |
| Pod Morphs | 16 | Basic Pod (2 pts) to Novacrab (15 pts) |
| Uplift Biomorphs | 11 | Neo-Porpoise (9 pts) to Neo-Whale (19 pts) |
| Infomorphs | 1 | Infomorph (0 pts) |

Every morph's notes carry its EP CP cost, chargen price, converted stat line, slot count, canon disadvantages, and a page reference to the Recognition Guide. The detailed write-ups below cover the morphs a campaign meets most often; for the rest, the library entry and **EP_Morph_Stats_Reference.md** together give you everything the book does.

Effective attribute lines below assume an unmodified Ego (DX 11, IQ 11, Will 10, Per 10). Your Ego's own purchases shift them.

### Biomorphs

**Flat — 216 points.** ST 10, HT 10, HP 18 and *nothing else*: canon says "Implants: None," so no biomods, no mesh inserts, no cortical stack. A Flat ages, sickens, sleeps eight hours, and dies for real. The only truly mortal body on this list.

**Generic — 340 points.** ST 10, HT 10, HP 18: the Flat chassis with basic biomods and mesh inserts installed — what most people mean when they say "an ordinary body." One slot.

**Splicer — 376 points.** ST 12, HT 12, HP 18, one customization slot. The genefixed standard model of transhumanity; most people you meet are wearing one.

**Exalt — 422 points.** ST 12, HT 12, HP 21, IQ +2, *three* customization slots. The enhanced-human generalist. Its 60 points of slot flexibility make it the most personally tailored production morph on the market.

**Menton — 554 points.** ST 12, HT 12, HP 21, IQ +4, Per +3, Will +3, plus Math Boost (Lightning Calculator with Intuitive Mathematician, Mathematical Ability 1), Photographic Memory, and Language Talent. One slot. The thinker's morph.

**Faust — 670 points.** The Menton platform pushed toward mental warfare: IQ +4, Per +3, Will +6, Mind Shield 3, Endocrine Control (Doesn't Sleep, +1 more Will), Circadian Regulation, and the full Menton cognitive suite. HP 21. One slot. Popular with asyncs and anyone expecting to be psychosurgically attacked.

**Hyperbright — 725 points.** IQ +6, Per +6, Will +4, HP 21, Enhanced Time Sense, prehensile feet, grip pads, Doesn't Sleep, the full cognitive suite — and the bill: Unattractive, ×2 food consumption, and a lifelong Comfurt dependency (Addiction, mitigated daily). The smartest thing you can legally sleeve, and it feels like it.

**Bruiser — 553 points.** ST 24 (20 base + 4 from Hardened Skeleton), HT 12, HP 36, Basic Speed +2.00 (Adrenal Boost), Sharp Claws. One slot. Thrust 2d+1, swing 4d+2 before skill or weapons enter into it. A body built to end fights in melee.

**Fury — 755 points.** ST 20, DX +2, HT 12, HP 30, Will +3, Basic Speed +2.00, DR 8 (Flexible, Tough Skin), Altered Time Rate 1 (Neurachem), Enhanced Vision (Hyperspectral, Telescopic 2), Immunity to Poison, one slot. The premier combat biomorph. ATR alone means it acts twice each second; treat any hostile Fury as a tactical problem, not an encounter.

**Ruster — 417 points.** ST 14, HT 12, HP 21, Enhanced Respiration, Temperature Tolerance. One slot. Breathes Mars's thin air and shrugs off its cold — a morph only a hypercorp accountant could love, and the default body of the Martian working class.

**Hibernoid — 427 points.** ST 12, HT 12, Per +3, HP 21, Circadian Regulation, Hibernation. One slot. Sleeps an hour or two a day and can drop into true hibernation on command, metabolism and oxygen use near zero. Long-haul spacers, habtechs, and executives who resent unconsciousness.

**Neotenic — 434 points.** ST 8, DX +2, Per +3, Basic Speed +2.00, HT 12, HP 18, SM −2. One slot. A child-sized frame that's harder to hit, eats half the life support, and fits where full-sized morphs don't. Carries its own Social Stigma. Beloved on cramped habs, banned in some bioconservative ones.

**Bouncer — 483 points.** ST 14, DX +2, HT 12, HP 21, Flexibility, grasping prehensile feet, grip pads, and an oxygen reserve. One slot. The standard body of the outer system; on a beehive hab or a scum barge, this is what "normal" looks like.

**Sylph — 505 points.** ST 12, DX +2, HT 12, HP 21, Beautiful, Smooth Operator 4, sanitized metabolism, tailored pheromones (+1 reactions, +2 Influence in person). One slot. Built for media icons and socialites; the pheromone package means people like being near it before it says a word.

**Olympian — 532 points.** ST 20, DX +2, HT 12, HP 24, Basic Speed +2.00. One slot. All the Fury's muscle, none of its military hardware. Discrete strength that photographs well.

**Futura — 564 points.** ST 12, IQ +2, Will +6, Smooth Operator 2, HP 21, eidetic memory, emotional dampers. One slot. Built for the Lost Generation and discontinued in disgrace; sleeving one gets you looks ranging from pity to fear.

**Remade — 614 points.** ST 20, IQ +4, Smooth Operator 2, HT 12, HP 24, environmental hardening (enhanced respiration, temperature tolerance, toxin filters), eidetic memory — and *two* customization slots, plus Uncanny Valley (−2 reactions from baseline humans in person). One slot short of an Exalt's flexibility on a chassis twice as capable. Humanity 2.0, whether you asked or not.

**Ghost — 660 points.** ST 14, DX +4, HT 12, HP 27, Will +3, Basic Speed +2.00 (Adrenal Boost), Chameleon Skin, Enhanced Vision (Hyperspectral, Telescopic 2), Grip Pads. One slot. The infiltrator: where the Fury wins fights, the Ghost decides whether one happens.

### Pod Morphs

Pods are vat-grown biological bodies with undeveloped brains completed by a cyberbrain — biomorph outside, synthmorph resleeving speed inside, and a social stigma everywhere that matters. All pods include Mnemonic Augmentation, a Puppet Sock, and Social Stigma (Pod) [−5] — canon puts the stigma on the body itself.

**Basic Pod — 406 points.** ST 12, HT 12, HP 18, one slot. A splicer with visible seams; the cheapest way to wear flesh.

**Pleasure Pod — 465 points.** ST 12, Per +3, Smooth Operator 2, HP 18, clean metabolism, tailored pheromones, and a sex switch. One slot. Not just for sex work, whatever the mesh graffiti says.

**Worker Pod — 476 points.** ST 20, HT 12, HP 21, one slot. Olympian-grade muscle at a fifth of the CP; the catch is being a pod.

**Vacuum Pod — 557 points.** A bouncer chassis with a cyberbrain: ST 14, DX +2, Flexibility, grip pads, prehensile feet, oxygen reserve, light bioweave, vacuum sealing. One slot. For vacwork where a synth would be unwelcome company.

**Security Pod — 639 points.** ST 20, Basic Speed +2.00 (Adrenal Boost), light bioweave, claws, eelware, Enhanced Vision, T-Ray, grip pads, HP 21. One slot. The pre-Fall toy soldier, back in fashion with mercenaries.

### Uplift Biomorphs

Canon puts Social Stigma (Uplift) on the character's *background*, not the morph — a human Ego sleeving an octomorph faces gawking, but the systematic prejudice belongs to actual uplifts. So uplift morphs here carry no stigma trait; uplift *characters* take the Uplift background from Part I, which carries it.

**Neo-Pig — 398 points.** ST 14, HT 12, HP 21, one slot. Bipedal, stocky, and tired of your bacon jokes.

**Neo-Hominid — 458 points.** ST 14, DX +2, Per +3, HP 18, Brachiator, prehensile feet. One slot. Covers uplifted chimps, bonobos, and orangutans; a gorilla variant would run ST 20 and thicker HP.

**Neo-Avian — 463 points.** ST 8, Per +3, Basic Speed +4.00, HP 12, SM −2, winged flight, beak and claws. One slot. A raven the size of a child that files flight plans. Fragile and fast; canon's +10 REF makes it the quickest reflexes on the biomorph list.

**Neanderthal — 507 points.** ST 20, IQ +2, Per +3, HT 12, HP 24, one slot. Resurrected from fossil DNA and enhanced to transhuman equivalence; the heavy-boned cousin nobody should underestimate.

**Octomorph — 596 points.** ST 12, DX +2, Per +3, HP 18, eight extra-flexible arms, Double-Jointed, 360° vision, chameleon skin, beak, ink cloud. One slot. The most alien body plan a human Ego can wear, and the Alienation table (−6) knows it.

### Synthmorphs

**Case — 236 points.** ST 10, HT 10, HP 12, the Synthmorph meta-trait, the Clanking Masses stigma, canon's −5 to one aptitude of the owner's choosing, and the Lemon disadvantage: on any critical failure with a DX-based roll, something in it breaks until repaired. The infugee special — the cheapest way to have hands, and the most common morph in the Solar System by volume.

**Synth — 353 points.** ST 16, HT 12, HP 24, one slot, plus the Synthmorph meta-trait. The mass-produced robotic shell. Cheaper than it looks on paper, since the market treats synthmorphs as commodity hardware.

**Steel Morph — 417 points.** ST 18, HT 12, HP 23, DR 6 (canon-proportional plating), IQ +2, one slot. The premium synthetic shell for people who live in one by choice.

**Sam's Steel Morph — 622 points.** The Steel platform with Injury Tolerance (Diffuse: Infiltration), Skinflex (Elastic Skin), and integrated Wrist-Mounted Tools (Artificer 4, Sharp Claws). A custom job — one owner's answer to "what if my body were also a disguise kit and a workshop."

**Daitya — 687 points.** ST 24 with Pneumatic Limbs (+10 Striking, +10 Lifting: strikes and lifts at 34), HT 12, HP 60, DR 8 industrial plating, four weapon-mount arms, Puppet Sock, grip pads, Wrist-Mounted Tools (Artificer 4), Hardened Skeleton. One slot. An industrial mech that happens to accept an Ego. Swing damage at effective ST 34 is 6d — before it picks up a tool.

**Dragonfly — 331 points.** ST 8, Basic Speed +2.00, HP 15, SM −2, near-silent winged flight. No slot. A meter-long flying toolbox, superb in microgravity.

**Flexbot — 408 points.** ST 10, IQ +2, Per +3, HP 15, SM −1, Modular Design (Independent Body Parts: modules detach, swap, recombine into snake, quadruped, or improvised shapes), Shape Adjusting, hover flight. No slot. A body that is also a toolkit; multiple flexbots merge into larger assemblies.

**Slitheroid — 428 points.** ST 14, DX +2, HT 12, HP 27, DR 6, Enhanced Vision, serpentine body (slithers, burrows, coils, rolls as a hoop at double Move) with two retractable arms. One slot. For when you feel like not fitting in.

**Swarmanoid — 263 points.** Hundreds of insect-sized microdrones: HP 18 as swarm attrition, full Injury Tolerance (Diffuse) [100] making gunfire nearly useless against it, and No Manipulators [−50] as a unit — individual bugs interface with electronics. Nearly unkillable, nearly harmless, genuinely unsettling.

**Arachnoid — 639 points.** ST 20, HT 12, HP 36, DR 9, ten limbs (eight retractable arm/legs at −30% for foot manipulators, plus a fine pair near the head), Enhanced Vision, LADAR, radar, Super Jump, and vectored-thrust flight in microgravity. No customization slot — canon gives it none. The working spider of the Solar System: construction, salvage, security, and anything else that benefits from being a leaping sensor platform with ten hands.

**Reaper — 924 points.** Not available at character creation, and the point total explains why. ST 20 striking and lifting at 30 through Pneumatic Limbs, DX +2, Basic Speed +4.00 *plus* Altered Time Rate 1 from Reflex Boosters, HP 30, DR 12, four articulated weapon mounts on top of four telescoping limbs, 360° vision, T-Ray, radar, magnetic clinging, ionic flight, and a shape-adjusting frame. The Reaper acts twice per second, sees everything around it, and mounts four guns it can fire independently. It is not an encounter; it is a war crime with a mesh ID, and most habitats treat arriving in one as a declaration of intent.

### Infomorphs

**Infomorph — 79 points.** No body, and therefore no ST, HT, HP, or FP. The package is pure cognition: Photographic Memory, Enhanced Time Sense, Absolute Timing, Lightning Calculator, and no need for sleep. Costs nothing at chargen, because being software has a price no point value captures: you go where the mesh goes, act through whatever you can rent or puppet, and exist at the sufferance of whoever owns the server. Infomorph life is very cheap and very exposed.

## Acquiring Morphs

**At character creation, your starting morph costs character points: its EP 1e Customization Point cost ÷ 4, rounded up.** In play, replacements and upgrades cost credits, favors, or reputation. The package total measures what the morph *is*; the chargen price is what you pay to start in it.

| Morph | EP CP | Chargen Cost | In-Play Price | Availability |
|---|---|---|---|---|
| Flat | 0 | 0 | $4,000 | Everywhere |
| Infomorph | 0 | 0 | Server rent only | Everywhere there's mesh |
| Case | 5 | 2 | $6,000 | Everywhere |
| Basic Pod | 5 | 2 | $8,000 | Everywhere |
| Generic | 10* | 3 | $9,000 | Everywhere |
| Splicer | 10 | 3 | $18,000 | Everywhere |
| Neo-Pig | 20 | 5 | $20,000 | Uncommon |
| Worker Pod | 20 | 5 | $20,000 | Common |
| Pleasure Pod | 20 | 5 | $25,000 | Common |
| Dragonfly | 20 | 5 | $20,000 | Common |
| Ruster | 25 | 7 | $30,000 | Common (Mars) |
| Hibernoid | 25 | 7 | $50,000 | Uncommon |
| Neotenic | 25 | 7 | $40,000 | Uncommon; illegal in biocon habs |
| Neo-Avian | 25 | 7 | $35,000 | Uncommon |
| Neo-Hominid | 25 | 7 | $35,000 | Uncommon |
| Swarmanoid | 25 | 7 | $35,000 | Uncommon |
| Synth | 30 | 8 | $15,000 | Everywhere |
| Exalt | 30 | 8 | $45,000 | Common |
| Security Pod | 30 | 8 | $60,000 | Restricted |
| Vacuum Pod | 30 | 8 | $50,000 | Common (outer system) |
| Flexbot | 35 | 9 | $45,000 | Common |
| Menton | 40 | 10 | $120,000 | Uncommon |
| Olympian | 40 | 10 | $100,000 | Common |
| Bouncer | 40 | 10 | $80,000 | Common (ubiquitous off-planet) |
| Sylph | 40 | 10 | $110,000 | Uncommon |
| Futura | 40 | 10 | $150,000 | Exceptionally rare |
| Neanderthal | 40 | 10 | $80,000 | Rare |
| Slitheroid | 40 | 10 | $70,000 | Uncommon |
| Arachnoid | 45 | 12 | $130,000 | Uncommon; industrial |
| Steel Morph | 50 | 13 | $60,000 | Common |
| Octomorph | 50 | 13 | $90,000 | Uncommon |
| Bruiser | 60* | 15 | $150,000 | Uncommon; restricted in some habs |
| Remade | 60 | 15 | $160,000 | Rare; Ultimates |
| Hyperbright | 70 | 18 | $250,000 | Rare |
| Sam's Steel Morph | 70 | 18 | $110,000 | Rare (Masked Steel variant) |
| Ghost | 70 | 18 | $275,000 | Rare; restricted |
| Fury | 75 | 19 | $350,000 | Restricted nearly everywhere |
| Daitya | 80 | 20 | $300,000 | Industrial licensing |
| Faust | 85 | 22 | $200,000 | Black market only; watched |
| Reaper | 100 | — (not at chargen) | $500,000 | Military; illegal almost everywhere |

*Starred entries are homebrew CP assignments; everything else uses published 1e values (Sam's Steel Morph prices as the canon Masked Steel variant).*

**The library enforces this for you.** Every morph carries a **Morph Price Adjustment**, a negative trait sized so the package nets out to exactly its chargen price. Drag a Fury onto a sheet and it adds 19 points, not 725: the package is 755, the adjustment is −736. The point totals quoted throughout this Part are still the package values, because that's what tells you what the body can do, but nothing on a sheet ever charges them. The customization slot's seven options are priced at 0 for the same reason, so which aptitude you pick changes what your morph *does* and never what it costs.

The adjustment is a bookkeeping trait, not a disadvantage in the fictional sense. It doesn't count against the −50 limit and it isn't a flaw the character has; if GCS's disadvantage tally looks alarming, that's why. Resleeving in play means deleting one morph and dragging on another, and the sheet's total moves by the difference in chargen prices.

**Points buy your starting morph and nothing after that.** Every sleeve and every mod acquired in play is bought with money, favors, or reputation, never with character points. The package totals throughout this Part describe what a morph *is* so you can see what you're getting; they are not a budget and they are never charged twice. Points paid at creation buy exactly one thing: the body you start in. If it gets destroyed, you're in whatever you can afford, borrow, or beg — same as everyone else in the Solar System. Sleeving above your means is a temporary condition; the setting is fluid on purpose, and a character who dumped 20 points into a Daitya should think hard about where they park it.

For in-play acquisition: at TL10 starting wealth of $50,000, a character owns a Splicer or Synth outright, or finances something better. Renting runs about 1% of purchase price per month plus insurance. Anarchist habs don't sell morphs at all; reputation gets you a body, and reputation takes it away.

---

# Part IV: Resleeving

Moving an Ego between morphs is routine surgery in most of the Solar System: an hour in a body bank for a biomorph-to-biomorph transfer, minutes for anything involving a cyberbrain. The hard part isn't the procedure. It's what your mind does afterward.

## Dying

Morphs die by the book. Standard GURPS damage, HP thresholds, bleeding, mortal wounds, and death checks all apply, and a morph at −5×HP is gone. Nothing in this conversion changes that, because the setting's twist isn't that transhumans are harder to kill. It's that killing them mostly doesn't take.

**Cortical Stack.** DR 50, HP 2, homogenous. A gram of diamond lattice at the brainstem, about a centimetre across, writing the Ego continuously. It is not a target. Reaching it takes a called shot to the skull (−7) and then to the stack within it (a further −10), and the attack still has to push more than 54 points past the morph's own DR and skull into a one-centimetre sphere. Assume in any normal firefight that stacks survive.

What destroys one:

| Cause | Result |
|---|---|
| Deliberate extraction from a downed body | 30 seconds and a cutting tool. Automatic |
| Plasma, antimatter, disintegrator, nuclear | Stack destroyed with everything else |
| Sustained incineration above ~3,000°C | Destroyed |
| Area damage exceeding 10×HP to the morph | Destroyed |
| Gunfire, blades, falls, explosions, drowning, decompression | Stack survives |
| Vacuum, cryogenic cold, 1,500°C for an hour, 10,000 G | Stack survives |

Destroying a stack on purpose is attempted permanent murder and every polity with laws treats it as such. Doing it to a corpse you already control is trivially easy, which is why bodies get recovered under fire and why erasure squads exist.

**Recovery.** Where your Ego comes back from depends on what survived, in this order:

| What survived | You come back as | Continuity roll uses |
|---|---|---|
| The stack, recovered | Yourself, memories intact to the moment of death | Stack recovery rows |
| Nothing, but you carry backup insurance | Your last backup, missing everything since | Backup rows |
| Neither | Nothing. This is the real death, and it is rare enough to matter |

Backup insurance runs $6,250 a year and writes a fresh copy at whatever interval you pay for; anarchist habs provide the equivalent as mutual aid, which is a rep obligation rather than a contract. The gap between your last backup and your death is the interesting number, and Part IV's Continuity table already prices it: under 24 hours is 1d÷3 stress, over is 1d÷2.

**Time to resleeve** is a plot clock, not a die roll:

| Situation | Delay |
|---|---|
| Died in a hab with an ego bridge, insurance current | Hours |
| Stack recovered, has to be couriered somewhere with a bridge | Days to weeks, plus travel |
| Stack in hostile hands | However long the rescue takes. Your Ego is a hostage, not a corpse |
| Backup only, egocast to a body bank | Hours, plus lightspeed lag |
| Body and stack unrecovered, no backup | Indefinite. Someone has to come looking |

An Ego waiting in storage experiences nothing, which is its own problem. See Alienation.

## The Mechanics of the Swap

When you resleeve, remove the old morph package and apply the new one. Recompute everything downstream: HP, FP, Basic Lift, damage, Basic Speed (the HT half changes), and encumbrance. Skills, mental traits, and Ego attributes are untouched. Physical techniques bought for one body plan (say, Extra-Arm fighting in a Daitya) sit dormant until you're in a body that can use them.

## Integration

Roll **HT-based Professional Skill (Resleeving)**, or HT−5 by default, using the *new* morph's HT. This covers motor acclimation: learning the body's weight, reach, and reflexes.

- **Critical success:** No penalties. The body fits like it was grown for you.
- **Success:** −1 to all DX-based rolls for 24 hours.
- **Failure:** −2 to all DX-based rolls and −1 to Basic Speed. Roll HT each morning; a success ends the penalties.
- **Critical failure:** As failure, and the penalties don't start recovering for a full week. Something about this body is *wrong* for you.

## Alienation

Roll **IQ-based Professional Skill (Resleeving)**, or IQ−5 by default. This covers identity: looking in a mirror and accepting what looks back. Apply the modifiers below; if your table uses *GURPS Horror*, failures inflict Derangement points (1 on a failure, 3 on a critical failure). Without Horror, a failure inflicts a −10-point temporary mental disadvantage chosen by the GM (Flashbacks, Nightmares, Chronic Depression [mild], Loner) that fades after 1d weeks; a critical failure inflicts −20 points' worth.

| Situation | Modifier |
|---|---|
| Morph you've spent 6+ months in before | +6 |
| Clone of a morph you've spent 6+ months in | +4 |
| Same model you were raised in / previously used | +4 / +2 |
| Different physiological sex than self-image | −2 |
| First time in a synthmorph (non-AGI) | −2 |
| AGI sleeving into a physical body | −2 |
| Moderate physiology change (extra limbs, digitigrade) | −4 |
| Radically nonhuman body plan | −6 |
| You are a fork | −4 |
| Non-AGI sleeving as infomorph | −2 |

## Continuity

If you resleeved with continuity — you went under on the table and woke up in the new body — skip this roll entirely. Otherwise, restoration from a stack or backup means confronting a gap where your death should be. Roll **Will**:

| Situation | Base stress |
|---|---|
| Stack recovery, death not remembered | 1d÷3 |
| Stack recovery, remembered dying peacefully | 1d÷3 |
| Stack recovery, remembered dying violently | 1d÷2 |
| Backup less than 24 hours old | 1d÷3 |
| Backup older than 24 hours | 1d÷2 |
| You don't know what happened to your other instance | +1 |

On a success, reduce the result by half your margin (round down); on a failure, increase it by half your margin (round up). Apply the result as Derangement (with Horror) or as points toward a temporary mental disadvantage at −5 points each (without).

---

# Part V: Forks and Psychosurgery

## Forking

A fork is a copy of an Ego made by reading a cortical stack or a running mind and writing the result somewhere else. What comes out is a real Ego with its own sheet that thinks it is you, because until the moment of the copy it was. This section is the procedure for making one. Running two instances of yourself, and putting them back together, is its own problem covered under Merging below.

### Making a fork

Work through these steps in order. The whole process is one scene at a terminal or ego bridge; the rolls are the interesting part, not the wait.

**1. Have a source and a destination.** The source is a stack, a backup, or a live mind you have read access to. The destination is storage with room for the fork type: any mesh device holds a delta, a decent server holds a beta, a full ego bridge or comparable rig is needed to spin up an alpha. No destination, no fork.

**2. Declare the fork type.** This is the single decision that sets everything downstream. It cannot be raised later without a fresh fork; you can prune an alpha down to a beta, never grow a beta up to an alpha.

| Type | The copy is | Attributes | Skill ceiling | Other |
|---|---|---|---|---|
| **Alpha** | A complete, unabridged you | Full sheet, unchanged | None | Legally a person almost nowhere; possessing one is a crime in most of the inner system |
| **Beta** | A functional you with the edges filed off | −2 to ST, DX, IQ, HT | No DX-based skill above 15 | Legal or tolerated in most polities as a tool |
| **Delta** | A task-built sliver | −4 to ST, DX, IQ, HT | No DX-based skill above 10, nothing above 18 | Keeps only six Talent-sized skill groups, chosen when the fork is made; everything else is gone |

Attribute reductions cascade. A beta's IQ−2 drops every IQ-based skill by 2 before the ceiling is applied, and its Will and Perception fall with IQ unless bought separately. Recompute the fork's derived stats from its reduced attributes; do not just copy the source's numbers down.

**3. Roll to create it.** Two hours of work at a terminal or bridge, then roll **Psychosurgery**. An alpha of yourself, taken with your cooperation from a clean stack, is +4. A beta is +0. A delta is −2 for the aggressive pruning. Add −2 if the source is a live, unwilling, or distressed mind rather than a quiescent stack.

| Result | What you get |
|---|---|
| **Critical success** | A clean fork, and its Alienation roll on first sleeving is at +2 |
| **Success** | The fork you asked for |
| **Failure** | The fork runs, but comes out with 10 points of mental disadvantage per point of margin, GM's choice, baked in |
| **Critical failure** | A **gamma**: fragmentary, unstable, wrong. It may not know it's a copy, may not know what year it is, and is a story rather than a character. Delete it or deal with it |

**4. The fork wakes up.** A fork that is sleeved into a morph or a simulspace runs its own Alienation roll (Part IV) at the −4 "you are a fork" modifier, because knowing you are the copy and not the original is its own small horror. A fork left as a naked infomorph skips this until it's sleeved. A fork is otherwise a full character from the instant it wakes: it acts on its own initiative, rolls its own skills, and can fork again if it has the means.

**5. The source is unchanged.** Forking reads; it does not cut. The original loses nothing and feels nothing. Every legal and moral problem in the setting flows from that: there is now more than one of you, all equally convinced they are the one who matters.

### Merging

Two instances that have diverged can be written back into one. Reconciling divergent memories, deciding which self's choices survive the seam, is a **Psychosurgery** roll penalized by how far the copies have drifted apart. Read hours of divergence as feet on the Size and Speed/Range table: an hour apart is −0, a day is roughly −5, a week −8, a month −10, and past a few months the two are different people wearing the same name and merging stops being the right verb.

| Result | What happens |
|---|---|
| **Success** | One Ego, holding both sets of memories. Reduce the merge stress by half the margin |
| **Failure** | The merge completes but tears: memory loss and stress scaling with the margin, and the survivor is unsure which of two versions of an event is the real one |
| **Critical failure** | Irreconcilable. Memories that contradict each other, a −10-point Delusion or Split Personality, or one instance's memories simply overwritten and lost |

The stress of confronting a version of yourself who made different choices is real and lands on both instances. Merge early and merge often; the longer two copies run, the more each has to lose in becoming one again.

Merging is optional. Plenty of forks are never reabsorbed. A beta sent to run a decade-long errand and a source who has moved on may have nothing left to reconcile and no wish to try.

## Psychosurgery

Editing a digitized mind — memories, behaviors, skills, personality — is the Psychosurgery skill (IQ/Very Hard, prerequisite Psychology, specialized by species). It requires the target's Ego loaded into an editing suite, or nanoscale brain surgery on a live body.

Each application is a task with a time (subjective, so a 60:1 simulspace does a day's work in twenty-four real minutes), a skill penalty, and a stress cost to the patient, paid in points toward temporary mental disadvantages at −5 points each (or Derangement, with *Horror*):

| Application | Time | Penalty | Patient Stress |
|---|---|---|---|
| Psychotherapy | 8 hrs/session | +0 | — (each success removes 5 points of stress-derived disadvantages) |
| Emotional dampening or boosting | 2 hrs | −2 | 1 |
| Memory erasure (a specific event) | 4 hrs | −2 | 2 |
| Memory fabrication | 8 hrs | −4 | 2 |
| Behavioral modification (install/remove a −10-point trait) | 8 hrs | −4 | 3 |
| Skill imprint (grants one skill at attribute level for margin days) | 8 hrs | −4 | 1 |
| Deep interrogation (unwilling subject) | 1 hr/question | −2 | 3 |
| Fork creation / pruning | 2 hrs | see Forking | — |
| Merge assistance | 1 hr | +0 (offsets 2 points of merge penalty) | 1 |

Unwilling or resisting subjects turn the roll into a Quick Contest against Will. Failure doubles the stress and the edit doesn't take; critical failure edits something unintended — the GM converts five times the listed stress into mental disadvantages of their choosing, discovered later.

---

# Part VI: Augmentations and Gear

## The Master Gear List

**Eclipse_Phase_Gear.eqp** holds 1,007 items in fifteen categories, drawn from *GURPS Ultra-Tech* and filtered to what exists in 10 AF.

The baseline is TL9 and TL10 equipment, preferring the TL10 version where an item appears at several tech levels. But Ultra-Tech's tech levels don't line up with Eclipse Phase's shape: the setting is roughly TL10 in guns and vehicles while running well ahead in nanotech, materials, and mind emulation. So the TL11 and TL12 catalog was reviewed item by item and about ninety entries were pulled forward.

**Nanotech came across almost whole** — utility fog, assembler goo, disassembler and replicator nanoglops, respirocytes, the foodfac/nanofac/robofac fabrication ladder, medical nano, and the nanoswarm weapons. Ultra-Tech puts most real nanotech at TL11-12, which would have gutted the shopping list of a setting built on it. **Monocrys armor** (TL11) came forward as the standard vest and body-armor tier, along with subdermal armor, cybersuits, and the sprayable living suitsprays. **Mind tech** came forward because the psychosurgery and resleeving rules were already referencing hardware that only exists at TL11: clinical and portable mind probes, neural programmers, the Chrysalis Machine, Downloading Nanosurgery, and the Ranged SQUID. **Blasters** came forward as EP's particle beam bolters, and **antimatter** with its containment traps came forward as fuel, since the setting manufactures it at Mercury.

Held back at any tech level: gravitics and contragrav, force fields and force swords, disintegrators, stasis, teleportation, FTL, reactionless anything, and Ultra-Tech's psi hardware — asyncs don't use amplifiers. Rejected specifically from the TL11-12 review: grasers, pulsars, X-ray laser weapons, and antiparticle cannons (EP's beam ceiling is plasma and particle beams, though X-ray laser *torches* stay as cutting tools), portable antimatter *generators* (making the stuff needs solar-collector infrastructure, not a backpack), true invisibility (the setting's ceiling is chameleon coating, so Ultimate Chameleon is in and Invisibility is out), Energy Cloth, the Warsuit, black hole communicators, and gravscanners. Dominator Nano — mind-control nanobots — was pulled from the shopping list on the grounds that it's TITAN tech, not merchandise.

| Category | Items | Category | Items |
|---|---|---|---|
| Eclipse Phase Essentials | 14 | Vacc & Environment | 39 |
| Weapons — Beam | 46 | Medical | 75 |
| Weapons — Kinetic | 82 | Computers & Software | 83 |
| Weapons — Launchers & Explosives | 26 | Comms & Sensors | 107 |
| Ammunition & Power | 106 | Covert Ops & Security | 63 |
| Armor & Protection | 119 | Nanotech & Fabrication | 37 |
| Powered Armor & Exoskeletons | 23 | Robots & Drones | 15 |
| General Equipment & Tools | 172 | | |

The **Eclipse Phase Essentials** category is written for this conversion, covering the hardware the setting runs on and Ultra-Tech has no equivalent for: the cortical stack ($1,500 for a spare), the ego bridge ($31,250, or $125,000 for the portable one that raises questions), the healing vat, desktop fabbers and cornucopia machines, QE comm rigs with their unreplenishable qubit reservoirs, ectos, utilitools, the standard drone lineup, and a year of backup insurance ($6,250) — the difference between death being an inconvenience and being permanent.

Bush robots came forward as well, and belong in the GM's hands more than a player's: fractal branching machines that reconfigure into whatever they need to be is close enough to a description of TITAN fractal drones to be worth the shelf space.

Ultra-Tech names don't always match EP's. Read across: laser and electrolaser weapons are EP's beam weapons, "Storm" and "Gauss" weapons are its kinetics, monocrys and nanoweave are armor vests and body armor, smart clothes and chameleon gear are smart materials, and Ultra-Tech's medical nanofluids are what EP calls medichines.


## Buying Augmentations

Augmentations exist twice in the GCS libraries: as **traits** (point costs, in Eclipse_Phase_Mods_Traits.adq) and as **equipment** (cash prices, in Eclipse_Phase_Mods_Equipment.eqp). The rule tying them together:

**Augmentations installed in a morph are part of the morph.** They're bought with credits, they raise the morph's point total, and they stay with the body when you leave it. Nobody pays character points for a hand laser.

Cash prices use four tiers, mapping EP's cost categories:

| Tier | Price | EP Equivalent | Examples |
|---|---|---|---|
| Low | $1,500 | Low | Most bioware senses, claws, gills, grip pads, mnemonics |
| Moderate | $6,250 | Moderate | Adrenal Boost, Carapace Armor, Puppet Sock, Cyberlimb |
| High | $31,250 | High | Muscle Augmentation, Neurachem 1, Multi-Tasking, Hardened Skeleton |
| Expensive | $125,000 | Expensive | Neurachem 2, Reflex Booster, Emergency Farcaster |

Installation runs 10% of the augmentation's price at a licensed clinic (Surgery or Electronics Operation roll by the installer; you feel it either way), free-to-cheap in anarchist habs if your rep is good, and Streetwise-flavored in between.

**Compatibility:** Bioware fits biomorphs. Cyberware fits anything with the relevant chassis. The "Bioware that works with Synthmorphs" list in the equipment file (Eelware, Grip Pads, Muscle Augmentation, Neurachem, Chameleon Skin, the mental and sensory suites, and a few others) marks the exceptions explicitly — if it's not on that list, it doesn't go in a robot.

## Weapons and Armor

Use *GURPS Ultra-Tech* at TL10. Smartlinked firearms, laser and particle small arms, railguns, nanotech ammunition, and vacuum-rated armor are all standard military kit; the setting notes in the EP core book tell you what any given polity lets civilians carry (usually: not much, and the hab knows where your gun is at all times).

Two setting-specific notes. First, armor divisors matter more than raw damage against synthmorphs and their DR-4-and-up chassis; needlers and AP ammunition exist for a reason. Second, anything that destroys a cortical stack (called shots to the base of the skull, disintegration, plasma) is attempted *permanent* murder and treated accordingly everywhere that has laws.

## Nanofabrication

Nanofactories turn feedstock plus blueprints into goods. Common items have free open-source blueprints on any hab's mesh (Research roll at +4 to find quality ones); restricted blueprints — weapons, military augmentations, morphs themselves — are DRM-locked, licensed, and the actual currency of a lot of black-market activity. Feedstock for ordinary goods costs roughly 10–20% of the item's market price; the rest of what you pay for manufactured goods is intellectual property and labor.

---

# Part VII: The Mesh

Everything is networked. Every morph, device, wall, and dust mote carries sensors and a mesh address; augmented reality overlays the physical world for anyone with mesh inserts; and the practical question in any scene is not whether something can be hacked but who gets there first. Intrusion runs on Computer Hacking (B184).

## Skills

**Computer Hacking (IQ/Very Hard)** is EP's Infosec: intrusion, counter-intrusion, and spoofing. **Computer Programming** writes the tools and evaluates strange code. **Computer Operation** covers everyday mesh use — everyone in 10 AF has it at IQ or better, the way 21st-century people could read. **Electronics Operation (Security)** handles physical-layer systems: cameras, locks, sensor grids. **Cryptography** matters mainly at endpoints, because quantum-encrypted traffic is unbreakable in transit; you don't crack the cipher, you hack the machine that decrypts it.

## Intrusion

Hacking a system is a Quick Contest: your Computer Hacking versus the defender's Computer Hacking, Computer Security expertise, or the system's autonomous defenses (treat an unattended personal system as skill 10, a professional one as 12, hardened corporate or military systems as 14–18, plus Firewall bonuses below). The margin sets your status:

| Result | Status | Meaning |
|---|---|---|
| Win by 5+ | Hidden | The system has no idea you exist. Act freely; even audits at −4 to find you. |
| Win | Covert | Normal authorized-user appearance. Critical failures on your later actions trigger a passive alert. |
| Lose | Spotted | Active alert: countermeasures launch, admins notified, your actions at −2. You can keep working, but the clock is running. |
| Lose by 5+ | Locked | Ejected and traced. The system knows your mesh ID unless you routed through anonymizers. |

A standard intrusion attempt takes one minute. Rushing to one second — combat time — is −5. Taking extra time gives the usual bonuses (B346). Once inside, individual actions (open a door, loop a camera, download a file, edit a log) are Computer Hacking rolls at +0 for things your access plausibly covers, −2 to −6 for things that should require higher privileges, each taking seconds.

## Defenses

**Firewall quality** is an equipment bonus to the defender's skill: +0 for consumer trash, +1–2 for decent commercial, +3–4 for professional, +5 for military systems that also actively hunt intruders. **A muse on overwatch** rolls as a complementary skill for its owner or actively contests intruders itself at skill 12. **VPNs and anonymizers** don't stop intrusion but break traces. **Air-gapping** works exactly as well as it did in the twentieth century, which is why anything that matters gets a physical courier. And the strongest defense in the setting is architectural: **biomorph brains cannot be hacked.** Meat is air-gapped by nature. You can hack a biomorph's mesh inserts — feeding them false AR, cutting their comms, reading their entoptics — but not the mind behind them.

## Cyberbrain Hacking

Cyberbrains — every synthmorph, every pod, every infomorph — are computers, and they can be owned. Intrusion works as above against the cyberbrain's defenses (usually the victim's own Computer Hacking or their muse's 12, plus firewall). Once inside with Covert or better status, the ugly options open up: eavesdrop on sensory input, inject false sensory data, lock the Ego out of its own motor control, force a shutdown, or — with a Puppet Sock installed — take the body over outright. A puppeted victim resists each commanded action with a Quick Contest of Will versus the hacker's Computer Hacking; deeply self-destructive orders give the victim +4. Copying the Ego out ("egonapping") takes minutes of Hidden access and is among the few crimes every polity in the system agrees on.

This is the synthmorph tax: the Reaper's chassis shrugs off rifle fire, and a sufficiently good hacker turns it into a gift. Serious operators run hardened firewalls, keep a muse on permanent overwatch, and know where the hardware cutoff switch is.

## TacNets

A tactical network shares every teammate's sensor feeds, position, and targeting data. Party members on a TacNet get +1 to attack any target a teammate has line-of-sight on, can make Per rolls using the best-positioned teammate's senses, and cannot be flanked by anything a teammate can see. The countermeasure is obvious: hack the TacNet and the party's greatest asset becomes their shared hallucination.

## Simulspace and Time Dilation

Full-immersion VR runs at up to 60:1 subjective time. A day of research, planning, code, or psychosurgery fits in twenty-four real minutes; leisure simulspaces run slower and stranger. Egos in simulspace are effectively infomorphs for hacking purposes — and a hacker with root on the simulspace server has root on everything the inhabitants experience.

## Egocasting

Minds travel at light speed. An egocast transmits your Ego to a receiving body bank — minutes of transmission time plus lightspeed lag (Mars is 3–22 light-minutes from Earth orbit; Saturn is over an hour) — where you resleeve on arrival, rolling Integration, Alienation, and Continuity as normal (an egocast is resleeving *without* continuity unless you suspended first). The copy that arrives is you; what happens to the instance that stayed behind is a question transhumanity answers with lawyers, ethics committees, and occasionally gunfire. Quantum-entangled comms allow instant messaging across any distance, but qubit reservoirs deplete per bit and can't be refilled remotely, so QE bandwidth is precious enough that "we'll QE you the go signal, nothing else" is standard mission planning.

# Part VIII: Reputation Networks

Half the Solar System doesn't run on money. It runs on being known — for helping, for delivering, for not being a liability. Reputation networks are mesh-mediated communities that score every member's standing in real time, and in the autonomist half of the system that score *is* your purchasing power. This chapter runs on the Pulling Rank rules from *GURPS Social Engineering* (p. SE20–24); have the book at the table, because the response tables live there and this chapter only tells you what to feed them.

## Rep as Courtesy Rank

Each network is an organization, and your standing in it is **Courtesy Rank** — influence without command authority. Nobody on a rep network is obligated to help you; they *want* to, in proportion to your score, because helping high-rep members is how their own rep grows.

**Rep (Network): 3 points/level, maximum 8, bought per network.** Use your Rep level as Rank for the Pulling Rank response roll. A new character can start with rep in two or three networks matching their background; rep in a network whose community you've never touched needs an explanation, not points.

Rough social meaning of the levels: 1–2 is a member in good standing, 3–4 is a known contributor people greet by name, 5–6 is a respected fixture whose requests jump queues, 7–8 is a celebrity of the network — and a celebrity's failures are equally famous.

In **anarchist and autonomist habs, rep replaces both Wealth and Status** (as Parts III and XI already establish for morph access and cost of living). In the money economies, rep networks operate alongside cash as a parallel favor economy — c-rep gets you meetings and leaked memos that credits can't openly buy.

## The Networks

| Network | Rep | Community | Where it counts |
|---|---|---|---|
| The @-List | @-rep | Anarchists, scum, Titanian mutualists, autonomists broadly | The entire autonomist alliance; most of the outer system |
| CivicNet | c-rep | Hypercorp employees, Consortium citizens, LLA, Morningstar | The inner system's polite economy |
| EcoWave | e-rep | Nano-ecologists, preservationists, reclaimers, gatekeeper greens | Anywhere terraforming or Earth reclamation is argued about |
| Fame | f-rep | Media, socialites, artists, XP stars | Glitterati circuits everywhere; opens doors, rarely airlocks |
| Guanxi | g-rep | Criminals, smugglers, fixers, triads and cartels | Everywhere, quietly |
| RNA | r-rep | Scientists, technologists, argonauts, open-source engineers | Research stations, universities, anywhere data is shared |
| Explore-Net | x-rep | Gatecrashers and first-in explorers | Gateway habs; anywhere people brag about dying somewhere new |
| The Eye | i-rep | Firewall sentinels and proxies | Firewall campaigns only; officially nonexistent |

## Making a Request

Frame every favor as a Pulling Rank request: your Rep level is Rank, and the GM applies the assistance-value modifier from Social Engineering based on what you're asking for. Calibrate assistance value in EP terms roughly as: freely shareable information or introductions are trivial to minor; a place to sleep, common gear, or a day of someone's labor is minor to moderate; restricted information, expensive gear, or risky help is serious; a morph, a ship berth, or help that could get the helper killed or arrested sits at the top of the scale. Then apply these EP-specific adjustments:

**Response time compresses.** Requests posted to a network are seen in seconds by thousands. Anything deliverable over the mesh — information, introductions, blueprints, remote labor — arrives one to two steps faster than the Social Engineering tables suggest, often in minutes. Physical goods and in-person help use the normal times, gated by how fast someone can walk it over.

**Cost splits by economy.** On c-rep, f-rep, and g-rep, an expensive favor takes the normal penalty for cost — those networks remember what things are worth in credits. On @-rep, e-rep, r-rep, and x-rep, replace the cost modifier with a **community-benefit modifier**, from +2 for requests that obviously serve the community (defending the hab, open-sourcing the results) through −2 to −6 for requests that serve only you, drain shared resources, or export community property. Asking the @-List for a Fury to defend the commune is *easier* than asking for one to take off-hab, whatever the sticker price says.

**Repetition strains rep normally.** The cumulative penalties for frequent requests (per Pulling Rank) apply per network per week or so. This is EP's rep strain working as written: the third big ask in a week is visibly mooching, and the network notices.

**Scope matters.** Mesh-deliverable favors draw on the whole network — apply the largest population bonuses. Local physical favors draw only on the network's presence in your hab; in a ten-thousand-person station, even @-rep 7 can't produce what nobody there owns.

## Burning Rep

When the response roll won't get there and the need is real, you can burn standing: take +2 to one request in exchange for dropping that network's Rep by one level, or +4 for two levels. The favor happens — and then everyone watches what you do with it. Burned rep isn't bought back with points; it's restored by visible service to the network (the GM should treat each burned level as roughly one session's worth of genuine contribution, documented on the mesh). Characters who burn rep and vanish become cautionary tales, which is its own kind of fame, on the wrong network.

## Losing Rep

Rep drops for the reasons you'd expect: publicly failing people who helped you, hoarding in a sharing economy, getting caught lying on the network that vouched for you. Mechanically, treat serious offenses as losing a level (two for betrayals that hurt people), recoverable the same way burned rep is. G-rep is the exception in both directions: Guanxi forgives nearly anything except talking to the authorities, and punishes that one sin permanently.

# Part IX: Asyncs

Some minds came back from the Fall changed. The Watts-MacLeod strain of the exsurgent virus — apparently benign, insistently plural — rewires its host's cognitive architecture, and the result is an async: a person whose brain does things brains cannot do. Sleights use *GURPS Psionic Powers*' framework; the full catalog lives in **Eclipse_Phase_Psi_Sleights.adq**, each entry with its statistics line. Skills are in **Eclipse_Phase_Skills.skl**.

## Becoming an Async

You don't buy psi; you catch it. **Watts-MacLeod Infection [−10]** is the gateway trait: it carries mandatory mental disorders worth at least −15 points (chosen with the GM, not counted against the disadvantage limit), detectability by Sense Infection and by the people who hunt asyncs, a +4 to resist further exsurgent infection — the strain defends its territory — and the permanent knowledge that something else shares your architecture. The infection lives in the Ego's structure: it survives every resleeve, every fork, every backup. There is no cure that leaves *you* behind.

**Async Talent (5/level, max 4)** adds to every sleight skill and to your side of every sleight Quick Contest. In play, high Talent should read as deep integration, and the GM is encouraged to let the strain occasionally express opinions.

## Using Sleights

**Psi-chi sleights** are internal: cognitive accelerants, sensory amplifiers, pain gates. Most are passive or cost 1 FP to sustain; none require a target. They range from Time Sense [2] to Unconscious Lead [35/level] — Altered Time Rate driven by the part of your mind that processes faster than thought — with most in the 4–15 range.

The catalog covers the full 2e sleight list (both categories, including the support gammas — the Bursts, Tranquility, Restorative Fugue — and the heavy hitters like Illusion, Basilisk Stare, and Nightmare) plus the 1e/supplement sleights 2e dropped, with 2e names noted where they differ. Two more 2e rules apply: **your own brain must be biological to wield psi** — the Infection rides the Ego everywhere, but an async in a synthmorph or infomorph can't express it, which makes forced resleeving the polite way to defang one. And defenders have options: **Psi Full Defense** (All-Out Defense, Mental: +3 to resist sleights until your next turn), and a **critical success on any resistance roll locks the async out** of that mind until they take a full rest.

**Psi-gamma sleights** are the invasive ones, and they follow four hard rules. *Proximity:* sleights reach to short range at −1 per yard beyond touch, maximum 10 yards; touching the target negates all range penalties, and bare skin contact gives +3 — asyncs shake hands, brush past you in corridors, and hold dying friends for more than one reason. *Substrate:* biological brains are psi's natural medium; digital minds — cyberbrains, synthmorphs, pods, infomorphs — can be reached, but at a flat −8, meat calling to something that only remembers being meat. *Contested:* every use against an unwilling mind is a Quick Contest (your sleight skill vs. their Will); a target who makes their own roll feels *something*, even if they can't name it. *Strain:* 2 FP per use; each sustained sleight costs 1 FP per minute and a cumulative −2 to all your other rolls while held. An async who overreaches finishes the fight unconscious, which the strain may or may not consider a loss.

Sleights follow Psionic Powers conventions fully: **every active sleight is leveled and has its own Hard skill** of the same name (based on Will, IQ, or Per per the library; Async Talent adds to all of them), with the level ladder in each entry's notes — extra dice for Psychic Stab, duration steps for Cloud Memory, range doublings for the senses. Passive sleights need no skill roll.

**Sleights are priced as GURPS abilities and bought as Alternative Abilities** (*GURPS Powers* p. 11): pay full price for your most expensive sleight and 1/5 (enable the −80% modifier in GCS) for every other active sleight. Only one Alternative Ability can be in use at a time; switching takes a Ready maneuver — an async mid-Thought-Browse who suddenly needs Psychic Stab loses a beat, which is exactly the vulnerability the touch-range dance implies. Always-on passives can't be alternatives and are priced without the discount.

The **Async Power modifier is −25%**, earning its depth: sleights require the Infection *and a biological brain* — a serious limitation in a resleeving game, where getting stuffed into a synth defangs you completely — plus suppression by inhibitors, detectability, and the strain's influence effects. The nine support sleights (the Bursts, Block Pain, Neural Hardening, Invigorate, Tranquility, Implant Skill, Restorative Fugue) carry an additional Ally-Only −20%, pricing them at 5–12 points. **Psi (Level 1)** and **(Level 2)** remain as 0-point prerequisite gates — the gate is fictional, the sleights carry the price.

**Unconscious Lead** stacks the deepest discounts: Altered Time Rate with Async −25%, Unconscious Direction −20% (the GM may drive your extra maneuvers), and Costs Fatigue −20% (4 FP to engage, 4 per additional minute) lands at **35/level** — or 7 points as an alternative behind a cheaper primary. Several seconds of borrowed speed, paid for in exhaustion and in remembering things you don't remember deciding.

A rounded async: Infection [−10, plus −15 in disorders], Talent 2 [10], Psychic Stab [16] as primary, Thought Browse, Drive Emotion, and Unconscious Lead as alternatives [4+4+7], Psi Shield 3 [9], and two cheap passives — about 45 points net, a real investment that stays inside a 250-point Ego.

The Penetration technique erodes Psi Shields; Hide Signature keeps other asyncs from making you.

## Detection and Defense

Psi has no mesh signature, no energy trace, no forensics — which is precisely what makes asyncs terrifying to institutions and invaluable to Firewall. The counters that exist: **Psi Shield** and hardened Will; **psi-jamming pharmaceuticals**, which suppress an async's sleights for hours per dose and are standard issue for anyone who interrogates one; **wearing a synthmorph**, no longer perfect but still a fortress (−8 to reach a digital mind turns most asyncs away), at the price of everything a biomorph is; and **Sense Infection**, which takes one async to catch another.

## The Faust

The morph catalog's Faust (Part III) is what money and bad judgment build for asyncs: Will +6 base plus Endocrine Control, Mind Shield 3, and the cognitive suite. An async in a Faust adds morph Will to every strain-side contest and resists other asyncs at absurd totals. Sleeving one is also a confession — the model has exactly one customer base, and everyone knows it.

## Psi-Epsilon (GM Only)

Full exsurgents wield a third tier this document deliberately does not price: ranged sleights, area effects, no strain — the virus paying costs its hosts can't see. When the PCs meet psi-epsilon, it should not feel like a bigger point total. It should feel like the rules of the setting were a courtesy that has been withdrawn.

# Part X: The Bestiary

Everything up to this point is equipment for players. This is what the equipment is for.

**Eclipse_Phase_Bestiary.adq** holds 57 threats converted from *Eclipse Phase: X-Risks*, organized by type and built on the same chassis as the morph library — load a blank sheet, drag a creature onto it, and GCS computes the stat block. Each entry carries attributes, DR, weapon blocks, special abilities, a Fright Check rating, threat level, encounter numbers, and a page reference back to X-Risks for the full write-up.

| Category | Count | What's in it |
|---|---|---|
| Exsurgents | 14 | The virus's handiwork: creepers, fetches, jellies, mantis worms, wastewalkers |
| TITAN Machines | 12 | Headhunters, warbots, stalkers, think tanks, and the things that took the habitats |
| Exhumans | 4 | Predators, defilers, dreadnoughts, neurodes — people who chose this |
| Aliens | 6 | Factors in four forms, Iktomi remnants, xenosamplers |
| Tech & AI Threats | 5 | Grey goo, smart mines, killer spambots, wild artificials |
| Xenofauna & Neogenetics | 16 | Gate-side wildlife and engineered organisms |

## Conversion Method

The stat blocks derive from X-Risks' numbers rather than replacing them, so a GM who owns the book can cross-check any entry.

**Aptitudes → attributes.** EP aptitude 15 is a competent transhuman, so 15 maps to the conversion's baselines: ST 10, DX 11, IQ 11, Will 10, Per 10. Above that the curves steepen the way EP's do — SOM 20 gives ST 14, SOM 25 gives ST 20, SOM 40 gives ST 40. COO and COG move ±2 per 5 points; WIL and INT move ±3 per 5, matching the morph conventions in Part III.

**DUR → HP at 0.6**, the same ratio the morphs use. **Armor → DR at 0.75**, also as per morphs, with kinetic and energy values tracked separately where X-Risks distinguishes them.

**Damage converts at 0.6 of the EP average**, which preserves lethality relative to HP rather than raw numbers. A stalker's arm blade is 2d10+4 in EP — about 15 average against a transhuman's DUR 30 — and 3d here, about 10 against HP 18. The proportion holds: roughly half your durability per hit, which is the number that matters at the table. **Armor penetration becomes armor divisors**: AP −4 to −8 gives (2), −9 to −15 gives (3), beyond that (5).

**Stress tests become Fright Checks** at −1 to −6 depending on the entry. If you're not using *GURPS Horror*, a failed check inflicts temporary mental disadvantages at −5 points each, per Part IV.

## Using the Threat Levels

X-Risks' color coding survives in each entry's notes and it is honest about scale. **Yellow** threats are a problem in numbers and trivial alone. **Orange** is a fair fight against one sentinel. **Red** means a few of them will beat a full team. **Ultraviolet** means the correct response is withdrawal and a call to people whose job is erasure — the Stalker, Think Tank, Creeper, Fetch, Factor Gestalt, and the self-replicating nanoswarm all sit here, and none of them are meant to be defeated by a standard party in a stand-up fight.

Two entries deserve particular care. The **self-replicating nanoswarm** doubles every hour of unrestricted feeding, which makes it a timer rather than a monster: the party's actual opponent is the containment window. The **creeper** grows from damage dealt to it, so a party that fights it correctly makes it stronger, and the only winning moves are vacuum, fire, and leaving.

## What Isn't Here

Psi-epsilon still isn't priced, and the deferred items from earlier chapters land here rather than in a shopping list: Dominator Nano, the fractal bush robots, and whatever the GM decides the TITANs left in the outer system. Individual TITANs themselves aren't statted, because a TITAN is a plot rather than an encounter.

---

# Part XI: Setting Rules

## Tech Level and Wealth

The campaign is TL10. Starting wealth is $50,000. The credit is the currency of the inner system and most of the outer; anarchist habs run on reputation instead — see Part VIII for the full rep network rules. When in an anarchist hab, Wealth means nothing and rep means everything, including whether you keep the morph you walked in wearing.

## Low Gravity

Multiply walking and running Move by the square root of local gravity in Gs. Below 0.5 G, running jumps outpace sprinting; let characters move at their running-jump distance and roll the better of HT or HT-based Jumping for paced running. Characters raised in one gravity regime take −1 to DX-based rolls per full step of difference (micro, low, standard, high) until they've spent a week acclimating or make an Environment Suit/Free Fall roll, whichever fits.

## Free Fall

Free Fall (DX/Avg) governs all deliberate movement in microgravity. Moving is a Free Fall−3 control roll as a free action; failure means tumbling with a DX penalty equal to your margin until you recover (Ready maneuver + Free Fall to reduce, or Astrobatics to recover instantly) or hit something. Anyone who grew up off a planetary surface has this skill; anyone who didn't and lacks it eats the Social Stigma of being obviously groundborn.

## Vacuum and Hostile Atmospheres

Synthmorphs ignore vacuum entirely (Vacuum Support is in the chassis or cheaply added). Biomorphs need suits: a mechanical counterpressure suit costs 20% extra FP on exertion and uses the wearer's full DX; a hard suit costs far more fatigue but carries armor and life support measured in days. Environment Suit skill is as fundamental to spacer life as literacy; defaulting it in an emergency is how people die embarrassingly.

## The Rule of 16

Not used. Contested rolls run at full effective skill, however high.

---

# Appendix: Designer's Notes

**Canon checking.** EP_Morph_Stats_Reference.json carries the aptitude bonuses, Durability, CP, and implant lists for all 104 morphs in the *Morph Recognition Guide*, parsed from the book. Every morph in the library was audited against it; the conversion conventions live in the same file, so a new morph can be built and checked without guesswork.

**The customization menu.** Options convert each aptitude at the project's standard rate rather than being forced to a common point value. Point-matching was tried and abandoned: the slot costs nothing, chargen price is CP ÷ 4 regardless, and equalizing the options only made the player's +5 worth half the designer's. Check any new option against the conversion table in EP_Morph_Stats_Reference.json.

**The stance.** This conversion is literal: EP's numbers map onto GURPS's, transhumans outclass baseline humans, and a 725-point Fury is simply what a Fury costs. Balance comes from same-weight opposition, backup anxiety, and problems no attribute solves — not from caps. That's why the Rule of 16 is off, why attributes start at 11, and why Will is priced at 15/level in a setting that attacks minds for a living.


**Why 8/level ST.** GURPS prices ST at 10/level as a bundle: Striking ST (5) + Lifting ST (3) + HP (2). EP separates SOM from DUR, so this conversion unbundles the same way: ST at 8/level for striking and lifting, HP at 2/level bought explicitly. Old bundled ST survives as the "+2 ST & +2 HP" customization option for anyone who misses it.

**Why HP has no cap.** The Basic Set's ±30% HP-to-ST guidance models evolved biology. Morphs are engineered products; a chassis overbuilt for durability relative to its actuators is an ordinary design decision, not an anomaly.

**Flat vs. Generic.** Resolved: the Flat is now canon-bare (216 points — no biomods, no mesh, no stack, no customization slot), while the Generic (340 points) is the biomodded everyday body. A Flat that buys implants in play converges on a Generic, which is precisely the setting's story about baseline humanity.

**HP derivation cleanup.** The attribute file still derives HP from ST (`base: $st`), which the ST trait's hidden −1 HP/level feature then cancels. A future cleanup could set HP's base to 0 in `EP_Attributes.attr` and delete the canceling features — same numbers, fewer moving parts. Until then the current implementation is correct, just baroque.

**Slot counts are intentional.** The Exalt's three customization slots and the Remade's two aren't errors; they're the product pitch. If a future morph shouldn't have that flexibility, give it fewer slots and lower the sticker price.

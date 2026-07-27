# GURPS Eclipse Phase — Quick Reference

*Everything you reach for mid-session. Full rules in the conversion guide; part numbers cited.*

---

## DYING (IV)

Morphs use **standard GURPS damage and death rules**, unchanged.

**Cortical stack:** DR 50, HP 2, homogenous. Called shot skull (−7) then stack (−10), and 54+ must get through. **In practice, untargetable.** Survives gunfire, blades, falls, explosions, drowning, vacuum, cold, 1,500°C/hr, 10,000 G. Destroyed by plasma, antimatter, disintegrators, nukes, 3,000°C sustained, area damage past 10×HP, or 30 seconds with a cutting tool on a body someone controls.

**Recovery order:** stack recovered → you, intact to the moment of death. Stack gone, insurance current → last backup, missing the gap. Neither → really dead.

**Time back:** hours with a local bridge and insurance · days-to-weeks if the stack ships · however long the rescue takes if someone else holds it · indefinite if nobody looks.

**Sleeves and mods in play cost money, favors, or rep. Never points.**

---

## RESLEEVING (IV)

Three rolls, in order. Skip Continuity if the character went under on the table and woke up in the new body.

**1. Integration** — HT-based Prof. Skill (Resleeving), default HT−5, using the **new morph's HT**. Motor acclimation. No modifier table; the morph's HT is the difficulty.

| Result | Effect |
|---|---|
| Critical success | No penalties |
| Success | −1 to DX-based rolls, 24 hours |
| Failure | −2 DX-based, −1 Basic Speed. HT each morning to end |
| Critical failure | As failure, no recovery rolls for a week |

**2. Alienation** — IQ-based Prof. Skill (Resleeving), default IQ−5. Identity.
Failure = −10 pts of temporary mental disadvantage (GM picks), fades in 1d weeks. Critical failure = −20 pts. *With Horror:* 1 / 3 Derangement points.

| Situation | Mod | Situation | Mod |
|---|---|---|---|
| Morph you've spent 6+ months in | +6 | Different physiological sex than self-image | −2 |
| Clone of that morph | +4 | First time in a synthmorph (non-AGI) | −2 |
| Model you were raised in | +4 | AGI sleeving into a physical body | −2 |
| Model previously used | +2 | Non-AGI sleeving as infomorph | −2 |
| Moderate physiology change | −4 | Radically nonhuman body plan | −6 |
| You are a fork | −4 | | |

**3. Continuity** — Will roll. Success reduces stress by half your margin (round down); failure increases it by half your margin (round up).

| Situation | Base stress |
|---|---|
| Stack recovery, death not remembered / remembered peacefully | 1d÷3 |
| Stack recovery, remembered dying violently | 1d÷2 |
| Backup < 24 hours old | 1d÷3 |
| Backup > 24 hours old | 1d÷2 |
| Don't know what happened to your other instance | +1 |

**Egocasting** = resleeving without continuity, unless you suspended first. Lightspeed lag: Mars 3–22 light-minutes, Saturn 60+.

---

## STRESS WITHOUT *HORROR* (IV)

Stress points convert to temporary mental disadvantages at **−5 points each**, GM's choice, fading over 1d weeks. Fright Check failures use the same conversion.

---

## HACKING (VII)

Quick Contest: attacker's **Computer Hacking** vs. defender's skill + firewall. **1 minute** standard, **1 second at −5**.

| Margin | Status | Meaning |
|---|---|---|
| Win by 5+ | **Hidden** | System doesn't know you exist. Audits at −4 to find you |
| Win | **Covert** | Looks authorized. Your critical failures trigger passive alerts |
| Lose | **Spotted** | Active alert, countermeasures, your actions at −2, clock running |
| Lose by 5+ | **Locked** | Ejected and traced unless you routed through anonymizers |

**Defender skill:** unattended personal 10 · professional 12 · hardened corporate/military 14–18.
**Firewall bonus:** consumer +0 · commercial +1–2 · professional +3–4 · military +5 (and it hunts back).
**Muse on overwatch:** complementary roll, or contests directly at skill 12.

**In-system actions:** +0 if your access plausibly covers it, −2 to −6 if it shouldn't. Seconds each.

**BIOMORPH BRAINS CANNOT BE HACKED.** Only their mesh inserts (false AR, cut comms).
**Cyberbrains can:** eavesdrop, inject senses, lock out motor control, force shutdown, puppet (with a Puppet Sock). Puppeted victim resists each command with Will vs. hacker's skill; **+4 to resist self-destructive orders**.

**TacNet:** +1 to hit anything a teammate sees, shared Per, no flanking. Hack it and the party's asset becomes a shared hallucination.

**Simulspace:** up to 60:1 time. Root on the server = root on everything the inhabitants experience.

---

## FORKING (V)

**Make a fork:** need a source (stack/backup/live read) and a destination sized to the type (delta = any device, beta = server, alpha = ego bridge). Pick the type — it only goes down later, never up.

| Type | Attributes | Skill cap | Roll mod |
|---|---|---|---|
| Alpha | full sheet | none | +4 (willing self, clean stack) |
| Beta | −2 ST/DX/IQ/HT | no DX skill >15 | +0 |
| Delta | −4 ST/DX/IQ/HT | no DX skill >10, none >18, 6 skill groups only | −2 |

−2 more if the source is live/unwilling/distressed. Reductions cascade: recompute the fork's derived stats and IQ/DX skills from its lowered attributes, don't copy the source's numbers.

**Psychosurgery roll:** crit = clean fork, +2 to its first Alienation · success = the fork · failure = 10 pts mental disadvantage per margin, baked in · crit fail = a **gamma**, unstable and wrong.

**Fork wakes:** runs Alienation at −4 (you are a fork) when sleeved; a naked infomorph fork waits. Full character from wake, acts on its own. **Source is untouched** — forking reads, it doesn't cut.

**Merging** (Psychosurgery, penalty by divergence, hours-as-feet): 1 hr −0 · 1 day −5 · week −8 · month −10 · beyond, they're different people. Success = one Ego, stress cut by half margin. Failure = memory loss + stress by margin. Crit fail = irreconcilable. Merge early, merge often.

---

## PSYCHOSURGERY (V)

IQ/VH, specialized by mind architecture. Times are **subjective** — a 60:1 simulspace does a day's work in 24 real minutes.

| Application | Time | Penalty | Stress |
|---|---|---|---|
| Psychotherapy | 8 hrs/session | +0 | *removes* 5 pts of stress disads per success |
| Emotional dampening / boosting | 2 hrs | −2 | 1 |
| Memory erasure (specific event) | 4 hrs | −2 | 2 |
| Memory fabrication | 8 hrs | −4 | 2 |
| Behavioral mod (install/remove −10-pt trait) | 8 hrs | −4 | 3 |
| Skill imprint (attribute level, margin days) | 8 hrs | −4 | 1 |
| Deep interrogation (unwilling) | 1 hr/question | −2 | 3 |
| Fork pruning (beta/delta) | 2 hrs | −2 | — |
| Merge assistance | 1 hr | +0 (offsets 2 pts merge penalty) | 1 |

**Unwilling subject:** Quick Contest vs. Will. Failure doubles stress, edit fails. **Critical failure:** GM converts 5× the listed stress into disadvantages of their choosing, discovered later.

---

## ASYNCS (IX)

**Range:** −1/yard beyond touch, max 10 yards. **Touch** negates range penalties. **Bare skin +3.**
**Digital minds** (cyberbrains, synths, pods, infomorphs): flat **−8**.
**Your own brain must be biological** — an async in a synthmorph can't use psi at all.
**Cost:** 2 FP per use. Sustained: 1 FP/min **and cumulative −2 to all other rolls per sleight held**.
**Contested:** sleight skill vs. Will. A target who makes their roll feels *something*.

**Defenses:** Psi Full Defense = All-Out Defense (Mental), +3 to resist until your next turn. **Critical success on any resistance roll locks the async out of that mind until they take a full rest.** Psi inhibitor drug: HT vs. potency 14 or lose all sleights 1d hours; even on a success, −4.

**Alternative Abilities:** full price for the most expensive sleight, 1/5 for the rest, **one active at a time**, switching is a Ready maneuver.

---

## REPUTATION (VIII)

Rep level = **Courtesy Rank** for Pulling Rank (*Social Engineering* p. SE20–24). 3 pts/level, max 8.

**Levels:** 1–2 member in good standing · 3–4 known contributor · 5–6 respected fixture · 7–8 network celebrity (whose failures are equally famous).

| Network | Community | Network | Community |
|---|---|---|---|
| **@-rep** The @-List | Anarchists, scum, autonomists | **r-rep** RNA | Scientists, argonauts |
| **c-rep** CivicNet | Hypercorps, Consortium, LLA | **x-rep** Explore-Net | Gatecrashers |
| **e-rep** EcoWave | Nano-ecologists, reclaimers | **f-rep** Fame | Media, socialites, XP stars |
| **g-rep** Guanxi | Criminals, smugglers, fixers | **i-rep** The Eye | Firewall only |

**Adjustments:**
- **Response time:** mesh-deliverable favors (info, intros, blueprints, remote labor) arrive **1–2 steps faster** than the book's tables. Physical goods and in-person help use normal times.
- **Cost:** on **c/f/g-rep**, normal cost penalties. On **@/e/r/x-rep**, replace cost with a **community-benefit modifier**: +2 obviously serves the community → −6 serves only you or exports community property.
- **Repetition:** normal cumulative penalties, per network per week. This is rep strain.
- **Scope:** mesh favors draw on the whole network; local physical favors draw only on local presence.
- **Burning rep:** +2 for one level, +4 for two. Restored by visible service (~one session per level), not points.
- **Guanxi** forgives anything except talking to authorities, and never forgives that.

---

## GEAR & MONEY (VI)

Starting wealth **$50,000**. Campaign is **TL10**.

| Aug Tier | Price | Examples |
|---|---|---|
| Low | $1,500 | Bioware senses, claws, gills, grip pads, mnemonics |
| Moderate | $6,250 | Adrenal Boost, Carapace Armor, Puppet Sock, Cyberlimb |
| High | $31,250 | Muscle Augmentation, Neurachem 1, Multi-Tasking, Hardened Skeleton |
| Expensive | $125,000 | Neurachem 2, Reflex Booster, Emergency Farcaster |

**Research +4** to find open-source blueprints for everyday goods.
**Key EP kit:** cortical stack $1,500 · ego bridge $31,250 (portable $125,000) · healing vat $31,250 · desktop fabber $6,250 · cornucopia machine $125,000 · QE comm rig $125,000 · ecto $250 · backup insurance $6,250/yr.

---

## ENVIRONMENT (XI)

**Low gravity:** Move × √(local G). Below 0.5 G running jumps beat sprinting. **−1 to DX-based rolls per full step** of gravity difference (micro / low / standard / high) from your upbringing, until a week's acclimation or a successful Environment Suit / Free Fall roll.

**Free fall:** movement is a **Free Fall−3** control roll, free action. Failure = tumbling at a DX penalty equal to your margin until you recover (Ready + Free Fall, or Astrobatics instantly) or hit something.

**Vacuum:** synthmorphs ignore it. Biomorphs need suits. **Free Fall Training** and **Environment Suit Training** techniques let you drill a *specific* skill for zero g or a suit instead of capping at the raw skill.

**Rule of 16:** not used. Contested rolls run at full effective skill.

---

## BESTIARY THREAT LEVELS (X)

| Level | Meaning |
|---|---|
| **Yellow** | Trivial alone, a problem in numbers |
| **Orange** | A fair fight for one sentinel |
| **Red** | A few will beat a full team |
| **Ultraviolet** | Withdraw and call erasers |

**Ultraviolet entries:** Stalker, Think Tank, Creeper, Fetch, Factor Gestalt, Self-Replicating Nanoswarm.

**Two are timers, not monsters.** The **nanoswarm** doubles every hour of unrestricted feeding — the opponent is the containment window. The **creeper** grows from damage dealt to it; vacuum, fire, or leave.

---

## CHARGEN CHECKLIST (I–III)

1. **250 points**, including the morph's chargen cost. Disadvantage limit −50.
2. Attributes: DX/IQ base **11**, Will/Per base **10**, **ST and HT base 0** — an unsleeved Ego has neither; the morph supplies both, so a Splicer's ST 12 costs 96 points and its HT 12 costs 120, paid by the morph package.
   Costs: **ST 8 · DX 20 · IQ 20 · HT 10 · Will 15 · Per 5 · HP 2 · Basic Speed 20/point.** ST is striking+lifting only; HP is bought separately.
3. **Morph customization slots** ("+5 to one aptitude"): enable exactly one —
   **COG→IQ +2 · COO→DX +2 · REF→Basic Speed +2.00 · WIL→Will +3 · SOM→ST +4 · SAV→Smooth Operator 2 · INT→Per +3.**
   Not point-matched (15–45 pts of value); the slot is free and the morph costs CP÷4 either way.
4. **Background** (Part I) — 15 options, −10 to +25 pts.
5. **Faction** (Part I) — 19 options, −9 to +20 pts. Most include a rep network at level 2.
6. **Morph** (Part III) — chargen cost = EP CP ÷ 4, rounded up.
7. Skills, then gear at $50,000.

**Free:** muse (or 5 pts as an Ally), basic mesh inserts, cortical stack, basic biomods — except a **Flat**, which has none of it and dies for real.

**Outside the disadvantage limit:** Watts-MacLeod Infection's −15 in disorders, Lost Generation's −15 in trauma.

---

## FILE LOAD ORDER

`EP_Attributes.attr` **first** — everything else computes wrong without it. Then Morphs, Mods_Traits, Mods_Equipment, Gear, Psi_Sleights, Skills, Ego_Packages, Bestiary, Templates.

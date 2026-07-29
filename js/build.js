// Turns a wizard build into a GCS entity.
//
// Assembly happens once, in `assemble`, and produces the rows the sheet will
// carry. The live sheet panel reads those rows to work out what the character's
// numbers actually are, and `buildSheet` runs the same rows through `adopt` to
// write the file. Preview and export therefore cannot drift apart.
//
// Anything that came out of a library keeps its features, prerequisites,
// weapons and modifiers, so the sheet behaves as if the row had been dragged in
// by hand.

import {
  adopt,
  aptitudeSlots,
  applyAptitudes,
  buildEntity,
  normalizeMorphPrice,
  skill as authorSkill,
  trait as authorTrait,
  traitGroup,
} from "./gcs.js";
import { applyChoices, applyEquipmentChoices } from "./modifiers.js";
import { traitPoints } from "./cost.js";
import { totals, cashSpent, disadvantageTally, egoTraitIndex, DEFAULT_SETTINGS } from "./state.js";

/** A payload the caller may mutate freely. */
const clone = (value) => structuredClone(value);

/** Collected side effects worth telling the player about after an export. */
const report = () => ({ priceAdjustments: [], notes: [] });

const choicesFor = (build, scope) => build.modifierChoices?.[scope];

// --- traits ----------------------------------------------------------------

function packageTraits(build, cat) {
  const out = [];
  const bg = cat.packages.backgrounds.find((b) => b.key === build.background);
  if (bg) out.push(applyChoices(clone(bg.payload), choicesFor(build, `bg:${bg.key}`)));
  const fac = cat.packages.factions.find((f) => f.key === build.faction);
  if (fac) out.push(applyChoices(clone(fac.payload), choicesFor(build, `fac:${fac.key}`)));
  return out;
}

function repTraits(build, cat) {
  const out = [];
  for (const [key, level] of Object.entries(build.repnets)) {
    if (!level) continue;
    const entry = cat.packages.repnets.find((r) => r.key === key);
    if (!entry) continue;
    const row = clone(entry.payload);
    row.levels = level;
    row.can_level = true;
    out.push(row);
  }
  return out;
}

function morphTraits(build, cat, log) {
  if (!build.morph) return [];
  const entry = cat.morphIndex.find((m) => m.key === build.morph.key);
  const payload = cat.morphs.get(build.morph.key);
  if (!entry || !payload) return [];

  const morph = applyChoices(clone(payload), choicesFor(build, `morph:${entry.key}`));
  const slots = aptitudeSlots(morph);
  applyAptitudes(morph, build.morph.aptitudes || []);

  if (build.options.normalizeMorphPrice) {
    const change = normalizeMorphPrice(morph, entry.points);
    if (change) log.priceAdjustments.push({ morph: entry.name, target: entry.points, ...change });
    else if (!entry.priced) {
      log.notes.push(
        `The ${entry.name} carries no Morph Price Adjustment, so it cannot be re-priced: ` +
        `GCS will charge its full package value of ${entry.points} points.`,
      );
    }
  }
  if (slots.length && !(build.morph.aptitudes || []).some((a) => a >= 0)) {
    log.notes.push(
      `The ${entry.name} has ${slots.length} customization slot${slots.length > 1 ? "s" : ""} with nothing selected.`,
    );
  }
  return [morph];
}

function augTraitRows(build, cat) {
  const out = [];
  if (!cat.augs) return out; // catalogue not fetched yet; the panel fills in later
  for (const chosen of build.augTraits) {
    const entry = cat.augs.traits.find((t) => t.key === chosen.key);
    if (!entry) continue;
    const row = applyChoices(clone(entry.payload), choicesFor(build, `aug:${entry.key}`));
    if (!chosen.offset) {
      out.push(row);
      continue;
    }
    // Augmentations are morph-side: bought with cash, not character points.
    // Pairing the trait with a matching negative keeps the mechanics while
    // leaving the point total alone, the same bookkeeping the libraries use
    // for morphs themselves.
    const cost = traitPoints(row);
    out.push(
      traitGroup(
        entry.name,
        [
          row,
          authorTrait({
            name: "Augmentation Price Adjustment",
            points: -cost,
            tags: ["Disadvantage", "Morph"],
            notes:
              "Installed augmentation, paid for with money rather than character points " +
              `(Character Creation, Step 7). This adjustment cancels the ${cost}-point trait cost.`,
          }),
        ],
        `${entry.name}: installed augmentation. ${entry.notes || ""}`.trim(),
      ),
    );
  }
  return out;
}

function museTraits(build) {
  if (build.muse !== "ally") return [];
  return [
    authorTrait({
      name: "Muse (Ally)",
      points: 5,
      reference: "B36",
      tags: ["Advantage", "Social"],
      notes:
        "Personal AI, constant companion since childhood. Built on 25% of the character's " +
        "points, appears almost all the time. Handles scheduling, mesh traffic and AR " +
        "filtering; on overwatch it rolls as a complementary skill against intrusion or " +
        "contests an intruder directly at skill 12.",
    }),
  ];
}

function psiTraits(build, cat) {
  if (!build.psi.enabled || !cat.sleights) return [];
  const rows = [];
  const core = new Map(cat.sleights.core.map((c) => [c.name, c]));

  const infection = core.get("Watts-MacLeod Infection");
  if (infection) rows.push(clone(infection.payload));

  if (build.psi.talent > 0) {
    const talent = core.get("Async Talent");
    if (talent) {
      const row = clone(talent.payload);
      row.levels = build.psi.talent;
      row.can_level = true;
      rows.push(row);
    }
  }
  if (build.psi.disorders.trim()) {
    rows.push(
      authorTrait({
        name: "Watts-MacLeod Disorders",
        notes: `${build.psi.disorders.trim()}\n\nMandatory disorders carried by the Infection, ` +
          "chosen with the GM. These fall outside the campaign disadvantage limit; price them " +
          "with the GM and record the individual traits here.",
        tags: ["Disadvantage", "Mental"],
      }),
    );
  }

  const all = new Map(cat.sleights.groups.flatMap((g) => g.items.map((i) => [i.key, i])));
  for (const chosen of build.psi.sleights) {
    const entry = all.get(chosen.key);
    if (!entry) continue;
    const row = applyChoices(clone(entry.payload), choicesFor(build, `psi:${entry.key}`));
    const alt = (row.modifiers || []).find((m) => m.name === "Alternative Ability");
    if (alt) alt.disabled = !(chosen.alternate && entry.can_alternate);
    rows.push(row);
  }
  return rows;
}

/** Setting traits and derangements taken from the libraries. */
function egoTraitRows(build, cat) {
  if (!cat.egoTraits) return [];
  const index = egoTraitIndex(cat);
  return build.egoTraits
    .map((chosen) => index.get(chosen.key))
    .filter(Boolean)
    .map((entry) => applyChoices(clone(entry.payload), choicesFor(build, `ego:${entry.key}`)));
}

/** Advantages, disadvantages and quirks the player entered by hand. */
function customTraitRows(build) {
  return build.customTraits.map((t) => {
    const row = authorTrait({
      name: t.name,
      notes: t.notes || "",
      reference: t.reference || "",
      tags: t.tags?.length
        ? [...t.tags]
        : [(t.points || 0) < 0 ? "Disadvantage" : "Advantage", t.kind === "physical" ? "Physical" : "Mental"],
    });
    if (t.levelled) {
      row.can_level = true;
      row.points_per_level = t.pointsPerLevel || 0;
      row.levels = t.levels || 0;
      if (t.basePoints) row.base_points = t.basePoints;
    } else if (t.points) {
      row.base_points = t.points;
    }
    if (t.cr) row.cr = t.cr;
    return row;
  });
}

// --- skills ----------------------------------------------------------------

function skillRows(build, cat) {
  const rows = [];
  const epIndex = new Map(cat.epSkills.groups.flatMap((g) => g.items.map((i) => [i.key, i])));
  const sleightSkills = new Map(
    cat.sleights
      ? cat.sleights.groups
          .flatMap((g) => g.items)
          .filter((i) => i.skill_payload)
          .map((i) => [i.skill, i.skill_payload])
      : [],
  );

  for (const entry of build.skills) {
    if (entry.source === "ep") {
      const lib = epIndex.get(entry.key);
      if (lib) {
        const row = clone(lib.payload);
        row.points = entry.points;
        if (entry.specialization) row.specialization = entry.specialization;
        if (entry.replacement) {
          row.replacements = { ...(row.replacements || {}) };
          for (const key of Object.keys(row.replacements)) {
            row.replacements[key] = entry.replacement;
          }
        }
        rows.push(row);
        continue;
      }
    }
    if (entry.source === "psi") {
      const payload = sleightSkills.get(entry.name);
      if (payload) {
        const row = clone(payload);
        row.points = entry.points;
        rows.push(row);
        continue;
      }
    }
    rows.push(
      authorSkill({
        name: entry.name,
        specialization: entry.specialization || "",
        difficulty: entry.difficulty,
        points: entry.points,
        notes: entry.notes || "",
        techLevel: entry.techLevel ?? null,
      }),
    );
  }
  return rows;
}

// --- equipment -------------------------------------------------------------

function equipmentRow(payload, item, choices, extraNote = "") {
  const row = applyEquipmentChoices(clone(payload), choices);
  row.quantity = item.qty || 1;
  row.equipped = item.equipped !== false;
  if (extraNote) {
    row.local_notes = [row.local_notes, extraNote].filter(Boolean).join(" ");
  }
  return row;
}

/** Carried equipment and stowed equipment, as GCS's two separate lists. */
function equipmentRows(build, cat) {
  const carried = [];
  const other = [];

  const augIndex = new Map((cat.augs?.equipment || []).map((e) => [e.key, e]));
  for (const item of build.augEquipment) {
    const entry = augIndex.get(item.key);
    if (!entry) continue;
    // An installed augmentation is part of the body, so it is always carried
    // and never weighs anything against encumbrance.
    carried.push(
      equipmentRow(entry.payload, { ...item, equipped: true },
        choicesFor(build, `augeq:${entry.key}`), "Installed augmentation."),
    );
  }

  const gearIndex = new Map(
    (cat.gear?.categories || []).flatMap((c) => c.items.map((i) => [i.key, i])),
  );
  for (const item of build.gear) {
    const entry = gearIndex.get(item.key);
    if (!entry) continue;
    const row = equipmentRow(entry.payload, item, choicesFor(build, `gear:${entry.key}`));
    (item.stowed ? other : carried).push(row);
  }
  return { carried, other };
}

// --- assembly --------------------------------------------------------------

/**
 * Build the rows a sheet will carry, without touching ids.
 * @returns {{traits, skills, carried, other, log}}
 */
export function assemble(build, cat) {
  const log = report();
  const traits = [
    ...packageTraits(build, cat),
    ...repTraits(build, cat),
    ...morphTraits(build, cat, log),
    ...augTraitRows(build, cat),
    ...museTraits(build),
    ...psiTraits(build, cat),
    ...egoTraitRows(build, cat),
    ...customTraitRows(build),
  ];
  const { carried, other } = equipmentRows(build, cat);
  return { traits, skills: skillRows(build, cat), carried, other, log };
}

// --- notes -----------------------------------------------------------------

function summaryNote(build, cat, log) {
  const t = totals(build, cat);
  const dis = disadvantageTally(build, cat);
  const morph = cat.morphIndex.find((m) => m.key === build.morph?.key);
  const bg = cat.packages.backgrounds.find((b) => b.key === build.background);
  const fac = cat.packages.factions.find((f) => f.key === build.faction);
  const rep = Object.entries(build.repnets)
    .filter(([, level]) => level > 0)
    .map(([key, level]) => {
      const entry = cat.packages.repnets.find((r) => r.key === key);
      return `${entry ? entry.code : key} ${level}`;
    });

  const lines = [
    "# Eclipse Phase build notes",
    "",
    `Background: ${bg ? bg.name : "none"}`,
    `Faction: ${fac ? fac.name : "unaffiliated"}`,
    `Reputation: ${rep.length ? rep.join(", ") : "none"}`,
    `Morph: ${morph ? `${morph.name} (${morph.category}, ${morph.cp} CP, ${morph.points} pts)` : "none"}`,
    `Muse: ${build.muse === "ally" ? "purchased as an Ally [5]" : "setting conceit, 0 points"}`,
    `Async: ${build.psi.enabled ? `yes, Async Talent ${build.psi.talent}` : "no"}`,
    "",
    `Points: ${t.spent} of ${t.total} spent, ${t.remaining} remaining.`,
    `Mental and social disadvantages: ${dis.total} of −50 allowed.`,
    `Equipment: $${cashSpent(build, cat).toLocaleString()} of $${build.startingWealth.toLocaleString()}.`,
  ];

  if (log.priceAdjustments.length) {
    lines.push(
      "",
      "## Morph price adjustment",
      "",
      ...log.priceAdjustments.map(
        (p) =>
          `${p.morph}: the price adjustment trait was re-pointed from ${p.from} to ${p.to} ` +
          `so the morph totals its documented chargen price of ${p.target} points. ` +
          `Without the correction GCS computes ${p.target - p.delta}.`,
      ),
    );
  }
  if (build.notes.trim()) lines.push("", "## Player notes", "", build.notes.trim());

  lines.push(
    "",
    "## Reminders",
    "",
    "- ST, HT, HP and FP come from the morph. Never buy them on the Ego.",
    "- Every resleeve rolls Professional Skill (Resleeving) twice against the new morph's HT: HT-based for Integration, IQ-based for Alienation, then a Will roll for Continuity.",
    "- The Morph Price Adjustment appears in the GCS disadvantage total but does not count against the −50 limit.",
  );
  return lines.join("\n");
}

// --- the sheet -------------------------------------------------------------

/**
 * Assemble the whole sheet and give every row a fresh id.
 * @returns {{entity: object, log: object}}
 */
export function buildSheet(build, cat) {
  const { traits, skills, carried, other, log } = assemble(build, cat);

  const entity = buildEntity({
    profile: Object.fromEntries(
      Object.entries(build.profile).filter(([, v]) => String(v ?? "").trim() !== ""),
    ),
    totalPoints: build.totalPoints,
    attributes: build.attributes,
    attributeDefs: cat.attrDefs,
    settings: { ...DEFAULT_SETTINGS, ...build.settings },
    traits: traits.map(adopt),
    skills: skills.map(adopt),
    equipment: carried.map(adopt),
    otherEquipment: other.map(adopt),
    notes: build.options.includeBuildNote ? [summaryNote(build, cat, log)] : [],
  });

  return { entity, log };
}

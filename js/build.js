// Turns a wizard build into a GCS entity.
//
// Anything that came out of a library is copied through `adopt` so the sheet
// carries the same features, prerequisites, weapons and modifiers GCS would
// have attached had the player dragged the row in by hand.

import {
  adopt,
  aptitudeSlots,
  applyAptitudes,
  buildEntity,
  equipmentFrom,
  normalizeMorphPrice,
  skill as authorSkill,
  trait as authorTrait,
  traitGroup,
} from "./gcs.js";
import { traitPoints } from "./cost.js";
import { totals, cashSpent, disadvantageTally } from "./state.js";

/** Collected side effects worth telling the player about after an export. */
function report() {
  return { priceAdjustments: [], notes: [] };
}

function repTraits(build, cat) {
  const out = [];
  for (const [key, level] of Object.entries(build.repnets)) {
    if (!level) continue;
    const entry = cat.packages.repnets.find((r) => r.key === key);
    if (!entry) continue;
    const row = adopt(entry.payload);
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

  const morph = adopt(payload);
  const slots = aptitudeSlots(morph);
  applyAptitudes(morph, build.morph.aptitudes || []);

  if (build.options.normalizeMorphPrice) {
    const change = normalizeMorphPrice(morph, entry.points);
    if (change) {
      log.priceAdjustments.push({
        morph: entry.name,
        target: entry.points,
        was: entry.points - change.delta,
        ...change,
      });
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
  for (const chosen of build.augTraits) {
    const entry = cat.augs.traits.find((t) => t.key === chosen.key);
    if (!entry) continue;
    const row = adopt(entry.payload);
    if (!chosen.offset) {
      out.push(row);
      continue;
    }
    // Augmentations are morph-side: bought with cash, not character points.
    // Pairing the trait with a matching negative keeps the mechanics while
    // leaving the point total alone, the same bookkeeping the libraries use
    // for morphs themselves.
    const cost = traitPoints(entry.payload);
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
              `Installed augmentation, paid for with money rather than character points ` +
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
  if (!build.psi.enabled) return [];
  const rows = [];
  const core = new Map(cat.sleights.core.map((c) => [c.name, c]));

  const infection = core.get("Watts-MacLeod Infection");
  if (infection) rows.push(adopt(infection.payload));

  if (build.psi.talent > 0) {
    const talent = core.get("Async Talent");
    if (talent) {
      const row = adopt(talent.payload);
      row.levels = build.psi.talent;
      row.can_level = true;
      rows.push(row);
    }
  }
  if (build.psi.disorders.trim()) {
    rows.push(
      authorTrait({
        name: "Watts-MacLeod Disorders",
        notes: build.psi.disorders.trim() +
          "\n\nMandatory disorders carried by the Infection, chosen with the GM. These fall " +
          "outside the campaign disadvantage limit; price them with the GM and record the " +
          "individual traits here.",
        tags: ["Disadvantage", "Mental"],
      }),
    );
  }

  const all = new Map(cat.sleights.groups.flatMap((g) => g.items.map((i) => [i.key, i])));
  for (const chosen of build.psi.sleights) {
    const entry = all.get(chosen.key);
    if (!entry) continue;
    const row = adopt(entry.payload);
    const alt = (row.modifiers || []).find((m) => m.name === "Alternative Ability");
    if (alt) alt.disabled = !(chosen.alternate && entry.can_alternate);
    rows.push(row);
  }
  return rows;
}

function skillRows(build, cat) {
  const rows = [];
  const epIndex = new Map(
    cat.epSkills.groups.flatMap((g) => g.items.map((i) => [i.key, i])),
  );
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
        const row = adopt(lib.payload);
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
        const row = adopt(payload);
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

function equipmentRows(build, cat) {
  const rows = [];
  const augIndex = new Map(cat.augs.equipment.map((e) => [e.key, e]));
  for (const item of build.augEquipment) {
    const entry = augIndex.get(item.key);
    if (!entry) continue;
    const row = equipmentFrom(entry.payload, item.qty || 1);
    row.local_notes = [row.local_notes, "Installed augmentation."]
      .filter(Boolean)
      .join(" ");
    rows.push(row);
  }
  const gearIndex = new Map(
    cat.gear.categories.flatMap((c) => c.items.map((i) => [i.key, i])),
  );
  for (const item of build.gear) {
    const entry = gearIndex.get(item.key);
    if (entry) rows.push(equipmentFrom(entry.payload, item.qty || 1));
  }
  return rows;
}

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

/**
 * Assemble the whole sheet.
 * @returns {{entity: object, log: object}}
 */
export function buildSheet(build, cat) {
  const log = report();

  const traits = [
    ...(() => {
      const bg = cat.packages.backgrounds.find((b) => b.key === build.background);
      return bg ? [adopt(bg.payload)] : [];
    })(),
    ...(() => {
      const fac = cat.packages.factions.find((f) => f.key === build.faction);
      return fac ? [adopt(fac.payload)] : [];
    })(),
    ...repTraits(build, cat),
    ...morphTraits(build, cat, log),
    ...augTraitRows(build, cat),
    ...museTraits(build),
    ...psiTraits(build, cat),
    ...build.customTraits.map((t) =>
      authorTrait({
        name: t.name,
        points: t.points || 0,
        notes: t.notes || "",
        tags: [t.points < 0 ? "Disadvantage" : "Advantage", t.kind === "physical" ? "Physical" : "Mental"],
      }),
    ),
  ];

  const entity = buildEntity({
    profile: Object.fromEntries(
      Object.entries(build.profile).filter(([, v]) => String(v).trim() !== ""),
    ),
    totalPoints: build.totalPoints,
    attributes: build.attributes,
    attributeDefs: cat.attrDefs,
    traits,
    skills: skillRows(build, cat),
    equipment: equipmentRows(build, cat),
    notes: build.options.includeBuildNote ? [summaryNote(build, cat, log)] : [],
  });

  return { entity, log };
}

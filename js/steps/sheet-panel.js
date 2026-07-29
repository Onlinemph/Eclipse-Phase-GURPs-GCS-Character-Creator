// The sheet panel: the character laid out the way GCS lays it out.
//
// Rendered into the sidebar on every step, and in full on the review step, so
// the effect of a choice is visible where it is made rather than at the end.

import { el, details, money, clear } from "../ui.js";
import { computeSheet } from "../sheet.js";

const ATTR_ROWS = [
  ["st", "ST"], ["dx", "DX"], ["iq", "IQ"], ["ht", "HT"],
  ["will", "Will"], ["per", "Per"],
];
const POOL_ROWS = [["hp", "HP"], ["fp", "FP"]];

const num = (n) => (n === undefined || n === null ? "—" : String(n));
const signed = (n) => (n > 0 ? `+${n}` : String(n));

const current = (sheet) =>
  sheet.encumbrance.find((e) => e.current) || sheet.encumbrance[0];

/** The compact panel that lives beside every step. */
export function sidebarSheet(build, cat) {
  let sheet;
  try {
    sheet = computeSheet(build, cat);
  } catch {
    return el("div.sheet-mini", el("p.muted.small", "Sheet unavailable until the catalogues load."));
  }

  const { values, points } = sheet;
  const morphless = (id) => (["st", "ht", "hp", "fp"].includes(id) && !sheet.embodied ? ".dim" : "");

  return el("div.sheet-mini",
    el("div.sheet-mini-grid",
      [...ATTR_ROWS, ...POOL_ROWS].map(([id, label]) =>
        el(`div.stat${morphless(id)}`,
          el("span.stat-label", label),
          el("span.stat-value", num(values[id])),
        ),
      ),
      el("div.stat", el("span.stat-label", "Speed"), el("span.stat-value", num(values.basic_speed))),
      el("div.stat", el("span.stat-label", "Move"), el("span.stat-value", num(current(sheet).move))),
      el("div.stat", el("span.stat-label", "Dodge"), el("span.stat-value", num(current(sheet).dodge))),
      el("div.stat", el("span.stat-label", "BL"), el("span.stat-value", String(sheet.lift.basic))),
    ),
    sheet.embodied
      ? el("p.sheet-mini-damage", `thr ${sheet.damage.thrust} · sw ${sheet.damage.swing}`)
      : el("p.sheet-mini-damage.dim", "no morph attached"),
    el("p.sheet-mini-points", `${points.spent} / ${points.total} points`),
  );
}

/** The full sheet, for the review step. */
export function fullSheet(build, cat) {
  const sheet = computeSheet(build, cat);
  const { values, resolved } = sheet;

  return el("section.card.sheet",
    el("h3", "Character sheet"),
    el("p.muted.small",
      "Computed from the rows that will be written to the file, using the same feature " +
      "resolution GCS applies when it opens a sheet.",
    ),

    el("div.sheet-grid",
      el("div.sheet-col",
        el("h4", "Attributes"),
        el("table.table.compact",
          el("tbody",
            [...ATTR_ROWS, ...POOL_ROWS].map(([id, label]) =>
              el("tr",
                el("th", label),
                el("td.num", num(values[id])),
                el("td.muted.small", bonusNote(resolved.bonuses[id])),
              ),
            ),
            el("tr", el("th", "Basic Speed"), el("td.num", num(values.basic_speed)), el("td")),
            el("tr", el("th", "Basic Move"), el("td.num", num(values.basic_move)), el("td")),
            el("tr", el("th", "Fright Check"), el("td.num", num(values.fright_check)), el("td")),
          ),
        ),
        strengthNote(resolved.strength),
      ),

      el("div.sheet-col",
        el("h4", "Damage & lifting"),
        el("table.table.compact",
          el("tbody",
            el("tr", el("th", "Thrust"), el("td.num", sheet.damage.thrust)),
            el("tr", el("th", "Swing"), el("td.num", sheet.damage.swing)),
            el("tr", el("th", "Basic Lift"), el("td.num", `${sheet.lift.basic} lb`)),
            el("tr", el("th", "One-handed lift"), el("td.num", `${sheet.lift.oneHanded} lb`)),
            el("tr", el("th", "Two-handed lift"), el("td.num", `${sheet.lift.twoHanded} lb`)),
            el("tr", el("th", "Shove & knock over"), el("td.num", `${sheet.lift.shove} lb`)),
            el("tr", el("th", "Carry on back"), el("td.num", `${sheet.lift.carryOnBack} lb`)),
          ),
        ),
      ),

      el("div.sheet-col",
        el("h4", "Encumbrance, move & dodge"),
        el("table.table.compact",
          el("thead",
            el("tr", el("th", "Level"), el("th", "Max load"), el("th", "Move"), el("th", "Dodge")),
          ),
          el("tbody",
            sheet.encumbrance.map((e) =>
              el(`tr${e.current ? ".current-enc" : ""}`,
                el("th", `${e.label}${e.penalty ? ` (${e.penalty})` : ""}`),
                el("td.num", `${e.maxLoad} lb`),
                el("td.num", String(e.move)),
                el("td.num", String(e.dodge)),
              ),
            ),
          ),
        ),
        el("p.muted.small", `Carrying ${sheet.weightCarried} lb.`),
      ),
    ),

    sheet.weapons.melee.length || sheet.weapons.ranged.length
      ? el("div",
          el("h4", "Attacks"),
          el("p.muted.small",
            "Skill levels resolve against the character's own skills; damage folds in the " +
            "morph's strength where the weapon is muscle-powered. Unequipping an item takes it " +
            "off these lines without removing it from the equipment list.",
          ),
          sheet.weapons.melee.length
            ? el("div",
                el("p.table-label", `Melee (${sheet.weapons.melee.length})`),
                weaponTable(sheet.weapons.melee, MELEE_COLUMNS),
              )
            : null,
          sheet.weapons.ranged.length
            ? el("div",
                el("p.table-label", `Ranged (${sheet.weapons.ranged.length})`),
                weaponTable(sheet.weapons.ranged, RANGED_COLUMNS),
              )
            : null,
        )
      : null,

    sheet.dr.length
      ? el("div",
          el("h4", "Damage resistance"),
          el("table.table.compact",
            el("thead", el("tr", el("th", "Location"), el("th", "DR"), el("th", ""))),
            el("tbody",
              sheet.dr.map((row) =>
                el("tr",
                  el("th", row.label),
                  el("td.num", String(row.value)),
                  el("td.muted.small", row.extra),
                ),
              ),
            ),
          ),
        )
      : el("p.muted.small", "No damage resistance from any trait yet."),

    sheet.skills.length
      ? details(`Skill levels (${sheet.skills.length})`,
          el("table.table.compact",
            el("thead",
              el("tr",
                el("th", "Skill"), el("th", "Difficulty"), el("th", "Points"), el("th", "Level"),
              ),
            ),
            el("tbody",
              sheet.skills.map((s) =>
                el("tr",
                  el("td",
                    s.name,
                    s.specialization ? el("span.muted", ` (${s.specialization})`) : null,
                  ),
                  el("td.muted", s.difficulty),
                  el("td.num", String(s.points)),
                  el("td.num",
                    s.level === null ? (s.technique ? "technique" : "—") : String(s.level),
                    s.bonus ? el("span.muted.small", ` (${signed(s.bonus)})`) : null,
                  ),
                ),
              ),
            ),
          ),
        )
      : null,

    resolved.reactions.length || resolved.conditionals.length
      ? details(
          `Reaction & conditional modifiers (${resolved.reactions.length + resolved.conditionals.length})`,
          el("table.table.compact",
            el("tbody",
              [...resolved.reactions, ...resolved.conditionals].map((r) =>
                el("tr",
                  el("td.num", signed(r.amount)),
                  el("td", r.situation),
                  el("td.muted.small", r.source),
                ),
              ),
            ),
          ),
        )
      : null,

    el("p.muted.small",
      `${sheet.traitCount} trait rows, ${sheet.skills.length} skills, ` +
      `${sheet.carriedCount} carried and ${sheet.otherCount} stowed items, ` +
      `${money(sheet.cash)} spent.`,
    ),
  );
}

// The columns a GURPS sheet prints for each kind of attack.
const MELEE_COLUMNS = [
  ["Weapon", (w) => weaponName(w)],
  ["Level", (w) => levelCell(w)],
  ["Damage", (w) => w.damage],
  ["Reach", (w) => w.reach],
  ["Parry", (w) => w.parry],
  ["ST", (w) => w.strength],
];

const RANGED_COLUMNS = [
  ["Weapon", (w) => weaponName(w)],
  ["Level", (w) => levelCell(w)],
  ["Damage", (w) => w.damage],
  ["Acc", (w) => w.accuracy],
  ["Range", (w) => w.range],
  ["RoF", (w) => w.rof],
  ["Shots", (w) => w.shots],
  ["Bulk", (w) => w.bulk],
  ["Rcl", (w) => w.recoil],
  ["ST", (w) => w.strength],
];

function weaponName(w) {
  return el("span",
    w.name,
    // A sword swung and a sword thrust are two lines with the same name.
    w.usage ? el("span.muted", ` — ${w.usage}`) : null,
    w.origin === "trait" ? el("span.tag", "natural") : null,
  );
}

function levelCell(w) {
  if (w.level === null) return el("span.muted", "—");
  return el("span",
    String(w.level),
    el("span.muted.small", ` ${w.levelFrom}`),
    w.shortfall
      ? el("span.warn-text", ` −${w.shortfall} ST`)
      : null,
  );
}

function weaponTable(rows, columns) {
  return el("div.scroll-x",
    el("table.table.compact",
      el("thead", el("tr", columns.map(([label]) => el("th", label)))),
      el("tbody",
        rows.map((w) =>
          el("tr", columns.map(([, get], i) =>
            el(i === 0 ? "td" : "td.num", get(w) ?? ""),
          )),
        ),
      ),
    ),
  );
}

function bonusNote(bonus) {
  return bonus ? `${signed(bonus)} from traits` : "";
}

function strengthNote(strength) {
  const parts = [];
  if (strength.striking !== strength.base) parts.push(`striking ${strength.striking}`);
  if (strength.lifting !== strength.base) parts.push(`lifting ${strength.lifting}`);
  if (strength.throwing !== strength.base) parts.push(`throwing ${strength.throwing}`);
  if (!parts.length) return null;
  return el("p.muted.small", `ST is split: ${parts.join(", ")}.`);
}

/** Refresh a sidebar container in place. */
export function renderSidebarSheet(container, build, cat) {
  clear(container).append(sidebarSheet(build, cat));
}

// Advantages, disadvantages and quirks the packages do not cover.
//
// The background and faction packages carry most of a character's traits, but
// GURPS characters are built out of traits generally, and a builder that only
// offers packages cannot express "Combat Reflexes" or "Bad Temper". This step
// takes any trait by name, prices it the way GCS prices it, and puts it on the
// sheet with the right tags.

import {
  el, field, textInput, numberInput, select, checkbox, button, details, notice, clear,
} from "../ui.js";
import { customTraitCost, DISADVANTAGE_LIMIT, disadvantageTally } from "../state.js";

// Self-control rolls multiply a disadvantage's cost (B121). GCS keys them by
// the number you roll against.
const SELF_CONTROL = [
  { value: 0, label: "None" },
  { value: 6, label: "6 — resist rarely (×2)" },
  { value: 9, label: "9 — resist occasionally (×1.5)" },
  { value: 12, label: "12 — resist usually (×1)" },
  { value: 15, label: "15 — resist almost always (×0.5)" },
];

// A starting point rather than a catalogue: the traits that come up most in
// Eclipse Phase play, with the cost the conversion's documents imply.
const SUGGESTED = [
  { group: "Worth having in this setting", traits: [
    { name: "Combat Reflexes", points: 15, kind: "mental",
      notes: "The only real improvement to Dodge available to an Ego, since Fray is not a skill." },
    { name: "Eidetic Memory", points: 5, kind: "mental" },
    { name: "Photographic Memory", points: 10, kind: "mental" },
    { name: "Language Talent", points: 10, kind: "mental" },
    { name: "Single-Minded", points: 5, kind: "mental" },
    { name: "Versatile", points: 5, kind: "mental" },
    { name: "Fearlessness", points: 2, kind: "mental", levelled: true, pointsPerLevel: 2, levels: 1 },
    { name: "Danger Sense", points: 15, kind: "mental" },
    { name: "Common Sense", points: 10, kind: "mental" },
    { name: "Intuition", points: 15, kind: "mental" },
    { name: "Contact Group", points: 10, kind: "social" },
    { name: "Patron", points: 10, kind: "social" },
    { name: "Wealth (Comfortable)", points: 10, kind: "social" },
    { name: "Wealth (Wealthy)", points: 20, kind: "social" },
    { name: "Status", points: 5, kind: "social", levelled: true, pointsPerLevel: 5, levels: 1 },
    { name: "Cultural Familiarity", points: 1, kind: "mental" },
    { name: "Languages", points: 2, kind: "mental" },
  ] },
  { group: "Disadvantages the setting produces", traits: [
    { name: "Nightmares", points: -5, kind: "mental", cr: 12,
      notes: "The commonest legacy of the Fall, and of a bad resleeve." },
    { name: "Flashbacks", points: -5, kind: "mental" },
    { name: "Phobia (Vacuum)", points: -15, kind: "mental", cr: 12 },
    { name: "Phobia (Being Forked)", points: -10, kind: "mental", cr: 12 },
    { name: "Paranoia", points: -10, kind: "mental" },
    { name: "Obsession", points: -10, kind: "mental", cr: 12 },
    { name: "Bad Temper", points: -10, kind: "mental", cr: 12 },
    { name: "Callous", points: -5, kind: "mental" },
    { name: "Curious", points: -5, kind: "mental", cr: 12 },
    { name: "Overconfidence", points: -5, kind: "mental", cr: 12 },
    { name: "Secret", points: -10, kind: "social" },
    { name: "Enemy", points: -10, kind: "social" },
    { name: "Duty", points: -10, kind: "social" },
    { name: "Sense of Duty", points: -5, kind: "social" },
    { name: "Social Stigma", points: -10, kind: "social" },
    { name: "Debt", points: -1, kind: "social", levelled: true, pointsPerLevel: -1, levels: 5,
      notes: "Indentures start here." },
    { name: "Delusion", points: -5, kind: "mental" },
    { name: "Chummy", points: -5, kind: "mental" },
    { name: "Loner", points: -5, kind: "mental", cr: 12 },
    { name: "Unluckiness", points: -10, kind: "mental" },
  ] },
];

const blankDraft = () => ({
  name: "",
  points: 0,
  kind: "mental",
  cr: 0,
  levelled: false,
  basePoints: 0,
  pointsPerLevel: 0,
  levels: 1,
  reference: "",
  notes: "",
});

export default {
  title: "Traits",
  subtitle: "Anything the background and faction packages do not already cover.",

  render(ctx) {
    const { build, cat, update } = ctx;
    const dis = disadvantageTally(build, cat);

    const add = (trait) => update((b) => {
      b.customTraits.push({ ...blankDraft(), ...trait });
    });

    return el("div.stack",
      el("section.card",
        el("p",
          "Backgrounds and factions bring their own traits. This step is for everything else: " +
          "the advantage a concept needs, the disadvantage a player wants, the quirks that make " +
          "a character specific. Each one is priced through the same engine as the rest of the " +
          "sheet, self-control rolls included.",
        ),
        notice(dis.total < DISADVANTAGE_LIMIT ? "error" : "info",
          `Mental and social disadvantages currently total ${dis.total}. The limit is ` +
          `${DISADVANTAGE_LIMIT}; physical disadvantages belong to the morph and do not count.`,
        ),
      ),

      chosen(build, update),
      suggestions(build, add),
      customForm(add),
    );
  },
};

function chosen(build, update) {
  if (!build.customTraits.length) {
    return el("section.card",
      el("h3", "On the sheet"),
      el("p.muted", "Nothing yet."),
    );
  }
  const total = build.customTraits.reduce((sum, t) => sum + customTraitCost(t), 0);

  // Like the attributes step: the cost beside each field is refreshed straight
  // from the input, because typing does not re-render the step body.
  const costCells = new Map();
  const heading = el("h3", `On the sheet (${build.customTraits.length}, ${total} points)`);

  const refreshCosts = () => {
    for (const [index, cell] of costCells) {
      const cost = customTraitCost(build.customTraits[index]);
      cell.textContent = String(cost);
      cell.classList.toggle("negative", cost < 0);
    }
    const now = build.customTraits.reduce((sum, t) => sum + customTraitCost(t), 0);
    heading.textContent = `On the sheet (${build.customTraits.length}, ${now} points)`;
  };

  const set = (index, key, value) => {
    update((b) => { b.customTraits[index][key] = value; });
    refreshCosts();
  };

  return el("section.card",
    heading,
    el("table.table",
      el("thead",
        el("tr",
          el("th", "Trait"), el("th", "Kind"), el("th", "Cost"),
          el("th", "Self-control"), el("th", "Points"), el("th", ""),
        ),
      ),
      el("tbody",
        build.customTraits.map((trait, index) =>
          el("tr",
            el("td",
              textInput(trait.name, (v) => set(index, "name", v), { class: "inline-input" }),
              trait.notes ? el("p.muted.small", trait.notes) : null,
            ),
            el("td",
              select(
                [
                  { value: "mental", label: "Mental" },
                  { value: "social", label: "Social" },
                  { value: "physical", label: "Physical (morph)" },
                ],
                trait.kind,
                (v) => set(index, "kind", v),
              ),
            ),
            el("td",
              trait.levelled
                ? el("div.row",
                    numberInput(trait.pointsPerLevel, (v) => set(index, "pointsPerLevel", v ?? 0),
                      { class: "tiny-input", title: "points per level" }),
                    el("span.muted", "×"),
                    numberInput(trait.levels, (v) => set(index, "levels", v ?? 0),
                      { class: "tiny-input", min: 0, title: "levels" }),
                  )
                : numberInput(trait.points, (v) => set(index, "points", v ?? 0),
                    { class: "tiny-input", step: 1 }),
            ),
            el("td",
              select(SELF_CONTROL.map((c) => ({ value: c.value, label: c.label })),
                trait.cr || 0, (v) => set(index, "cr", Number(v))),
            ),
            costCell(index, trait, costCells),
            el("td",
              el("div.row",
                checkbox("levelled", trait.levelled, (v) => set(index, "levelled", v)),
                button("Remove", () => update((b) => { b.customTraits.splice(index, 1); }), "ghost"),
              ),
            ),
          ),
        ),
      ),
    ),
    el("p.muted.small",
      "Physical traits are morph-side: they stay out of the −50 disadvantage tally, the same " +
      "way a morph's own disadvantages do.",
    ),
  );
}

/** The per-row cost cell, kept so typing can refresh it in place. */
function costCell(index, trait, cells) {
  const cost = customTraitCost(trait);
  const cell = el("td.num" + (cost < 0 ? ".negative" : ""), String(cost));
  cells.set(index, cell);
  return cell;
}

function suggestions(build, add) {
  const taken = new Set(build.customTraits.map((t) => t.name));
  return el("section.card",
    el("h3", "Common choices"),
    el("p.muted.small",
      "A starting point, not a catalogue. Costs are the Basic Set's; adjust any of them after " +
      "adding, and use the form below for anything not listed.",
    ),
    SUGGESTED.map((group) =>
      el("div",
        el("h4.pick-group", group.group),
        el("div.chip-row",
          group.traits.map((trait) =>
            el(`button.chip${taken.has(trait.name) ? ".on" : ""}`, {
              type: "button",
              title: trait.notes || "",
              onclick: () => add(trait),
            },
              el("span.chip-name", trait.name),
              el("span.chip-diff",
                trait.levelled ? `${trait.pointsPerLevel}/lvl` : String(trait.points),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

function customForm(add) {
  const draft = blankDraft();
  const body = el("div");

  const draw = () => {
    clear(body).append(
      el("div.grid-3",
        field("Name", textInput(draft.name, (v) => { draft.name = v; })),
        field("Kind", select(
          [
            { value: "mental", label: "Mental" },
            { value: "social", label: "Social" },
            { value: "physical", label: "Physical (morph)" },
          ],
          draft.kind, (v) => { draft.kind = v; },
        )),
        field("Page reference", textInput(draft.reference, (v) => { draft.reference = v; }),
          "e.g. B60"),
        draft.levelled
          ? field("Base points", numberInput(draft.basePoints, (v) => { draft.basePoints = v ?? 0; }))
          : field("Points", numberInput(draft.points, (v) => { draft.points = v ?? 0; }),
              "Negative for a disadvantage."),
        draft.levelled
          ? field("Points per level", numberInput(draft.pointsPerLevel, (v) => { draft.pointsPerLevel = v ?? 0; }))
          : null,
        draft.levelled
          ? field("Levels", numberInput(draft.levels, (v) => { draft.levels = v ?? 0; }, { min: 0 }))
          : null,
        field("Self-control roll", select(
          SELF_CONTROL.map((c) => ({ value: c.value, label: c.label })),
          draft.cr, (v) => { draft.cr = Number(v); },
        )),
      ),
      el("div.row",
        checkbox("This trait has levels", draft.levelled, (v) => { draft.levelled = v; draw(); }),
      ),
      field("Notes", el("textarea", {
        rows: 2, value: draft.notes, oninput: (e) => { draft.notes = e.target.value; },
      })),
      el("div.row",
        button("Add trait", () => {
          if (!draft.name.trim()) return;
          add({ ...draft, name: draft.name.trim() });
          Object.assign(draft, blankDraft());
          draw();
        }, "primary"),
      ),
    );
  };
  draw();

  return el("section.card", details("Add any trait", body));
}

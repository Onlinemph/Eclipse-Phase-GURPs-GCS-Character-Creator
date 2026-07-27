// Pieces used by more than one step.

import { el, filterBox, matches, points, details, checkbox, button } from "../ui.js";
import { traitPoints } from "../cost.js";
import { toggleableRows, isEnabled, summarize } from "../modifiers.js";

/**
 * The modifier editor: the switches GCS puts on every trait.
 *
 * Damage Resistance can be Hardened or a Force Field, Extra Limbs can be Long
 * or Weak, a sleight can be an Alternative Ability. The libraries ship these
 * disabled; toggling them is most of what customizing a GCS character consists
 * of, and the choice changes both the point cost and what the trait does.
 *
 * @param {object} payload the library payload, untouched
 * @param {string} scope where the choice is stored, e.g. "morph:fury"
 * @param {object} build
 * @param {(mutate: Function) => void} update
 */
export function modifierEditor(payload, scope, build, update) {
  const choices = build.modifierChoices?.[scope];
  const rows = toggleableRows(payload);
  if (!rows.length) return null;
  const { available, enabled } = summarize(payload, choices);

  const toggle = (address, index, on) => update((b) => {
    b.modifierChoices[scope] ??= {};
    b.modifierChoices[scope][address] ??= {};
    b.modifierChoices[scope][address][index] = on;
  });

  const reset = () => update((b) => { delete b.modifierChoices[scope]; });

  return details(
    `Modifiers — ${enabled} of ${available} enabled`,
    el("p.muted.small",
      "Each switch changes what the trait does and what it costs, exactly as it would in GCS. " +
      "The library's own defaults apply until you change one.",
    ),
    el("div.pick-list",
      rows.map((row) =>
        el("div.mod-row",
          el("h4.pick-group", row.name),
          el("div.chip-row",
            row.modifiers.map(({ index, mod }) => {
              const on = isEnabled(choices, row.address, index, mod);
              return el(`button.chip${on ? ".on" : ""}`, {
                type: "button",
                title: mod.local_notes || "",
                onclick: () => toggle(row.address, index, !on),
              },
                el("span.chip-name", mod.name),
                mod.cost_adj ? el("span.chip-diff", mod.cost_adj) : null,
              );
            }),
          ),
        ),
      ),
    ),
    choices ? el("div.row", button("Reset to library defaults", reset, "ghost")) : null,
  );
}

/** The same editor for an equipment row, whose modifiers are a flat list. */
export function equipmentModifierEditor(payload, scope, build, update) {
  const modifiers = payload.modifiers || [];
  if (!modifiers.length) return null;
  const choices = build.modifierChoices?.[scope]?.[""] || {};

  return details(
    `Modifiers (${modifiers.length})`,
    el("div.chip-row",
      modifiers.map((mod, index) => {
        const on = choices[index] === undefined ? !mod.disabled : choices[index];
        return el(`button.chip${on ? ".on" : ""}`, {
          type: "button",
          title: mod.local_notes || "",
          onclick: () => update((b) => {
            b.modifierChoices[scope] ??= {};
            b.modifierChoices[scope][""] ??= {};
            b.modifierChoices[scope][""][index] = !on;
          }),
        },
          el("span.chip-name", mod.name),
          mod.cost ? el("span.chip-diff", String(mod.cost)) : null,
        );
      }),
    ),
  );
}

export { checkbox };

/**
 * A grid of selectable package cards (backgrounds, factions).
 *
 * @param {object[]} list catalogue entries with key/name/notes/contents
 * @param {?string} selected currently chosen key
 * @param {(key: ?string) => void} onSelect called with null to clear
 * @param {object} opts {allowNone, noneLabel}
 */
export function packageGrid(list, selected, onSelect, opts = {}) {
  const container = el("div.stack");
  const grid = el("div.card-grid");

  const draw = (query = "") => {
    grid.replaceChildren();
    if (opts.allowNone) {
      grid.append(
        card({
          name: opts.noneLabel || "None",
          notes: opts.noneNote || "",
          cost: 0,
          contents: [],
          active: selected === null || selected === undefined,
          onClick: () => onSelect(null),
        }),
      );
    }
    for (const entry of list) {
      if (!matches(query, entry.name, entry.notes, entry.contents.map((c) => c.name).join(" "))) {
        continue;
      }
      grid.append(
        card({
          name: entry.name,
          notes: entry.notes,
          cost: traitPoints(entry.payload),
          contents: entry.contents,
          active: selected === entry.key,
          onClick: () => onSelect(entry.key),
        }),
      );
    }
    if (!grid.childElementCount) grid.append(el("p.muted", "Nothing matches that."));
  };

  container.append(filterBox("Filter…", draw), grid);
  draw();
  return container;
}

function card({ name, notes, cost, contents, active, onClick }) {
  return el(`button.pick-card${active ? ".active" : ""}`, { type: "button", onclick: onClick },
    el("div.pick-head",
      el("span.pick-name", name),
      el("span.pick-cost" + (cost < 0 ? ".negative" : ""), points(cost)),
    ),
    notes ? el("p.pick-notes", notes) : null,
    contents.length
      ? el("ul.pick-contents",
          contents.map((c) =>
            el("li",
              el("span", c.name),
              c.points ? el("span.muted", ` [${c.points}]`) : null,
            ),
          ),
        )
      : null,
  );
}

/** Renders the currently chosen package's full contents. */
export function packageDetail(entry) {
  if (!entry) return null;
  return el("section.card",
    el("h3", entry.name),
    entry.notes ? el("p", entry.notes) : null,
    el("table.table",
      el("thead", el("tr", el("th", "Trait"), el("th", "Points"), el("th", "Notes"))),
      el("tbody",
        (entry.payload.children || []).map((child) =>
          el("tr",
            el("td", child.name),
            el("td.num", String(traitPoints(child))),
            el("td.muted", child.local_notes || ""),
          ),
        ),
      ),
    ),
  );
}

/** Quantity stepper used by the equipment steps. */
export function quantity(value, onChange) {
  return el("span.qty",
    el("button", { type: "button", onclick: () => onChange(Math.max(1, value - 1)) }, "−"),
    el("input", {
      type: "number", min: 1, value, class: "qty-input",
      oninput: (e) => onChange(Math.max(1, Number(e.target.value) || 1)),
    }),
    el("button", { type: "button", onclick: () => onChange(value + 1) }, "+"),
  );
}

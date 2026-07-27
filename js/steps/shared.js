// Pieces used by more than one step.

import { el, filterBox, matches, points } from "../ui.js";
import { traitPoints } from "../cost.js";

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

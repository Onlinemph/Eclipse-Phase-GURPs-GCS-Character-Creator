// Step 2: the four attributes the Ego owns, priced by EP_ATT.attr.

import { el, field, numberInput, notice } from "../ui.js";
import { EGO_ATTRIBUTES, attributePoints } from "../state.js";

const WHY = {
  dx: "Raises every DX-based skill with it.",
  iq: "Raises every IQ-based skill with it.",
  will: "The setting resolves a large share of its threats through Will: psychosurgery, sleights, interrogation, and the Continuity roll after every resleeve.",
  per: "Cheap in GURPS terms, and the setting rewards noticing things.",
};

export default {
  title: "Attributes",
  subtitle: "DX and IQ start at 11 — the post-Fall transhuman baseline, not a below-average character.",

  render(ctx) {
    const { build, cat, update } = ctx;
    const defs = new Map(cat.attrDefs.map((d) => [d.id, d]));

    const rows = EGO_ATTRIBUTES.map((id) => {
      const def = defs.get(id);
      if (!def) return null;
      const base = Number(def.base);
      const value = build.attributes[id];
      const cost = (value - base) * def.cost_per_point;
      return el("tr",
        el("th", def.full_name || def.name),
        el("td",
          numberInput(value, (v) => update((b) => { b.attributes[id] = v ?? base; }), {
            min: 1, max: 30, step: 1, class: "attr-input",
          }),
        ),
        el("td.muted", String(base)),
        el("td.muted", `${def.cost_per_point}/level`),
        el("td.num" + (cost < 0 ? ".negative" : ""), String(cost)),
        el("td.muted.why", WHY[id] || ""),
      );
    });

    const morphSupplied = cat.attrDefs.filter((d) =>
      ["st", "ht", "hp", "fp"].includes(d.id),
    );

    return el("div.stack",
      el("section.card",
        el("table.table.attr-table",
          el("thead",
            el("tr",
              el("th", "Attribute"), el("th", "Value"), el("th", "Base"),
              el("th", "Cost"), el("th", "Points"), el("th", "Why it matters"),
            ),
          ),
          el("tbody", rows),
          el("tfoot",
            el("tr",
              el("th", { colspan: 4 }, "Total"),
              el("td.num", String(attributePoints(build, cat.attrDefs))),
              el("td"),
            ),
          ),
        ),
        el("p.muted",
          "Will and Per are independent of IQ in this conversion and cannot be bought against it.",
        ),
      ),

      el("section.card",
        el("h3", "Supplied by the morph"),
        el("table.table",
          el("thead", el("tr", el("th", "Attribute"), el("th", "Base"), el("th", "Owner"))),
          el("tbody",
            morphSupplied.map((d) =>
              el("tr",
                el("td", d.full_name || d.name),
                el("td.muted", d.base),
                el("td.muted", "Morph"),
              ),
            ),
            el("tr",
              el("td", "Basic Speed"),
              el("td.muted", "(DX + HT) / 4"),
              el("td.muted", "Both"),
            ),
          ),
        ),
        notice("info",
          "Basic Speed shows an incomplete value until a morph is attached, because it derives " +
          "from the Ego's DX and the morph's HT. It will recompute at Step 6.",
        ),
      ),

      el("section.card",
        el("h3", "For orientation"),
        el("p.muted",
          "IQ 13 costs 40, Will 12 costs 30, Per 13 costs 15, DX 12 costs 20. That combination " +
          "totals 105 and leaves 145 for skills, background, faction and a morph.",
        ),
      ),
    );
  },
};

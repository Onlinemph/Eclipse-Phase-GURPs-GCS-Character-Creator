// Step 6: the morph, and the aptitude that goes in its customization slot.

import { el, button, filterBox, matches, notice, checkbox, clear, points } from "../ui.js";
import { traitPoints } from "../cost.js";
import * as data from "../data.js";

const CATEGORY_ORDER = ["Biomorphs", "Pod Morphs", "Uplift Biomorphs", "Synthmorphs", "Infomorphs"];

export default {
  title: "Morph",
  subtitle: "103 bodies. Each costs its Eclipse Phase Customization Point price divided by four.",

  render(ctx) {
    const { build, cat, update, needMorph } = ctx;
    const index = cat.morphIndex;
    const selected = index.find((m) => m.key === build.morph?.key) || null;
    const payload = build.morph ? cat.morphs.get(build.morph.key) : null;

    const choose = async (key) => {
      await needMorph(key);
      update((b) => {
        const entry = index.find((m) => m.key === key);
        b.morph = { key, aptitudes: new Array(entry?.slots || 0).fill(-1) };
      });
    };

    return el("div.stack",
      el("section.card",
        el("p",
          "Points spent on a morph are points not spent on skills, which are permanent while the " +
          "morph is not. A Splicer at 3 points leaves 16 more points for skills than a Fury at 19.",
        ),
        morphBrowser(index, build.morph?.key, choose),
      ),
      selected ? morphDetail(selected, payload, build, update) : null,
      selected ? slotPicker(selected, build, update) : null,
      el("section.card",
        el("h3", "After the morph is attached"),
        el("p",
          "ST, HT, HP and FP populate from the morph package, and Basic Speed recomputes from the " +
          "Ego's DX and the morph's HT. Check Dodge on the sheet before continuing.",
        ),
      ),
    );
  },
};

function morphBrowser(index, selectedKey, choose) {
  const body = el("div.pick-list");
  const state = { query: "", category: "all", maxCost: null };

  const draw = () => {
    clear(body);
    const categories = state.category === "all"
      ? CATEGORY_ORDER
      : [state.category];
    let shown = 0;
    for (const category of categories) {
      const items = index.filter((m) =>
        m.category === category &&
        matches(state.query, m.name, m.notes) &&
        (state.maxCost === null || m.points <= state.maxCost),
      );
      if (!items.length) continue;
      shown += items.length;
      body.append(
        el("h4.pick-group", `${category} (${items.length})`),
        el("div.card-grid",
          items.map((m) =>
            el(`button.pick-card${m.key === selectedKey ? ".active" : ""}`, {
              type: "button", onclick: () => choose(m.key),
            },
              el("div.pick-head",
                el("span.pick-name", m.name),
                el("span.pick-cost", `${m.points} pts`),
              ),
              el("p.pick-notes", m.notes),
              el("div.morph-tags",
                m.cp !== null ? el("span.tag", `${m.cp} CP`) : null,
                el("span.tag", m.slots === 1 ? "1 slot" : `${m.slots} slots`),
                Object.entries(m.stats).slice(0, 4).map(([k, v]) =>
                  el("span.tag.stat", `${k} ${v}`),
                ),
              ),
            ),
          ),
        ),
      );
    }
    if (!shown) body.append(el("p.muted", "No morph matches those filters."));
  };

  const controls = el("div.filter-row",
    filterBox("Filter morphs…", (q) => { state.query = q; draw(); }),
    el("select", {
      onchange: (e) => { state.category = e.target.value; draw(); },
    },
      el("option", { value: "all" }, "All categories"),
      CATEGORY_ORDER.map((c) => el("option", { value: c }, c)),
    ),
    el("select", {
      onchange: (e) => {
        state.maxCost = e.target.value === "" ? null : Number(e.target.value);
        draw();
      },
    },
      el("option", { value: "" }, "Any cost"),
      [3, 5, 10, 15, 20, 25].map((c) => el("option", { value: c }, `${c} points or less`)),
    ),
  );

  draw();
  return el("div.stack", controls, body);
}

function morphDetail(entry, payload, build, update) {
  const computed = payload ? traitPoints(payload) : null;
  const diverges = computed !== null && computed !== entry.points;

  return el("section.card",
    el("h3", `${entry.name} — ${entry.category}`),
    el("p", entry.notes),
    el("dl.stat-row",
      Object.entries(entry.stats).map(([k, v]) =>
        el("div", el("dt", k), el("dd", v)),
      ),
    ),
    payload
      ? el("details.disclosure",
          el("summary", "Package contents"),
          el("table.table",
            el("tbody",
              (payload.children || []).map((group) =>
                el("tr",
                  el("th", group.name),
                  el("td.num", String(traitPoints(group))),
                  el("td.muted",
                    (group.children || []).map((c) => c.name).join(", ") ||
                      group.local_notes || "",
                  ),
                ),
              ),
            ),
          ),
        )
      : null,

    diverges
      ? el("div.stack",
          notice("warn",
            `This morph's price adjustment was written without applying the modifiers enabled on ` +
            `its own traits, so GCS computes ${computed} points for it rather than the documented ` +
            `chargen price of ${entry.points}. The builder can re-point the adjustment on export ` +
            `so the morph lands where the library says it should.`,
          ),
          checkbox(
            `Correct the price adjustment so the ${entry.name} costs ${entry.points} points in GCS`,
            build.options.normalizeMorphPrice,
            (v) => update((b) => { b.options.normalizeMorphPrice = v; }),
          ),
        )
      : notice("ok", `GCS will compute ${entry.points} points for this morph, as documented.`),
  );
}

function slotPicker(entry, build, update) {
  if (!entry.slots) {
    return el("section.card",
      el("h3", "Customization slots"),
      el("p.muted", `The ${entry.name} has none. Canon gives it no slot, so there is nothing to choose.`),
    );
  }

  const options = entry.slot_options;
  const chosen = build.morph.aptitudes || [];

  return el("section.card",
    el("h3", `Customization slots (${entry.slots})`),
    el("p",
      "Enable exactly one option per slot. All seven cost 0 points, because the slot is free and " +
      "the morph's price does not change with the choice. They are not equivalent in value and " +
      "are not intended to be.",
    ),
    Array.from({ length: entry.slots }, (_, slot) =>
      el("div.slot",
        el("h4", `Slot ${slot + 1}`),
        el("div.chip-row",
          options.map((opt, i) =>
            el(`button.chip.aptitude${chosen[slot] === i ? ".on" : ""}`, {
              type: "button",
              title: opt.notes,
              onclick: () => update((b) => {
                const list = b.morph.aptitudes.slice();
                list[slot] = list[slot] === i ? -1 : i;
                b.morph.aptitudes = list;
              }),
            },
              el("span.chip-name", opt.name),
              opt.notes ? el("span.chip-note", opt.notes) : null,
            ),
          ),
        ),
        chosen[slot] === undefined || chosen[slot] < 0
          ? el("p.muted.small", "Nothing selected yet.")
          : null,
      ),
    ),
  );
}

// Step 6: the morph, and the aptitude that goes in its customization slot.

import { el, button, filterBox, matches, notice, checkbox, clear, points } from "../ui.js";
import { traitPoints } from "../cost.js";
import { modifierEditor } from "./shared.js";
import { applyChoices } from "../modifiers.js";

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
        morphBrowser(index, build, choose, update),
      ),
      selected ? morphDetail(selected, payload, build, update) : null,
      selected ? slotPicker(selected, build, update) : null,
      selected && payload
        ? el("section.card",
            el("h3", "Fine-tune the morph"),
            el("p.muted.small",
              "Every trait in the package carries the same modifier switches GCS shows. Enabling " +
              "one changes both what the trait does and what it costs — and with price correction " +
              "on, the adjustment re-balances so the morph still lands on its chargen price.",
            ),
            modifierEditor(payload, `morph:${selected.key}`, build, update),
          )
        : null,
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

function morphBrowser(index, build, choose, update) {
  const selectedKey = build.morph?.key;
  const body = el("div.pick-list");
  const state = { query: "", category: "all", maxCost: null };
  // Kept in the build, not locally: selecting a morph re-renders the step, and
  // a local flag would reset and hide the morph the player just chose.
  const showAll = () => build.options.showAllMorphs;
  const hidden = index.filter((m) => !m.chargen).length;

  const draw = () => {
    clear(body);
    const categories = state.category === "all"
      ? CATEGORY_ORDER
      : [state.category];
    let shown = 0;
    for (const category of categories) {
      const items = index.filter((m) =>
        m.category === category &&
        (showAll() || m.chargen) &&
        matches(state.query, m.name, m.notes) &&
        (state.maxCost === null || m.points <= state.maxCost),
      );
      if (!items.length) continue;
      shown += items.length;
      body.append(
        el("h4.pick-group", `${category} (${items.length})`),
        el("div.card-grid",
          items.map((m) =>
            el(`button.pick-card${m.key === selectedKey ? ".active" : ""}${m.chargen ? "" : ".gm-only"}`, {
              type: "button", onclick: () => choose(m.key),
            },
              el("div.pick-head",
                el("span.pick-name", m.name),
                el("span.pick-cost", `${m.points} pts`),
              ),
              m.chargen ? null : el("p.pick-notes.warn-text", "Not available at character creation."),
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
    hidden
      ? checkbox(`Include the ${hidden} morphs a player cannot start with`, showAll(),
          (v) => update((b) => { b.options.showAllMorphs = v; }))
      : null,
  );

  draw();
  return el("div.stack", controls, body);
}

function morphDetail(entry, payload, build, update) {
  // Price the morph as it currently stands, modifier choices included, so the
  // note below reflects what the player has actually switched on.
  const configured = payload
    ? applyChoices(structuredClone(payload), build.modifierChoices?.[`morph:${entry.key}`])
    : null;
  const computed = configured ? traitPoints(configured) : null;
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

    entry.chargen
      ? null
      : notice("error",
          `The ${entry.name} is not available at character creation. ` +
          (entry.priced
            ? "It carries a chargen price, but the procedure puts it out of reach."
            : `It has no Customization Point cost and no price adjustment, so GCS charges its ` +
              `full package value of ${entry.points} points. It is listed for GM reference.`),
        ),

    diverges && entry.chargen
      ? el("div.stack",
          notice("warn",
            `As configured, GCS computes ${computed} points for this morph rather than its ` +
            `documented chargen price of ${entry.points}. That is either the library's price ` +
            `adjustment having been written without the modifiers its own traits enable, or ` +
            `modifiers you have switched on below. The builder can re-point the adjustment on ` +
            `export so the morph lands where the library says it should.`,
          ),
          checkbox(
            `Correct the price adjustment so the ${entry.name} costs ${entry.points} points in GCS`,
            build.options.normalizeMorphPrice,
            (v) => update((b) => { b.options.normalizeMorphPrice = v; }),
          ),
        )
      : entry.chargen
        ? notice("ok", `GCS will compute ${entry.points} points for this morph, as documented.`)
        : null,
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

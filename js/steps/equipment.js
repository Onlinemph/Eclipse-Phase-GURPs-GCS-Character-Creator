// Step 8: general equipment, against $50,000 of starting wealth at TL10.

import { el, button, filterBox, matches, notice, money, clear, checkbox } from "../ui.js";
import { quantity } from "./shared.js";
import { cashSpent } from "../state.js";

export default {
  title: "Equipment",
  subtitle: "1,007 items from Ultra-Tech, filtered to what exists in 10 AF.",

  render(ctx) {
    const { build, cat, update, need } = ctx;
    if (!cat.gear) {
      need("gear").then(() => update());
      return el("p.muted", "Loading the gear catalogue…");
    }

    return el("div.stack",
      budgetBar(build, cat),
      carried(build, cat, update),
      catalogue(build, cat, update),
      el("section.card",
        el("h3", "Two things to decide before weapons"),
        el("p",
          el("strong", "Backup insurance"), " at $6,250 per year determines whether the Ego can " +
          "be restored when a cortical stack is not recovered. Anarchist habitats provide an " +
          "equivalent as mutual aid, which is a rep obligation rather than a contract — " +
          "autonomist characters should confirm coverage with the GM.",
        ),
        el("p",
          el("strong", "Vacuum protection"), ". Characters in biomorphs should budget for it " +
          "before weapons.",
        ),
        notice("info",
          "Legality class governs what a polity permits civilians to carry. LC 2 and below is " +
          "restricted in most inner-system habitats, and habitat mesh systems track carried " +
          "equipment. Confirm local restrictions with the GM.",
        ),
      ),
    );
  },
};

function budgetBar(build, cat) {
  const spent = cashSpent(build, cat);
  const ratio = Math.min(1, spent / (build.startingWealth || 1));
  const over = spent > build.startingWealth;
  return el("section.card",
    el("div.budget",
      el("div.budget-bar", el("div" + (over ? ".budget-fill.over" : ".budget-fill"), {
        style: `width:${ratio * 100}%`,
      })),
      el("p" + (over ? ".over" : ""),
        `${money(spent)} spent of ${money(build.startingWealth)} — ${money(build.startingWealth - spent)} left`,
      ),
    ),
  );
}

function carried(build, cat, update) {
  const index = new Map(cat.gear.categories.flatMap((c) => c.items.map((i) => [i.key, i])));
  const rows = build.gear
    .map((item) => ({ item, entry: index.get(item.key) }))
    .filter((r) => r.entry);

  return el("section.card",
    el("h3", `Carried (${rows.length})`),
    rows.length === 0
      ? el("p.muted", "Nothing yet.")
      : el("table.table",
          el("thead",
            el("tr",
              el("th", "Item"), el("th", "Qty"), el("th", "Each"),
              el("th", "Total"), el("th", "Weight"), el("th", ""),
            ),
          ),
          el("tbody",
            rows.map(({ item, entry }) =>
              el("tr",
                el("td",
                  el("strong", entry.name),
                  entry.armed ? el("span.tag", "weapon") : null,
                  entry.lc ? el("span.tag", `LC${entry.lc}`) : null,
                  entry.notes ? el("p.muted.small", entry.notes) : null,
                ),
                el("td", quantity(item.qty || 1, (v) => update((b) => {
                  const found = b.gear.find((g) => g.key === item.key);
                  if (found) found.qty = v;
                }))),
                el("td.num", money(entry.price)),
                el("td.num", money(entry.price * (item.qty || 1))),
                el("td.muted", entry.weight),
                el("td", button("Remove", () => update((b) => {
                  b.gear = b.gear.filter((g) => g.key !== item.key);
                }), "ghost")),
              ),
            ),
          ),
        ),
  );
}

function catalogue(build, cat, update) {
  const body = el("div.pick-list");
  const owned = new Set(build.gear.map((g) => g.key));
  const state = { query: "", category: cat.gear.categories[0].name, affordable: false };
  const remaining = build.startingWealth - cashSpent(build, cat);

  const draw = () => {
    clear(body);
    const category = cat.gear.categories.find((c) => c.name === state.category);
    const items = (category ? category.items : cat.gear.categories.flatMap((c) => c.items))
      .filter((i) => matches(state.query, i.name, i.notes, i.path.join(" ")))
      .filter((i) => !state.affordable || i.price <= remaining);

    if (!items.length) {
      body.append(el("p.muted", "Nothing matches those filters."));
      return;
    }
    body.append(
      el("p.muted.small", `${items.length} item${items.length === 1 ? "" : "s"}`),
      el("table.table",
        el("thead",
          el("tr",
            el("th", "Item"), el("th", "Price"), el("th", "Weight"),
            el("th", "LC"), el("th", "Ref"), el("th", ""),
          ),
        ),
        el("tbody",
          items.slice(0, 400).map((entry) =>
            el("tr",
              el("td",
                el("strong", entry.name),
                entry.armed ? el("span.tag", "weapon") : null,
                entry.notes ? el("p.muted.small", entry.notes) : null,
              ),
              el("td.num", money(entry.price)),
              el("td.muted", entry.weight),
              el("td.muted", entry.lc),
              el("td.muted", entry.reference),
              el("td",
                owned.has(entry.key)
                  ? el("span.muted", "carried")
                  : button("Add", () => update((b) => {
                      b.gear.push({ key: entry.key, qty: 1 });
                    })),
              ),
            ),
          ),
        ),
      ),
      items.length > 400
        ? el("p.muted", `Showing the first 400 of ${items.length}. Narrow the filter to see the rest.`)
        : null,
    );
  };

  const controls = el("div.filter-row",
    filterBox("Search all gear…", (q) => {
      state.query = q;
      // A search should look everywhere, not just inside one category.
      if (q) state.category = "";
      draw();
    }),
    el("select", { onchange: (e) => { state.category = e.target.value; draw(); } },
      el("option", { value: "" }, "All categories"),
      cat.gear.categories.map((c) =>
        el("option", { value: c.name, selected: c.name === state.category }, `${c.name} (${c.items.length})`),
      ),
    ),
    checkbox("Only what I can still afford", state.affordable, (v) => {
      state.affordable = v;
      draw();
    }),
  );

  draw();
  return el("section.card", el("h3", "Catalogue"), controls, body);
}

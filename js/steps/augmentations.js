// Step 7: augmentations. Bought with money, not character points.

import {
  el, button, filterBox, matches, notice, money, checkbox, clear, details,
} from "../ui.js";
import { traitPoints } from "../cost.js";
import { quantity } from "./shared.js";
import { cashSpent } from "../state.js";

const INSTALL_RATE = 0.1;

const TIERS = [
  ["Low", 1500, "Grip Pads, Enhanced Vision, Mnemonic Augmentation, Medichines, gills, claws"],
  ["Moderate", 6250, "Puppet Sock, Cyberlimb, Adrenal Boost, Carapace Armor, Skinlink, Ghostrider Module"],
  ["High", 31250, "Muscle Augmentation, Neurachem 1, Multi-Tasking, Hardened Skeleton"],
  ["Expensive", 125000, "Neurachem 2, Reflex Booster, Emergency Farcaster"],
];

export default {
  title: "Augmentations",
  subtitle: "Part of the morph: paid for with money, they stay with the body when the Ego leaves it.",

  render(ctx) {
    const { build, cat, update, need } = ctx;
    if (!cat.augs) {
      need("augs").then(() => update());
      return el("p.muted", "Loading the augmentation catalogue…");
    }

    const morph = cat.morphIndex.find((m) => m.key === build.morph?.key);
    const synthetic = morph ? /Synthmorph/.test(morph.category) : false;

    return el("div.stack",
      el("section.card",
        el("p",
          "Augmentations installed in a morph are part of the morph. They are purchased with " +
          "money, they raise the morph's package total, and character points are never spent on " +
          "them. Installation costs 10% of the price at a licensed clinic.",
        ),
        morph
          ? notice(synthetic ? "warn" : "info",
              `Current morph: ${morph.name}. ` +
              (synthetic
                ? "Bioware outside the \"works with synthmorphs\" group cannot be installed in a synthmorph."
                : "Bioware and cyberware both fit a biomorph chassis."),
            )
          : notice("warn", "No morph chosen yet — pick one at Step 6 so compatibility can be checked."),
        el("p.muted",
          "At starting wealth most characters buy nothing here. Medichines at $1,500 is the most " +
          "commonly affordable option.",
        ),
      ),

      installedList(build, cat, update),
      catalogue(build, cat, update, synthetic),
      traitCatalogue(build, cat, update),

      el("section.card",
        el("h3", "Price tiers"),
        el("table.table",
          el("thead", el("tr", el("th", "Tier"), el("th", "Price"), el("th", "Examples"))),
          el("tbody",
            TIERS.map(([name, price, examples]) =>
              el("tr", el("td", name), el("td.num", money(price)), el("td.muted", examples)),
            ),
          ),
        ),
      ),
    );
  },
};

function installedList(build, cat, update) {
  const index = new Map(cat.augs.equipment.map((e) => [e.key, e]));
  const rows = build.augEquipment
    .map((item) => ({ item, entry: index.get(item.key) }))
    .filter((r) => r.entry);

  const total = rows.reduce(
    (sum, r) => sum + r.entry.price * (r.item.qty || 1) * (1 + INSTALL_RATE), 0,
  );

  return el("section.card",
    el("h3", `Installed (${rows.length})`),
    rows.length === 0
      ? el("p.muted", "Nothing installed.")
      : el("table.table",
          el("thead",
            el("tr",
              el("th", "Augmentation"), el("th", "Qty"), el("th", "Price"),
              el("th", "With install"), el("th", ""),
            ),
          ),
          el("tbody",
            rows.map(({ item, entry }) =>
              el("tr",
                el("td",
                  el("strong", entry.name),
                  el("p.muted.small", entry.notes),
                ),
                el("td", quantity(item.qty || 1, (v) => update((b) => {
                  const found = b.augEquipment.find((a) => a.key === item.key);
                  if (found) found.qty = v;
                }))),
                el("td.num", money(entry.price)),
                el("td.num", money(entry.price * (item.qty || 1) * (1 + INSTALL_RATE))),
                el("td", button("Remove", () => update((b) => {
                  b.augEquipment = b.augEquipment.filter((a) => a.key !== item.key);
                }), "ghost")),
              ),
            ),
          ),
          el("tfoot", el("tr",
            el("th", { colspan: 3 }, "Total, installation included"),
            el("td.num", money(total)), el("td"),
          )),
        ),
    el("p.muted", `All equipment so far: ${money(cashSpent(build, cat))} of ${money(build.startingWealth)}.`),
  );
}

function catalogue(build, cat, update, synthetic) {
  const body = el("div.pick-list");
  const owned = new Set(build.augEquipment.map((a) => a.key));
  const state = { query: "", hideIncompatible: synthetic };

  const draw = () => {
    clear(body);
    const groups = new Map();
    for (const entry of cat.augs.equipment) {
      if (!matches(state.query, entry.name, entry.notes, entry.group)) continue;
      if (state.hideIncompatible && synthetic && entry.compat === "biomorph") continue;
      if (!groups.has(entry.group)) groups.set(entry.group, []);
      groups.get(entry.group).push(entry);
    }
    for (const [group, items] of groups) {
      body.append(
        el("h4.pick-group", `${group} (${items.length})`),
        el("table.table",
          el("tbody",
            items.map((entry) =>
              el("tr" + (synthetic && entry.compat === "biomorph" ? ".incompatible" : ""),
                el("td",
                  el("strong", entry.name),
                  el("p.muted.small", entry.notes),
                ),
                el("td.num", money(entry.price)),
                el("td.muted", entry.lc ? `LC${entry.lc}` : ""),
                el("td",
                  owned.has(entry.key)
                    ? el("span.muted", "installed")
                    : button("Install", () => update((b) => {
                        b.augEquipment.push({ key: entry.key, qty: 1 });
                      })),
                ),
              ),
            ),
          ),
        ),
      );
    }
    if (!groups.size) body.append(el("p.muted", "Nothing matches that."));
  };

  const controls = el("div.filter-row",
    filterBox("Filter augmentations…", (q) => { state.query = q; draw(); }),
    synthetic
      ? checkbox("Hide bioware that will not fit a synthmorph", state.hideIncompatible,
          (v) => { state.hideIncompatible = v; draw(); })
      : null,
  );

  draw();
  return el("section.card",
    el("h3", "Catalogue"),
    controls,
    body,
  );
}

/**
 * The traits file, for players who want the mechanical effect on the sheet.
 * The equipment entries carry prices and notes but no GCS features, so this is
 * the only way to make an augmentation actually do something in GCS.
 */
function traitCatalogue(build, cat, update) {
  const body = el("div.pick-list");
  const owned = new Map(build.augTraits.map((a) => [a.key, a]));

  const draw = (query = "") => {
    clear(body);
    const groups = new Map();
    for (const entry of cat.augs.traits) {
      if (!matches(query, entry.name, entry.notes, entry.path.join(" "))) continue;
      const group = entry.path.join(" / ");
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(entry);
    }
    for (const [group, items] of groups) {
      body.append(
        el("h4.pick-group", group),
        el("table.table",
          el("tbody",
            items.map((entry) => {
              const chosen = owned.get(entry.key);
              const cost = traitPoints(entry.payload);
              return el("tr",
                el("td", el("strong", entry.name), entry.notes ? el("p.muted.small", entry.notes) : null),
                el("td.num", `${cost} pts`),
                el("td",
                  chosen
                    ? el("div.row",
                        checkbox("offset to 0 points", chosen.offset, (v) => update((b) => {
                          const found = b.augTraits.find((a) => a.key === entry.key);
                          if (found) found.offset = v;
                        })),
                        button("Remove", () => update((b) => {
                          b.augTraits = b.augTraits.filter((a) => a.key !== entry.key);
                        }), "ghost"),
                      )
                    : button("Add trait", () => update((b) => {
                        b.augTraits.push({ key: entry.key, offset: true });
                      })),
                ),
              );
            }),
          ),
        ),
      );
    }
    if (!groups.size) body.append(el("p.muted", "Nothing matches that."));
  };

  draw();
  return el("section.card",
    details("Add augmentations as traits (advanced)",
      el("p",
        "The equipment entries above carry prices and descriptions but no mechanical effect. " +
        "Adding the matching trait is what makes an augmentation actually modify the sheet.",
      ),
      notice("info",
        "Left at the default, each trait is paired with an offsetting price adjustment so it " +
        "costs nothing — the same bookkeeping the libraries use for morphs, and consistent with " +
        "augmentations being bought with money rather than character points. Clear the offset if " +
        "your GM would rather charge points for it.",
      ),
      filterBox("Filter traits…", draw),
      body,
    ),
  );
}

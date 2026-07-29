// Step 10: async characters. Optional, and it changes the shape of a character.

import {
  el, button, checkbox, filterBox, matches, notice, clear, select, points,
} from "../ui.js";
import { traitPoints } from "../cost.js";
import { ASYNC_TALENT_MAX, ASYNC_TALENT_COST, psiPoints } from "../state.js";

const RULES = [
  ["Proximity", "Sleights reach to touch and no further than 10 yards, at −1 per yard beyond touch. Touching negates range penalties; bare skin contact gives +3."],
  ["Substrate", "Digital minds — cyberbrains, synthmorphs, pods, infomorphs — can be reached at a flat −8."],
  ["Contested", "Every use against an unwilling mind is a Quick Contest of the sleight skill against the target's Will. A target who succeeds perceives something regardless."],
  ["Strain", "Each use costs 2 FP. Sustained sleights cost 1 FP per minute and impose a cumulative −2 to all the async's other rolls while held."],
];

export default {
  title: "Async",
  subtitle: "Optional. Discuss it with the GM before committing — it reshapes the character.",

  render(ctx) {
    const { build, cat, update, need } = ctx;

    const toggle = el("section.card",
      checkbox(
        "This character is an async (Watts-MacLeod infected)",
        build.psi.enabled,
        (v) => update((b) => {
          b.psi.enabled = v;
          if (!v) { b.psi.sleights = []; b.psi.talent = 0; }
        }),
      ),
      el("p.muted",
        "Psi is not purchased as a package. Watts-MacLeod Infection [−10] is the prerequisite " +
        "trait. It carries at least 15 points of mandatory mental disorders, chosen with the GM, " +
        "which fall outside the disadvantage limit. It grants +4 to resist further exsurgent " +
        "infection and makes the character detectable by Sense Infection. The infection is part " +
        "of the Ego's structure and survives every resleeve, fork and backup.",
      ),
    );

    if (!build.psi.enabled) {
      return el("div.stack", toggle, rulesCard());
    }
    if (!cat.sleights) {
      need("sleights").then(() => update());
      return el("div.stack", toggle, el("p.muted", "Loading the sleight catalogue…"));
    }

    return el("div.stack",
      toggle,
      substrateWarning(build, cat),
      talentCard(build, cat, update),
      chosenSleights(build, cat, update),
      sleightCatalogue(build, cat, update),
      rulesCard(),
    );
  },
};

function substrateWarning(build, cat) {
  const morph = cat.morphIndex.find((m) => m.key === build.morph?.key);
  if (!morph) return null;
  if (/Synthmorph|Infomorph/.test(morph.category)) {
    return notice("error",
      `An async's own brain must be biological. In the ${morph.name} the character cannot use ` +
      "sleights at all — the infection stays, the abilities do not work.",
    );
  }
  if (/Pod/.test(morph.category)) {
    return notice("warn",
      `The ${morph.name} is a pod with a cyberbrain. Confirm with the GM whether its biological ` +
      "tissue is enough to carry the strain.",
    );
  }
  return null;
}

function talentCard(build, cat, update) {
  return el("section.card",
    el("h3", "Async Talent and disorders"),
    el("div.grid-2",
      el("label.field",
        el("span.field-label", `Async Talent (${ASYNC_TALENT_COST} points per level, max ${ASYNC_TALENT_MAX})`),
        select(
          Array.from({ length: ASYNC_TALENT_MAX + 1 }, (_, i) => ({
            value: i, label: `${i} — ${i * ASYNC_TALENT_COST} points`,
          })),
          build.psi.talent,
          (v) => update((b) => { b.psi.talent = Number(v); }),
        ),
        el("span.field-hint", "Adds to every sleight skill and to the async's side of every sleight contest."),
      ),
      el("label.field",
        el("span.field-label", "Mandatory disorders"),
        el("textarea", {
          rows: 4,
          value: build.psi.disorders,
          placeholder: "e.g. Delusion (the strain is speaking to me) [−10], Nightmares [−5]",
          oninput: (e) => update((b) => { b.psi.disorders = e.target.value; }),
        }),
        el("span.field-hint",
          "At least 15 points' worth, chosen with the GM. They fall outside the −50 limit. " +
          "The Derangements & disorders catalogue on the Traits step has the setting's own list, " +
          "already priced — anything picked there goes on the sheet as a real trait; this box is " +
          "for anything it does not cover.",
        ),
      ),
    ),
    el("p.muted", `Async subtotal: ${points(psiPoints(build, cat))}.`),
  );
}

function chosenSleights(build, cat, update) {
  const all = new Map(cat.sleights.groups.flatMap((g) => g.items.map((i) => [i.key, i])));
  const rows = build.psi.sleights
    .map((chosen) => ({ chosen, entry: all.get(chosen.key) }))
    .filter((r) => r.entry);

  return el("section.card",
    el("h3", `Sleights (${rows.length})`),
    el("p.muted",
      "Alternative Abilities: full price for the most expensive sleight, one fifth for each other " +
      "active one. Only one may be in use at a time and switching is a Ready maneuver. " +
      "Always-on passive sleights cannot be alternatives and are bought at full price.",
    ),
    rows.length === 0
      ? el("p.muted", "None chosen.")
      : el("table.table",
          el("thead",
            el("tr",
              el("th", "Sleight"), el("th", "Full"), el("th", "Charged"),
              el("th", "Alternative"), el("th", "Skill"), el("th", ""),
            ),
          ),
          el("tbody",
            rows.map(({ chosen, entry }) => {
              const full = traitPoints(entry.payload);
              const alternate = chosen.alternate && entry.can_alternate;
              return el("tr",
                el("td", el("strong", entry.name), el("p.muted.small", entry.group)),
                el("td.num", String(full)),
                el("td.num", String(alternate ? Math.ceil(full * 0.2) : full)),
                el("td",
                  entry.can_alternate
                    ? checkbox("", alternate, (v) => update((b) => {
                        const found = b.psi.sleights.find((s) => s.key === chosen.key);
                        if (found) found.alternate = v;
                      }))
                    : el("span.muted", "passive"),
                ),
                el("td.muted", entry.skill || "—"),
                el("td", button("Remove", () => update((b) => {
                  b.psi.sleights = b.psi.sleights.filter((s) => s.key !== chosen.key);
                }), "ghost")),
              );
            }),
          ),
        ),
    rows.length
      ? el("p.muted",
          "Each active sleight needs its own Hard skill. Add them at Step 5 from the Async Skills " +
          "group, or use the button beside each sleight below.",
        )
      : null,
  );
}

function sleightCatalogue(build, cat, update) {
  const body = el("div.pick-list");
  const owned = new Set(build.psi.sleights.map((s) => s.key));

  const draw = (query = "") => {
    clear(body);
    for (const group of cat.sleights.groups) {
      const items = group.items.filter((i) => matches(query, i.name, i.notes));
      if (!items.length) continue;
      body.append(
        el("h4.pick-group", `${group.name} (${items.length})`),
        el("table.table",
          el("tbody",
            items.map((entry) =>
              el("tr",
                el("td",
                  el("strong", entry.name),
                  entry.passive ? el("span.tag", "passive") : null,
                  el("p.muted.small", entry.notes),
                ),
                el("td.num", `${traitPoints(entry.payload)} pts`),
                el("td",
                  owned.has(entry.key)
                    ? el("span.muted", "chosen")
                    : button("Add", () => update((b) => {
                        // First sleight is the full-price primary; later ones default
                        // to alternates, which is what Powers p. 11 expects.
                        const alternate = b.psi.sleights.length > 0 && entry.can_alternate;
                        b.psi.sleights.push({ key: entry.key, alternate });
                        if (entry.skill && !b.skills.some((s) => s.name === entry.skill)) {
                          b.skills.push({
                            source: "psi", kind: "skill", name: entry.skill,
                            difficulty: "iq/h", points: 1,
                            notes: `Governs the ${entry.name} sleight.`,
                          });
                          b.skills.sort((x, y) => x.name.localeCompare(y.name));
                        }
                      })),
                ),
              ),
            ),
          ),
        ),
      );
    }
    if (!body.childElementCount) body.append(el("p.muted", "Nothing matches that."));
  };

  draw();
  return el("section.card",
    el("h3", "Sleight catalogue"),
    el("p.muted", "Adding a sleight also adds its governing skill at 1 point, if it has one."),
    filterBox("Filter sleights…", draw),
    body,
  );
}

function rulesCard() {
  return el("section.card",
    el("h3", "Four rules govern sleight use"),
    el("dl.rules",
      RULES.map(([name, text]) => el("div", el("dt", name), el("dd", text))),
    ),
    notice("info",
      "A representative async totals about 45 points net: Infection [−10] plus disorders, Async " +
      "Talent 2 [10], one primary sleight at full price, three or four alternatives at a fifth " +
      "each, and one or two passives.",
    ),
  );
}

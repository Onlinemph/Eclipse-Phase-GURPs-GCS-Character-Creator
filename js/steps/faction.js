// Step 4: faction (optional) and reputation networks.

import { el, notice, points } from "../ui.js";
import { packageGrid, packageDetail } from "./shared.js";
import { REP_MAX_LEVEL, REP_COST_PER_LEVEL, repPoints } from "../state.js";

const STANDING = [
  [1, 2, "Member in good standing"],
  [3, 4, "Known contributor"],
  [5, 6, "Respected fixture whose requests take priority"],
  [7, 8, "Network celebrity, whose failures are equally visible"],
];

export default {
  title: "Faction & rep",
  subtitle: "Faction is optional. Reputation is 3 points per level in each network, to a maximum of 8.",

  render(ctx) {
    const { build, cat, update } = ctx;
    const list = cat.packages.factions;
    const chosen = list.find((f) => f.key === build.faction) || null;
    const total = repPoints(build);

    return el("div.stack",
      el("section.card",
        el("h3", "Faction"),
        el("p",
          "Low-cost and negative-cost factions carry offsetting obligations. Firewall Sentinel " +
          "provides proxy support and i-rep access against a hazardous Duty and a Secret; Jovian " +
          "Republic provides military contacts and supply against an ongoing Duty and " +
          "bioconservative intolerance that uplifts and AGIs will notice.",
        ),
        packageGrid(list, build.faction, (key) => update((b) => { b.faction = key; }), {
          allowNone: true,
          noneLabel: "Unaffiliated",
          noneNote: "A perfectly ordinary choice. No package traits, no obligations.",
        }),
      ),

      packageDetail(chosen),

      el("section.card",
        el("h3", "Reputation networks"),
        el("p",
          "A character's level in a network functions as Courtesy Rank for the Pulling Rank rules " +
          "in GURPS Social Engineering. Members are never obligated to help, but they are inclined " +
          "to in proportion to standing, since assisting high-rep members raises their own.",
        ),
        el("table.table.rep-table",
          el("thead",
            el("tr", el("th", "Network"), el("th", "Community"), el("th", "Level"), el("th", "Points")),
          ),
          el("tbody",
            cat.packages.repnets.map((net) => {
              const level = build.repnets[net.key] || 0;
              // Updated straight from the slider: the step body is deliberately
              // not re-rendered mid-drag, so these would otherwise freeze.
              const levelLabel = el("span.rep-level", String(level));
              const pointsCell = el("td.num", String(level * REP_COST_PER_LEVEL));
              return el("tr",
                el("td", el("strong", net.code), " ", el("span.muted", net.network)),
                el("td.muted.why", net.notes.split(".")[0]),
                el("td",
                  el("input", {
                    type: "range", min: 0, max: REP_MAX_LEVEL, value: level, class: "rep-range",
                    oninput: (e) => {
                      const v = Number(e.target.value);
                      levelLabel.textContent = String(v);
                      pointsCell.textContent = String(v * REP_COST_PER_LEVEL);
                      update((b) => {
                        if (v) b.repnets[net.key] = v;
                        else delete b.repnets[net.key];
                      });
                    },
                  }),
                  levelLabel,
                ),
                pointsCell,
              );
            }),
          ),
          el("tfoot",
            el("tr", el("th", { colspan: 3 }, "Total"), el("td.num", points(total))),
          ),
        ),
        el("p.muted",
          "Two or three networks consistent with the background is standard. Rep in a network " +
          "whose community the character has never engaged with wants an explanation.",
        ),
        el("ul.plain",
          STANDING.map(([lo, hi, text]) => el("li", el("strong", `${lo}–${hi}: `), text)),
        ),
        notice("info",
          "In anarchist and autonomist habitats, rep replaces both Wealth and Status — including " +
          "for morph access.",
        ),
      ),
    );
  },
};

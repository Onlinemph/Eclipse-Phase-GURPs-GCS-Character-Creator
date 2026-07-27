// Step 3: one background, representing circumstances before play.

import { el, notice } from "../ui.js";
import { packageGrid, packageDetail } from "./shared.js";

export default {
  title: "Background",
  subtitle: "Where the Ego comes from. Ego-side traits only — anything physical belongs to the morph.",

  render(ctx) {
    const { build, cat, update } = ctx;
    const list = cat.packages.backgrounds;
    const chosen = list.find((b) => b.key === build.background) || null;

    return el("div.stack",
      el("section.card",
        el("p",
          "Every character takes one background. Selecting it here adds the whole package — " +
          "Status, Wealth, Contacts, Social Stigma and the rest — exactly as the library defines it.",
        ),
        packageGrid(list, build.background, (key) => update((b) => { b.background = key; }), {
          allowNone: true,
          noneLabel: "No background",
          noneNote: "Not recommended; every character came from somewhere.",
        }),
      ),

      packageDetail(chosen),

      el("section.card",
        el("h3", "Two backgrounds carry setting-level consequences"),
        el("p",
          el("strong", "Uplift"), " holds Social Stigma (Uplift), reflecting restricted legal " +
          "standing across the inner system. It sits on the character rather than on any uplift " +
          "morph: a human Ego wearing an uplift morph attracts attention, but not the same legal " +
          "treatment.",
        ),
        el("p",
          el("strong", "Infolife (AGI)"), " is the origin for characters that were compiled " +
          "rather than born. AGI characters take Digital Mind and can never use psi in any morph.",
        ),
        notice("warn",
          "Negative-cost backgrounds are not free points. Lost Generation includes 15 points of " +
          "mandatory trauma that fall outside the disadvantage limit.",
        ),
      ),
    );
  },
};

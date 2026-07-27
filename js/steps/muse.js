// Step 9: the muse, a personal AI that has been with the character since childhood.

import { el, notice } from "../ui.js";
import { MUSE_ALLY_COST } from "../state.js";

const OPTIONS = [
  {
    key: "ally",
    title: `Purchased as an Ally [${MUSE_ALLY_COST}]`,
    blurb:
      "Built on 25% of the character's points and constantly available. The muse rolls dice and " +
      "can act on its own.",
    argument:
      "A muse on overwatch rolls as a complementary skill when its owner's systems are attacked, " +
      "or contests an intruder directly at skill 12. That matters most for characters in " +
      "synthmorphs, pods or infomorphs, whose brains are computers and can be hacked directly.",
  },
  {
    key: "none",
    title: "Setting conceit [0]",
    blurb:
      "The muse handles scheduling, mesh traffic and AR filtering as narrative convenience. It " +
      "never rolls.",
    argument:
      "Costs nothing and stays out of the way. Fine for characters whose brain is biological and " +
      "who are not expecting to be hacked.",
  },
];

export default {
  title: "Muse",
  subtitle: "Every character has one. The question is whether it rolls dice.",

  render(ctx) {
    const { build, cat, update } = ctx;
    const morph = cat.morphIndex.find((m) => m.key === build.morph?.key);
    const digital = morph ? /Synthmorph|Pod|Infomorph/.test(morph.category) : false;

    return el("div.stack",
      el("section.card",
        el("p",
          "A muse is a personal AI that has accompanied the character since childhood. Both " +
          "treatments below are legitimate; they differ in whether the muse is a character or a " +
          "convenience.",
        ),
        el("div.card-grid",
          OPTIONS.map((opt) =>
            el(`button.pick-card${build.muse === opt.key ? ".active" : ""}`, {
              type: "button",
              onclick: () => update((b) => { b.muse = opt.key; }),
            },
              el("div.pick-head", el("span.pick-name", opt.title)),
              el("p.pick-notes", opt.blurb),
              el("p.pick-notes.muted", opt.argument),
            ),
          ),
        ),
        digital
          ? notice("warn",
              `The ${morph.name} has a cyberbrain, so the character's own mind can be hacked ` +
              "directly. A muse on overwatch is worth the 5 points here.",
            )
          : null,
      ),
    );
  },
};

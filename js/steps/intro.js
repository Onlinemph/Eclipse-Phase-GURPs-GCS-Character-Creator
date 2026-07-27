// Step 0: what the libraries are and how the Ego/morph split works, plus the
// character's name and the campaign's point total.

import { el, field, textInput, button, notice } from "../ui.js";

const LIBRARY_FILES = [
  ["EP_ATT.attr", "Attribute definitions. Load first; the others compute incorrectly without it."],
  ["Eclipse_Phase_Skills.skl", "Setting skills and four techniques."],
  ["Eclipse_Phase_Ego_Packages.adq", "15 backgrounds, 19 factions, 8 reputation networks."],
  ["Eclipse_Phase_Morphs.adq", "103 morphs, priced to chargen cost."],
  ["Eclipse_Phase_Mods_Traits.adq", "Augmentations as traits."],
  ["Eclipse_Phase_Mods_Equipment.eqp", "Augmentations and drugs with cash prices."],
  ["Eclipse_Phase_Gear.eqp", "1,007 items of general equipment."],
  ["Eclipse_Phase_Psi_Sleights.adq", "Async abilities; only needed for asyncs."],
];

export default {
  title: "Start",
  subtitle: "The Ego is the mind and everything learned. The morph is the body, and it is replaceable.",

  render(ctx) {
    const { build, update } = ctx;

    return el("div.stack",
      el("section.card",
        el("h3", "What this builder does"),
        el("p",
          "It walks the eleven steps of the GURPS Eclipse Phase character procedure and writes " +
          "a GCS character file at the end. Every trait, skill and item it puts on the sheet is " +
          "copied from the conversion's own libraries, so the sheet computes in GCS exactly as it " +
          "would if you had dragged each row in by hand.",
        ),
        el("p",
          "Your progress is saved in this browser as you go. Nothing is uploaded anywhere.",
        ),
      ),

      el("section.card",
        el("h3", "The split that governs everything"),
        el("div.split-grid",
          el("div.split-half",
            el("h4", "The Ego owns"),
            el("ul",
              el("li", "DX, IQ, Will and Per"),
              el("li", "Every skill and technique"),
              el("li", "Mental and social traits"),
              el("li", "Reputation, background, faction"),
            ),
            el("p.muted", "These survive death, backup, transmission and resleeving."),
          ),
          el("div.split-half",
            el("h4", "The morph owns"),
            el("ul",
              el("li", "ST, HT, HP and FP"),
              el("li", "DR, damage, appearance"),
              el("li", "Physical advantages and disadvantages"),
              el("li", "Installed augmentations"),
            ),
            el("p.muted", "These change entirely when the character changes bodies."),
          ),
        ),
        notice("warn",
          "Never buy ST, HT, HP or FP. They read 0 on a sheet with no morph attached, which is " +
          "correct — the morph supplies all four at Step 6, and points spent on them here are lost.",
        ),
      ),

      el("section.card",
        el("h3", "The character"),
        el("div.grid-2",
          field("Character name", textInput(build.profile.name, (v) => update((b) => { b.profile.name = v; }))),
          field("Player", textInput(build.profile.player_name, (v) => update((b) => { b.profile.player_name = v; }))),
          field("Age", textInput(build.profile.age, (v) => update((b) => { b.profile.age = v; }))),
          field("Gender", textInput(build.profile.gender, (v) => update((b) => { b.profile.gender = v; }))),
          field("Title", textInput(build.profile.title, (v) => update((b) => { b.profile.title = v; }))),
          field("Organization", textInput(build.profile.organization, (v) => update((b) => { b.profile.organization = v; }))),
        ),
        el("p.muted.small",
          "The rest of the description block, the campaign's point total and GCS's own sheet " +
          "settings are on the Sheet & profile step, near the end.",
        ),
      ),

      el("section.card",
        el("h3", "Libraries for GCS"),
        el("p",
          "The exported sheet is self-contained and opens without these. Add them to GCS's " +
          "Library view anyway if you want to keep editing the character with the full " +
          "Eclipse Phase catalogue to hand.",
        ),
        el("table.table",
          el("thead", el("tr", el("th", "File"), el("th", "Contents"))),
          el("tbody",
            LIBRARY_FILES.map(([name, desc]) =>
              el("tr",
                el("td", el("a", { href: `data/library/${name}`, download: name }, name)),
                el("td.muted", desc),
              ),
            ),
          ),
        ),
      ),

      el("section.card",
        el("h3", "Saved work"),
        el("div.row",
          button("Start over", () => {
            if (confirm("Discard this character and start again?")) ctx.reset();
          }),
        ),
        el("p.muted", "Saving and loading build files lives on the final step."),
      ),
    );
  },
};

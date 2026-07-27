// The description block and the sheet settings, as GCS presents them.
//
// Everything here is written into the exported file: the profile fields fill
// GCS's description panel, and the settings are the same list GCS's Sheet
// Settings dialog offers. Setting them here means the sheet arrives configured
// rather than needing a pass in GCS afterwards.

import {
  el, field, textInput, numberInput, select, checkbox, button, details, notice,
} from "../ui.js";
import { DEFAULT_SETTINGS } from "../state.js";
import { readFile } from "../ui.js";

const DISPLAY_OPTIONS = [
  { value: "not_shown", label: "Not shown" },
  { value: "inline", label: "Inline" },
  { value: "tooltip", label: "Tooltip" },
  { value: "inline_and_tooltip", label: "Inline and tooltip" },
];

const PROGRESSIONS = [
  { value: "basic_set", label: "Basic Set" },
  { value: "knowing_your_own_strength", label: "Knowing Your Own Strength" },
  { value: "no_school_grognard_damage", label: "No School Grognard" },
  { value: "thrust_equals_swing_minus_2", label: "Thrust = Swing − 2" },
  { value: "swing_equals_thrust_plus_2", label: "Swing = Thrust + 2" },
  { value: "phoenix_flame_d3", label: "Phoenix Flame d3" },
];

const LENGTH_UNITS = [
  { value: "ft_in", label: "Feet & inches" }, { value: "in", label: "Inches" },
  { value: "ft", label: "Feet" }, { value: "yd", label: "Yards" },
  { value: "cm", label: "Centimetres" }, { value: "m", label: "Metres" },
];

const WEIGHT_UNITS = [
  { value: "lb", label: "Pounds" }, { value: "oz", label: "Ounces" },
  { value: "kg", label: "Kilograms" }, { value: "g", label: "Grams" },
  { value: "tn", label: "Tons" },
];

const FLAGS = [
  ["show_trait_modifier_adj", "Show trait modifier cost adjustments"],
  ["show_equipment_modifier_adj", "Show equipment modifier cost adjustments"],
  ["show_spell_adj", "Show spell point adjustments"],
  ["show_all_weapons", "Show all weapons, not just the equipped ones"],
  ["hide_unused_weapon_columns", "Hide weapon columns that are entirely empty"],
  ["use_multiplicative_modifiers", "Multiplicative modifiers (P102)"],
  ["use_modifying_dice_plus_adds", "Modifying dice + adds (B269)"],
  ["use_half_stat_defaults", "Half-stat defaults (Dungeon Fantasy RPG)"],
  ["exclude_unspent_points_from_total", "Exclude unspent points from the total"],
  ["show_lifting_st_damage", "Show lifting ST damage"],
  ["show_iq_based_damage", "Show IQ-based damage"],
  ["hide_zero_value_conditional_modifiers", "Hide zero-value conditional modifiers"],
  ["use_title_in_footer", "Use the title in the page footer"],
  ["hide_tl_column", "Hide the TL column"],
  ["hide_lc_column", "Hide the LC column"],
  ["hide_page_ref_column", "Hide the page reference column"],
  ["hide_source_mismatch", "Hide source-mismatch markers"],
];

export default {
  title: "Sheet & profile",
  subtitle: "The description block and the settings GCS would otherwise want configuring by hand.",

  render(ctx) {
    const { build, update } = ctx;
    const set = (key, value) => update((b) => { b.profile[key] = value; });
    const setting = (key, value) => update((b) => { b.settings[key] = value; });

    return el("div.stack",
      el("section.card",
        el("h3", "Description"),
        el("p.muted.small",
          "These fill GCS's description panel. A morph decides most of them in this setting — " +
          "height, weight and appearance change with the body, and the values here describe " +
          "whichever one the character is wearing now.",
        ),
        el("div.grid-3",
          field("Character name", textInput(build.profile.name, (v) => set("name", v))),
          field("Player", textInput(build.profile.player_name, (v) => set("player_name", v))),
          field("Title", textInput(build.profile.title, (v) => set("title", v))),
          field("Organization", textInput(build.profile.organization, (v) => set("organization", v))),
          field("Age", textInput(build.profile.age, (v) => set("age", v))),
          field("Birthday", textInput(build.profile.birthday, (v) => set("birthday", v))),
          field("Gender", textInput(build.profile.gender, (v) => set("gender", v))),
          field("Handedness", textInput(build.profile.handedness, (v) => set("handedness", v))),
          field("Height", textInput(build.profile.height, (v) => set("height", v)), "e.g. 5' 9\""),
          field("Weight", textInput(build.profile.weight, (v) => set("weight", v)), "e.g. 160 lb"),
          field("Eyes", textInput(build.profile.eyes, (v) => set("eyes", v))),
          field("Hair", textInput(build.profile.hair, (v) => set("hair", v))),
          field("Skin", textInput(build.profile.skin, (v) => set("skin", v))),
          field("Religion", textInput(build.profile.religion, (v) => set("religion", v))),
          field("Tech level", textInput(build.profile.tech_level, (v) => set("tech_level", v)),
            "10 in 10 AF."),
          field("Size modifier",
            numberInput(build.profile.SM, (v) => set("SM", v ?? 0), { step: 1 }),
            "Uplift and synthmorph chassis often set this themselves."),
        ),
        portraitField(build, update),
      ),

      el("section.card",
        el("h3", "Sheet settings"),
        el("p.muted.small",
          "The same list GCS shows under Sheet Settings. The defaults are what this conversion " +
          "assumes; change them only if your table has.",
        ),
        el("div.grid-3",
          field("Damage progression", select(PROGRESSIONS,
            build.settings.damage_progression, (v) => setting("damage_progression", v)),
            "Basic Set is what the conversion's damage figures assume."),
          field("Length units", select(LENGTH_UNITS,
            build.settings.default_length_units, (v) => setting("default_length_units", v))),
          field("Weight units", select(WEIGHT_UNITS,
            build.settings.default_weight_units, (v) => setting("default_weight_units", v))),
          field("User description", select(DISPLAY_OPTIONS,
            build.settings.user_description_display, (v) => setting("user_description_display", v))),
          field("Modifiers", select(DISPLAY_OPTIONS,
            build.settings.modifiers_display, (v) => setting("modifiers_display", v))),
          field("Notes", select(DISPLAY_OPTIONS,
            build.settings.notes_display, (v) => setting("notes_display", v))),
          field("Skill level adjustments", select(DISPLAY_OPTIONS,
            build.settings.skill_level_adj_display, (v) => setting("skill_level_adj_display", v))),
        ),
        details("Switches",
          el("div.grid-2",
            FLAGS.map(([key, label]) =>
              checkbox(label, build.settings[key], (v) => setting(key, v)),
            ),
          ),
          el("div.row",
            button("Restore defaults", () => update((b) => {
              b.settings = { ...DEFAULT_SETTINGS };
            }), "ghost"),
          ),
        ),
        notice("info",
          "The Eclipse Phase attribute definitions are written into the sheet whatever these " +
          "say, which is what lets the file open correctly on a machine without the libraries.",
        ),
      ),

      el("section.card",
        el("h3", "Campaign"),
        el("div.grid-2",
          field("Point total",
            numberInput(build.totalPoints, (v) => update((b) => { b.totalPoints = v ?? 250; }),
              { min: 0, step: 5 }),
            "The conversion builds on 250."),
          field("Starting wealth",
            numberInput(build.startingWealth, (v) => update((b) => { b.startingWealth = v ?? 50000; }),
              { min: 0, step: 1000 }),
            "$50,000 at TL10."),
        ),
        field("Player notes", el("textarea", {
          rows: 4,
          value: build.notes,
          placeholder: "Anything you want carried onto the sheet's notes page.",
          oninput: (e) => update((b) => { b.notes = e.target.value; }),
        })),
      ),
    );
  },
};

function portraitField(build, update) {
  const has = Boolean(build.profile.portrait);
  return el("div.row",
    has
      ? el("img.portrait", { src: `data:image/*;base64,${build.profile.portrait}`, alt: "portrait" })
      : el("div.portrait.empty", "no portrait"),
    el("div.stack",
      button("Choose a portrait…", async () => {
        const dataURL = await readImage();
        if (dataURL) update((b) => { b.profile.portrait = dataURL; });
      }),
      has ? button("Remove", () => update((b) => { b.profile.portrait = ""; }), "ghost") : null,
      el("p.muted.small", "Stored on the sheet itself, the way GCS stores it. Keep it small."),
    ),
  );
}

/** Read an image file and return its base64 payload, as GCS's profile expects. */
function readImage() {
  return new Promise((resolve) => {
    const input = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp" });
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
    input.click();
  });
}

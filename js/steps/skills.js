// Step 5: skills. They belong to the Ego permanently.

import {
  el, field, textInput, select, button, details, filterBox, matches, notice, clear,
} from "../ui.js";
import { skillRelativeLevel, SKILL_POINT_STEPS, parseDifficulty } from "../cost.js";
import { GURPS_SKILLS, DIFFICULTIES, ATTRIBUTES } from "../gurps-skills.js";

const DIFF_LABEL = { e: "E", a: "A", h: "H", vh: "VH" };
const ATTR_LABEL = { st: "ST", dx: "DX", iq: "IQ", ht: "HT", will: "Will", per: "Per" };

/** The level a skill reaches, or a symbolic form when the morph supplies the attribute. */
function levelOf(entry, build) {
  const { attr, diff } = parseDifficulty(entry.difficulty);
  const relative = skillRelativeLevel(entry.points, diff);
  if (relative === null) return { text: "—", relative: null };
  const sign = relative >= 0 ? `+${relative}` : String(relative);
  const base = build.attributes[attr];
  if (base === undefined) {
    // ST and HT come from the morph, so the number is not known until Step 6.
    return { text: `${ATTR_LABEL[attr] || attr}${relative ? sign : ""}`, relative };
  }
  return { text: String(base + relative), relative, absolute: base + relative };
}

/** Technique rows carry a bare difficulty ("a"/"h") and default off another skill. */
const isTechnique = (entry) => entry.kind === "technique";

function skillKey(entry) {
  return `${entry.name}|${entry.specialization || ""}`;
}

export default {
  title: "Skills",
  subtitle: "GURPS rolls 3d6 against the skill. 1 point buys the base level, 2 buys +1, then +1 per 4 points.",

  render(ctx) {
    const { build, cat, update } = ctx;
    const chosen = new Set(build.skills.map(skillKey));

    const add = (entry) => update((b) => {
      if (b.skills.some((s) => skillKey(s) === skillKey(entry))) return;
      b.skills.push(entry);
      b.skills.sort((a, c) => a.name.localeCompare(c.name));
    });
    const remove = (key) => update((b) => {
      b.skills = b.skills.filter((s) => skillKey(s) !== key);
    });
    const setPoints = (key, value) => update((b) => {
      const found = b.skills.find((s) => skillKey(s) === key);
      if (found) found.points = value;
    });
    const setField = (key, name, value) => update((b) => {
      const found = b.skills.find((s) => skillKey(s) === key);
      if (found) found[name] = value;
    });

    return el("div.stack",
      chosenTable(build, remove, setPoints, setField),
      epSkillPicker(cat, chosen, add),
      gurpsSkillPicker(chosen, add),
      customSkillForm(add),
      freeSkillsNote(),
    );
  },
};

function chosenTable(build, remove, setPoints, setField) {
  const total = build.skills.reduce((sum, s) => sum + (s.points || 0), 0);

  return el("section.card",
    el("h3", `Skills on the sheet (${build.skills.length}, ${total} points)`),
    build.skills.length === 0
      ? el("p.muted", "Nothing yet. Pick from the lists below.")
      : el("table.table.skill-table",
          el("thead",
            el("tr",
              el("th", "Skill"), el("th", "Type"), el("th", "Points"),
              el("th", "Level"), el("th", ""),
            ),
          ),
          el("tbody",
            build.skills.map((entry) => {
              const key = skillKey(entry);
              const level = levelOf(entry, build);
              const { attr, diff } = parseDifficulty(entry.difficulty);
              return el("tr",
                el("td",
                  el("strong", entry.name),
                  entry.specialization ? el("span", ` (${entry.specialization})`) : null,
                  entry.replacement ? el("span.muted", ` — ${entry.replacement}`) : null,
                  entry.notes ? el("p.muted.small", entry.notes) : null,
                  entry.needsSpec && !entry.specialization
                    ? el("div",
                        textInput("", (v) => setField(key, "specialization", v), {
                          placeholder: "specialization required", class: "inline-input",
                        }),
                      )
                    : null,
                  entry.needsReplacement
                    ? el("div",
                        textInput(entry.replacement || "", (v) => setField(key, "replacement", v), {
                          placeholder: "which skill is this drilled for?", class: "inline-input",
                        }),
                      )
                    : null,
                ),
                el("td.muted",
                  isTechnique(entry)
                    ? `Technique/${DIFF_LABEL[diff] || diff}`
                    : `${ATTR_LABEL[attr] || attr}/${DIFF_LABEL[diff] || diff}`,
                ),
                el("td",
                  select(
                    SKILL_POINT_STEPS.map((p) => ({ value: p, label: String(p) })),
                    entry.points,
                    (v) => setPoints(key, Number(v)),
                    { class: "points-select" },
                  ),
                ),
                el("td.num", level.text),
                el("td", button("Remove", () => remove(key), "ghost")),
              );
            }),
          ),
        ),
  );
}

function epSkillPicker(cat, chosen, add) {
  const body = el("div.pick-list");
  const groups = cat.epSkills.groups.filter((g) => g.name !== "Async Skills");

  const draw = (query = "") => {
    clear(body);
    for (const group of groups) {
      const items = group.items.filter((i) => matches(query, i.name, i.notes));
      if (!items.length) continue;
      body.append(
        el("h4.pick-group", group.name),
        el("div.chip-row",
          items.map((item) => {
            const technique = group.name === "Techniques";
            const key = `${item.name}|`;
            return el(`button.chip${chosen.has(key) ? ".on" : ""}`, {
              type: "button",
              title: item.notes,
              onclick: () => add({
                source: "ep",
                kind: technique ? "technique" : "skill",
                key: item.key,
                name: item.name,
                difficulty: item.difficulty,
                points: technique ? 2 : 1,
                notes: item.notes,
                needsReplacement: item.name.includes("@"),
              }),
            }, item.name);
          }),
        ),
      );
    }
    if (!body.childElementCount) body.append(el("p.muted", "Nothing matches that."));
  };

  draw();
  return el("section.card",
    el("h3", "Skills this conversion supplies"),
    el("p.muted",
      "From Eclipse_Phase_Skills.skl. Professional Skill (Resleeving) is rolled twice on every " +
      "change of body; defaulting it costs −5 on both rolls.",
    ),
    filterBox("Filter setting skills…", draw),
    body,
  );
}

function gurpsSkillPicker(chosen, add) {
  const body = el("div.pick-list");

  const draw = (query = "") => {
    clear(body);
    for (const group of GURPS_SKILLS) {
      const items = group.skills.filter((s) => matches(query, s.name, s.note, (s.spec || []).join(" ")));
      if (!items.length) continue;
      body.append(
        el("h4.pick-group", group.group),
        el("div.chip-row",
          items.map((s) => {
            const { attr, diff } = parseDifficulty(s.difficulty);
            return el(`button.chip${chosen.has(`${s.name}|`) ? ".on" : ""}`, {
              type: "button",
              title: [s.note, s.spec ? `e.g. ${s.spec.join(", ")}` : ""].filter(Boolean).join(" "),
              onclick: () => add({
                source: "gurps",
                kind: "skill",
                name: s.name,
                specialization: "",
                needsSpec: Boolean(s.needsSpec),
                difficulty: s.difficulty,
                points: 1,
                notes: s.note || "",
                techLevel: null,
              }),
            },
              s.name,
              el("span.chip-diff", `${ATTR_LABEL[attr]}/${DIFF_LABEL[diff]}`),
            );
          }),
        ),
      );
    }
    if (!body.childElementCount) body.append(el("p.muted", "Nothing matches that."));
  };

  draw();
  return el("section.card",
    el("h3", "Basic Set skills"),
    el("p.muted",
      "Everything the conversion's skill-mapping tables point at. Anything not listed can be " +
      "added by hand below — GCS computes a skill's level from its difficulty and points, so a " +
      "hand-entered skill behaves exactly like a catalogued one.",
    ),
    filterBox("Filter Basic Set skills…", draw),
    body,
  );
}

function customSkillForm(add) {
  const draft = { name: "", specialization: "", attr: "iq", diff: "a", techLevel: "" };

  const form = el("div.grid-3",
    field("Name", textInput(draft.name, (v) => { draft.name = v; })),
    field("Specialization", textInput(draft.specialization, (v) => { draft.specialization = v; })),
    field("Attribute", select(
      ATTRIBUTES.map((a) => ({ value: a, label: ATTR_LABEL[a] })), draft.attr,
      (v) => { draft.attr = v; },
    )),
    field("Difficulty", select(
      DIFFICULTIES.map((d) => ({ value: d.key, label: d.label })), draft.diff,
      (v) => { draft.diff = v; },
    )),
    field("Tech level", textInput(draft.techLevel, (v) => { draft.techLevel = v; }), "Leave blank for skills with no TL."),
  );

  return el("section.card",
    details("Add a skill by hand",
      el("p.muted",
        "For anything the lists above do not cover. Name it as the Basic Set does and GCS will " +
        "line it up with your own libraries.",
      ),
      form,
      button("Add skill", () => {
        if (!draft.name.trim()) return;
        add({
          source: "custom",
          kind: "skill",
          name: draft.name.trim(),
          specialization: draft.specialization.trim(),
          difficulty: `${draft.attr}/${draft.diff}`,
          points: 1,
          techLevel: draft.techLevel.trim() || null,
        });
      }, "primary"),
    ),
  );
}

function freeSkillsNote() {
  return el("section.card",
    el("h3", "Held at no cost, and two that do not exist"),
    el("p",
      "Every transhuman raised after the Fall has Computer Operation at IQ, literacy, and Area " +
      "Knowledge of their home habitat for free. Free Fall and Environment Suit (Vacc Suit) " +
      "distinguish characters raised off a planetary surface from those raised on one — spacers " +
      "are assumed to have points in both.",
    ),
    notice("info",
      el("strong", "Fray"), " is not a skill: it is Dodge, which derives from Basic Speed. ",
      el("strong", "Networking: [rep]"), " is not a skill either — it is the character's Rep " +
      "level and the Pulling Rank rules from Step 4.",
    ),
  );
}

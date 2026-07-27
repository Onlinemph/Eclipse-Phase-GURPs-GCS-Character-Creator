// Wizard shell: loads catalogues, tracks the build, renders one step at a time.

import * as data from "./data.js";
import * as ui from "./ui.js";
import {
  defaultBuild,
  migrate,
  restore,
  save,
  clearSaved,
  totals,
  cashSpent,
} from "./state.js";
import { STEPS } from "./steps/index.js";
import { sidebarSheet } from "./steps/sheet-panel.js";

const cat = {
  attrDefs: null,
  packages: null,
  epSkills: null,
  morphIndex: null,
  morphs: new Map(),
  augs: null,
  gear: null,
  sleights: null,
};

let build = restore() || defaultBuild();
let current = 0;

const dom = {};

/** Load a catalogue on demand and re-render once it arrives. */
const loaders = {
  augs: () => data.augs().then((d) => { cat.augs = d; }),
  gear: () => data.gear().then((d) => { cat.gear = d; }),
  sleights: () => data.sleights().then((d) => { cat.sleights = d; }),
};

async function need(...names) {
  await Promise.all(names.filter((n) => !cat[n]).map((n) => loaders[n]()));
}

/** Fetch a morph payload once and keep it for the point maths. */
async function needMorph(key) {
  if (!key || cat.morphs.has(key)) return;
  cat.morphs.set(key, await data.morph(key));
}

const ctx = {
  get build() { return build; },
  cat,
  need,
  needMorph,
  update(mutate) {
    if (mutate) mutate(build);
    save(build);
    render();
  },
  reset() {
    build = defaultBuild();
    clearSaved();
    current = 0;
    render();
  },
  replace(next) {
    build = migrate(next);
    save(build);
    render();
  },
  goto(index) {
    current = Math.max(0, Math.min(STEPS.length - 1, index));
    render();
    dom.main.scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
};

function renderNav() {
  ui.clear(dom.nav);
  STEPS.forEach((step, i) => {
    dom.nav.append(
      ui.el(`button.step-link${i === current ? ".current" : ""}`, {
        type: "button",
        onclick: () => ctx.goto(i),
      },
        ui.el("span.step-number", step.label),
        ui.el("span.step-name", step.title),
      ),
    );
  });
}

function renderSheet() {
  ui.clear(dom.sheet).append(sidebarSheet(build, cat));
}

function renderTally() {
  const t = totals(build, cat);
  const cash = cashSpent(build, cat);
  const overPoints = t.remaining < 0;
  const overCash = cash > build.startingWealth;

  ui.clear(dom.tally).append(
    ui.el("div.tally-figure",
      ui.el("span.tally-value" + (overPoints ? ".over" : ""), String(t.remaining)),
      ui.el("span.tally-label", "points left"),
    ),
    ui.el("div.tally-figure",
      ui.el("span.tally-value" + (overCash ? ".over" : ""), ui.money(build.startingWealth - cash)),
      ui.el("span.tally-label", "cash left"),
    ),
    ui.details("Breakdown",
      ui.el("table.tally-table",
        ui.el("tbody",
          Object.entries(t.lines).map(([name, value]) =>
            ui.el("tr", ui.el("th", name), ui.el("td", String(value))),
          ),
          ui.el("tr.tally-total",
            ui.el("th", "spent"),
            ui.el("td", `${t.spent} / ${t.total}`),
          ),
        ),
      ),
    ),
  );
}

function render() {
  renderNav();
  renderTally();
  renderSheet();

  const step = STEPS[current];
  ui.clear(dom.main).append(
    ui.el("header.step-header",
      ui.el("p.step-eyebrow", `Step ${step.label} · ${current + 1} of ${STEPS.length}`),
      ui.el("h2", step.title),
      step.subtitle ? ui.el("p.step-subtitle", step.subtitle) : null,
    ),
    ui.el("div.step-body", step.render(ctx)),
    ui.el("nav.step-nav",
      current > 0
        ? ui.button(`← ${STEPS[current - 1].title}`, () => ctx.goto(current - 1))
        : ui.el("span"),
      current < STEPS.length - 1
        ? ui.button(`${STEPS[current + 1].title} →`, () => ctx.goto(current + 1), "primary")
        : ui.el("span"),
    ),
  );
}

async function start() {
  dom.nav = document.getElementById("step-nav");
  dom.main = document.getElementById("step-main");
  dom.tally = document.getElementById("tally");
  dom.sheet = document.getElementById("sheet-mini");

  try {
    const [attrDefs, packages, epSkills, morphIndex] = await Promise.all([
      data.attributeDefs(),
      data.packages(),
      data.epSkills(),
      data.morphIndex(),
    ]);
    Object.assign(cat, { attrDefs, packages, epSkills, morphIndex });
    if (build.morph?.key) await needMorph(build.morph.key);
  } catch (error) {
    dom.main.append(
      ui.notice("error",
        "Could not load the Eclipse Phase data files. ",
        "If you opened index.html straight from disk, browsers block the fetches this page makes — " +
        "serve the folder over HTTP instead (for example: python3 -m http.server). ",
        ui.el("code", String(error.message || error)),
      ),
    );
    return;
  }

  document.getElementById("loading")?.remove();
  render();
}

start();

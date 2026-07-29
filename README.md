# Eclipse Phase character builder for GURPS &amp; GCS

A browser wizard that walks a player through every step of building a *GURPS Eclipse Phase*
character and writes a GCS character sheet at the end.

It is a static site. There is no build step, no server and no framework: push it to GitHub,
turn on Pages, and it runs.

**[Open the builder →](https://onlinemph.github.io/eclipse-phase-gurps-gcs-character-creator/)**

---

## What it does

The eleven steps of `docs/Character-Creation.md`, in order, each with the choices the
conversion actually offers:

| Step | What you choose |
|---|---|
| 0–1 | The character's name, and the Ego/morph split explained |
| 2 | DX, IQ, Will and Per, priced by `EP_ATT.attr` |
| 3 | One of 15 backgrounds, whole package included |
| 4 | One of 19 factions, plus levels in any of 8 reputation networks |
| 4b | 42 setting traits, 46 derangements and disorders, and any Basic Set trait by hand |
| 5 | 60 setting skills and techniques, ~110 Basic Set skills, or anything typed by hand |
| 6 | One of 101 chargen-legal morphs (of 103), filtered by category and cost, with its slots |
| 7 | 227 augmentations with cash prices, and 213 as traits if you want the mechanics |
| 8 | 1,221 items of gear against $50,000, each carried, stowed or unequipped |
| 9 | The muse, as a 5-point Ally or a 0-point setting conceit |
| 10 | Watts-MacLeod, Async Talent and 81 sleights with Alternative Ability pricing |
| 10b | The full description block and every GCS sheet setting |
| 11 | A point audit, the −50 disadvantage check, and the `.gcs` download |

On top of the procedure, every trait carries the modifier switches GCS shows — about 11,000 of
them across the libraries. Damage Resistance can be Hardened or a Force Field, Extra Limbs can
be Long or Weak, a sleight can be an Alternative Ability. Toggling one changes what the trait
does and what it costs, and the choice is stored against its position in the library payload so
it survives a reload.

Running totals for points and cash sit beside every step, along with a live sheet.

## The live sheet

The panel beside every step is not a summary of your choices — it is the character, computed
from the rows that will be written to the file.

The libraries carry roughly 7,000 features: attribute bonuses, DR by hit location, skill
bonuses, reaction and conditional modifiers. GCS applies them when it opens a sheet. The
builder applies the same ones up front, so ST reads 0 until a morph is attached and then jumps
to whatever the body supplies. Attaching a Fury to an Ego with DX 12 gives ST 20, HP 17, DX 14,
Basic Speed 8.25, thrust 2d−1, swing 3d+2, Basic Lift 80 lb and DR 20 — the same numbers GCS
will show.

The review step expands this into a full sheet: the attribute block with the source of every
bonus, thrust and swing, the lifting table, encumbrance with Move and Dodge at each level, DR
by hit location, resolved skill levels including trait bonuses, and every reaction and
conditional modifier with what granted it.

`tests/sheet.test.mjs` holds this to the library: it parses the stat line out of all 103
morphs' notes and checks that the features resolve to those numbers — 334 values, one known
exception.

## What comes out

A complete GCS 5.x character sheet. Two things make it robust:

**It is self-contained.** The Eclipse Phase attribute definitions are embedded in the sheet's
own settings, so it opens and computes correctly on a machine that has never loaded
`EP_ATT.attr`. You do not need the libraries installed to use a character somebody sent you.

**Everything structural is copied from the libraries verbatim.** Features, prerequisites,
weapons and modifiers come across exactly as GCS would have attached them had you dragged each
row in by hand. The builder authors only the sheet envelope and the handful of fields you
actually pick.

On top of that, the exporter does what GCS itself does on load, so the file means what it says:

- Every id is a fresh, well-formed TID of the right kind, unique within the file.
- `calc` blocks are dropped — GCS recomputes them — and so are `source` links, which would go
  stale the moment the libraries change.
- Rows are trimmed to the shape their id kind declares, matching `ClearUnusedFieldsForType`.

## Two corrections it makes

Working through the libraries turned up two places where the data and GCS disagree. Both are
handled, and both are visible in the interface rather than done silently.

**Morph prices.** Every morph carries a *Morph Price Adjustment* trait sized so the morph nets
out to its documented chargen price — its Eclipse Phase Customization Point cost divided by
four. For 14 of the 103 morphs that adjustment was computed without applying the modifiers
enabled on the morph's own traits, so GCS arrives somewhere else: Flying Squid, Nautiloid,
Q-Morph and Takko are each 40 points more expensive in GCS than documented. The builder
re-points the adjustment on export so the morph lands on its documented price, says so when it
has, and lets you turn the correction off.

The Fenrir is the exception: it has no Customization Point cost and no price adjustment,
because it is a multi-ego combat vehicle listed for GM reference rather than a body a player
sleeves into. It cannot be re-priced, so GCS charges its full 722-point package value. It and
the Reaper are hidden from the morph picker unless you ask for them, and the checks flag them.

**Point rounding.** GURPS rounds a modified advantage cost up (B101) and so does GCS; the
libraries' stored totals were rounded to nearest. Twenty-one rows land a point higher in GCS
than the library says — Ambience Sense is 12, not 11. The wizard shows the number GCS will
show. `tests/fixtures/known-cost-divergences.json` records all 65 divergent rows with the
cause of each, the morph sub-rows included.

Neither correction changes the libraries. They are shipped byte-identical in `data/library/`
and can be downloaded from Step 0.

## Running it locally

The page fetches its data, so `file://` will not work — serve the folder over HTTP.

```sh
git clone https://github.com/onlinemph/eclipse-phase-gurps-gcs-character-creator.git
cd eclipse-phase-gurps-gcs-character-creator
python3 -m http.server 8000     # or: npm run serve
```

Then open <http://localhost:8000>.

## Hosting it yourself

Settings → Pages → Source: **GitHub Actions**. `.github/workflows/pages.yml` publishes the
repository root on every push to `main`. Serving the root as a branch source works too — the
`.nojekyll` file is already there.

## Tests

```sh
npm test           # schema, cost engine, feature resolution and export fixtures
npm run test:all   # the above plus two real Chromium runs through the wizard
```

| Suite | What it holds the code to |
|---|---|
| `tests/library.test.mjs` | All 17,423 library rows across nine files validate against the GCS 5 schema. Since GCS loads these files, a failure here means the validator is wrong — this is what keeps the export test honest. |
| `tests/cost.test.mjs` | The cost engine reproduces GCS's `AdjustedPoints` across 4,374 trait rows, with the 65 known library divergences pinned to a fixture. |
| `tests/sheet.test.mjs` | The GURPS damage, lift, Move, Dodge and encumbrance tables, plus 334 stat-line values across all 103 morphs resolved from their features. |
| `tests/export.test.mjs` | Five fixture characters build end to end and validate: TID format and uniqueness, container consistency, no unknown fields, correct attribute round-trips, one aptitude enabled per slot, morphs at their documented price, Alternative Abilities marked correctly, sheet settings and profile fields round-tripped, carried/stowed/unequipped states, hand-entered traits priced identically on both sides, and a toggled modifier arriving enabled on the right row. |
| `tests/browser.test.mjs` | Chromium clicks through all thirteen steps, toggles a modifier, reads the sheet panel, downloads the `.gcs`, validates it, and checks that progress survives a reload. |
| `tests/typing.test.mjs` | A touch-emulated phone types into text, number and textarea fields and drags a slider, checking focus, the caret and the cells that update beside them. |

The schema in `tests/gcs-schema.mjs` is derived from the Go structs in
[`richardwilkes/gcs`](https://github.com/richardwilkes/gcs) — `EntityData`, `TraitData`,
`SkillData`, `EquipmentData`, `NoteData` and their enums.

## Layout

```
index.html            the page
styles.css
js/
  app.js              wizard shell: catalogues, state, navigation
  state.js            the build, the point maths, the rules checks
  cost.js             GURPS point costs, matching GCS's AdjustedPoints
  features.js         resolves attribute, DR and skill bonuses; the GURPS tables
  sheet.js            the live character sheet, computed from the assembled rows
  modifiers.js        addressing and applying the libraries' modifier switches
  gcs.js              the .gcs writer: TIDs, sheet envelope, morph pricing
  build.js            assembles the rows, then turns them into a GCS entity
  data.js             on-demand catalogue loading
  gurps-skills.js     the Basic Set skills the conversion's tables name
  steps/              one module per step, plus the sheet panel
data/
  library/            the eight GCS libraries, byte-identical to their source
  gen/                catalogues generated from them, committed so Pages needs no build
tools/build_data.py   regenerates data/gen
docs/                 the conversion's own documents
tests/
```

`data/gen` is committed on purpose: GitHub Pages serves files, not build steps. Regenerate it
with `npm run data` after changing anything in `data/library`; CI fails if the two are out of
step.

## Requirements

[GCS](https://gurpscharactersheet.com/) 5.x to open the exported sheet. For play: *GURPS Basic
Set*, plus *Ultra-Tech* for gear, *Bio-Tech* for augmentations, *Psionic Powers* for sleights,
*Social Engineering* for reputation, and *Spaceships* or *Space* for habitats.

## Credits and licensing

Character data comes from the GURPS Eclipse Phase conversion in `data/library/` and `docs/`.
*Eclipse Phase* is released by Posthuman Studios under a Creative Commons licence. *GURPS* is a
trademark of Steve Jackson Games; this is an unofficial fan project.

No `LICENSE` file is included — the terms for the builder's own code are the repository owner's
to set, and the conversion data carries its own.

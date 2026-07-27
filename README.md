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
| 0–1 | Campaign point total and starting wealth; the Ego/morph split explained |
| 2 | DX, IQ, Will and Per, priced by `EP_ATT.attr` |
| 3 | One of 15 backgrounds, whole package included |
| 4 | One of 19 factions, plus levels in any of 8 reputation networks |
| 5 | 59 setting skills and techniques, ~110 Basic Set skills, or anything typed by hand |
| 6 | One of 103 morphs, filtered by category and cost, with its customization slots |
| 7 | 91 augmentations with cash prices, and 126 as traits if you want the mechanics |
| 8 | 1,007 items of gear against $50,000 |
| 9 | The muse, as a 5-point Ally or a 0-point setting conceit |
| 10 | Watts-MacLeod, Async Talent and 68 sleights with Alternative Ability pricing |
| 11 | A point audit, the −50 disadvantage check, and the `.gcs` download |

Running totals for points and cash sit beside every step. Progress is kept in the browser and
can be exported as a build file to move between machines. Nothing is uploaded anywhere.

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
four. For 19 of the 103 morphs that adjustment was computed without applying the modifiers
enabled on the morph's own traits, so GCS arrives somewhere else. Flying Squid, Nautiloid,
Q-Morph and Takko are each 40 points more expensive in GCS than documented; Samsa and Novacrab
each come out 24 points cheaper, at a negative price. The builder re-points the adjustment on
export so the morph lands on its documented price, says so when it has, and lets you turn the
correction off.

**Point rounding.** GURPS rounds a modified advantage cost up (B101) and so does GCS; the
libraries' stored totals were rounded to nearest. Seventeen sleights land a point higher in
GCS than the library says — Ambience Sense is 12, not 11. The wizard shows the number GCS will
show. `tests/fixtures/known-cost-divergences.json` records all 90 divergent rows with the
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
npm test           # schema, cost engine and export fixtures
npm run test:all   # the above plus a real Chromium run through the whole wizard
```

| Suite | What it holds the code to |
|---|---|
| `tests/library.test.mjs` | All 16,793 library rows validate against the GCS 5 schema. Since GCS loads these files, a failure here means the validator is wrong — this is what keeps the export test honest. |
| `tests/cost.test.mjs` | The cost engine reproduces GCS's `AdjustedPoints` across 4,061 trait rows, with the 97 known library divergences pinned to a fixture. |
| `tests/export.test.mjs` | Four fixture characters build end to end and validate: TID format and uniqueness, container consistency, no unknown fields, correct attribute round-trips, one aptitude enabled per slot, morphs at their documented price, Alternative Abilities marked correctly. |
| `tests/browser.test.mjs` | Chromium clicks through all eleven steps, downloads the `.gcs`, validates it, and checks that progress survives a reload. |

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
  gcs.js              the .gcs writer: TIDs, sheet envelope, morph pricing
  build.js            turns a build into a GCS entity
  data.js             on-demand catalogue loading
  gurps-skills.js     the Basic Set skills the conversion's tables name
  steps/              one module per step
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

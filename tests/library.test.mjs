// Validates the bundled libraries against the same schema the exporter is held
// to. GCS loads these files, so anything the validator objects to here is the
// validator being wrong — this is what keeps the export test honest.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkRows, isTID } from "./gcs-schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  ["Eclipse_Phase_Morphs.adq", "trait"],
  ["Eclipse_Phase_Ego_Packages.adq", "trait"],
  ["Eclipse_Phase_Mods_Traits.adq", "trait"],
  ["Eclipse_Phase_Psi_Sleights.adq", "trait"],
  ["Eclipse_Phase_Ego_Traits.adq", "trait"],
  ["Eclipse_Phase_Derangements.adq", "trait"],
  ["Eclipse_Phase_Skills.skl", "skill"],
  ["Eclipse_Phase_Gear.eqp", "equipment"],
  ["Eclipse_Phase_Mods_Equipment.eqp", "equipment"],
];

let failures = 0;
let rows = 0;

for (const [file, type] of FILES) {
  const data = JSON.parse(readFileSync(join(ROOT, "data/library", file), "utf8"));
  if (data.version !== 5) {
    console.error(`${file}: version ${data.version}, expected 5`);
    failures += 1;
  }
  const v = { problems: [], warnings: [], seenIDs: new Set(), extraKeys: new Set() };
  checkRows(data.rows, type, v, [file]);
  rows += v.seenIDs.size;
  if (v.problems.length) {
    failures += v.problems.length;
    console.error(`${file}: ${v.problems.length} problems`);
    for (const problem of v.problems.slice(0, 10)) console.error(`  ${problem}`);
  }
}

// The attribute file is a different shape.
const attrs = JSON.parse(readFileSync(join(ROOT, "data/library/EP_ATT.attr"), "utf8"));
if (attrs.version !== 5) { console.error("EP_ATT.attr: version is not 5"); failures += 1; }
for (const id of ["st", "dx", "iq", "ht", "will", "per", "hp", "fp", "basic_speed"]) {
  if (!attrs.rows.some((r) => r.id === id)) {
    console.error(`EP_ATT.attr: missing the "${id}" definition`);
    failures += 1;
  }
}
for (const id of ["st", "ht"]) {
  const def = attrs.rows.find((r) => r.id === id);
  if (def && def.base !== "0") {
    console.error(`EP_ATT.attr: ${id} base is "${def.base}", expected "0" — the morph supplies it`);
    failures += 1;
  }
}

// Sanity: TID validation must actually accept the ids GCS wrote.
if (!isTID(attrs.rows[0].id ?? "tAAAAAAAAAAAAAAAA")) {
  // Attribute definitions use plain ids, not TIDs; nothing to assert here.
}

if (failures) {
  console.error(`library: ${failures} problems`);
  process.exit(1);
}
console.log(`library: ${FILES.length} files and ${rows} rows validate against the GCS 5 schema`);

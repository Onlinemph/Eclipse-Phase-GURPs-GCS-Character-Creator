// The character creation procedure, in order. Each step constrains the next,
// which is why the order is fixed.
//
// `label` is the step number from Documents/Character-Creation.md, so a player
// reading along in the PDF lands in the right place. Steps 0 and 1 — loading
// the libraries and understanding the Ego/morph split — are one screen here.
// Two steps carry a letter because the procedure does not number them: traits
// beyond the packages, and the sheet settings GCS would otherwise want set by
// hand.

import intro from "./intro.js";
import attributes from "./attributes.js";
import background from "./background.js";
import faction from "./faction.js";
import traits from "./traits.js";
import skills from "./skills.js";
import morph from "./morph.js";
import augmentations from "./augmentations.js";
import equipment from "./equipment.js";
import muse from "./muse.js";
import asyncStep from "./async.js";
import settings from "./settings.js";
import review from "./review.js";

const ORDER = [
  ["0–1", intro],
  ["2", attributes],
  ["3", background],
  ["4", faction],
  ["4b", traits],
  ["5", skills],
  ["6", morph],
  ["7", augmentations],
  ["8", equipment],
  ["9", muse],
  ["10", asyncStep],
  ["10b", settings],
  ["11", review],
];

export const STEPS = ORDER.map(([label, step]) => ({ ...step, label }));

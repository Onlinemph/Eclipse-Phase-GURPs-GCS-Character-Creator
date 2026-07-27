// Addressing and applying the modifier toggles a library row carries.
//
// GCS treats a trait's modifiers as a set of switches: Damage Resistance can be
// Hardened or a Force Field, Extra Limbs can be Long or Weak, a sleight can be
// an Alternative Ability. The libraries ship about eleven thousand of these,
// all disabled, and toggling them is most of what customizing a character in
// GCS actually consists of.
//
// A choice is stored against the position of the row inside its library
// payload, which is stable because the payloads are generated and committed.

/** The customization slots are driven by their own picker, not this editor. */
export const APTITUDE_PREFIX = "Choose One Aptitude";

/** Walk a payload, yielding an index-path address for every row. */
export function* addressed(root, path = []) {
  yield { address: path.join("."), node: root, depth: path.length };
  const children = root.children || [];
  for (let i = 0; i < children.length; i += 1) {
    yield* addressed(children[i], [...path, i]);
  }
}

/** Rows carrying modifiers a player may toggle, with their addresses. */
export function toggleableRows(root) {
  const out = [];
  for (const { address, node } of addressed(root)) {
    if (String(node.name || "").startsWith(APTITUDE_PREFIX)) continue;
    const modifiers = (node.modifiers || []).map((mod, index) => ({ index, mod }));
    if (modifiers.length) out.push({ address, name: node.name, modifiers });
  }
  return out;
}

/** Whether a modifier is on, taking the player's choice over the library default. */
export function isEnabled(choices, address, index, mod) {
  const chosen = choices?.[address]?.[index];
  return chosen === undefined ? !mod.disabled : chosen;
}

/**
 * Apply a set of choices to a cloned payload.
 * @param {object} root a payload the caller owns and may mutate
 * @param {object} choices address -> {modifierIndex: enabled}
 */
export function applyChoices(root, choices) {
  if (!choices) return root;
  for (const { address, node } of addressed(root)) {
    const forRow = choices[address];
    if (!forRow) continue;
    (node.modifiers || []).forEach((mod, index) => {
      const chosen = forRow[index];
      if (chosen !== undefined) mod.disabled = !chosen;
    });
  }
  return root;
}

/** Equipment modifiers live in a flat list on one row, so the address is "". */
export function applyEquipmentChoices(row, choices) {
  const forRow = choices?.[""] || choices;
  if (!forRow) return row;
  (row.modifiers || []).forEach((mod, index) => {
    const chosen = forRow[index];
    if (chosen !== undefined) mod.disabled = !chosen;
  });
  return row;
}

/** How many modifiers a payload offers, and how many are currently on. */
export function summarize(root, choices) {
  let available = 0;
  let enabled = 0;
  for (const row of toggleableRows(root)) {
    for (const { index, mod } of row.modifiers) {
      available += 1;
      if (isEnabled(choices, row.address, index, mod)) enabled += 1;
    }
  }
  return { available, enabled };
}

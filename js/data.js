// Loads the generated catalogues. Everything is fetched on demand and cached,
// so opening the wizard costs a few kilobytes; the gear catalogue and the
// individual morph payloads only arrive when a step actually needs them.

const BASE = new URL("../data/gen/", import.meta.url);
const cache = new Map();

function get(path) {
  if (!cache.has(path)) {
    cache.set(
      path,
      fetch(new URL(path, BASE)).then((res) => {
        if (!res.ok) throw new Error(`could not load ${path}: ${res.status}`);
        return res.json();
      }).catch((err) => {
        cache.delete(path);
        throw err;
      }),
    );
  }
  return cache.get(path);
}

export const attributeDefs = () => get("attributes.json").then((d) => d.rows);
export const packages = () => get("packages.json");
export const epSkills = () => get("skills-ep.json");
export const morphIndex = () => get("morph-index.json").then((d) => d.morphs);
export const morph = (key) => get(`morphs/${key}.json`);
export const augs = () => get("augs.json");
export const gear = () => get("gear.json");
export const sleights = () => get("sleights.json");
export const egoTraits = () => get("ego-traits.json");
export const manifest = () => get("manifest.json");

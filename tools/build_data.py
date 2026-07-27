#!/usr/bin/env python3
"""Generate the browser-facing data set from the GCS libraries in data/library.

The web app never parses the 5 MB morph library at runtime. This script slices
the libraries into small catalogues (names, costs, notes) plus per-item payloads
that hold the verbatim GCS rows the exporter drops into a character sheet.

Payloads keep every field GCS understands and drop only `calc` (output-only,
recomputed on load) and `source` (library-sync bookkeeping that would go stale).

Run from the repository root:

    python3 tools/build_data.py
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "data" / "library"
GEN = ROOT / "data" / "gen"

# Fields GCS writes but recomputes on load. Carrying them into a sheet is
# harmless but wasteful, and stale values are confusing when diffing files.
STRIP_KEYS = ("calc", "source")


def load(name: str) -> dict:
    with (LIB / name).open(encoding="utf-8") as fh:
        return json.load(fh)


def clean(node):
    """Deep-copy a GCS row, dropping output-only fields."""
    if isinstance(node, dict):
        return {k: clean(v) for k, v in node.items() if k not in STRIP_KEYS}
    if isinstance(node, list):
        return [clean(v) for v in node]
    return node


def label(row: dict) -> str:
    # Traits and skills use "name"; equipment uses "description".
    return row.get("name") or row.get("description") or "?"


def points_of(row: dict) -> float:
    return (row.get("calc") or {}).get("points", 0)


def value_of(row: dict) -> float:
    return (row.get("calc") or {}).get("value", 0)


def weight_of(row: dict) -> str:
    return (row.get("calc") or {}).get("weight", "")


_slug_used: dict[str, int] = {}


def slug(text: str, scope: str = "") -> str:
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "item"
    key = f"{scope}/{base}"
    seen = _slug_used.get(key, 0)
    _slug_used[key] = seen + 1
    return base if seen == 0 else f"{base}-{seen + 1}"


def walk(rows, path=()):
    """Yield (container path, row) for every leaf row."""
    for row in rows:
        name = label(row)
        if row.get("children"):
            yield from walk(row["children"], path + (name,))
        else:
            yield path, row


def descend(row, path=()):
    """Yield (path, row) for every row, containers included."""
    yield path, row
    for child in row.get("children", []):
        yield from descend(child, path + (label(row),))


# ---------------------------------------------------------------------------
# attributes
# ---------------------------------------------------------------------------


def build_attributes() -> dict:
    attrs = load("EP_ATT.attr")
    GEN.joinpath("attributes.json").write_text(
        json.dumps(attrs, separators=(",", ":")), encoding="utf-8"
    )
    return {"attributes": len(attrs["rows"])}


# ---------------------------------------------------------------------------
# ego packages: backgrounds, factions, reputation networks
# ---------------------------------------------------------------------------


def build_packages() -> dict:
    src = load("Eclipse_Phase_Ego_Packages.adq")
    groups = {label(r): r for r in src["rows"]}

    def package_list(group_name: str, scope: str) -> list[dict]:
        out = []
        for row in groups[group_name]["children"]:
            out.append(
                {
                    "key": slug(label(row), scope),
                    "name": label(row),
                    "points": points_of(row),
                    "notes": row.get("local_notes", ""),
                    "contents": [
                        {
                            "name": label(c),
                            "points": points_of(c),
                            "notes": c.get("local_notes", ""),
                        }
                        for c in row.get("children", [])
                    ],
                    "payload": clean(row),
                }
            )
        return out

    backgrounds = package_list("Backgrounds", "bg")
    factions = package_list("Factions", "fac")

    repnets = []
    for row in groups["Reputation Networks"]["children"]:
        name = label(row)
        # "Reputation: @-rep (The @-List)" -> code "@-rep", network "The @-List"
        match = re.match(r"Reputation:\s*(\S+)\s*\((.+)\)", name)
        repnets.append(
            {
                "key": slug(name, "rep"),
                "name": name,
                "code": match.group(1) if match else name,
                "network": match.group(2) if match else "",
                "per_level": row.get("points_per_level", 3),
                "notes": row.get("local_notes", ""),
                "payload": clean(row),
            }
        )

    GEN.joinpath("packages.json").write_text(
        json.dumps(
            {"backgrounds": backgrounds, "factions": factions, "repnets": repnets},
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    return {
        "backgrounds": len(backgrounds),
        "factions": len(factions),
        "repnets": len(repnets),
    }


# ---------------------------------------------------------------------------
# skills supplied by the conversion
# ---------------------------------------------------------------------------


def build_skills() -> dict:
    src = load("Eclipse_Phase_Skills.skl")
    groups = []
    total = 0
    for group in src["rows"]:
        items = []
        for row in group.get("children", []):
            items.append(
                {
                    "key": slug(label(row), "skl"),
                    "name": label(row),
                    "difficulty": row.get("difficulty", ""),
                    "reference": row.get("reference", ""),
                    "notes": row.get("local_notes", ""),
                    "technique": "default" in row,
                    "payload": clean(row),
                }
            )
        total += len(items)
        groups.append({"name": label(group), "items": items})

    GEN.joinpath("skills-ep.json").write_text(
        json.dumps({"groups": groups}, separators=(",", ":")), encoding="utf-8"
    )
    return {"ep_skills": total}


# ---------------------------------------------------------------------------
# morphs
# ---------------------------------------------------------------------------

STAT_RE = re.compile(r"\b(ST|HT|HP|FP|DX|IQ|Will|Per|DR|SM)\s*([+-]?\d+)")
CP_RE = re.compile(r"(\d+)\s*CP")


def build_morphs() -> dict:
    src = load("Eclipse_Phase_Morphs.adq")
    outdir = GEN / "morphs"
    if outdir.exists():
        shutil.rmtree(outdir)
    outdir.mkdir(parents=True)

    index = []
    for category in src["rows"]:
        cat_name = label(category)
        for morph in category["children"]:
            name = label(morph)
            key = slug(name, "morph")
            notes = morph.get("local_notes", "")

            slots = []
            for _, row in descend(morph):
                if row.get("name", "").startswith("Choose One Aptitude"):
                    slots.append(
                        [
                            {
                                "name": mod.get("name", ""),
                                "notes": mod.get("local_notes", ""),
                            }
                            for mod in row.get("modifiers", [])
                        ]
                    )

            cp = CP_RE.search(notes)
            index.append(
                {
                    "key": key,
                    "name": name,
                    "category": cat_name,
                    "points": points_of(morph),
                    "cp": int(cp.group(1)) if cp else None,
                    "notes": notes,
                    "slots": len(slots),
                    "slot_options": slots[0] if slots else [],
                    "stats": {m.group(1): m.group(2) for m in STAT_RE.finditer(notes)},
                }
            )
            outdir.joinpath(f"{key}.json").write_text(
                json.dumps(clean(morph), separators=(",", ":")), encoding="utf-8"
            )

    GEN.joinpath("morph-index.json").write_text(
        json.dumps({"morphs": index}, separators=(",", ":")), encoding="utf-8"
    )
    return {"morphs": len(index)}


# ---------------------------------------------------------------------------
# augmentations: equipment (cash) and traits (mechanics)
# ---------------------------------------------------------------------------

# Path segment in the traits library marking bioware a synthmorph can take.
SYNTH_SAFE = "Bioware that works with Synthmorphs"


def compatibility(path: tuple[str, ...]) -> str:
    joined = " / ".join(path)
    if SYNTH_SAFE in path:
        return "any"
    if "Bioware" in path:
        return "biomorph"
    if "Cyberware" in path or "Nanoware" in path or "Robotic Enhancements" in joined:
        return "any"
    if "Pharmaceuticals" in joined or "Nanodrugs" in joined:
        return "biomorph"
    return "any"


def build_augs() -> dict:
    eq_src = load("Eclipse_Phase_Mods_Equipment.eqp")
    tr_src = load("Eclipse_Phase_Mods_Traits.adq")

    equipment = []
    for path, row in walk(eq_src["rows"]):
        equipment.append(
            {
                "key": slug(label(row), "aug"),
                "name": label(row),
                "group": path[0] if path else "Other",
                "path": list(path),
                "price": value_of(row),
                "lc": row.get("legality_class", ""),
                "notes": row.get("local_notes", ""),
                "compat": compatibility(path),
                "payload": clean(row),
            }
        )

    traits = []
    for path, row in walk(tr_src["rows"]):
        traits.append(
            {
                "key": slug(label(row), "augt"),
                "name": label(row),
                "group": path[0] if path else "Other",
                "path": list(path),
                "points": points_of(row),
                "notes": row.get("local_notes", ""),
                "compat": compatibility(path),
                "payload": clean(row),
            }
        )

    GEN.joinpath("augs.json").write_text(
        json.dumps({"equipment": equipment, "traits": traits}, separators=(",", ":")),
        encoding="utf-8",
    )
    return {"aug_equipment": len(equipment), "aug_traits": len(traits)}


# ---------------------------------------------------------------------------
# general gear
# ---------------------------------------------------------------------------


def build_gear() -> dict:
    src = load("Eclipse_Phase_Gear.eqp")
    categories = []
    total = 0
    for category in src["rows"]:
        items = []
        for path, row in walk([category]):
            items.append(
                {
                    "key": slug(label(row), "gear"),
                    "name": label(row),
                    "path": list(path[1:]),
                    "price": value_of(row),
                    "weight": weight_of(row),
                    "lc": row.get("legality_class", ""),
                    "tl": row.get("tech_level", ""),
                    "reference": row.get("reference", ""),
                    "notes": row.get("local_notes", ""),
                    "armed": bool(row.get("weapons")),
                    "payload": clean(row),
                }
            )
        total += len(items)
        categories.append({"name": label(category), "items": items})

    GEN.joinpath("gear.json").write_text(
        json.dumps({"categories": categories}, separators=(",", ":")), encoding="utf-8"
    )
    return {"gear": total}


# ---------------------------------------------------------------------------
# async psi
# ---------------------------------------------------------------------------

SLEIGHT_SKILL_RE = re.compile(r"Skill:\s*([^(]+)\(([^)]+)\)")


def build_sleights() -> dict:
    src = load("Eclipse_Phase_Psi_Sleights.adq")
    skl = load("Eclipse_Phase_Skills.skl")
    async_skills = {}
    for group in skl["rows"]:
        if label(group) == "Async Skills":
            for row in group.get("children", []):
                async_skills[label(row)] = clean(row)

    core, groups = [], []
    for group in src["rows"]:
        gname = label(group)
        items = []
        for row in group.get("children", []):
            name = label(row)
            notes = row.get("local_notes", "")
            match = SLEIGHT_SKILL_RE.search(notes)
            skill_name = match.group(1).strip() if match else None
            alt = next(
                (
                    m
                    for m in row.get("modifiers", [])
                    if m.get("name") == "Alternative Ability"
                ),
                None,
            )
            entry = {
                "key": slug(name, "psi"),
                "name": name,
                "group": gname,
                "points": points_of(row),
                "notes": notes,
                "can_alternate": alt is not None,
                # Passive/always-on sleights cannot be Alternative Abilities.
                "passive": alt is None,
                "skill": skill_name,
                "skill_payload": async_skills.get(skill_name) if skill_name else None,
                "payload": clean(row),
            }
            items.append(entry)
        if gname == "Async Core":
            core = items
        else:
            groups.append({"name": gname, "items": items})

    GEN.joinpath("sleights.json").write_text(
        json.dumps({"core": core, "groups": groups}, separators=(",", ":")),
        encoding="utf-8",
    )
    return {"sleights": sum(len(g["items"]) for g in groups)}


def main() -> int:
    if not LIB.exists():
        print(f"missing library directory: {LIB}", file=sys.stderr)
        return 1
    GEN.mkdir(parents=True, exist_ok=True)

    counts = {}
    for build in (
        build_attributes,
        build_packages,
        build_skills,
        build_morphs,
        build_augs,
        build_gear,
        build_sleights,
    ):
        counts.update(build())

    GEN.joinpath("manifest.json").write_text(
        json.dumps({"format": 1, "counts": counts}, indent=1), encoding="utf-8"
    )
    for key, value in sorted(counts.items()):
        print(f"{key:>16}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

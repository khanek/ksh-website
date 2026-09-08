/**
 * Build script: merges structure.json with flat locale files (en.flat.json, pl.flat.json)
 * and writes nested en.json and pl.json for the app.
 *
 * Workflow:
 * - Edit structure.json when adding/removing keys (single source of structure).
 * - Edit en.flat.json and pl.flat.json for translation strings only.
 * - Run: node scripts/build-i18n.mjs (or via npm run build / npm run dev).
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(__dirname, "..", "src", "i18n");

/**
 * Flatten a nested object to dot-notation keys. Arrays use numeric indices.
 * @param {object} obj
 * @param {string} prefix
 * @returns {Record<string, string | string[]>}
 */
function flatten(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flatten(value, path));
    } else if (Array.isArray(value)) {
      const first = value[0];
      if (typeof first === "string") {
        value.forEach((v, i) => (out[`${path}.${i}`] = v));
      } else {
        value.forEach((item, i) => Object.assign(out, flatten(item, `${path}.${i}`)));
      }
    } else {
      out[path] = value;
    }
  }
  return out;
}

/**
 * Build a structure object: same shape as input, every leaf value is its dot-path.
 * Used as the single source of keys and nesting.
 * @param {object} obj
 * @param {string} prefix
 * @returns {object}
 */
function buildStructure(obj, prefix = "") {
  const out = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      out[key] = buildStructure(value, path);
    } else if (Array.isArray(value)) {
      const first = value[0];
      if (typeof first === "string") {
        out[key] = value.map((_, i) => `${path}.${i}`);
      } else {
        out[key] = value.map((item, i) => buildStructure(item, `${path}.${i}`));
      }
    } else {
      out[key] = path;
    }
  }
  return out;
}

/**
 * Unflatten a flat key-value object into nested form using structure as the template.
 * @param {Record<string, string | string[]>} flat
 * @param {object} structure
 * @returns {object}
 */
function unflatten(flat, structure) {
  if (Array.isArray(structure)) {
    return structure.map((item, i) => {
      if (typeof item === "string") {
        return flat[item] ?? "";
      }
      return unflatten(flat, item);
    });
  }
  const out = {};
  for (const [key, value] of Object.entries(structure)) {
    if (typeof value === "string") {
      out[key] = flat[value] ?? "";
    } else {
      out[key] = unflatten(flat, value);
    }
  }
  return out;
}

/**
 * Merge two structure objects so arrays use the longer length (keeps all keys across locales).
 * @param {object} a
 * @param {object} b
 * @returns {object}
 */
function mergeStructures(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    const out = [];
    for (let i = 0; i < len; i++) {
      const ai = a[i];
      const bi = b[i];
      if (ai !== undefined && bi !== undefined && typeof ai === "object" && typeof bi === "object") {
        out.push(mergeStructures(ai, bi));
      } else {
        out.push(ai ?? bi);
      }
    }
    return out;
  }
  if (a !== null && typeof a === "object" && !Array.isArray(a) && b !== null && typeof b === "object" && !Array.isArray(b)) {
    const out = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (a[k] !== undefined && b[k] !== undefined) {
        out[k] = mergeStructures(a[k], b[k]);
      } else {
        out[k] = a[k] ?? b[k];
      }
    }
    return out;
  }
  return a ?? b;
}

/**
 * One-time init: generate structure.json and *.flat.json from current en.json and pl.json.
 * Uses merged structure so keys present in any locale are kept.
 * Run: node scripts/build-i18n.mjs --init
 */
function init() {
  const enPath = join(I18N_DIR, "en.json");
  const plPath = join(I18N_DIR, "pl.json");
  const en = JSON.parse(readFileSync(enPath, "utf-8"));
  const pl = JSON.parse(readFileSync(plPath, "utf-8"));

  const structureEn = buildStructure(en);
  const structurePl = buildStructure(pl);
  const structure = mergeStructures(structureEn, structurePl);

  const enFlat = flatten(en);
  const plFlat = flatten(pl);

  writeFileSync(join(I18N_DIR, "structure.json"), JSON.stringify(structure, null, 2) + "\n", "utf-8");
  writeFileSync(join(I18N_DIR, "en.flat.json"), JSON.stringify(enFlat, null, 2) + "\n", "utf-8");
  writeFileSync(join(I18N_DIR, "pl.flat.json"), JSON.stringify(plFlat, null, 2) + "\n", "utf-8");

  console.log("Created structure.json, en.flat.json, pl.flat.json");
}

function build() {
  const structurePath = join(I18N_DIR, "structure.json");
  const structure = JSON.parse(readFileSync(structurePath, "utf-8"));

  const locales = ["en", "pl"];
  for (const locale of locales) {
    const flatPath = join(I18N_DIR, `${locale}.flat.json`);
    const outPath = join(I18N_DIR, `${locale}.json`);
    const flat = JSON.parse(readFileSync(flatPath, "utf-8"));
    const nested = unflatten(flat, structure);
    writeFileSync(outPath, JSON.stringify(nested, null, 2) + "\n", "utf-8");
    console.log(`Wrote ${outPath}`);
  }
}

const isInit = process.argv.includes("--init");
if (isInit) {
  init();
} else {
  build();
}

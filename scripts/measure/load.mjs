import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const loadTopology = (file) => JSON.parse(readFileSync(join(root, file), "utf8"));
export const readArtifact = (file) => readFileSync(join(root, file));
export const pointCount = (topology) => topology.arcs.reduce((sum, arc) => sum + arc.length, 0);

export async function optional(name) {
  try {
    return await import(name);
  } catch {
    console.error(`Missing ${name}. Run: npm install --no-save topojson-simplify@3 polygon-clipping@0.15`);
    process.exit(1);
  }
}

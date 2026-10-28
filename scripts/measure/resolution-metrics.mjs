// Figures for docs/guides/choosing-a-resolution: the measured table and the
// list of UN members missing from the 110m file.
import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import { geoArea, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { observerStateIds, unMemberIds } from "../coverage-ids.mjs";
import { loadTopology, pointCount, readArtifact } from "./load.mjs";

const draws = (f) => {
  const area = geoArea(f);
  return area > 0 && area < 2 * Math.PI;
};
const path = geoPath(geoNaturalEarth1().fitSize([960, 500], { type: "Sphere" }));
const rows = {};

for (const scale of ["110m", "50m", "10m"]) {
  const file = `countries-${scale}.json`;
  const bytes = readArtifact(file);
  const topology = loadTopology(file);
  const countries = feature(topology, topology.objects.countries);
  const ids = new Set(countries.features.map((f) => f.id));
  const drawn = new Set(countries.features.filter(draws).map((f) => f.id));
  rows[scale] = {
    bytes: bytes.length,
    gzip9: gzipSync(bytes, { level: 9 }).length,
    brotli11: brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
    features: countries.features.length,
    arcs: topology.arcs.length,
    points: pointCount(topology),
    geojsonBytes: JSON.stringify(countries).length,
    svgPathChars960: countries.features.reduce((sum, f) => sum + (path(f) ?? "").length, 0),
    unMembersPresent: unMemberIds.filter((id) => ids.has(id)).length,
    observersPresent: observerStateIds.filter((id) => ids.has(id)).length,
    unMembersAndObserversThatDraw: [...unMemberIds, ...observerStateIds].filter((id) => drawn.has(id)).length,
  };
}
console.table(rows);

for (const scale of ["110m", "50m", "10m"]) {
  const bytes = readArtifact(`land-${scale}.json`);
  console.log(`land-${scale}.json: ${bytes.length} bytes, ${gzipSync(bytes, { level: 9 }).length} gzip`);
}

const names = new Map(loadTopology("countries-10m.json").objects.countries.geometries.map((g) => [g.id, g.properties.name]));
const small = new Set(loadTopology("countries-110m.json").objects.countries.geometries.map((g) => g.id));
console.log("Missing from 110m:", [...unMemberIds, ...observerStateIds].filter((id) => !small.has(id)).map((id) => names.get(id)).join(", "));

const mid = new Set(loadTopology("countries-50m.json").objects.countries.geometries.map((g) => g.properties.name));
const large = loadTopology("countries-10m.json").objects.countries.geometries.map((g) => g.properties.name);
console.log("Only in 10m:", large.filter((name) => !mid.has(name)).join(", "));

// Point-in-country examples and Western Sahara areas used in
// docs/guides/boundary-data-licensing. Needs polygon-clipping; see README.md.
import { geoArea, geoContains } from "d3-geo";
import { feature } from "topojson-client";
import { loadTopology, optional } from "./load.mjs";

const { default: clipping } = await optional("polygon-clipping");
const R = 6371.0088; // mean Earth radius, km
const points = {
  Geneva: [6.143, 46.204],
  Singapore: [103.82, 1.35],
  Montevideo: [-56.16, -34.9],
  "El Paso": [-106.44, 31.76],
  Simferopol: [34.1, 44.95],
};

for (const file of ["countries-110m.json", "countries-50m.json", "countries-independent-50m.json"]) {
  const topology = loadTopology(file);
  const features = feature(topology, topology.objects.countries).features;
  const hits = Object.entries(points).map(([city, p]) => `${city}: ${features.find((f) => geoContains(f, p))?.properties.name ?? "sea"}`);
  console.log(`${file}\n  ${hits.join("\n  ")}`);
}

const topology = loadTopology("countries-50m.json");
const features = feature(topology, topology.objects.countries).features;
const sahara = features.find((f) => f.properties.name === "W. Sahara");
const morocco = features.find((f) => f.properties.name === "Morocco");
// Morocco's part south of 27°40'N, the northern limit of Western Sahara.
const south = [[[-20, 15], [0, 15], [0, 27 + 40 / 60], [-20, 27 + 40 / 60], [-20, 15]]];
const polygons = morocco.geometry.type === "Polygon" ? [morocco.geometry.coordinates] : morocco.geometry.coordinates;
// polygon-clipping winds planar exteriors counterclockwise; d3-geo wants the reverse.
const inside = clipping
  .intersection(polygons, [south])
  .reduce((sum, rings) => sum + geoArea({ type: "Polygon", coordinates: rings.map((r) => [...r].reverse()) }), 0);
console.log(`W. Sahara feature: ${Math.round(geoArea(sahara) * R * R)} km²`);
console.log(`Morocco feature south of 27°40'N: ${Math.round(inside * R * R)} km²`);

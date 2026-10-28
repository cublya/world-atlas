// Zero-area and reversed polygons per file, and whether a reversed ring makes
// a feature cover the whole map (docs/guides/choosing-a-resolution, "Tiny
// islands at 10m").
import { geoArea, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { loadTopology } from "./load.mjs";

const files = ["110m", "50m", "10m"].flatMap((s) => [`countries-${s}.json`, `countries-independent-${s}.json`, `land-${s}.json`]);
const path = geoPath(geoNaturalEarth1().fitSize([960, 500], { type: "Sphere" }));
const sphere = path.area({ type: "Sphere" });
const tally = (names) => Object.entries(names.reduce((m, n) => ((m[n] = (m[n] ?? 0) + 1), m), {})).map(([n, c]) => `${n} x${c}`).join(", ") || "none";

for (const file of files) {
  const topology = loadTopology(file);
  const object = file.startsWith("land") ? topology.objects.land : topology.objects.countries;
  const converted = feature(topology, object);
  const features = converted.type === "FeatureCollection" ? converted.features : [converted];
  const reversed = [];
  const zero = [];
  const fillsMap = [];
  for (const f of features) {
    const name = f.properties?.name ?? "land";
    const g = f.geometry;
    const polygons = g?.type === "Polygon" ? [g.coordinates] : g?.type === "MultiPolygon" ? g.coordinates : [];
    for (const rings of polygons) {
      const area = geoArea({ type: "Polygon", coordinates: rings });
      if (area > 2 * Math.PI) reversed.push(name);
      if (area === 0) zero.push(name);
    }
    if (path.area(f) >= sphere * 0.99) fillsMap.push(name);
  }
  console.log(`${file}\n  reversed: ${tally(reversed)}\n  zero-area: ${tally(zero)}\n  draws over the whole map: ${fillsMap.join(", ") || "none"}`);
}

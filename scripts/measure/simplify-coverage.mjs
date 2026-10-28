// Simplify the 10m countries to roughly the 50m file's point budget and count
// which UN members and observer states still draw (docs/guides/choosing-a-resolution,
// "Why not simplify 10m yourself?"). Needs topojson-simplify; see README.md.
import { geoArea } from "d3-geo";
import { feature } from "topojson-client";
import { observerStateIds, unMemberIds } from "../coverage-ids.mjs";
import { loadTopology, optional, pointCount } from "./load.mjs";

const { presimplify, quantile, simplify } = await optional("topojson-simplify");
const wanted = [...unMemberIds, ...observerStateIds];
const drawing = (topology) => {
  const features = feature(topology, topology.objects.countries).features;
  return new Set(features.filter((f) => geoArea(f) > 0 && geoArea(f) < 2 * Math.PI).map((f) => f.id));
};

const names = new Map(loadTopology("countries-10m.json").objects.countries.geometries.map((g) => [g.id, g.properties.name]));
const base10 = drawing(loadTopology("countries-10m.json"));
console.log(`50m: ${pointCount(loadTopology("countries-50m.json"))} points, ${wanted.filter((id) => drawing(loadTopology("countries-50m.json")).has(id)).length} draw`);
console.log(`10m unsimplified: ${wanted.filter((id) => base10.has(id)).length} draw; not drawing: ${wanted.filter((id) => !base10.has(id)).map((id) => names.get(id)).join(", ")}`);

for (const p of [0.15, 0.16, 0.17]) {
  let topology = presimplify(loadTopology("countries-10m.json"));
  topology = simplify(topology, quantile(topology, p));
  const drawn = drawing(topology);
  const lost = wanted.filter((id) => base10.has(id) && !drawn.has(id)).map((id) => names.get(id));
  console.log(`keep top ${Math.round(p * 100)}%: ${pointCount(topology)} points; newly lost: ${lost.join(", ")}`);
}

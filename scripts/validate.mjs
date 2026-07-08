import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";
import { observerStateIds, unMemberIds } from "./coverage-ids.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scales = ["10m", "50m", "110m"];
const policyMergedNames = new Set(["Kosovo", "N. Cyprus", "Cyprus U.N. Buffer Zone", "Somaliland"]);
const independentNames = new Set(["Kosovo", "N. Cyprus", "Somaliland"]);
const crimeaPoint = [34.1, 44.95];

assert.equal(unMemberIds.length, 193, "expected 193 UN member-state ids");
assert.equal(new Set(unMemberIds).size, 193, "duplicate UN member-state id");
assert.equal(observerStateIds.length, 2, "expected two observer-state ids");

async function readJson(file) {
  return JSON.parse(await readFile(join(root, file), "utf-8"));
}

function validateTopology(topology, objectName, file) {
  assert.equal(topology.type, "Topology", `${file}: expected a Topology`);
  assert.ok(topology.transform, `${file}: expected quantized coordinates`);
  assert.ok(topology.objects[objectName], `${file}: missing ${objectName} object`);
  assert.ok(topology.arcs.length > 0, `${file}: expected non-empty arcs`);
  const geojson = feature(topology, topology.objects[objectName]);
  if (geojson.type === "FeatureCollection") {
    assert.ok(geojson.features.length > 0, `${file}: expected non-empty geometry`);
  } else {
    assert.ok(geojson.geometry, `${file}: expected non-empty geometry`);
  }
}

for (const scale of scales) {
  const countriesFile = `countries-${scale}.json`;
  const countries = await readJson(countriesFile);
  validateTopology(countries, "countries", countriesFile);
  validateTopology(countries, "land", countriesFile);

  const ids = countries.objects.countries.geometries.map((geometry) => geometry.id).filter(Boolean);
  assert.ok(ids.every((id) => /^\d{3}$/.test(id)), `${countriesFile}: invalid ISO numeric id`);
  assert.ok(
    countries.objects.countries.geometries.every(
      (geometry) => geometry.properties.name && !geometry.properties.name.includes("\0"),
    ),
    `${countriesFile}: invalid country name`,
  );
  assert.ok(
    countries.objects.countries.geometries.every((geometry) => geometry.properties.boundaryView === "un"),
    `${countriesFile}: expected UN boundary view`,
  );

  const countryFeatures = feature(countries, countries.objects.countries).features;
  const names = new Set(countryFeatures.map((country) => country.properties.name));
  for (const mergedName of policyMergedNames) {
    assert.ok(!names.has(mergedName), `${countriesFile}: ${mergedName} must be dissolved in UN view`);
  }
  const crimeaHits = countryFeatures
    .filter((country) => country.properties.name !== "Maldives" && geoContains(country, crimeaPoint))
    .map((country) => country.properties.name);
  assert.deepEqual(crimeaHits, ["Ukraine"], `${countriesFile}: Crimea must resolve to Ukraine in UN view`);

  const covered = new Set(ids);
  const missingMembers = unMemberIds.filter((id) => !covered.has(id));
  const missingObservers = observerStateIds.filter((id) => !covered.has(id));
  process.stdout.write(
    `${countriesFile}: ${unMemberIds.length - missingMembers.length}/${unMemberIds.length} UN members, ` +
      `${observerStateIds.length - missingObservers.length}/${observerStateIds.length} observer states`,
  );
  if (missingMembers.length) process.stdout.write(`; missing members ${missingMembers.join(", ")}`);
  if (missingObservers.length) process.stdout.write(`; missing observers ${missingObservers.join(", ")}`);
  process.stdout.write("\n");
  if (scale === "10m") {
    assert.deepEqual(missingMembers, [], `${countriesFile}: incomplete UN-member coverage`);
    assert.deepEqual(missingObservers, [], `${countriesFile}: incomplete observer-state coverage`);
  }

  const independentFile = `countries-independent-${scale}.json`;
  const independent = await readJson(independentFile);
  validateTopology(independent, "countries", independentFile);
  validateTopology(independent, "land", independentFile);
  assert.ok(
    independent.objects.countries.geometries.every((geometry) => geometry.properties.boundaryView === "independent"),
    `${independentFile}: expected independent boundary view`,
  );
  const independentFeatures = feature(independent, independent.objects.countries).features;
  const independentFeatureNames = new Set(independentFeatures.map((country) => country.properties.name));
  for (const independentName of independentNames) {
    assert.ok(independentFeatureNames.has(independentName), `${independentFile}: missing ${independentName}`);
  }
  const independentCrimeaHits = independentFeatures
    .filter((country) => country.properties.name !== "Maldives" && geoContains(country, crimeaPoint))
    .map((country) => country.properties.name);
  assert.deepEqual(independentCrimeaHits, ["Russia"], `${independentFile}: Crimea must resolve to Russia in Natural Earth view`);

  const landFile = `land-${scale}.json`;
  validateTopology(await readJson(landFile), "land", landFile);
}

const source = await readJson("source.json");
assert.equal(source.naturalEarthVersion, "5.1.2", "unexpected Natural Earth source version");
process.stdout.write("All generated artifacts are valid.\n");

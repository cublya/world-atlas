import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { geoStitch } from "d3-geo-projection";
import { geoContains } from "d3-geo";
import extract from "extract-zip";
import isoCountries from "i18n-iso-countries";
import * as shapefile from "shapefile";
import { mergeArcs } from "topojson-client";
import { topology as createTopology } from "topojson-server";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceVersion = "5.1.2";
const scales = ["10m", "50m", "110m"];
const quantization = 1e5;
const unViewReassignments = new Map([
  // Kosovo is represented as a separate Natural Earth map unit, but it is not a
  // UN member or observer state. The UN-style view dissolves it into Serbia.
  ["KOS", "SRB"],
  // Northern Cyprus and the UN buffer zone are separate Natural Earth map units.
  // The UN-style view dissolves both into Cyprus.
  ["CYN", "CYP"],
  ["CNM", "CYP"],
  // Somaliland is a separate Natural Earth map unit. The UN-style view dissolves
  // it into Somalia.
  ["SOL", "SOM"],
  // Baikonur is an administrative lease within Kazakhstan, not a sovereign
  // country. The UN-style view dissolves it into Kazakhstan.
  ["KAB", "KAZ"],
]);
const crimeaPoint = [34.1, 44.95];
const archiveSha256 = {
  "10m/cultural/admin_0_countries": "ce1ac7036499a0edd641fbc093cd209a98f96a49d2eca8480aaacad35138a7f6",
  "10m/physical/land": "e547d749445eaa0964aba76738090ec88f5e63c4585122170f98c67a7ea922dc",
  "50m/cultural/admin_0_countries": "5fed433373581fa648920435f937d95f2d3c0200e067409c6478dcdf1b853139",
  "50m/physical/land": "0b8e670cf80dce9cbebe2a193bc44ba5602758c22e1fa603980553646d7ff162",
  "110m/cultural/admin_0_countries": "0f243aeac8ac6cf26f0417285b0bd33ac47f1b5bdb719fd3e0df37d03ea37110",
  "110m/physical/land": "1926c621afd6ac67c3f36639bb1236134a48d82226dc675d3e3df53d02d2a3de",
};
const publicCountryPropertyOverrides = new Map([
  [
    "TUR",
    {
      name: "Turkiye",
      nameLong: "Turkiye",
      sovereignty: "Turkiye",
    },
  ],
]);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadAndExtract(scale, category, layer) {
  const directory = join(root, "build", sourceVersion, scale, category);
  const basename = `ne_${scale}_${layer}`;
  const shapePath = join(directory, `${basename}.shp`);
  if (await exists(shapePath)) return shapePath;

  await mkdir(directory, { recursive: true });
  const archivePath = join(directory, `${basename}.zip`);
  const url = `https://naturalearth.s3.amazonaws.com/${sourceVersion}/${scale}_${category}/${basename}.zip`;
  process.stdout.write(`Downloading ${url}\n`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  const archive = Buffer.from(await response.arrayBuffer());
  const checksum = createHash("sha256").update(archive).digest("hex");
  const expectedChecksum = archiveSha256[`${scale}/${category}/${layer}`];
  if (checksum !== expectedChecksum) {
    throw new Error(`Checksum mismatch for ${url}: expected ${expectedChecksum}, received ${checksum}`);
  }
  await writeFile(archivePath, archive);
  await extract(archivePath, { dir: directory });
  return shapePath;
}

function countryId(properties) {
  const numeric = cleanString(properties.ISO_N3);
  if (/^\d{3}$/.test(numeric) && numeric !== "-99") return numeric;

  // Some valid countries (notably France in Natural Earth 5.1.2) use -99 in
  // ISO_N3 while retaining an ISO-compatible ADM0_A3 value.
  const adminAlpha3 = cleanString(properties.ADM0_A3);
  const fallback = isoCountries.alpha3ToNumeric(adminAlpha3);
  if (fallback) return fallback;

  // Natural Earth intentionally has no ISO code for some disputed map units.
  return undefined;
}

function cleanString(value) {
  return String(value ?? "").replace(/\0+$/g, "").trim();
}

function propertyString(properties, key) {
  const value = cleanString(properties[key]);
  return value && value !== "-99" ? value : undefined;
}

function countryProperties(properties, extras = {}) {
  const note = propertyString(properties, "NOTE_BRK") ?? propertyString(properties, "NOTE_ADM0");
  const overrides = publicCountryPropertyOverrides.get(cleanString(properties.ADM0_A3)) ?? {};
  const result = {
    name: cleanString(properties.NAME),
    ...(propertyString(properties, "NAME_LONG") ? { nameLong: propertyString(properties, "NAME_LONG") } : {}),
    ...(propertyString(properties, "ADM0_A3") ? { adm0A3: propertyString(properties, "ADM0_A3") } : {}),
    ...(propertyString(properties, "ISO_A2") ? { isoA2: propertyString(properties, "ISO_A2") } : {}),
    ...(propertyString(properties, "ISO_A3") ? { isoA3: propertyString(properties, "ISO_A3") } : {}),
    ...(propertyString(properties, "ISO_N3") ? { isoN3: propertyString(properties, "ISO_N3") } : {}),
    ...(propertyString(properties, "TYPE") ? { type: propertyString(properties, "TYPE") } : {}),
    ...(propertyString(properties, "SOVEREIGNT") ? { sovereignty: propertyString(properties, "SOVEREIGNT") } : {}),
    ...(propertyString(properties, "FCLASS_ISO") ? { fclassIso: propertyString(properties, "FCLASS_ISO") } : {}),
    ...(propertyString(properties, "FCLASS_TLC") ? { fclassTlc: propertyString(properties, "FCLASS_TLC") } : {}),
    ...(note ? { note } : {}),
  };
  return { ...result, ...overrides, ...extras };
}

function rawCountryProperties(properties) {
  const keys = [
    "NAME",
    "NAME_LONG",
    "ADMIN",
    "SOVEREIGNT",
    "TYPE",
    "ADM0_A3",
    "SOV_A3",
    "BRK_A3",
    "ISO_A2",
    "ISO_A3",
    "ISO_N3",
    "NOTE_ADM0",
    "NOTE_BRK",
    "FCLASS_ISO",
    "FCLASS_TLC",
  ];
  return Object.fromEntries(keys.map((key) => [key, cleanString(properties[key])]));
}

function getAdminCode(feature) {
  return cleanString(feature.properties.ADM0_A3);
}

function asMultiPolygonCoordinates(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function setMultiPolygonCoordinates(feature, coordinates) {
  if (coordinates.length === 1) {
    feature.geometry = { type: "Polygon", coordinates: coordinates[0] };
  } else {
    feature.geometry = { type: "MultiPolygon", coordinates };
  }
}

function reassignPolygonContaining(features, { from, to, point, name }) {
  const fromFeature = features.find((feature) => getAdminCode(feature) === from);
  const toFeature = features.find((feature) => getAdminCode(feature) === to);
  if (!fromFeature || !toFeature) {
    throw new Error(`Cannot reassign ${name}: missing ${from} or ${to}`);
  }

  const sourcePolygons = asMultiPolygonCoordinates(fromFeature.geometry);
  const moving = [];
  const remaining = [];
  for (const polygon of sourcePolygons) {
    const polygonFeature = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: polygon } };
    if (geoContains(polygonFeature, point)) moving.push(polygon);
    else remaining.push(polygon);
  }
  if (moving.length === 0) {
    throw new Error(`Cannot reassign ${name}: no ${from} polygon contains ${point.join(",")}`);
  }

  const targetPolygons = asMultiPolygonCoordinates(toFeature.geometry);
  setMultiPolygonCoordinates(fromFeature, remaining);
  setMultiPolygonCoordinates(toFeature, [...targetPolygons, ...moving]);
  toFeature.properties = {
    ...toFeature.properties,
    policyMergedMapUnits: [
      ...(Array.isArray(toFeature.properties.policyMergedMapUnits)
        ? toFeature.properties.policyMergedMapUnits
        : []),
      name,
    ],
  };
}

async function readFeatures(path) {
  const collection = await shapefile.read(path, undefined, { encoding: "utf-8" });
  return collection.features;
}

function buildIndependentView(features) {
  const publicFeatures = features.map((feature) => ({
    ...feature,
    properties: countryProperties(feature.properties, { boundaryView: "independent" }),
  }));
  const result = createTopology(
    { countries: { type: "FeatureCollection", features: publicFeatures } },
    quantization,
  );
  result.objects.land = mergeArcs(result, result.objects.countries.geometries);
  return result;
}

function buildUnView(features) {
  const working = features.map((feature) => ({
    ...feature,
    properties: { ...feature.properties },
    geometry: structuredClone(feature.geometry),
  }));

  reassignPolygonContaining(working, {
    from: "RUS",
    to: "UKR",
    point: crimeaPoint,
    name: "Crimea",
  });

  const targetsByCode = new Map(working.map((feature) => [getAdminCode(feature), feature]));
  const grouped = new Map();
  const mergedNames = new Map();
  for (const feature of working) {
    const code = getAdminCode(feature);
    const targetCode = unViewReassignments.get(code) ?? code;
    const target = targetsByCode.get(targetCode);
    if (!target) throw new Error(`Missing UN-view reassignment target ${targetCode} for ${code}`);
    if (!grouped.has(targetCode)) grouped.set(targetCode, []);
    grouped.get(targetCode).push(feature);
    if (targetCode !== code) {
      if (!mergedNames.has(targetCode)) mergedNames.set(targetCode, []);
      mergedNames.get(targetCode).push(cleanString(feature.properties.NAME));
    }
  }

  const source = createTopology(
    { source: { type: "FeatureCollection", features: working } },
    quantization,
  );
  const sourceGeometries = source.objects.source.geometries;
  const indexByCode = new Map(working.map((feature, i) => [getAdminCode(feature), i]));
  const finalGeometries = [];

  for (const [targetCode, sourceFeatures] of grouped) {
    if (unViewReassignments.has(targetCode)) continue;
    const targetFeature = targetsByCode.get(targetCode);
    const sourceGeometry = sourceFeatures.map((feature) => sourceGeometries[indexByCode.get(getAdminCode(feature))]);
    const geometry =
      sourceGeometry.length === 1
        ? structuredClone(sourceGeometry[0])
        : mergeArcs(source, sourceGeometry);
    const policyMergedMapUnits = [
      ...(Array.isArray(targetFeature.properties.policyMergedMapUnits)
        ? targetFeature.properties.policyMergedMapUnits
        : []),
      ...(mergedNames.get(targetCode) ?? []),
    ];
    geometry.id = countryId(targetFeature.properties);
    geometry.properties = countryProperties(targetFeature.properties, {
      boundaryView: "un",
      ...(policyMergedMapUnits.length ? { policyMergedMapUnits } : {}),
    });
    finalGeometries.push(geometry);
  }

  finalGeometries.sort((a, b) => String(a.properties.name).localeCompare(String(b.properties.name)));
  delete source.objects.source;
  source.objects.countries = { type: "GeometryCollection", geometries: finalGeometries };
  source.objects.land = mergeArcs(source, source.objects.countries.geometries);
  return source;
}

async function buildCountries(scale) {
  const path = await downloadAndExtract(scale, "cultural", "admin_0_countries");
  const features = (await readFeatures(path)).map((feature) => {
    const stitched = geoStitch(feature);
    stitched.id = countryId(feature.properties);
    stitched.properties = rawCountryProperties(feature.properties);
    return stitched;
  });

  await writeFile(join(root, `countries-independent-${scale}.json`), `${JSON.stringify(buildIndependentView(features))}\n`);
  await writeFile(join(root, `countries-${scale}.json`), `${JSON.stringify(buildUnView(features))}\n`);
}

async function buildLand(scale) {
  const path = await downloadAndExtract(scale, "physical", "land");
  const features = (await readFeatures(path)).map((feature) => {
    const stitched = geoStitch(feature);
    stitched.properties = {};
    return stitched;
  });

  const result = createTopology({ source: { type: "FeatureCollection", features } }, quantization);
  result.objects.land = mergeArcs(result, result.objects.source.geometries);
  delete result.objects.source;
  await writeFile(join(root, `land-${scale}.json`), `${JSON.stringify(result)}\n`);
}

await Promise.all(scales.map((scale) => buildCountries(scale)));
await Promise.all(scales.map((scale) => buildLand(scale)));

const metadata = {
  naturalEarthVersion: sourceVersion,
  quantization,
  archiveSha256,
  boundaryViews: {
    un: {
      default: true,
      files: scales.map((scale) => `countries-${scale}.json`),
      description:
        "UN-style sovereign-state view. Kosovo, Northern Cyprus, the Cyprus UN buffer zone, Somaliland, and Baikonur are dissolved into the UN-recognized sovereign state; Crimea is assigned to Ukraine.",
    },
    independent: {
      files: scales.map((scale) => `countries-independent-${scale}.json`),
      description:
        "Natural Earth independent map-unit view. Kosovo, Northern Cyprus, Somaliland, Western Sahara, and similar map units are kept as separate features when present in Natural Earth.",
    },
  },
  files: [
    ...scales.map((scale) => `countries-${scale}.json`),
    ...scales.map((scale) => `countries-independent-${scale}.json`),
    ...scales.map((scale) => `land-${scale}.json`),
  ],
};
await writeFile(join(root, "source.json"), `${JSON.stringify(metadata, null, 2)}\n`);
process.stdout.write(`Built Natural Earth ${sourceVersion} TopoJSON.\n`);

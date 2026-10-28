# Sources (loaded 2026-10-18)

- Natural Earth terms of use: https://www.naturalearthdata.com/about/terms-of-use/
- Natural Earth downloads and scale descriptions: https://www.naturalearthdata.com/downloads/
- Natural Earth Admin 0 countries (de facto boundaries, POV variants): https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/
- TopoJSON specification (2.1.2 transforms, 2.1.3 arcs): https://github.com/topojson/topojson-specification
- topojson-client: https://github.com/topojson/topojson-client
- topojson-simplify: https://github.com/topojson/topojson-simplify
- CSS absolute lengths (96 px per inch): https://www.w3.org/TR/css-values-4/#absolute-lengths
- npm package.json `files` (README and LICENSE always included): https://docs.npmjs.com/cli/v11/configuring-npm/package-json#files
- ISC licence text: https://opensource.org/license/isc-license-txt
- Google Dataset structured data: https://developers.google.com/search/docs/appearance/structured-data/dataset
- Licence pages in competitors.md.

## Measurements in the guides

All on the committed 3.0.0-beta.2 files with topojson-client 3, d3-geo 3.1,
topojson-simplify 3 (scratch install), system gzip and brotli, Node 26:
- sizes: `wc -c`, `gzip -9c | wc -c`, `brotli -c -q 11 | wc -c`
- features, arcs, points: from the topology
- GeoJSON size: `JSON.stringify(feature(topology, topology.objects.countries)).length`
- SVG path data: sum of `geoPath(geoNaturalEarth1().fitSize([960, 500], Sphere))(f).length`
- coverage: ids from `scripts/coverage-ids.mjs`; "draws" means 0 < geoArea < 2π
- degenerate rings: per polygon, geoArea == 0 (zero-area) or > 2π (reversed)
- point-in-country examples: `geoContains`
- Western Sahara: geoArea of `W. Sahara` and of Morocco clipped south of 27°40'N (polygon-clipping)

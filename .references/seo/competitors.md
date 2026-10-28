# Alternatives and licences (checked 2026-10-18)

Internal notes. Public comparison content quotes each publisher's own page.

| Source | Packaging | Licence as published | URL |
| --- | --- | --- | --- |
| Natural Earth (upstream) | Shapefile, GeoPackage, SQLite | Public domain; attribution unnecessary | https://www.naturalearthdata.com/about/terms-of-use/ |
| world-atlas 2.0.2 (archived original, npm) | TopoJSON, same file names | Data from Natural Earth; last npm modification 2022-06-29 | https://github.com/topojson/world-atlas |
| visionscarto-world-atlas 1.0.0 | TopoJSON derived from the original | npm modification 2024-04-01 | npm |
| geoBoundaries gbOpen | GeoJSON, shapefile, TopoJSON via API | CC BY 4.0, acknowledgement required | https://www.geoboundaries.org/ |
| OpenStreetMap | Planet / extracts | ODbL: credit + share-alike for altered data | https://www.openstreetmap.org/copyright |
| GADM | GeoPackage, shapefile | Academic and non-commercial use; no redistribution or commercial use without permission | https://gadm.org/license.html |
| Eurostat GISCO countries | Several, including TopoJSON | "specific download rules ... must be complied with" | https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/countries |
| world-geojson 3.5.3 (npm) | GeoJSON per country | Not reviewed | npm |
| @highcharts/map-collection 2.3.3 | Chart-vendor maps | Vendor terms; not reviewed | npm |

Positioning that holds up against the data: reproducible build from pinned,
checksummed Natural Earth archives; two documented boundary views; CI checks of
10m coverage and boundary policy; public domain data.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/logo-white.svg">
    <img src="docs/brand/logo-black.svg" alt="World Atlas" width="180">
  </picture>
</p>

# Cublya World Atlas TopoJSON

This maintained fork provides a reproducible redistribution of [Natural
Earth](https://www.naturalearthdata.com/) vector data, version **5.1.2**, as
quantized TopoJSON. It is derived from the archived
[`topojson/world-atlas`](https://github.com/topojson/world-atlas) project while
preserving the original six artifact names and object structure, with additional
boundary-policy variants.

Natural Earth data is [public
domain](https://www.naturalearthdata.com/about/terms-of-use/): commercial use,
modification, and redistribution are permitted without permission or required
attribution. The build code remains ISC-licensed.

**[Read the documentation](https://cublya.github.io/world-atlas/)**

## Install

```sh
npm install @cublya/world-atlas
```

```js
import world from "@cublya/world-atlas/countries-10m.json" with { type: "json" };
```

## Boundary views

The default `countries-*.json` files use a UN-style sovereign-state view:

- Crimea is assigned to Ukraine.
- Kosovo is dissolved into Serbia.
- Northern Cyprus and the Cyprus U.N. Buffer Zone are dissolved into Cyprus.
- Somaliland is dissolved into Somalia.
- Western Sahara remains a distinct territory (`EH` / `ESH` / `732`), not part
  of Morocco.

If you need Natural Earth's independent map-unit view, use the matching
`countries-independent-*.json` file:

```js
import world from "@cublya/world-atlas/countries-independent-10m.json" with { type: "json" };
```

That view keeps Kosovo, Northern Cyprus, Somaliland, Western Sahara, and other
Natural Earth map units separate when they exist in the source data. Each country
geometry includes `properties.boundaryView`, and default files mark merged
features with `properties.policyMergedMapUnits`.

## Coverage

The United Nations has 193 member states and two non-member observer states:
the Holy See and the State of Palestine. Generated artifacts are checked
against both groups.

| File | UN members | Observer states |
| --- | ---: | ---: |
| `countries-10m.json` | 193 / 193 | 2 / 2 |
| `countries-50m.json` | 193 / 193 | 2 / 2 |
| `countries-110m.json` | 165 / 193 | 1 / 2 |

Use 10m or 50m when complete country coverage matters. The 110m source omits
microstates as part of Natural Earth's small-scale generalization.

## Rebuilding

The source release, URLs, quantization, and output names are fixed in
[`scripts/build.mjs`](scripts/build.mjs). Downloads are cached under the ignored
`build/` directory.

```sh
npm ci
npm run build
npm run validate
```

`source.json` records the Natural Earth version used by the committed artifacts.
CI rebuilds everything and fails if generated output has drifted.

### Usage

In a browser, using [d3-geo](https://github.com/d3/d3-geo) and Canvas:<br>
https://observablehq.com/@d3/world-map

In a browser, using [d3-geo](https://github.com/d3/d3-geo) and SVG:<br>
https://observablehq.com/@d3/world-map-svg

In Node, using [d3-geo](https://github.com/d3/d3-geo) and [node-canvas](https://github.com/Automattic/node-canvas):<br>
https://bl.ocks.org/mbostock/885fffe88d72b2a25c090e0bbbef382f

## File Reference

<a href="#countries-110m.json" name="countries-110m.json">#</a> <b>countries-110m.json</b> · [Download](https://cdn.jsdelivr.net/npm/@cublya/world-atlas@3.0.0-beta.0/countries-110m.json "Source")

A [TopoJSON file](https://github.com/topojson/topojson-specification/blob/master/README.md#21-topology-objects) containing the geometry collections <i>countries</i> and <i>land</i>. The geometry is quantized, but not projected; it is in spherical coordinates, decimal degrees. This topology is derived from the Natural Earth's [Admin 0 country boundaries](http://www.naturalearthdata.com/downloads/110m-cultural-vectors/), 1:110m small scale. The land boundary is computed by [merging](https://github.com/topojson/topojson-client/blob/master/README.md#merge) countries, ensuring a consistent topology. This default file uses the UN-style boundary view.

<a href="#countries-50m.json" name="countries-50m.json">#</a> <b>countries-50m.json</b> · [Download](https://cdn.jsdelivr.net/npm/@cublya/world-atlas@3.0.0-beta.0/countries-50m.json "Source")

A [TopoJSON file](https://github.com/topojson/topojson-specification/blob/master/README.md#21-topology-objects) containing the geometry collections <i>countries</i> and <i>land</i>. The geometry is quantized, but not projected; it is in spherical coordinates, decimal degrees. This topology is derived from the Natural Earth's [Admin 0 country boundaries](http://www.naturalearthdata.com/downloads/50m-cultural-vectors/), 1:50m medium scale. The land boundary is computed by [merging](https://github.com/topojson/topojson-client/blob/master/README.md#merge) countries, ensuring a consistent topology. This default file uses the UN-style boundary view.

<a href="#countries-10m.json" name="countries-10m.json">#</a> <b>countries-10m.json</b> · [Download](https://cdn.jsdelivr.net/npm/@cublya/world-atlas@3.0.0-beta.0/countries-10m.json "Source")

A [TopoJSON file](https://github.com/topojson/topojson-specification/blob/master/README.md#21-topology-objects) containing the geometry collections <i>countries</i> and <i>land</i>. The geometry is quantized, but not projected; it is in spherical coordinates, decimal degrees. This topology is derived from the Natural Earth's [Admin 0 country boundaries](http://www.naturalearthdata.com/downloads/10m-cultural-vectors/), 1:10m large scale. The land boundary is computed by [merging](https://github.com/topojson/topojson-client/blob/master/README.md#merge) countries, ensuring a consistent topology. This default file uses the UN-style boundary view.

<a href="#countries-independent" name="countries-independent">#</a> <b>countries-independent-*.json</b>

These files have the same object structure as `countries-*.json`, but use
Natural Earth's independent map-unit view. Use them when you want Kosovo,
Northern Cyprus, Somaliland, and similar source map units to render as separate
features.

<a href="#land-110m.json" name="land-110m.json">#</a> <b>land-110m.json</b> · [Download](https://cdn.jsdelivr.net/npm/@cublya/world-atlas@3.0.0-beta.0/land-110m.json "Source")

A [TopoJSON file](https://github.com/topojson/topojson-specification/blob/master/README.md#21-topology-objects) containing the geometry collection <i>land</i>. The geometry is quantized, but not projected; it is in spherical coordinates, decimal degrees. This topology is derived from the Natural Earth's [land boundaries](http://www.naturalearthdata.com/downloads/110m-physical-vectors/), 1:110m small scale.

<a href="#land-50m.json" name="land-50m.json">#</a> <b>land-50m.json</b> · [Download](https://cdn.jsdelivr.net/npm/@cublya/world-atlas@3.0.0-beta.0/land-50m.json "Source")

A [TopoJSON file](https://github.com/topojson/topojson-specification/blob/master/README.md#21-topology-objects) containing the geometry collection <i>land</i>. The geometry is quantized, but not projected; it is in spherical coordinates, decimal degrees. This topology is derived from the Natural Earth's [land boundaries](http://www.naturalearthdata.com/downloads/50m-physical-vectors/), 1:50m medium scale.

<a href="#land-10m.json" name="land-10m.json">#</a> <b>land-10m.json</b> · [Download](https://cdn.jsdelivr.net/npm/@cublya/world-atlas@3.0.0-beta.0/land-10m.json "Source")

A [TopoJSON file](https://github.com/topojson/topojson-specification/blob/master/README.md#21-topology-objects) containing the geometry collection <i>land</i>. The geometry is quantized, but not projected; it is in spherical coordinates, decimal degrees. This topology is derived from the Natural Earth's [land boundaries](http://www.naturalearthdata.com/downloads/10m-physical-vectors/), 1:10m large scale.

<a href="#countries" name="countries">#</a> *world*.objects.<b>countries</b>

<img src="https://raw.githubusercontent.com/cublya/world-atlas/master/img/countries.png" width="480" height="300">

Each country has these stable fields:

* *country*.id - the three-digit [ISO 3166-1 numeric country code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric), such as `"528"`
* *country*.properties.name - the country name, such as `"Netherlands"`
* *country*.properties.boundaryView - `"un"` or `"independent"`

Additional descriptive properties may be present, including `nameLong`,
`adm0A3`, `isoA2`, `isoA3`, `isoN3`, `type`, `sovereignty`, `fclassIso`,
`fclassTlc`, `note`, and `policyMergedMapUnits`.

<a href="#land" name="land">#</a> *world*.objects.<b>land</b>

<img src="https://raw.githubusercontent.com/cublya/world-atlas/master/img/land.png" width="480" height="300">

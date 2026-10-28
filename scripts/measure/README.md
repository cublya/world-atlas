# Measurement scripts

These reproduce the figures in the project site guides
(`docs/guides/*/index.html`). They read the committed artifacts in the
repository root and change nothing.

```sh
npm ci
node scripts/measure/resolution-metrics.mjs   # size, geometry, SVG output, coverage
node scripts/measure/degenerate-rings.mjs     # zero-area and reversed rings
node scripts/measure/boundary-checks.mjs      # point-in-country examples, Western Sahara areas
node scripts/measure/simplify-coverage.mjs    # simplifying 10m to 50m's point budget
```

`boundary-checks.mjs` and `simplify-coverage.mjs` need two packages that are not
dependencies of this repository. Install them without saving:

```sh
npm install --no-save topojson-simplify@3 polygon-clipping@0.15
```

Figures in the guides were measured on 3.0.0-beta.2 with Node.js 26.

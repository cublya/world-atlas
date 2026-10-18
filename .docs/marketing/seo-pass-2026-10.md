# SEO and content pass, October 2026

Scope: discoverability for developers. `@cublya/world-atlas` is a data package
with a static project page on GitHub Pages (`docs/`, deployed by
`.github/workflows/pages.yml` on pushes to `master` that touch `docs/`). No
blog: two guides on the project site serve the real questions better.

## Completed

- Guides (static HTML in the site's existing styles, linked from the landing
  page, README and `llms.txt`, listed in the sitemap):
  - `docs/guides/choosing-a-resolution/`: measured size, gzip and Brotli
    size, features, arcs, points, GeoJSON size and SVG output per resolution;
    picking by map width from Natural Earth's nominal scales; 110m coverage
    gaps by name; why simplifying 10m to 50m's budget loses microstates;
    loading strategies; degenerate rings in the 10m files with a repair
    snippet.
  - `docs/guides/boundary-data-licensing/`: `DATA_LICENSE.md` quoted
    verbatim, Natural Earth terms quoted, data versus build-code licence,
    optional credit text, what public domain does not settle (accuracy, with
    measured point-in-country errors; boundary views; joined data), and a
    sourced comparison with geoBoundaries, OpenStreetMap and GADM.
- Landing page: JSON-LD `Dataset.license` changed from a CC0 URL to Natural
  Earth's terms page (`DATA_LICENSE.md` and Natural Earth say "public domain",
  not CC0); added `isAccessibleForFree` and `version`; version badge and
  download links moved from 3.0.0-beta.1 to 3.0.0-beta.2; corrected the
  `source.json` claim (it records version, checksums and quantization, not
  source URLs); corrected the `id` claim (default 10m files also contain
  features without an ISO code); guides section and nav; em dash removed from
  OG alt text; meta description and hero describe compatibility instead of
  naming the original package.
- README: plain first paragraph, real badges (npm, CI, data and code
  licences), exact CI claim, guide links, beta.2 download links, `id` caveat.
- `package.json`: description, `homepage`, `bugs`, keywords.
- Sitemap: guide URLs and `lastmod` dates; dropped `changefreq`/`priority`.

## Product name

The site is hand-written static HTML with no build step, so there is no
single constant to route "World Atlas" through. Adding a build only for that
would cost more than it saves. Rename checklist: `docs/index.html` (8),
`docs/guides/*/index.html` (8 each: title suffix, `og:site_name`, header,
breadcrumbs, JSON-LD, footer), `README.md` logo alt, `CHANGELOG.md` (history,
leave), `docs/brand/logo-*.svg` wordmarks (3), and `docs/og-image.png`.

## Proposed GitHub settings (not changed)

- Description: "World country and land boundaries as TopoJSON from Natural
  Earth, at 10m, 50m and 110m, with UN-style and independent boundary views."
- Website: `https://cublya.github.io/world-atlas/` (already set).
- Topics: `topojson`, `geojson`, `natural-earth`, `world-map`, `countries`,
  `boundaries`, `cartography`, `gis`, `d3`, `choropleth`, `open-data`,
  `public-domain`.

## Findings for the owner (data, not changed in this pass)

1. **Reversed and zero-area rings in the 10m files.** Quantization at 1e5
   collapses tiny islands. `countries-10m.json` has 3 reversed rings
   (Maldives) and zero-area rings in the Bahamas, Japan, the Maldives,
   Mexico, Seychelles, Spain, U.S. Minor Outlying Islands and the Holy See;
   `land-10m.json` has 7 reversed and 173 zero-area rings. With plain d3-geo,
   the Maldives feature and `land-10m.json` draw as fills over the whole
   sphere. The source shapefile has none of these. Fix in `scripts/build.mjs`
   (drop zero-area rings and rewind reversed ones after quantization) and add
   a check to `scripts/validate.mjs`. The resolution guide documents the issue
   and a workaround; update it when fixed.
2. **The Holy See draws nothing at 10m.** Its polygon has zero area, yet it
   counts toward the "2 / 2 observer states" coverage, which checks ids only.
3. **Western Sahara.** README, landing page and `llms.txt` say Western Sahara
   "remains a distinct territory, not part of Morocco" in the default view. In
   the data, both views have a `W. Sahara` feature of about 91,000 km², and
   about 179,000 km² of the territory (south of 27°40'N) is inside the
   Morocco feature, following Natural Earth's de facto depiction. Either fix
   the UN-style build or reword the policy text. The licensing guide states
   what the data does.
4. **Naming the original package.** The landing data-model section still
   says "used by world-atlas 2.x", and README and footer link the archived
   original as attribution. Confirm these fall under the attribution
   exception.

## Release checklist addition

- When a guide or the landing page changes materially, update its `<lastmod>`
  in `docs/sitemap.xml` and, for guides, `dateModified` in the page's JSON-LD.
  The sitemap is hand-maintained; nothing updates it automatically.
- Measurement scripts for every guide figure live in `scripts/measure/`; rerun
  them after a data release and update the guides.

## Checks

- Run: every guide figure recomputed from the committed files (method in
  `.references/seo/sources.md`); all cited URLs loaded on 2026-10-18; pages
  served locally and checked in Chromium at 1280 and 390 px: no console
  errors, no failed requests, no horizontal overflow, one H1, JSON-LD parses.
- Not run: `npm run build` / `npm run validate` (no data or script changes),
  Rich Results Test on the deployed pages.

## Next steps

1. After merge, the Pages workflow deploys `docs/`. Inspect the live guide
   pages and submit `https://cublya.github.io/world-atlas/sitemap.xml` in
   Search Console (a `robots.txt` under `/world-atlas/` is not read by
   crawlers; only the host root's is).
2. Fix findings 1 to 3, then update the resolution guide.
3. Next guide candidate: using the boundary views (switching, `boundaryView`,
   `policyMergedMapUnits`) with worked examples.
4. Check date for search data: 2027-01-18.

# Changelog

All notable changes to this project are documented in this file.

## 3.0.0-beta.1 - 2026-07-09 (Hikmat Samadov)

### Added

- `llms.txt` file summarizing topology structures, boundary views, and package guidance.
- Add reproducible Natural Earth 5.1.2 builds with pinned source checksums.
- Add UN-style and independent geopolitical boundary views.
- Add validation for topology, boundary policy, and UN country coverage.
- Add committed 10m, 50m, and 110m TopoJSON artifacts.
- Add CI verification for generated artifacts.

### Changed

- Dissolve Baikonur into Kazakhstan in the default UN-style country view.
- Refined brand logo, favicon, and project site styles with concentric circles representing the World Atlas.
- Renamed internal `topojsonFromFeatures` helper to `buildIndependentView` in the build script.
- Rename the package to `@cublya/world-atlas`.
- Replace the legacy shell and Yarn publishing workflow with Node.js and npm.
- Document boundary views, coverage, source metadata, and data licensing.

### Removed

- Remove the legacy `prepublish` script and `yarn.lock`.

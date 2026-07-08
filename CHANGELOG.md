# Changelog

All notable changes to this project are documented in this file.

## 3.0.0-beta.0 - 2026-07-08

Author: Hikmat Samadov <s3m3dov@hotmail.com>

### Added

- Add reproducible Natural Earth 5.1.2 builds with pinned source checksums.
- Add UN-style and independent geopolitical boundary views.
- Add validation for topology, boundary policy, and UN country coverage.
- Add committed 10m, 50m, and 110m TopoJSON artifacts.
- Add CI verification for generated artifacts.

### Changed

- Rename the package to `@cublya/world-atlas`.
- Replace the legacy shell and Yarn publishing workflow with Node.js and npm.
- Document boundary views, coverage, source metadata, and data licensing.

### Removed

- Remove the legacy `prepublish` script and `yarn.lock`.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-06

### Added
- **Core Engine:** Initial release of the Obsidian Brand Gate Doctrine Compliance Engine.
- **Indices:** Implementation of Tone Stability Index (TSI), Sovereignty Drift Index (SDI), and Architectural Authority Index (AAI).
- **CLI Command:** `obsidian-brand-gate evaluate` supporting file input and custom COA IR directive profiles.
- **Sector Profiles:**
  - `coa_ir_directive.json` (Default Balanced profile)
  - `coa_ir_legal_sector.json` (Legal profile prioritizing citation verification)
  - `coa_ir_healthcare_sector.json` (Healthcare profile prioritizing medical policy compliance)
- **CI/CD Integration:** GitHub Actions build-and-test workflow config.
- **Documentation:** Full technical specifications covering the Architecture, contributing guidelines, and JSON schemas.
- **Verification Tests:** Automated suite asserting gate behaviour across both permitted and prohibited templates.

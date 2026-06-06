# COA IR Directive Schema Specification

The Constitutional Order of Authority Intent & Response (COA IR) Directive governs the weights, thresholds, and metadata used to enforce brand compliance. This document defines the schema structure of these JSON profiles.

---

## Schema Structure

A valid COA IR Directive JSON file must contain the following top-level structures:

```json
{
  "profile_metadata": {
    "sector": "string",
    "version": "string",
    "description": "string"
  },
  "constitutional_thresholds": {
    "weights": {
      "tone_stability_index": 0.0 - 1.0,
      "sovereignty_drift_index": 0.0 - 1.0,
      "architectural_authority_index": 0.0 - 1.0
    },
    "minimum_doctrine_compliance_score": 0.0 - 10.0
  }
}
```

### 1. `profile_metadata`

Contains information identifying the target industry, sector, or purpose of the profile.

* **`sector`** (String, Required): The target category or domain of this directive (e.g. `"general"`, `"legal"`, `"healthcare"`).
* **`version`** (String, Required): Semantic versioning string (e.g. `"1.0.0"`).
* **`description`** (String, Required): A short explanation of the compliance strategy enforced by this profile.

---

### 2. `constitutional_thresholds`

Defines the mathematical parameters of the compliance evaluation.

#### `weights`
Individual indices are assigned fractional weights indicating their significance to the target sector.
* **`tone_stability_index`** (Float, Required): Must be between `0.0` and `1.0`. Measures brand voice consistency.
* **`sovereignty_drift_index`** (Float, Required): Must be between `0.0` and `1.0`. Measures liability and commitment drift.
* **`architectural_authority_index`** (Float, Required): Must be between `0.0` and `1.0`. Measures alignment with canonical facts and reference structures.

> [!IMPORTANT]
> The sum of the three weights (`tone_stability_index` + `sovereignty_drift_index` + `architectural_authority_index`) **MUST** equal exactly `1.0`.

#### `minimum_doctrine_compliance_score`
* **`minimum_doctrine_compliance_score`** (Float, Required): The minimum overall Doctrine Compliance Score (DCS) required to pass validation. This is typically set to `8.0`. Any evaluation resulting in a score strictly less than this value will fail.

---

## Example Directives

### Default (General) Profile
Enforces a balanced weighting scheme across all three metrics.
```json
{
  "profile_metadata": {
    "sector": "general",
    "version": "1.0.0",
    "description": "Default balanced compliance directive for corporate messaging and PR channels."
  },
  "constitutional_thresholds": {
    "weights": {
      "tone_stability_index": 0.3,
      "sovereignty_drift_index": 0.4,
      "architectural_authority_index": 0.3
    },
    "minimum_doctrine_compliance_score": 8.0
  }
}
```

### Legal Sector Profile
Heavily weights the Sovereignty Drift Index (SDI) and Architectural Authority Index (AAI) to eliminate unverified assertions and citation hallucinations.
```json
{
  "profile_metadata": {
    "sector": "legal",
    "version": "1.0.0",
    "description": "Legal sector compliance directive prioritising legal accuracy and citation integrity."
  },
  "constitutional_thresholds": {
    "weights": {
      "tone_stability_index": 0.2,
      "sovereignty_drift_index": 0.4,
      "architectural_authority_index": 0.4
    },
    "minimum_doctrine_compliance_score": 8.0
  }
}
```

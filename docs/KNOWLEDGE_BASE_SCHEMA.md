# Knowledge Base Schema Specification

The Architectural Authority Index (AAI) uses a local or remote **Knowledge Base** JSON file to cross-reference AI-generated assertions against corporate truth. This document outlines the schema design of the knowledge base.

---

## Schema Structure

A valid Knowledge Base JSON file contains two primary arrays: `facts` and `citations`.

```json
{
  "facts": [
    {
      "topic": "string",
      "description": "string",
      "canonical_truth": "string",
      "banned_assertions": ["string"]
    }
  ],
  "citations": [
    {
      "citation": "string",
      "case_name": "string",
      "jurisdiction": "string",
      "year": 2026,
      "status": "VALID | OVERRULED | UNVERIFIED"
    }
  ]
}
```

---

### 1. `facts` Array

Maintains structured factual anchors about products, policies, architecture, or regulatory stances.

| Field | Type | Description |
|---|---|---|
| **`topic`** | String | The unique subject or theme of the rule (e.g. `"Data Residency"`). |
| **`description`** | String | Detailed explanation of the policy or architectural detail. |
| **`canonical_truth`** | String | The official corporate stance (used in audit violation logs). |
| **`banned_assertions`** | Array[String] | Phrases or terms that explicitly contradict the truth and are banned. |

---

### 2. `citations` Array

For legal and clinical compliance, this array indexes verified, active case citations or research trial IDs to ensure that any generated reference is valid.

| Field | Type | Description |
|---|---|---|
| **`citation`** | String | The exact citation string (e.g., `"891 F.3d 445"` or `"NCT0123456"`). |
| **`case_name`** | String | The name of the case or clinical trial study. |
| **`jurisdiction`** | String | The court or governing board (e.g., `"2d Cir."` or `"FDA"`). |
| **`year`** | Integer | The year of publication/decision. |
| **`status`** | String | Must be `"VALID"`, `"OVERRULED"`, or `"UNVERIFIED"`. |

---

## Example Knowledge Base File

Save this structure to a file such as `knowledge_base.json`:

```json
{
  "facts": [
    {
      "topic": "System Hosting Architecture",
      "description": "Our product is local-first and zero-trust, storing no customer data on external cloud databases.",
      "canonical_truth": "Obsidian OS is an off-grid, self-hosted, local-first platform.",
      "banned_assertions": [
        "cloud-hosted",
        "managed service",
        "we host your data",
        "our servers store"
      ]
    }
  ],
  "citations": [
    {
      "citation": "891 F.3d 445",
      "case_name": "Thornton v. Apex Digital Advisors, Inc.",
      "jurisdiction": "2d Cir.",
      "year": 2024,
      "status": "VALID"
    },
    {
      "citation": "2025 WL 3847291",
      "case_name": "Rodriguez v. NovaTrade Systems, LLC",
      "jurisdiction": "S.D.N.Y.",
      "year": 2025,
      "status": "OVERRULED"
    }
  ]
}
```

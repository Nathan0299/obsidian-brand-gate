# Sector-Specific COA IR Directive Profiles

This directory contains pre-configured COA IR (Constitutional Order of Authority Intent & Response) Directive profiles. Each profile represents a customized weighting system tailored to specific corporate risk profiles and regulatory domains.

---

## Profile Catalog

### 1. Default (Balanced) Profile
* **File:** [coa_ir_directive.json](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/coa_ir_directive.json)
* **Target Sector:** General Corporate / Public Relations
* **Description:** Ideal for standard marketing copy, public relations statements, and customer-facing support. It maintains a balanced view of tone stability (TSI: 30%), liability prevention (SDI: 40%), and architectural truth (AAI: 30%).

### 2. Legal Sector Profile
* **File:** [coa_ir_legal_sector.json](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/coa_ir_legal_sector.json)
* **Target Sector:** Legal Services / Document Drafting / Compliance Memos
* **Description:** Emphasizes citation accuracy and prevents hallucinated case names. This profile shifts emphasis to the Architectural Authority Index (AAI: 40%) and Sovereignty Drift Index (SDI: 40%) while reducing tone checks (TSI: 20%).

### 3. Healthcare Sector Profile
* **File:** [coa_ir_healthcare_sector.json](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/coa_ir_healthcare_sector.json)
* **Target Sector:** Medical/Healthcare / Health Insurance
* **Description:** Built to target FDA/regulatory compliance and prevent illegal medical advice or diagnostic claims. It heavily penalizes unauthorized medical assertions (SDI: 50%) and medical claims (AAI: 30%).

---

## Evaluating with a Specific Profile

You can run the compliance check using a specific profile using the `-c` or `--coa` CLI option.

Example using the Legal profile:
```bash
node dist/index.js evaluate -f tests/fixtures/test_legal_hallucination.md -c profiles/coa_ir_legal_sector.json
```

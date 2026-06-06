# Obsidian Brand Gate

[![CI Build](https://github.com/obsidian-os/obsidian-brand-gate/actions/workflows/ci.yml/badge.svg)](https://github.com/obsidian-os/obsidian-brand-gate/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)

**Deterministic pre-publication CI/CD gate enforcing corporate doctrine compliance.**

Obsidian Brand Gate intercepts AI-generated content in your publishing/release pipelines and evaluates it against a strict set of rule boundaries defined in a **COA IR Directive** (Constitutional Order of Authority Intent & Response). If the content violates corporate doctrine, the pipeline fails—blocking publication before bad outputs reach production.

---

## Why Brand Gate?

AI-generated corporate communications carry legal and financial liabilities. In *Moffatt v. Air Canada* (2024), the court ruled that Air Canada was liable for a refund policy hallucinated by its customer-support chatbot. Similarly, law firms have faced sanctions for submitting AI-hallucinated case citations in legal briefs.

Probabilistic "LLM-as-a-judge" guardrails are slow, expensive, and non-deterministic—they can still miss critical compliance violations.

**Obsidian Brand Gate** provides a fast, deterministic, zero-cost compliance gate that runs locally in your build step or CI/CD environment.

---

## Architecture & Scoring Indices

The engine analyzes text files along three key indices to compute a weighted **Doctrine Compliance Score (DCS)** out of `10.0`:

| Index | Focus Area | Checks & Protections |
|---|---|---|
| **Tone Stability Index (TSI)** | Tone Consistency | Detects hyperbolic slang, excessive emojis, and panic-inducing urgency language. |
| **Sovereignty Drift Index (SDI)** | Liability & Commitment | Flags unauthorized financial promises, return/refund guarantees, and diagnostic/prescription claims. |
| **Architectural Authority Index (AAI)**| Truth Alignment | Catches architectural contradictions (e.g. cloud claims vs local-first facts) and hallucinated legal/clinical citations. |

For detailed information on the math and inner workings, see [ARCHITECTURE.md](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/ARCHITECTURE.md).

---

## Installation & Setup

1. **Install globally or in your project** via npm:
   ```bash
   npm install -g @obsidian-os/brand-gate
   ```

2. **Verify installation**:
   ```bash
   obsidian-brand-gate --help
   ```

---

## Usage Guide

To evaluate a file (e.g., draft release notes, legal briefs, marketing posts) against a COA IR profile:

```bash
obsidian-brand-gate evaluate -f <path-to-content-file> -c <path-to-coa-ir-directive.json>
```

### CI/CD Pipeline Integration

Since the CLI returns an exit code of `1` on a failed doctrine check, you can easily integrate it into your GitHub Actions workflow or deployment scripts:

```yaml
- name: Evaluate Content compliance
  run: obsidian-brand-gate evaluate -f ./drafts/newsletter.md -c ./profiles/coa_ir_directive.json
```

---

## Sector Profiles

The project includes pre-configured profile rules suited for different domains:
* [profiles/coa_ir_directive.json](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/coa_ir_directive.json) (General Corporate)
* [profiles/coa_ir_legal_sector.json](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/coa_ir_legal_sector.json) (Legal Services)
* [profiles/coa_ir_healthcare_sector.json](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/coa_ir_healthcare_sector.json) (Healthcare & Insurance)

For more information, see [profiles/README.md](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/README.md).

---

## Contributing

We welcome contributions! Please review our [CONTRIBUTING.md](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/CONTRIBUTING.md) guide to learn how to add custom validators, build profiles, or run the test suite.

---

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

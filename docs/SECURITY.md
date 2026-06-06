# Security, Compliance, & SOC 2 Readiness

**Product:** Obsidian Brand Gate (`obsidian-brand-gate`)  
**Deployment Model:** Self-Hosted / On-Premise  
**Security Classification:** Public / Security Brief  

This document outlines the security architecture, data handling policies, and SOC 2 Trust Services Criteria mapping for Obsidian Brand Gate. Because the framework is designed to run entirely within the customer’s cloud boundary (On-Prem/Self-Hosted), the architecture minimizes data privacy exposure and simplifies compliance reviews.

---

## 1. Core Security Architecture

Obsidian Brand Gate enforces a **Zero-Exfiltration, Local-First** security model.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER CLOUD BOUNDARY                         │
│                                                                        │
│   [ CI/CD Runner / Service ]                                           │
│               │                                                        │
│               ▼ (Local execution)                                      │
│      [ obsidian-brand-gate ]                                           │
│               │                                                        │
│               ├─► [ Local DB / EHR / Ticketing Connector ]             │
│               │                                                        │
│               ├─► [ Local LLM / Ollama Evaluation API ] (Optional)     │
│               │                                                        │
│               └─► [ SQLite Audit Ledger (brand_gate_audit.db) ]        │
└────────────────────────────────────────────────────────────────────────┘
```

1.  **Local Execution:** The compiler gate, validators, and database connectors execute locally inside your containerized CI/CD environment or private cloud.
2.  **No External Callouts:** The core gate and regex validators make zero external network requests.
3.  **Local Knowledge Base Connectors:** The facts index verification system queries local database instances (EHR, Ticketing Engines, Case Databases) using restricted, read-only connections.
4.  **Audit Ledger Isolation:** Telemetry data is recorded directly into a local SQLite database (`brand_gate_audit.db`) or structured JSON file. No telemetry or log records are sent back to the Obsidian OS team.

---

## 2. Cryptographic Integrity & Ledger Security

To satisfy SOC 2 audit demands for **Processing Integrity** and **Security**, the audit ledger implements the following controls:

*   **Immutable Hashing:** Every validation transaction is compiled into an audit block. The block is cryptographically signed and hashed using SHA-256 (`receipt_hash`):
    $$Receipt\ Hash = SHA256(Timestamp \parallel FilePath \parallel DCS \parallel Violations \parallel SchemaVersion)$$
*   **Tamper Detection:** The database schema is designed to detect and block back-dated or altered ledger records.
*   **Signature Verification:** Automated workflows can verify receipt signatures using your system-configured signing secret (`OSBG_SIGNING_SECRET`) to prove audit history authenticity.

---

## 3. Secret & Credentials Management

The gate requires credentials to connect to databases (EHR, ticketing engines) or optional external evaluation models (e.g. Gemini, OpenAI API keys).

*   **Zero Hardcoded Secrets:** The codebase contains no default credentials. All connections are configured at runtime via environment variables (e.g., `OSBG_LEDGER_DB_PATH`, `OLLAMA_HOST`, `GEMINI_API_KEY`).
*   **Runtime Injection:** Environment variables must be injected into containers using standard secret managers (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, Kubernetes Secrets).
*   **Least Privilege Database Access:** Database connectors must utilize service accounts restricted to `SELECT` (read-only) privileges on specified target tables.

---

## 4. SOC 2 Trust Services Criteria Mapping

| TSC Trust Principle | brand Gate Control Implementation | Evidence Location |
|---|---|---|
| **Security (CC1-CC5)** | • Runs entirely inside customer private network bounds.<br>• Secure Docker build scripts without root privileges.<br>• RBAC on Express dashboard server endpoints. | `Dockerfile`<br>`src/dashboard/server.ts`<br>`docs/DEPLOYMENT.md` |
| **Confidentiality (CC6)** | • Zero-exfiltration architecture. Client data and AI drafts never leave the customer's cloud boundary.<br>• Logs are stored on-prem in a local SQLite file. | `src/audit/ledger.ts`<br>`src/gate.ts` |
| **Processing Integrity (CC7)** | • Deterministic validation based on compiled COA IR state rulesets.<br>• Cryptographic SHA-256 ledger signatures for every evaluation transaction. | `src/adapters/regex_detector.ts`<br>`src/audit/ledger.ts` |
| **Availability (CC8)** | • High-performance engine (< 2ms average latency overhead).<br>• Graceful SQLite database disconnect fallback to local JSON files. | `src/audit/ledger.ts`<br>`src/tests/benchmark.ts` |

---

## 5. Security Inquiries & Contact
To request penetration test results, ask security architecture questions, or report vulnerabilities, contact our compliance team:  
📧 **compliance@obsidian-os.org** (GPG Key available upon request).

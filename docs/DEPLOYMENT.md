# On-Premise & Private Cloud Deployment Guide

This document describes how to deploy and configure Obsidian Brand Gate (`obsidian-brand-gate`) and its audit dashboard in production, containerized, and high-availability environments.

---

## 1. Prerequisites

### A. Bare Metal / VM Environment
*   **Runtime:** Node.js v20.x or higher, npm v10.x or higher
*   **Database:** SQLite 3 (compiled binaries for your host OS, e.g. for `better-sqlite3`)
*   **Build Tools:** Python 3, `make`, `g++` (required for native SQLite compilation)

### B. Containerized Environment
*   **Docker:** v24.x or higher
*   **Docker Compose:** v2.x or higher

---

## 2. Docker Deployment (Recommended)

Docker isolates native SQLite builds from the host environment, making it the most resilient setup.

### A. Configuration via `docker-compose.yml`
Create or modify the `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  brand-gate-dashboard:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: osbg-dashboard
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - OSBG_LEDGER_DB_PATH=/data/brand_gate_audit.db
    volumes:
      - osbg-data:/data
    restart: unless-stopped

volumes:
  osbg-data:
    driver: local
```

### B. Execution Commands
1.  **Build and Start Services:**
    ```bash
    docker compose up -d --build
    ```
2.  **Monitor Output Logs:**
    ```bash
    docker compose logs -f brand-gate-dashboard
    ```
3.  **Shut Down Services:**
    ```bash
    docker compose down
    ```

---

## 3. Configuration Environment Variables

| Variable Name | Default Value | Description |
|---|---|---|
| `PORT` | `3000` | The port the Express telemetry dashboard binds to. |
| `OSBG_LEDGER_DB_PATH` | `./brand_gate_audit.db` | Absolute path to the SQLite audit database file. |
| `OSBG_SIGNING_SECRET` | `unset` | Hex-encoded secret key used to sign receipt transaction blocks. |
| `OLLAMA_HOST` | `http://localhost:11434` | Host address of Ollama server (used by `LlmEvaluatorDetector`). |
| `GEMINI_API_KEY` | `unset` | Google Gemini API Key (used for live evaluation testing). |

---

## 4. CI/CD Runner Deployment

When deploying the gate as a pre-publication blocker in build runners (without the dashboard):

1.  **Install the SDK package:**
    ```bash
    npm install @obsidian-os/brand-gate
    ```
2.  **Integrate the CLI check step:**
    Add a script in your package.json or deployment file executing the check:
    ```bash
    npx obsidian-brand-gate evaluate --file ./drafts/newsletter.md --profile ./profiles/default.json
    ```
3.  **Halt Policy:**
    If the draft fails evaluation, the process exits with status code `1`, halting the runner and blocking publication.

---

## 5. High Availability & Scaling

For high-throughput enterprise architectures running the dashboard:

```
                      [ Load Balancer ]
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
       [ Node 1 ]       [ Node 2 ]       [ Node 3 ]
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                [ Shared Storage / Volume ]
             (Persistent SQLite/JSON Ledger)
```

1.  **Ledger Persistent Volume:** If scaling the dashboard Express app across multiple nodes, ensure the `OSBG_LEDGER_DB_PATH` points to a shared persistent volume (e.g. AWS EFS, NFS, or shared Radix volumes) that supports atomic file locking.
2.  **Shared Database (Future Phase):** For systems processing > 10,000 requests per second, configure the audit connector to target a centralized, high-availability PostgreSQL database cluster rather than SQLite.

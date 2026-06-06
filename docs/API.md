# Dashboard REST API Specification

This document describes the REST API endpoints exposed by the Obsidian Brand Gate dashboard server. 

---

## 1. Base URL & Protocol

All requests must utilize standard JSON formatting:
*   **Protocol:** `HTTP/1.1` (or `HTTPS` in production)
*   **Default Base URL:** `http://localhost:3000`
*   **Headers:**
    *   `Accept: application/json`
    *   `Content-Type: application/json`

---

## 2. API Endpoints Reference

### A. Server System Status
Retrieve runtime status details for the Brand Gate engine.

*   **Endpoint:** `/api/status`
*   **Method:** `GET`
*   **Auth Required:** None (Public)
*   **Success Response (200 OK):**
    ```json
    {
      "status": "ACTIVE",
      "engine": "obsidian-brand-gate v1.0.0",
      "timestamp": "2026-06-06T12:35:11.123Z"
    }
    ```

---

### B. List Audit Ledger Evaluations
Query chronological validation logs recorded in the persistent ledger database.

*   **Endpoint:** `/api/evaluations`
*   **Method:** `GET`
*   **Auth Required:** None (Default setup; requires reverse-proxy auth in production)
*   **Query Parameters:**
    *   `limit` (Optional, Integer): Maximum records to retrieve. Default is `100`.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "records": [
        {
          "id": 42,
          "timestamp": "2026-06-06T12:26:44.000Z",
          "file_path": "/workspace/drafts/test_rogue.md",
          "dcs": 6.60,
          "tsi": 10.0,
          "sdi": 4.5,
          "aai": 6.0,
          "passed": false,
          "violations": [
            "SDI-001: Detected 1 unauthorized commitment(s). Penalty: -2.5",
            "SDI-002: Detected potential financial liability language. Penalty: -3.0",
            "AAI-004: Detected unverified policy entitlement claim. Penalty: -4.0"
          ],
          "receipt_hash": "fea670b37fd9d8c5bb53da2938970d3f8b997f0c2d11baa9f625ed84cc9aceaf",
          "coa_ir_version": "coa_ir_directive_v1"
        }
      ]
    }
    ```
*   **Error Response (500 Internal Server Error):**
    ```json
    {
      "success": false,
      "error": "Failed to read database ledger: SQLite database locked."
    }
    ```

---

## 3. Client Verification Flow Example (cURL)

Retrieve the last 5 evaluations recorded on the server:

```bash
curl -X GET "http://localhost:3000/api/evaluations?limit=5" \
  -H "Accept: application/json"
```

# GitHub Actions Integration Guide

This guide shows how to integrate `obsidian-brand-gate` into GitHub Actions. This allows you to automatically evaluate and block AI-generated drafts (e.g. documentation, articles, marketing collateral, policy briefs) in your pull requests before they are merged and published.

---

## 1. Compliance Pipeline Workflow Example

Create a workflow file under `.github/workflows/ai_compliance.yml` in your repository:

```yaml
name: AI Content compliance Audit Gate

on:
  pull_request:
    paths:
      - 'content/**'
      - 'drafts/**'
      - 'docs/**'
  push:
    branches:
      - main
    paths:
      - 'content/**'
      - 'drafts/**'
      - 'docs/**'

jobs:
  compliance-gate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository Source
        uses: actions/checkout@v4
        with:
          fetch-depth: 2 # Required to inspect modified files

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Project Dependencies
        run: npm ci

      - name: Build Brand Gate Compiler
        run: npm run build

      - name: Identify Modified Draft Files
        id: files
        run: |
          # Find all newly added or modified markdown files
          MODIFIED_FILES=$(git diff --name-only --diff-filter=AM HEAD~1 | grep '\.md$' || true)
          echo "files=$MODIFIED_FILES" >> $GITHUB_OUTPUT

      - name: Execute Doctrine Compliance Check
        if: steps.files.outputs.files != ''
        env:
          OSBG_SIGNING_SECRET: ${{ secrets.OSBG_SIGNING_SECRET }}
          # Inject target model API keys if using LLM detectors
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }} 
        run: |
          for file in ${{ steps.files.outputs.files }}; do
            echo "══════════════════════════════════════════════════════"
            echo " Evaluating: $file"
            echo "══════════════════════════════════════════════════════"
            
            # Execute gate check. Exits with status 1 if DCS falls below 8.0, halting workflow.
            npx obsidian-brand-gate evaluate --file "$file" --profile ./profiles/default.json
          done
```

---

## 2. Secrets Configuration

In your GitHub repository:
1.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
2.  Add repository secrets:
    *   `OSBG_SIGNING_SECRET`: Hex-encoded signing key used to cryptographically stamp validation ledger receipts.
    *   `GEMINI_API_KEY` or `OLLAMA_HOST` (optional): Required only if using LLM validation adapters.

---

## 3. Workflow Failure Behavior
If a pull request contains drafts that violate Tone, Sovereignty, or Factual directives:
1.  The `obsidian-brand-gate` script outputs the directive indices scores (TSI, SDI, AAI) and lists the specific violations.
2.  The script exits with code `1`, causing the GitHub Actions job to fail.
3.  The pull request displays a failed check badge, blocking merges until the author edits the content to align with corporate doctrine.

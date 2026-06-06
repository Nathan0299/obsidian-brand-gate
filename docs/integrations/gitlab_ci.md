# GitLab CI/CD Integration Guide

This guide demonstrates how to configure `obsidian-brand-gate` within a GitLab CI/CD pipeline to automatically audit and enforce compliance guidelines on AI-generated documentation or marketing content.

---

## 1. Compliance Pipeline Configuration

Create or modify the `.gitlab-ci.yml` file in the root of your repository:

```yaml
stages:
  - build
  - compliance

build-gate:
  stage: build
  image: node:20-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
      - node_modules/
    expire_in: 1 hour

doctrine-compliance-gate:
  stage: compliance
  image: node:20-alpine
  dependencies:
    - build-gate
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  before_script:
    - apk add --no-cache git # Install Git to perform file diffing
  script:
    - echo "Locating modified drafts since last commit..."
    # Compare current commit against origin/main to find modified markdown files
    - git fetch origin main
    - MODIFIED_FILES=$(git diff --name-only origin/main...HEAD | grep '\.md$' || true)
    
    - |
      if [ -z "$MODIFIED_FILES" ]; then
        echo "✓ No modified drafts discovered."
        exit 0
      fi
      
      echo "Modified files to check:"
      echo "$MODIFIED_FILES"
      
      # Iterate and evaluate each draft
      for file in $MODIFIED_FILES; do
        if [ -f "$file" ]; then
          echo "══════════════════════════════════════════════════════"
          echo " Auditing Compliance: $file"
          echo "══════════════════════════════════════════════════════"
          
          # Runs check. Pipeline halts with exit 1 if DCS falls below 8.0.
          node dist/index.js evaluate --file "$file" --profile ./profiles/default.json
        else
          echo "File skipped (removed or directory): $file"
        fi
      done
  only:
    - merge_requests
    - main
  variables:
    OSBG_SIGNING_SECRET: $OSBG_SIGNING_SECRET
    GEMINI_API_KEY: $GEMINI_API_KEY
```

---

## 2. CI/CD Environment Variables in GitLab

To register credentials and signing keys safely:
1.  In your GitLab project, go to **Settings** > **CI/CD**.
2.  Expand the **Variables** section.
3.  Add the following variables:
    *   `OSBG_SIGNING_SECRET`: The signing secret key used to stamp audit receipts (protecting the SQLite database ledger from modification). Check the "Mask variable" and "Protect variable" options where appropriate.
    *   `GEMINI_API_KEY` (optional): API key needed if you run verification adapters communicating with Gemini models.

---

## 3. Merge Request Block Policy
When a merge request is submitted, GitLab CI will execute the `doctrine-compliance-gate` job. If any modified markdown draft contains hyperbole, unverified citations, or medical prescribing claims that fail the evaluation score threshold:
1.  The compliance job fails, marking the pipeline as failed.
2.  If **"Merge checks"** are configured in your repository settings to require successful pipelines, the merge request is blocked from being merged until the developer revises the text and commits compliant drafts.

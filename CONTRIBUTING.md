# Contributing to Obsidian Brand Gate

First off, thank you for considering contributing to Obsidian Brand Gate! It is contributors like you who make this a robust tool for enforcing AI compliance.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (please refer to our community standards).

## How Can I Contribute?

### 1. Adding New Lexicon Validators
Our engine checks text against rules defined in `src/gate.ts`. If you find common LLM hallucination or rogue patterns, feel free to add them:
1. Open [src/gate.ts](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/src/gate.ts).
2. Locate the appropriate category (TSI, SDI, or AAI).
3. Define your regex pattern and score penalty.
4. Add descriptive violation messages following the pattern `[CATEGORY]-[NUMBER]`.
5. Run tests to ensure everything is correct (`npm run test`).

### 2. Creating Custom COA IR Profiles
We welcome contribution of new sector-specific COA IR profiles (e.g. finance, customer service):
1. Create a JSON profile file inside the [profiles/](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles) directory following the name format `coa_ir_<sector>_sector.json`.
2. Document the profile in [profiles/README.md](file:///Users/macpro/workspace/Obsidian_OS/sdk/obsidian-brand-gate/profiles/README.md).
3. Test your profile with representative mock markdown files using:
   ```bash
   node dist/index.js evaluate -f <path-to-test-file> -c <path-to-your-profile>
   ```

### 3. Reporting Bugs and Feedback
* Use GitHub Issues to report bugs or request features.
* Include a minimal reproducible example where possible (e.g., the target text file and the COA IR profile used).

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/obsidian-os/obsidian-brand-gate.git
   cd obsidian-brand-gate
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the code:
   ```bash
   npm run build
   ```
4. Run the test suite:
   ```bash
   npm test
   ```

## Code Style Guide

* **TypeScript**: Use TypeScript strict type checks.
* **Formatting**: Keep code clean, readable, and properly indented (2 spaces).
* **Naming**: Use camelCase for variables/functions, and PascalCase for classes.
* **Commit Messages**: Write clear, descriptive commit messages starting with semantic prefixes (e.g., `feat:`, `fix:`, `docs:`).

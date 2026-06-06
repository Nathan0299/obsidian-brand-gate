#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { ObsidianBrandGate } from './gate';

const program = new Command();

program
  .name('obsidian-brand-gate')
  .description('Deterministic pre-publication CI/CD gate enforcing corporate doctrine compliance.')
  .version('1.0.0');

program
  .command('evaluate')
  .description('Evaluate a content file against the COA IR directive')
  .requiredOption('-f, --file <path>', 'Path to the markdown/content file')
  .requiredOption('-c, --coa <path>', 'Path to the COA IR Directive JSON')
  .option('-k, --kb <path>', 'Path to the canonical Knowledge Base JSON')
  .action(async (options) => {
    try {
        console.log(chalk.blue(`\n══════════════════════════════════════════════════════`));
        console.log(chalk.blue(`  OBSIDIAN BRAND GATE — Constitutional Compliance Engine`));
        console.log(chalk.blue(`══════════════════════════════════════════════════════\n`));
        console.log(chalk.dim(`COA IR Directive: ${options.coa}`));
        console.log(chalk.dim(`Target File:      ${options.file}`));
        if (options.kb) {
            console.log(chalk.dim(`Knowledge Base:   ${options.kb}`));
        }
        console.log('');

        const gate = new ObsidianBrandGate(options.coa, undefined, options.kb);
        const result = await gate.evaluateFile(options.file);

        console.log(chalk.yellow(`── SCORING METRICS ──────────────────────────────────`));
        console.log(`  Tone Stability Index (TSI):          ${result.tsi}/10.0`);
        console.log(`  Sovereignty Drift Index (SDI):       ${result.sdi}/10.0`);
        console.log(`  Architectural Authority Index (AAI):  ${result.aai}/10.0`);
        console.log(chalk.cyan(`\n  Doctrine Compliance Score (DCS):     ${result.dcs}/10.0`));
        console.log(chalk.dim(`  Minimum Required:                    8.0/10.0\n`));

        if (result.passed) {
            console.log(chalk.green.bold(`  ✓ [PERMITTED] Content passed all constitutional thresholds.`));
            console.log(chalk.dim(`  Audit Receipt:  ${result.receiptHash}`));
            console.log(chalk.dim(`  Timestamp:      ${result.timestamp}\n`));
            process.exit(0);
        } else {
            console.log(chalk.red.bold(`  ✗ [FATAL BLOCK] DCS ${result.dcs} < 8.0 — Publication denied.`));
            console.log(chalk.red(`  CI/CD Pipeline Terminated.\n`));
            console.log(chalk.yellow(`── VIOLATIONS ──────────────────────────────────────`));
            result.violations.forEach(v => console.log(chalk.red(`  ▸ ${v}`)));
            console.log(chalk.dim(`\n  Violation Receipt: ${result.receiptHash}`));
            console.log(chalk.dim(`  Timestamp:         ${result.timestamp}\n`));
            process.exit(1);
        }
    } catch (err: any) {
        console.error(chalk.red(`\n  [EXECUTION ERROR] ${err.message}\n`));
        process.exit(1);
    }
  });

program.parse(process.argv);

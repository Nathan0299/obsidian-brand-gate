import fs from 'fs';
import crypto from 'crypto';
import { DetectorAdapter, DetectionResult } from './adapters/detector';
import { RegexDetector } from './adapters/regex_detector';
import { KnowledgeBaseConnector } from './knowledge_base/connector';
import { AuditLedger } from './audit/ledger';

export interface GateResult {
    passed: boolean;
    dcs: number;
    tsi: number;
    sdi: number;
    aai: number;
    receiptHash: string;
    violations: string[];
    timestamp: string;
}

export class ObsidianBrandGate {
    private coaIrPath: string;
    private detector: DetectorAdapter;
    private kbConnector?: KnowledgeBaseConnector;
    private ledger: AuditLedger;

    constructor(coaIrPath: string, detector?: DetectorAdapter, kbPath?: string, dbPath?: string) {
        this.coaIrPath = coaIrPath;
        this.detector = detector || new RegexDetector();
        if (kbPath) {
            this.kbConnector = new KnowledgeBaseConnector(kbPath);
        }
        this.ledger = new AuditLedger(dbPath);
    }

    private calculateHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    public async evaluateFile(filePath: string): Promise<GateResult> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Target file not found at: ${filePath}`);
        }
        if (!fs.existsSync(this.coaIrPath)) {
            throw new Error(`COA IR Directive file not found at: ${this.coaIrPath}`);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const coaIr = JSON.parse(fs.readFileSync(this.coaIrPath, 'utf-8'));
        const coaIrVersion = coaIr.profile_metadata?.version || '1.0.0';

        // 1. Run pluggable evaluation
        const result = await this.detector.evaluate(content, coaIr);
        let { tsi, sdi, aai, violations } = result;

        // 2. Cross-reference against Knowledge Base if configured
        if (this.kbConnector) {
            const kbViolations = this.kbConnector.auditContentFacts(content);
            if (kbViolations.length > 0) {
                const penalty = Math.min(kbViolations.length * 3.0, 8.0);
                aai = Math.max(0, aai - penalty);
                violations = [...violations, ...kbViolations];
            }

            // Verify citation references
            const citationPatterns = /\b\d{4}\s+wl\s+\d+|\b\d{3}\s+f\.\s*(?:supp|3d|2d)\b|\b\d{3}\s+u\.s\.\s+\d+/gi;
            const citationMatches = content.match(citationPatterns);
            if (citationMatches) {
                for (const match of citationMatches) {
                    const verification = this.kbConnector.verifyCitation(match);
                    if (!verification.exists) {
                        violations.push(`KB-CITATION-UNVERIFIED: Citation "${match}" not verified in canonical Knowledge Base. Penalty: -2.0`);
                        aai = Math.max(0, aai - 2.0);
                    } else if (verification.status === 'OVERRULED') {
                        violations.push(`KB-CITATION-OVERRULED: Citation "${match}" is marked OVERRULED in canonical Knowledge Base. Penalty: -4.0`);
                        aai = Math.max(0, aai - 4.0);
                    }
                }
            }
        }

        // Calculate DCS based on COA IR weights
        const weights = coaIr.constitutional_thresholds.weights;
        const dcs = (tsi * weights.tone_stability_index) + 
                    (sdi * weights.sovereignty_drift_index) + 
                    (aai * weights.architectural_authority_index);

        const minimumScore = coaIr.constitutional_thresholds.minimum_doctrine_compliance_score;
        const passed = dcs >= minimumScore;
        const timestamp = new Date().toISOString();

        const receiptHash = this.calculateHash(
            `DCS:${dcs.toFixed(2)}|TSI:${tsi}|SDI:${sdi}|AAI:${aai}|TIME:${timestamp}|PASSED:${passed}|FILE:${filePath}`
        );

        // 3. Write to persistent audit ledger
        const finalResult = {
            passed,
            dcs: parseFloat(dcs.toFixed(2)),
            tsi: parseFloat(tsi.toFixed(1)),
            sdi: parseFloat(sdi.toFixed(1)),
            aai: parseFloat(aai.toFixed(1)),
            receiptHash,
            violations,
            timestamp
        };

        try {
            this.ledger.record({
                timestamp: finalResult.timestamp,
                file_path: filePath,
                dcs: finalResult.dcs,
                tsi: finalResult.tsi,
                sdi: finalResult.sdi,
                aai: finalResult.aai,
                passed: finalResult.passed,
                violations: finalResult.violations,
                receipt_hash: finalResult.receiptHash,
                coa_ir_version: coaIrVersion
            });
        } catch (err: any) {
            console.error(`[ObsidianBrandGate] Failed to record in ledger: ${err.message}`);
        }

        return finalResult;
    }
}

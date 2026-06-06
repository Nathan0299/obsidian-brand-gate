import { DetectorAdapter, DetectionResult } from './detector';

export class RegexDetector implements DetectorAdapter {
    public name = 'RegexDetector';

    public async evaluate(content: string, coaIr: any): Promise<DetectionResult> {
        const text = content.toLowerCase();
        let tsi = 10.0;
        let sdi = 10.0;
        let aai = 10.0;
        const violations: string[] = [];

        // ═══════════════════════════════════════════════════════════
        // TSI: Tone Stability Index
        // Penalizes hyperbole, panic-inducing, or casual slang that
        // deviates from authoritative corporate doctrine.
        // ═══════════════════════════════════════════════════════════
        const hyperbolePatterns = /game-changer|insane|mind-blowing|crazy|asap|urgent!|groundbreaking|revolutionary|incredible|amazing|awesome|unbelievable/g;
        const hyperboleMatches = text.match(hyperbolePatterns);
        if (hyperboleMatches) {
            const penalty = Math.min(hyperboleMatches.length * 2.0, 8.0);
            tsi -= penalty;
            violations.push(`TSI-001: Detected ${hyperboleMatches.length} hyperbolic/casual semantics. Penalty: -${penalty.toFixed(1)}`);
        }

        const panicPatterns = /act now|limited time|don't miss|last chance|hurry/g;
        const panicMatches = text.match(panicPatterns);
        if (panicMatches) {
            tsi -= 3.0;
            violations.push(`TSI-002: Detected panic-inducing urgency language. Penalty: -3.0`);
        }

        // ═══════════════════════════════════════════════════════════
        // SDI: Sovereignty Drift Index
        // Penalizes unauthorized commitments, liability assumptions,
        // and binding promises that exceed the author's authority.
        // ═══════════════════════════════════════════════════════════
        const commitmentPatterns = /we promise|we guarantee|guaranteed|100% immune|we accept liability|definitely will|we commit to|we ensure|we warrant/g;
        const commitmentMatches = text.match(commitmentPatterns);
        if (commitmentMatches) {
            const penalty = Math.min(commitmentMatches.length * 2.5, 8.0);
            sdi -= penalty;
            violations.push(`SDI-001: Detected ${commitmentMatches.length} unauthorized commitment(s). Penalty: -${penalty.toFixed(1)}`);
        }

        const liabilityPatterns = /refund|retroactively|compensation|we will pay|reimburse|money back/g;
        const liabilityMatches = text.match(liabilityPatterns);
        if (liabilityMatches) {
            sdi -= 3.0;
            violations.push(`SDI-002: Detected potential financial liability language. Penalty: -3.0`);
        }

        const medicalCommitmentPatterns = /we recommend taking|you should take|your diagnosis is|you have been diagnosed|prescribed|dosage of \d/g;
        const medicalMatches = text.match(medicalCommitmentPatterns);
        if (medicalMatches) {
            sdi -= 5.0;
            violations.push(`SDI-003: Detected unauthorized medical guidance or prescription language. Penalty: -5.0`);
        }

        // ═══════════════════════════════════════════════════════════
        // AAI: Architectural Authority Index
        // Penalizes factual contradictions against the canonical
        // knowledge base, fabricated citations, and false claims.
        // ═══════════════════════════════════════════════════════════
        const contradictionPatterns = /cloud-hosted|managed service|we host your data|our servers store/g;
        const contradictionMatches = text.match(contradictionPatterns);
        if (contradictionMatches) {
            aai -= 5.0;
            violations.push(`AAI-001: Detected canonical truth contradiction (cloud-hosting claim vs. zero-trust architecture). Penalty: -5.0`);
        }

        // Detect fabricated legal citations (e.g., "Smith v. Jones, 2025 WL 12345")
        const fabricatedCitationPatterns = /\b\d{4}\s+wl\s+\d+|\b\d{3}\s+f\.\s*(?:supp|3d|2d)\b|\b\d{3}\s+u\.s\.\s+\d+/g;
        const citationMatches = text.match(fabricatedCitationPatterns);
        if (citationMatches) {
            aai -= 4.0;
            violations.push(`AAI-002: Detected ${citationMatches.length} unverified legal citation(s) requiring canonical validation. Penalty: -4.0`);
        }

        // Detect fabricated medical claims or unverified clinical data
        const fabricatedMedicalPatterns = /clinical trial.{0,30}(?:showed|proved|demonstrated)\s+\d+%|fda.{0,20}approved for/g;
        const medicalClaimMatches = text.match(fabricatedMedicalPatterns);
        if (medicalClaimMatches) {
            aai -= 4.0;
            violations.push(`AAI-003: Detected unverified clinical/regulatory claim requiring canonical validation. Penalty: -4.0`);
        }

        // Detect fabricated policy claims (airline-specific)
        const policyFabricationPatterns = /(?:you (?:can|may|are entitled to)) (?:claim|request|receive) a (?:refund|credit|compensation|rebooking)/g;
        const policyMatches = text.match(policyFabricationPatterns);
        if (policyMatches) {
            aai -= 4.0;
            violations.push(`AAI-004: Detected unverified policy entitlement claim. Penalty: -4.0`);
        }

        return {
            tsi: Math.max(0, parseFloat(tsi.toFixed(1))),
            sdi: Math.max(0, parseFloat(sdi.toFixed(1))),
            aai: Math.max(0, parseFloat(aai.toFixed(1))),
            violations
        };
    }
}

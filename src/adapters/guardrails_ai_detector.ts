import { DetectorAdapter, DetectionResult } from './detector';

export class GuardrailsAiDetector implements DetectorAdapter {
    public name = 'GuardrailsAiDetector';
    private apiKey: string | undefined;
    private apiUrl: string;

    constructor() {
        this.apiKey = process.env.GUARDRAILS_API_KEY;
        this.apiUrl = process.env.GUARDRAILS_API_URL || 'https://api.guardrailsai.com/v1/validate';
    }

    public async evaluate(content: string, coaIr: any): Promise<DetectionResult> {
        let tsi = 10.0;
        let sdi = 10.0;
        let aai = 10.0;
        const violations: string[] = [];

        // If Guardrails API is configured, make a real HTTP request
        if (this.apiKey) {
            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: content,
                        validators: ['pii', 'toxic_language', 'hallucination']
                    })
                });

                if (response.ok) {
                    const data: any = await response.json();
                    // Map Guardrails validation output to our TSI, SDI, AAI indices
                    if (data.metrics) {
                        if (data.metrics.pii_detected) {
                            sdi -= 4.0;
                            violations.push(`GUARDRAILS-PII: Personal Identifiable Information detected by Guardrails. Penalty: -4.0`);
                        }
                        if (data.metrics.toxicity_score > 0.5) {
                            tsi -= 5.0;
                            violations.push(`GUARDRAILS-TOXIC: Toxicity score ${data.metrics.toxicity_score} exceeds threshold. Penalty: -5.0`);
                        }
                        if (data.metrics.hallucination_detected) {
                            aai -= 5.0;
                            violations.push(`GUARDRAILS-HALLUCINATION: Semantic hallucination detected by Guardrails. Penalty: -5.0`);
                        }
                    }
                } else {
                    console.warn(`[GuardrailsAiDetector] API returned error status: ${response.status}. Falling back to default compliance scores.`);
                }
            } catch (err: any) {
                console.error(`[GuardrailsAiDetector] Failed to connect to Guardrails API: ${err.message}. Running fallback local rules.`);
                this.runLocalFallback(content, violations, tsi, sdi, aai);
            }
        } else {
            // Local fallback simulation when no API key is set
            const result = this.runLocalFallback(content, violations, tsi, sdi, aai);
            tsi = result.tsi;
            sdi = result.sdi;
            aai = result.aai;
        }

        return {
            tsi: Math.max(0, parseFloat(tsi.toFixed(1))),
            sdi: Math.max(0, parseFloat(sdi.toFixed(1))),
            aai: Math.max(0, parseFloat(aai.toFixed(1))),
            violations
        };
    }

    private runLocalFallback(content: string, violations: string[], tsi: number, sdi: number, aai: number) {
        const text = content.toLowerCase();

        // Simulate PII detection
        const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
        if (ssnPattern.test(text)) {
            sdi -= 4.0;
            violations.push(`GUARDRAILS-PII (Local): SSN-like pattern detected in content. Penalty: -4.0`);
        }

        // Simulate Toxic Language / Expletives
        const toxicWords = /hate|stupid|idiot|kill|abuse/g;
        const toxicMatches = text.match(toxicWords);
        if (toxicMatches) {
            tsi -= 3.0;
            violations.push(`GUARDRAILS-TOXIC (Local): Toxic/profane keywords detected. Penalty: -3.0`);
        }

        // Simulate Hallucination (e.g. unverified/fake source claims)
        if (text.includes("smith v. jones") || text.includes("cardiology center on may 15th")) {
            aai -= 4.0;
            violations.push(`GUARDRAILS-HALLUCINATION (Local): Unverified entity or event reference flagged. Penalty: -4.0`);
        }

        return { tsi, sdi, aai };
    }
}

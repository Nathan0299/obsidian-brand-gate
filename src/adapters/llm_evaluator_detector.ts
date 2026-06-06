import { DetectorAdapter, DetectionResult } from './detector';

export class LlmEvaluatorDetector implements DetectorAdapter {
    public name = 'LlmEvaluatorDetector';
    private endpoint: string;
    private model: string;

    constructor() {
        this.endpoint = process.env.LLM_EVALUATOR_ENDPOINT || 'http://localhost:11434/api/generate';
        this.model = process.env.LLM_EVALUATOR_MODEL || 'llama3';
    }

    public async evaluate(content: string, coaIr: any): Promise<DetectionResult> {
        let tsi = 10.0;
        let sdi = 10.0;
        let aai = 10.0;
        const violations: string[] = [];

        const prompt = `You are a compliance auditor. Evaluate the following text and return a JSON object containing the compliance scores for Tone Stability (TSI), Sovereignty Drift (SDI), and Architectural Authority (AAI).

Text to evaluate:
"""
${content}
"""

Guidelines:
- TSI (Tone Stability): Penalize casual slang or panic-inducing urgency.
- SDI (Sovereignty Drift): Penalize unauthorized commitments, liability statements, or medical/legal advice.
- AAI (Architectural Authority): Penalize claims contradicting facts or citing unverified citations.

Respond ONLY with a JSON object in this format:
{
  "tsi": 10.0,
  "sdi": 10.0,
  "aai": 10.0,
  "violations": ["Detailed description of violation 1", "Detailed description of violation 2"]
}`;

        try {
            // Attempt to call local Ollama endpoint
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                })
            });

            if (response.ok) {
                const data: any = await response.json();
                const responseText = data.response || '';
                const parsed = JSON.parse(responseText.trim());

                if (typeof parsed.tsi === 'number') tsi = parsed.tsi;
                if (typeof parsed.sdi === 'number') sdi = parsed.sdi;
                if (typeof parsed.aai === 'number') aai = parsed.aai;
                if (Array.isArray(parsed.violations)) {
                    parsed.violations.forEach((v: string) => violations.push(`LLM-EVAL: ${v}`));
                }
            } else {
                console.warn(`[LlmEvaluatorDetector] LLM service returned error: ${response.status}. Using fallback scoring.`);
                this.runLocalFallback(content, violations, tsi, sdi, aai);
            }
        } catch (err: any) {
            // Local fallback simulation when the LLM service is offline
            console.log(`[LlmEvaluatorDetector] Local LLM service offline at ${this.endpoint}. Running semantic local rules.`);
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

        // TSI checks
        if (text.includes("insane") || text.includes("game-changer") || text.includes("mind-blowing")) {
            tsi -= 4.0;
            violations.push("LLM-EVAL (Local): Slang/hyperbole detected in content. Penalty: -4.0");
        }

        // SDI checks
        if (text.includes("we promise") || text.includes("we guarantee") || text.includes("refund")) {
            sdi -= 5.0;
            violations.push("LLM-EVAL (Local): Unauthorized refund or guarantee commitment. Penalty: -5.0");
        }

        // AAI checks
        if (text.includes("cloud-hosted") || text.includes("smith v. jones")) {
            aai -= 4.0;
            violations.push("LLM-EVAL (Local): Contradiction against local-first database architecture. Penalty: -4.0");
        }

        return { tsi, sdi, aai };
    }
}

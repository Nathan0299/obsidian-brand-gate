import fs from 'fs';

export interface Fact {
    topic: string;
    description: string;
    canonical_truth: string;
    banned_assertions: string[];
}

export interface LegalCitation {
    citation: string;
    case_name: string;
    jurisdiction: string;
    year: number;
    status: 'VALID' | 'OVERRULED' | 'UNVERIFIED';
}

export interface KnowledgeBase {
    facts: Fact[];
    citations: LegalCitation[];
}

export class KnowledgeBaseConnector {
    private kb: KnowledgeBase = { facts: [], citations: [] };

    constructor(kbPath?: string) {
        if (kbPath) {
            this.load(kbPath);
        }
    }

    public load(kbPath: string): void {
        if (!fs.existsSync(kbPath)) {
            throw new Error(`Knowledge base file not found at: ${kbPath}`);
        }
        try {
            const raw = fs.readFileSync(kbPath, 'utf-8');
            this.kb = JSON.parse(raw);
        } catch (err: any) {
            throw new Error(`Failed to parse knowledge base: ${err.message}`);
        }
    }

    public getFacts(): Fact[] {
        return this.kb.facts;
    }

    public getCitations(): LegalCitation[] {
        return this.kb.citations;
    }

    /**
     * Checks if a legal citation exists and is valid in the knowledge base
     */
    public verifyCitation(citationStr: string): { exists: boolean; status: 'VALID' | 'OVERRULED' | 'UNVERIFIED' } {
        const normalized = citationStr.toLowerCase().replace(/\s+/g, ' ').trim();
        const found = this.kb.citations.find(c => 
            c.citation.toLowerCase().replace(/\s+/g, ' ').trim() === normalized
        );

        if (!found) {
            return { exists: false, status: 'UNVERIFIED' };
        }
        return { exists: true, status: found.status };
    }

    /**
     * Scans text to check if any banned assertions (from facts) are present.
     * Returns an array of violations found.
     */
    public auditContentFacts(text: string): string[] {
        const violations: string[] = [];
        const normalizedText = text.toLowerCase();

        for (const fact of this.kb.facts) {
            for (const banned of fact.banned_assertions) {
                if (normalizedText.includes(banned.toLowerCase())) {
                    violations.push(`KB-CONTRADICTION: Claim contradicts "${fact.topic}". Assertion: "${banned}". Truth: "${fact.canonical_truth}"`);
                }
            }
        }

        return violations;
    }
}

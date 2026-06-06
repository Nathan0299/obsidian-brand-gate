import path from 'path';
import fs from 'fs';

export interface EvaluationRecord {
    id?: number;
    timestamp: string;
    file_path: string;
    dcs: number;
    tsi: number;
    sdi: number;
    aai: number;
    passed: boolean;
    violations: string[];
    receipt_hash: string;
    coa_ir_version: string;
}

export class AuditLedger {
    private db: any = null;
    private useSqlite = false;
    private jsonFilePath: string;

    constructor(dbPath?: string) {
        const baseDir = process.cwd();
        this.jsonFilePath = path.join(baseDir, 'brand_gate_audit.json');
        const sqlitePath = dbPath || process.env.OSBG_LEDGER_DB_PATH || path.join(baseDir, 'brand_gate_audit.db');

        try {
            // Attempt to load better-sqlite3 dynamically
            const Database = require('better-sqlite3');
            this.db = new Database(sqlitePath);
            this.useSqlite = true;
            this.initSqlite();
        } catch (err: any) {
            console.warn(`[AuditLedger] SQLite connection failed: ${err.message}. Falling back to JSON file ledger.`);
            this.initJson();
        }
    }

    private initSqlite() {
        const schema = `
            CREATE TABLE IF NOT EXISTS osbg_evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                file_path TEXT NOT NULL,
                dcs REAL NOT NULL,
                tsi REAL NOT NULL,
                sdi REAL NOT NULL,
                aai REAL NOT NULL,
                passed INTEGER NOT NULL,
                violations TEXT NOT NULL,
                receipt_hash TEXT NOT NULL UNIQUE,
                coa_ir_version TEXT NOT NULL
            );
        `;
        this.db.exec(schema);
    }

    private initJson() {
        if (!fs.existsSync(this.jsonFilePath)) {
            fs.writeFileSync(this.jsonFilePath, JSON.stringify([], null, 2), 'utf-8');
        }
    }

    public record(entry: EvaluationRecord): void {
        if (this.useSqlite && this.db) {
            try {
                const stmt = this.db.prepare(`
                    INSERT OR IGNORE INTO osbg_evaluations 
                    (timestamp, file_path, dcs, tsi, sdi, aai, passed, violations, receipt_hash, coa_ir_version)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                stmt.run(
                    entry.timestamp,
                    entry.file_path,
                    entry.dcs,
                    entry.tsi,
                    entry.sdi,
                    entry.aai,
                    entry.passed ? 1 : 0,
                    JSON.stringify(entry.violations),
                    entry.receipt_hash,
                    entry.coa_ir_version
                );
                return;
            } catch (err: any) {
                console.error(`[AuditLedger] SQLite write error: ${err.message}. Saving to JSON file ledger instead.`);
            }
        }

        // JSON Fallback writing
        try {
            const records = this.listJson();
            // Avoid duplicates by receipt_hash
            if (!records.some(r => r.receipt_hash === entry.receipt_hash)) {
                entry.id = records.length + 1;
                records.unshift(entry); // Prepend to show newest first
                fs.writeFileSync(this.jsonFilePath, JSON.stringify(records, null, 2), 'utf-8');
            }
        } catch (err: any) {
            console.error(`[AuditLedger] JSON write error: ${err.message}`);
        }
    }

    public list(limit = 100): EvaluationRecord[] {
        if (this.useSqlite && this.db) {
            try {
                const stmt = this.db.prepare(`
                    SELECT * FROM osbg_evaluations ORDER BY id DESC LIMIT ?
                `);
                const rows = stmt.all(limit) as any[];
                return rows.map(r => ({
                    id: r.id,
                    timestamp: r.timestamp,
                    file_path: r.file_path,
                    dcs: r.dcs,
                    tsi: r.tsi,
                    sdi: r.sdi,
                    aai: r.aai,
                    passed: r.passed === 1,
                    violations: JSON.parse(r.violations),
                    receipt_hash: r.receipt_hash,
                    coa_ir_version: r.coa_ir_version
                }));
            } catch (err: any) {
                console.error(`[AuditLedger] SQLite list error: ${err.message}. Reading from JSON file ledger.`);
            }
        }

        return this.listJson().slice(0, limit);
    }

    private listJson(): EvaluationRecord[] {
        try {
            if (fs.existsSync(this.jsonFilePath)) {
                const raw = fs.readFileSync(this.jsonFilePath, 'utf-8');
                return JSON.parse(raw);
            }
        } catch (err: any) {
            console.error(`[AuditLedger] JSON read error: ${err.message}`);
        }
        return [];
    }
}

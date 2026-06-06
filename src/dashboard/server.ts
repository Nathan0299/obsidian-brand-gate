import express from 'express';
import path from 'path';
import fs from 'fs';
import { AuditLedger } from '../audit/ledger';

const app = express();
const port = process.env.PORT || 3000;
const ledger = new AuditLedger();

app.use(express.json());

// Resolve public path with fallback to src/ folder in development
let publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
    publicPath = path.resolve(__dirname, '..', '..', 'src', 'dashboard', 'public');
}

// Serve dashboard static assets
app.use(express.static(publicPath));

// API: Get all audit logs
app.get('/api/evaluations', (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
        const records = ledger.list(limit);
        res.json({ success: true, records });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API: Server status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ACTIVE',
        engine: 'obsidian-brand-gate v1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`\n══════════════════════════════════════════════════════`);
    console.log(`  OBSIDIAN BRAND GATE — Audit Dashboard Backend`);
    console.log(`  Running locally at http://localhost:${port}`);
    console.log(`══════════════════════════════════════════════════════\n`);
});

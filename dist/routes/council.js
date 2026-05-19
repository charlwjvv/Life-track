"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.councilRouter = void 0;
const express_1 = require("express");
const council_1 = require("../services/council");
exports.councilRouter = (0, express_1.Router)();
exports.councilRouter.post('/', async (req, res) => {
    try {
        const body = req.body;
        const message = typeof body === 'string' ? body : body?.message ?? '';
        let query = message.trim();
        if (query.startsWith('/council ')) {
            query = query.slice(9).trim();
        }
        if (!query) {
            return res.status(400).json({ error: 'No query provided. Send a message or /council <question>' });
        }
        const result = await (0, council_1.runCouncil)(query);
        res.json({
            query,
            ...result,
        });
    }
    catch (err) {
        console.error('Council error:', err);
        res.status(500).json({ error: 'Council deliberation failed', details: String(err) });
    }
});
//# sourceMappingURL=council.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
exports.authRouter = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.authRouter.post('/register', async (req, res) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const { data, error } = await db_1.supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) {
            if (error.message.includes('already been registered')) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            return res.status(400).json({ error: error.message });
        }
        const user = data.user;
        const token = data.session?.access_token || user.id;
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.user_metadata?.name || null } });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const { data, error } = await db_1.supabase.auth.signInWithPassword({ email, password });
        if (error)
            return res.status(400).json({ error: 'Invalid credentials' });
        const user = data.user;
        res.json({ token: data.session.access_token, user: { id: user.id, email: user.email, name: user.user_metadata?.name || null } });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.post('/demo', async (req, res) => {
    try {
        const { data, error } = await db_1.supabase.auth.signInWithPassword({
            email: 'demo@lifetrack.app',
            password: 'demo123456',
        });
        if (error)
            return res.status(401).json({ error: 'Demo user not set up. Run the seed.' });
        res.json({ token: data.session.access_token, user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || null } });
    }
    catch {
        res.status(500).json({ error: 'Server error' });
    }
});
//# sourceMappingURL=auth.js.map
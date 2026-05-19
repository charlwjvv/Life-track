"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.goalsRouter = (0, express_1.Router)();
exports.goalsRouter.use(auth_1.authenticate);
const goalSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    weekStart: zod_1.z.string(),
    weekEnd: zod_1.z.string(),
});
exports.goalsRouter.get('/', async (req, res) => {
    try {
        const { weekStart, weekEnd } = req.query;
        const now = new Date();
        const startOfWeek = weekStart ? new Date(weekStart) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const endOfWeek = weekEnd ? new Date(weekEnd) : new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        const { data, error } = await db_1.supabase
            .from('goals')
            .select('*')
            .eq('user_id', req.userId)
            .gte('week_start', startOfWeek.toISOString())
            .lte('week_end', endOfWeek.toISOString())
            .order('created_at', { ascending: false });
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data || []);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.goalsRouter.post('/', async (req, res) => {
    try {
        const { title, description, weekStart, weekEnd } = goalSchema.parse(req.body);
        const { data, error } = await db_1.supabase
            .from('goals')
            .insert({ user_id: req.userId, title, description, week_start: weekStart, week_end: weekEnd })
            .select()
            .single();
        if (error)
            return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Server error' });
    }
});
exports.goalsRouter.patch('/:id/toggle', async (req, res) => {
    try {
        const { data: existing } = await db_1.supabase
            .from('goals')
            .select('completed')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();
        if (!existing)
            return res.status(404).json({ error: 'Goal not found' });
        const { data, error } = await db_1.supabase
            .from('goals')
            .update({ completed: !existing.completed })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.goalsRouter.delete('/:id', async (req, res) => {
    try {
        const { error } = await db_1.supabase
            .from('goals')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);
        if (error)
            return res.status(500).json({ error: error.message });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
//# sourceMappingURL=goals.js.map
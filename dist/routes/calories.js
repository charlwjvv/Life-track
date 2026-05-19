"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.caloriesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.caloriesRouter = (0, express_1.Router)();
exports.caloriesRouter.use(auth_1.authenticate);
const mealSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    calories: zod_1.z.number().positive(),
    protein: zod_1.z.number().optional(),
    carbs: zod_1.z.number().optional(),
    fat: zod_1.z.number().optional(),
    mealType: zod_1.z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    date: zod_1.z.string().optional(),
});
function getDayBounds(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return { start: start.toISOString(), end: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString() };
}
exports.caloriesRouter.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        const day = date ? new Date(date) : new Date();
        const { start, end } = getDayBounds(day);
        let { data: log } = await db_1.supabase
            .from('calorie_logs')
            .select('*, meals(*)')
            .eq('user_id', req.userId)
            .gte('date', start)
            .lt('date', end)
            .single();
        if (!log) {
            const { data: newLog, error } = await db_1.supabase
                .from('calorie_logs')
                .insert({ user_id: req.userId, date: start, total: 0, goal: 2000 })
                .select('*, meals(*)')
                .single();
            if (error)
                return res.status(500).json({ error: error.message });
            log = newLog;
        }
        res.json(log);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.caloriesRouter.post('/meal', async (req, res) => {
    try {
        const data = mealSchema.parse(req.body);
        const day = data.date ? new Date(data.date) : new Date();
        const { start, end } = getDayBounds(day);
        let { data: log } = await db_1.supabase
            .from('calorie_logs')
            .select('id, total')
            .eq('user_id', req.userId)
            .gte('date', start)
            .lt('date', end)
            .single();
        if (!log) {
            const { data: newLog } = await db_1.supabase
                .from('calorie_logs')
                .insert({ user_id: req.userId, date: start })
                .select('id, total')
                .single();
            log = newLog;
        }
        const { data: meal, error } = await db_1.supabase
            .from('meals')
            .insert({
            user_id: req.userId,
            calorie_log_id: log?.id,
            name: data.name,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            meal_type: data.mealType,
            date: day.toISOString(),
        })
            .select()
            .single();
        if (error)
            return res.status(500).json({ error: error.message });
        await db_1.supabase
            .from('calorie_logs')
            .update({ total: (log?.total || 0) + data.calories })
            .eq('id', log?.id);
        res.status(201).json(meal);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Server error' });
    }
});
exports.caloriesRouter.put('/goal', async (req, res) => {
    try {
        const { goal } = zod_1.z.object({ goal: zod_1.z.number().positive() }).parse(req.body);
        const { start, end } = getDayBounds(new Date());
        const { data: existing } = await db_1.supabase
            .from('calorie_logs')
            .select('id')
            .eq('user_id', req.userId)
            .gte('date', start)
            .lt('date', end)
            .single();
        if (existing) {
            await db_1.supabase.from('calorie_logs').update({ goal }).eq('id', existing.id);
        }
        else {
            await db_1.supabase.from('calorie_logs').insert({ user_id: req.userId, date: start, goal });
        }
        res.json({ goal });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Server error' });
    }
});
exports.caloriesRouter.get('/history', async (req, res) => {
    try {
        const { data, error } = await db_1.supabase
            .from('calorie_logs')
            .select('*, meals(*)')
            .eq('user_id', req.userId)
            .order('date', { ascending: false })
            .limit(30);
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data || []);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
//# sourceMappingURL=calories.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.budgetRouter = (0, express_1.Router)();
exports.budgetRouter.use(auth_1.authenticate);
const setBudgetSchema = zod_1.z.object({
    month: zod_1.z.number().min(1).max(12),
    year: zod_1.z.number().min(2020).max(2100),
    amount: zod_1.z.number().positive(),
});
const expenseSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    category: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    isRecurring: zod_1.z.boolean().optional().default(false),
    date: zod_1.z.string().optional(),
});
exports.budgetRouter.post('/set', async (req, res) => {
    try {
        const { month, year, amount } = setBudgetSchema.parse(req.body);
        const { data, error } = await db_1.supabase
            .from('budgets')
            .upsert({ user_id: req.userId, month, year, amount }, { onConflict: 'user_id,month,year' })
            .select()
            .single();
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Server error' });
    }
});
exports.budgetRouter.get('/current', async (req, res) => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 1).toISOString();
        const { data: budget, error } = await db_1.supabase
            .from('budgets')
            .select('*, expenses(*)')
            .eq('user_id', req.userId)
            .eq('month', month)
            .eq('year', year)
            .single();
        if (error && error.code !== 'PGRST116')
            return res.status(500).json({ error: error.message });
        const { data: expenseData } = await db_1.supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', req.userId)
            .gte('date', startDate)
            .lt('date', endDate);
        const spent = expenseData?.reduce((sum, e) => sum + e.amount, 0) || 0;
        const remaining = budget ? budget.amount - spent : 0;
        const tips = generateBudgetTips(budget?.amount || 0, spent, month);
        res.json({ budget, spent, remaining, tips });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.budgetRouter.post('/expense', async (req, res) => {
    try {
        const data = expenseSchema.parse(req.body);
        const { data: expense, error } = await db_1.supabase
            .from('expenses')
            .insert({
            user_id: req.userId,
            amount: data.amount,
            category: data.category,
            description: data.description,
            is_recurring: data.isRecurring,
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        })
            .select()
            .single();
        if (error)
            return res.status(500).json({ error: error.message });
        res.status(201).json(expense);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: 'Server error' });
    }
});
exports.budgetRouter.get('/expenses', async (req, res) => {
    try {
        const { month, year, category } = req.query;
        const now = new Date();
        const m = month ? parseInt(month) : now.getMonth() + 1;
        const y = year ? parseInt(year) : now.getFullYear();
        const startDate = new Date(y, m - 1, 1).toISOString();
        const endDate = new Date(y, m, 1).toISOString();
        let query = db_1.supabase
            .from('expenses')
            .select('*')
            .eq('user_id', req.userId)
            .gte('date', startDate)
            .lt('date', endDate)
            .order('date', { ascending: false });
        if (category)
            query = query.eq('category', category);
        const { data, error } = await query;
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data || []);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.budgetRouter.get('/analysis', async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 1).toISOString();
        const { data: expenses } = await db_1.supabase
            .from('expenses')
            .select('category, amount')
            .eq('user_id', req.userId)
            .gte('date', startDate)
            .lt('date', endDate);
        const byCategory = {};
        for (const e of expenses || []) {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        }
        const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
        const insights = sorted.map(([category, amount]) => ({
            category,
            amount,
            percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
            tip: getCategoryTip(category, amount, total),
        }));
        res.json({ insights, total });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
function getCategoryTip(category, amount, total) {
    const pct = total > 0 ? (amount / total) * 100 : 0;
    const tips = {
        Food: ['Try meal prepping to reduce food spending', 'Consider cooking at home more often'],
        Transport: ['Carpooling or public transit could save money', 'Consider walking for short distances'],
        Shopping: ['Try a 24-hour rule before non-essential purchases', 'Look for second-hand alternatives'],
        Entertainment: ['Look for free local events instead', 'Consider sharing subscription services'],
        Bills: ['Review your subscriptions and cancel unused ones', 'Compare providers for better rates'],
    };
    if (pct > 30)
        return `${category} is ${Math.round(pct)}% of your spending — ${tips[category]?.[0] || 'consider reducing this category'}`;
    return tips[category]?.[1] || 'Keep tracking your spending habits';
}
function generateBudgetTips(budget, spent, month) {
    const tips = [];
    const remaining = budget - spent;
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const daysLeft = daysInMonth - dayOfMonth;
    if (remaining < 0)
        tips.push('You have exceeded your budget — review non-essential spending');
    else if (remaining < budget * 0.1)
        tips.push('You are close to your budget limit — consider cutting back');
    if (daysLeft > 0) {
        const dailyAllowance = remaining / daysLeft;
        tips.push(`You can spend $${dailyAllowance.toFixed(2)} per day for the rest of the month`);
    }
    return tips;
}
//# sourceMappingURL=budget.js.map
import { Router, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

export const budgetRouter = Router();
budgetRouter.use(authenticate);

const setBudgetSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  amount: z.number().positive(),
});

const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string(),
  isRecurring: z.boolean().optional().default(false),
  date: z.string().optional(),
});

budgetRouter.post('/set', async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, amount } = setBudgetSchema.parse(req.body);
    const { data, error } = await supabase
      .from('budgets')
      .upsert({ user_id: req.userId!, month, year, amount }, { onConflict: 'user_id,month,year' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

budgetRouter.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 1).toISOString();

    const { data: budget, error } = await supabase
      .from('budgets')
      .select('*, expenses(*)')
      .eq('user_id', req.userId!)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });

    const { data: expenseData } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', req.userId!)
      .gte('date', startDate)
      .lt('date', endDate);

    const spent = expenseData?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const remaining = budget ? budget.amount - spent : 0;
    const tips = generateBudgetTips(budget?.amount || 0, spent, month);

    res.json({ budget, spent, remaining, tips });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

budgetRouter.post('/expense', async (req: AuthRequest, res: Response) => {
  try {
    const data = expenseSchema.parse(req.body);
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        user_id: req.userId!,
        amount: data.amount,
        category: data.category,
        description: data.description,
        is_recurring: data.isRecurring,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(expense);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

budgetRouter.get('/expenses', async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, category } = req.query;
    const now = new Date();
    const m = month ? parseInt(month as string) : now.getMonth() + 1;
    const y = year ? parseInt(year as string) : now.getFullYear();
    const startDate = new Date(y, m - 1, 1).toISOString();
    const endDate = new Date(y, m, 1).toISOString();

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', req.userId!)
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: false });

    if (category) query = query.eq('category', category as string);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

budgetRouter.get('/analysis', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 1).toISOString();

    const { data: expenses } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('user_id', req.userId!)
      .gte('date', startDate)
      .lt('date', endDate);

    const byCategory: Record<string, number> = {};
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
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

function getCategoryTip(category: string, amount: number, total: number): string {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  const tips: Record<string, string[]> = {
    Food: ['Try meal prepping to reduce food spending', 'Consider cooking at home more often'],
    Transport: ['Carpooling or public transit could save money', 'Consider walking for short distances'],
    Shopping: ['Try a 24-hour rule before non-essential purchases', 'Look for second-hand alternatives'],
    Entertainment: ['Look for free local events instead', 'Consider sharing subscription services'],
    Bills: ['Review your subscriptions and cancel unused ones', 'Compare providers for better rates'],
  };
  if (pct > 30) return `${category} is ${Math.round(pct)}% of your spending — ${tips[category]?.[0] || 'consider reducing this category'}`;
  return tips[category]?.[1] || 'Keep tracking your spending habits';
}

function generateBudgetTips(budget: number, spent: number, month: number): string[] {
  const tips: string[] = [];
  const remaining = budget - spent;
  const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
  const dayOfMonth = new Date().getDate();
  const daysLeft = daysInMonth - dayOfMonth;

  if (remaining < 0) tips.push('You have exceeded your budget — review non-essential spending');
  else if (remaining < budget * 0.1) tips.push('You are close to your budget limit — consider cutting back');

  if (daysLeft > 0) {
    const dailyAllowance = remaining / daysLeft;
    tips.push(`You can spend $${dailyAllowance.toFixed(2)} per day for the rest of the month`);
  }
  return tips;
}
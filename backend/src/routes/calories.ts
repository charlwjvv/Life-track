import { Router, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

export const caloriesRouter = Router();
caloriesRouter.use(authenticate);

const mealSchema = z.object({
  name: z.string().min(1),
  calories: z.number().positive(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  date: z.string().optional(),
});

function getDayBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return { start: start.toISOString(), end: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString() };
}

caloriesRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date as string) : new Date();
    const { start, end } = getDayBounds(day);

    let { data: log } = await supabase
      .from('calorie_logs')
      .select('*, meals(*)')
      .eq('user_id', req.userId!)
      .gte('date', start)
      .lt('date', end)
      .single();

    if (!log) {
      const { data: newLog, error } = await supabase
        .from('calorie_logs')
        .insert({ user_id: req.userId!, date: start, total: 0, goal: 2000 })
        .select('*, meals(*)')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      log = newLog;
    }

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

caloriesRouter.post('/meal', async (req: AuthRequest, res: Response) => {
  try {
    const data = mealSchema.parse(req.body);
    const day = data.date ? new Date(data.date) : new Date();
    const { start, end } = getDayBounds(day);

    let { data: log } = await supabase
      .from('calorie_logs')
      .select('id, total')
      .eq('user_id', req.userId!)
      .gte('date', start)
      .lt('date', end)
      .single();

    if (!log) {
      const { data: newLog } = await supabase
        .from('calorie_logs')
        .insert({ user_id: req.userId!, date: start })
        .select('id, total')
        .single();
      log = newLog;
    }

    const { data: meal, error } = await supabase
      .from('meals')
      .insert({
        user_id: req.userId!,
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

    if (error) return res.status(500).json({ error: error.message });

    await supabase
      .from('calorie_logs')
      .update({ total: (log?.total || 0) + data.calories })
      .eq('id', log?.id);

    res.status(201).json(meal);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

caloriesRouter.put('/goal', async (req: AuthRequest, res: Response) => {
  try {
    const { goal } = z.object({ goal: z.number().positive() }).parse(req.body);
    const { start, end } = getDayBounds(new Date());

    const { data: existing } = await supabase
      .from('calorie_logs')
      .select('id')
      .eq('user_id', req.userId!)
      .gte('date', start)
      .lt('date', end)
      .single();

    if (existing) {
      await supabase.from('calorie_logs').update({ goal }).eq('id', existing.id);
    } else {
      await supabase.from('calorie_logs').insert({ user_id: req.userId!, date: start, goal });
    }

    res.json({ goal });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

caloriesRouter.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('calorie_logs')
      .select('*, meals(*)')
      .eq('user_id', req.userId!)
      .order('date', { ascending: false })
      .limit(30);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
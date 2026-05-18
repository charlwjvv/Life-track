import { Router, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

export const goalsRouter = Router();
goalsRouter.use(authenticate);

const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  weekStart: z.string(),
  weekEnd: z.string(),
});

goalsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { weekStart, weekEnd } = req.query;
    const now = new Date();
    const startOfWeek = weekStart ? new Date(weekStart as string) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = weekEnd ? new Date(weekEnd as string) : new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', req.userId!)
      .gte('week_start', startOfWeek.toISOString())
      .lte('week_end', endOfWeek.toISOString())
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

goalsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, weekStart, weekEnd } = goalSchema.parse(req.body);
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: req.userId!, title, description, week_start: weekStart, week_end: weekEnd })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

goalsRouter.patch('/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const { data: existing } = await supabase
      .from('goals')
      .select('completed')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .single();

    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    const { data, error } = await supabase
      .from('goals')
      .update({ completed: !existing.completed })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

goalsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId!);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
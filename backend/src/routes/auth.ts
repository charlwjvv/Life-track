import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../db';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const { data, error } = await supabase.auth.signUp({
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
    const user = data.user!;
    const token = data.session?.access_token || user.id;
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.user_metadata?.name || null } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: 'Invalid credentials' });
    const user = data.user;
    res.json({ token: data.session!.access_token, user: { id: user.id, email: user.email, name: user.user_metadata?.name || null } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/demo', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@lifetrack.app',
      password: 'demo123456',
    });
    if (error) return res.status(401).json({ error: 'Demo user not set up. Run the seed.' });
    res.json({ token: data.session!.access_token, user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || null } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
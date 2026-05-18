import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    (req as AuthRequest).userId = user.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
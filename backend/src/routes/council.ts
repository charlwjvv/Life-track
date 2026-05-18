import { Router, Request, Response } from 'express';
import { runCouncil } from '../services/council';

export const councilRouter = Router();

councilRouter.post('/', async (req: Request, res: Response) => {
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

    const result = await runCouncil(query);

    res.json({
      query,
      ...result,
    });
  } catch (err) {
    console.error('Council error:', err);
    res.status(500).json({ error: 'Council deliberation failed', details: String(err) });
  }
});
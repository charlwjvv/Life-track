import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth';
import { budgetRouter } from './routes/budget';
import { goalsRouter } from './routes/goals';
import { caloriesRouter } from './routes/calories';
import { stravaRouter } from './routes/strava';
import { coachRouter } from './routes/coach';
import { councilRouter } from './routes/council';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/calories', caloriesRouter);
app.use('/api/strava', stravaRouter);
app.use('/api/coach', coachRouter);
app.use('/api/council', councilRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve the webapp frontend
const webappDist = path.join(__dirname, '../../webapp/dist');
app.use(express.static(webappDist));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(webappDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webapp: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/health`);
});

import { Router, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  generateWeeklyPlan,
  analyzeRuns,
  getDashboardSummary,
  getMileageTrend,
  getPaceDistribution,
  getWorkoutTypeBreakdown,
  getHrZoneDistribution,
  CoachProfile,
  RunRecord,
} from '../services/runningCoach';
import {
  getDailyNutritionSummary,
  getWeeklyNutritionReview,
  getNutritionAnalytics,
  NutritionRecommendation,
} from '../services/nutritionCoach';

export const coachRouter = Router();
coachRouter.use(authenticate);

// ─── Helper: get user profile for coaching personalization ───
async function getCoachProfile(userId: string): Promise<CoachProfile> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('experience_level, max_heart_rate, resting_heart_rate, weight_kg, goal_type, weekly_goal_km, birth_year, injury_status, injury_type, injury_notes, injury_since, return_to_run_date')
    .eq('id', userId)
    .single();

  return {
    experienceLevel: profile?.experience_level || 'beginner',
    maxHr: profile?.max_heart_rate || undefined,
    restingHr: profile?.resting_heart_rate || undefined,
    weightKg: profile?.weight_kg || undefined,
    goalType: profile?.goal_type || 'general',
    weeklyGoalKm: profile?.weekly_goal_km || 20,
    birthYear: profile?.birth_year || undefined,
    injuryStatus: profile?.injury_status || 'healthy',
    injuryType: profile?.injury_type || undefined,
    injuryNotes: profile?.injury_notes || undefined,
    injurySince: profile?.injury_since || undefined,
    returnToRunDate: profile?.return_to_run_date || undefined,
  };
}

// ─── Helper: get runs for a period ───
async function getRunsForPeriod(userId: string, startDate: Date, endDate: Date): Promise<RunRecord[]> {
  const { data: runs } = await supabase
    .from('runs')
    .select('*')
    .eq('user_id', userId)
    .gte('start_date', startDate.toISOString())
    .lt('start_date', endDate.toISOString())
    .order('start_date', { ascending: true });

  return (runs || []).map(r => ({
    id: r.id,
    distance: r.distance,
    movingTime: r.moving_time,
    startDate: r.start_date,
    averageSpeed: r.average_speed,
    averageHeartrate: r.average_heartrate,
    source: r.source || 'strava',
    runType: r.run_type || 'easy',
    perceivedEffort: r.perceived_effort,
    notes: r.notes,
  }));
}

async function getAllRuns(userId: string): Promise<RunRecord[]> {
  const { data: runs } = await supabase
    .from('runs')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
    .limit(200);

  return (runs || []).map(r => ({
    id: r.id,
    distance: r.distance,
    movingTime: r.moving_time,
    startDate: r.start_date,
    averageSpeed: r.average_speed,
    averageHeartrate: r.average_heartrate,
    source: r.source || 'strava',
    runType: r.run_type || 'easy',
    perceivedEffort: r.perceived_effort,
    notes: r.notes,
  }));
}

function getWeekBounds(offset: number = 0): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + (offset * 7));
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

// ─── 1. Dashboard summary ───
coachRouter.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    const { start, end } = getWeekBounds();
    const weekRuns = await getRunsForPeriod(req.userId!, start, end);
    const allRuns = await getAllRuns(req.userId!);
    
    const summary = getDashboardSummary(weekRuns, allRuns, profile);
    
    // Get today's nutrition
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const todayRuns = await getRunsForPeriod(req.userId!, todayStart, todayEnd);
    const nutrition = getDailyNutritionSummary(todayRuns, profile);

    res.json({ ...summary, nutrition });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 2. Weekly plan (enhanced with scientific periodization) ───
coachRouter.get('/plan', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    const weekOffset = parseInt(req.query.week as string) || 0;
    const { start, end } = getWeekBounds(weekOffset);
    const weekRuns = await getRunsForPeriod(req.userId!, start, end);
    const allRuns = await getAllRuns(req.userId!);
    
    const result = generateWeeklyPlan(weekRuns, profile, weekOffset);
    const totalPlanned = result.plan.reduce((sum, d) => sum + (d.distanceKm || 0), 0);
    const completedKm = weekRuns.reduce((sum, r) => sum + r.distance / 1000, 0);

    res.json({
      plan: result.plan,
      phase: result.phase,
      weekInCycle: result.weekInCycle,
      reasoning: result.reasoning,
      weeklyGoal: profile.weeklyGoalKm,
      totalPlannedKm: Math.round(totalPlanned * 10) / 10,
      completedKm: Math.round(completedKm * 10) / 10,
      progress: Math.min(100, Math.round((completedKm / Math.max(totalPlanned, 1)) * 100)),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 3. Coach analysis & tips (enhanced) ───
coachRouter.get('/advice', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('coach_advice')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate new analysis
coachRouter.post('/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    const { start, end } = getWeekBounds();
    const weekRuns = await getRunsForPeriod(req.userId!, start, end);
    const allRuns = await getAllRuns(req.userId!);
    
    // Get running tips
    const tips = analyzeRuns(weekRuns, profile, allRuns);
    
    // Get nutrition review
    const nutritionRecs = getWeeklyNutritionReview(weekRuns, profile);
    
    // Save tips to database
    const allAdvice = [...tips, ...nutritionRecs];
    const saved = [];
    
    for (const tip of allAdvice) {
      const { data: a } = await supabase
        .from('coach_advice')
        .insert({
          user_id: req.userId!,
          type: tip.category,
          content: `${tip.content}\n\n🔬 ${tip.reasoning}`,
        })
        .select()
        .single();
      if (a) saved.push(a);
    }

    // Save nutrition recommendations
    for (const rec of nutritionRecs) {
      const { data: nr } = await supabase
        .from('nutrition_advice')
        .insert({
          user_id: req.userId!,
          date: new Date().toISOString(),
          category: rec.category,
          title: rec.title,
          content: rec.content,
          reasoning: rec.reasoning,
          calories_estimate: rec.caloriesEstimate,
          protein_g: rec.proteinG,
          carbs_g: rec.carbsG,
          fat_g: rec.fatG,
        })
        .select()
        .single();
    }

    res.json({
      advice: saved,
      tips: tips.length,
      nutritionRecs: nutritionRecs.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 4. Analytics endpoints ───
coachRouter.get('/analytics/mileage-trend', async (req: AuthRequest, res: Response) => {
  try {
    const weeks = Math.min(parseInt(req.query.weeks as string) || 12, 52);
    const allRuns = await getAllRuns(req.userId!);
    res.json(getMileageTrend(allRuns, weeks));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

coachRouter.get('/analytics/pace-distribution', async (req: AuthRequest, res: Response) => {
  try {
    const allRuns = await getAllRuns(req.userId!);
    res.json(getPaceDistribution(allRuns));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

coachRouter.get('/analytics/workout-breakdown', async (req: AuthRequest, res: Response) => {
  try {
    const allRuns = await getAllRuns(req.userId!);
    res.json(getWorkoutTypeBreakdown(allRuns));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

coachRouter.get('/analytics/hr-zones', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    const allRuns = await getAllRuns(req.userId!);
    res.json(getHrZoneDistribution(allRuns, profile));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

coachRouter.get('/analytics/nutrition', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    
    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', req.userId!)
      .order('date', { ascending: false })
      .limit(200);

    const allRuns = await getAllRuns(req.userId!);

    res.json(getNutritionAnalytics(
      (meals || []).map(m => ({
        date: m.date,
        calories: m.calories,
        protein: m.protein || 0,
        carbs: m.carbs || 0,
        fat: m.fat || 0,
        mealType: m.meal_type,
      })),
      allRuns,
      profile
    ));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 5. Manual run entry ───
const manualRunSchema = z.object({
  distanceKm: z.number().positive(),
  durationMinutes: z.number().positive(),
  runDate: z.string().optional(),
  runType: z.enum(['easy', 'tempo', 'interval', 'long_run', 'recovery', 'race', 'fartlek']).default('easy'),
  perceivedEffort: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

coachRouter.post('/runs', async (req: AuthRequest, res: Response) => {
  try {
    const data = manualRunSchema.parse(req.body);
    const runDate = data.runDate ? new Date(data.runDate) : new Date();
    const distanceMeters = data.distanceKm * 1000;
    const movingTimeSeconds = data.durationMinutes * 60;
    const averageSpeed = distanceMeters / movingTimeSeconds; // m/s

    const { data: run, error } = await supabase
      .from('runs')
      .insert({
        user_id: req.userId!,
        source: 'manual',
        distance: distanceMeters,
        moving_time: movingTimeSeconds,
        elapsed_time: movingTimeSeconds,
        start_date: runDate.toISOString(),
        average_speed: averageSpeed,
        name: `${data.runType.charAt(0).toUpperCase() + data.runType.slice(1)} run — ${data.distanceKm.toFixed(1)}km`,
        run_type: data.runType,
        perceived_effort: data.perceivedEffort,
        notes: data.notes,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(run);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 6. Nutrition recommendations ───
coachRouter.get('/nutrition', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const todayRuns = await getRunsForPeriod(req.userId!, today, tomorrow);
    
    // Get existing calorie log for today
    const { data: calorieLog } = await supabase
      .from('calorie_logs')
      .select('total, goal')
      .eq('user_id', req.userId!)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .single();

    const summary = getDailyNutritionSummary(todayRuns, profile, calorieLog || undefined);

    // Also get historical nutrition recs
    const { data: savedRecs } = await supabase
      .from('nutrition_advice')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      ...summary,
      savedRecommendations: savedRecs || [],
      todayCalories: calorieLog || { total: 0, goal: profile.weightKg ? Math.round(profile.weightKg * 32) : 2000 },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 7. Profile management ───
const profileSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  maxHeartRate: z.number().positive().optional(),
  restingHeartRate: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  goalType: z.enum(['general', '5k', '10k', 'half_marathon', 'marathon', 'ultra', 'comrades', 'weight_loss', 'speed']).optional(),
  weeklyGoalKm: z.number().positive().optional(),
  birthYear: z.number().int().min(1900).max(2026).optional(),
  name: z.string().optional(),
  injuryStatus: z.enum(['healthy', 'niggled', 'injured', 'recovering']).optional(),
  injuryType: z.string().optional(),
  injuryNotes: z.string().optional(),
});

coachRouter.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const data = profileSchema.parse(req.body);
    
    const updates: Record<string, any> = {};
    if (data.experienceLevel !== undefined) updates.experience_level = data.experienceLevel;
    if (data.maxHeartRate !== undefined) updates.max_heart_rate = data.maxHeartRate;
    if (data.restingHeartRate !== undefined) updates.resting_heart_rate = data.restingHeartRate;
    if (data.weightKg !== undefined) updates.weight_kg = data.weightKg;
    if (data.goalType !== undefined) updates.goal_type = data.goalType;
    if (data.weeklyGoalKm !== undefined) updates.weekly_goal_km = data.weeklyGoalKm;
    if (data.birthYear !== undefined) updates.birth_year = data.birthYear;
    if (data.name !== undefined) updates.name = data.name;
    if (data.injuryStatus !== undefined) updates.injury_status = data.injuryStatus;
    if (data.injuryType !== undefined) updates.injury_type = data.injuryType;
    if (data.injuryNotes !== undefined) updates.injury_notes = data.injuryNotes;
    // Set injury start date when injury status changes to injured
    if (data.injuryStatus === 'injured') updates.injury_since = new Date().toISOString().split('T')[0];
    if (data.injuryStatus === 'healthy') {
      updates.injury_type = null;
      updates.injury_notes = null;
      updates.injury_since = null;
      updates.return_to_run_date = null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.userId!)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(profile);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Server error' });
  }
});

coachRouter.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    const { data: fullProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId!)
      .single();
    
    res.json({
      ...profile,
      name: fullProfile?.name || '',
      email: fullProfile?.email,
      createdAt: fullProfile?.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 8. Nutrition meal plan suggestions ───
coachRouter.post('/nutrition/meal-plan', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getCoachProfile(req.userId!);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const todayRuns = await getRunsForPeriod(req.userId!, today, tomorrow);
    
    const { getDailyMealPlan } = await import('../services/nutritionCoach');
    const mealPlan = getDailyMealPlan(todayRuns, profile);

    // Save meal plan suggestions
    for (const meal of mealPlan.meals) {
      await supabase
        .from('meal_plans')
        .upsert({
          user_id: req.userId!,
          date: today.toISOString(),
          meal_type: meal.mealType,
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein_g: meal.proteinG,
          carbs_g: meal.carbsG,
          fat_g: meal.fatG,
        }, { onConflict: 'user_id,date,meal_type' });
    }

    res.json(mealPlan);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── 9. Get saved meal plans ───
coachRouter.get('/nutrition/meal-plan', async (req: AuthRequest, res: Response) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const dayStart = new Date(date as string);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const { data: meals } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', req.userId!)
      .gte('date', dayStart.toISOString())
      .lt('date', dayEnd.toISOString())
      .order('created_at', { ascending: true });

    res.json(meals || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export for use if needed
export { getCoachProfile, getRunsForPeriod, getAllRuns, getWeekBounds };

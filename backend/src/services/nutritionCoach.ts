/**
 * Nutrition Coach Engine
 * 
 * Coordinates with running coach to provide training-specific fueling
 * Based on sports nutrition science:
 * - Pre-run fueling: timing and composition based on run type
 * - Post-run recovery: 3:1 or 4:1 carb:protein ratio within 30min window
 * - Daily macro periodization: more carbs on hard days, fewer on rest days
 * - Hydration guidelines based on sweat rate estimation
 */

import { CoachProfile, RunRecord, metersToKm, secondsToMin } from './runningCoach';

// Helper to convert m/s to min/km pace string
function paceFromSpeed(speedMs: number): string {
  if (speedMs <= 0) return '--:--';
  const pace = 1000 / 60 / speedMs;
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

export interface NutritionRecommendation {
  category: 'pre_run' | 'post_run' | 'daily' | 'weekly_review' | 'hydration';
  mealTiming?: 'pre' | 'post' | 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  content: string;
  reasoning: string;
  caloriesEstimate?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface MealSuggestion {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_run' | 'post_run';
  name: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  reasoning: string;
}

interface DayMealPlan {
  meals: MealSuggestion[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  reasoning: string;
}

/**
 * Get nutrition recommendations based on today's planned run
 */
export function getPreRunFueling(runType: string, distanceKm: number, profile: CoachProfile): NutritionRecommendation[] {
  const recs: NutritionRecommendation[] = [];
  const weight = profile.weightKg || 70;
  
  if (distanceKm <= 0) {
    recs.push({
      category: 'daily',
      mealTiming: 'breakfast',
      title: 'Rest day nutrition',
      content: `Since it's a rest day, reduce carb intake to ~${Math.round(weight * 4)}g (${Math.round(weight * 4 * 4)} cal from carbs). Focus on protein for recovery: ${Math.round(weight * 1.8)}g.`,
      reasoning: 'On rest days, your muscles are repairing, not topping off glycogen. Lower carb intake prevents unnecessary calorie surplus while protein supports overnight recovery.',
      carbsG: Math.round(weight * 4),
      proteinG: Math.round(weight * 1.8),
      priority: 'medium',
    });
    return recs;
  }

  const durationMin = distanceKm * (profile.experienceLevel === 'beginner' ? 7 : 5.5);

  // Pre-run fueling
  if (distanceKm > 5) {
    const preRunCal = Math.round(weight * (distanceKm < 10 ? 1.5 : 3));
    recs.push({
      category: 'pre_run',
      mealTiming: 'pre',
      title: distanceKm > 15 ? 'Pre-run meal (2-3 hours before)' : 'Pre-run snack (1-2 hours before)',
      content: distanceKm > 15
        ? `Eat a carb-heavy meal: ${Math.round(weight * 2)}g carbs (e.g., oatmeal with banana and honey, or rice with fruit). Total ~${preRunCal} calories. Finish 2-3 hours before.`
        : `Light snack: ${Math.round(weight * 1)}g carbs (banana, toast with jam, or a dates). Total ~${preRunCal} calories. Finish 1 hour before.`,
      reasoning: distanceKm > 15
        ? 'Runs over 90 minutes significantly deplete glycogen stores. A pre-run meal with 2g/kg of carbs 2-3 hours before ensures full glycogen stores without GI distress.'
        : 'For moderate runs, a small carb snack 60min beforehand tops off liver glycogen without causing insulin spikes that could drop blood glucose during the run.',
      caloriesEstimate: preRunCal,
      carbsG: Math.round(weight * (distanceKm < 10 ? 1 : 2)),
      priority: 'high',
    });
  }

  // Recommendations for longer runs
  if (distanceKm > 12) {
    recs.push({
      category: 'pre_run',
      title: 'Fuel during the run',
      content: `For runs over 90 minutes, consume 30-60g carbs per hour. Options: 1 gel (25g carbs) every 30-40min, or sports drink (200-300ml every 20min).`,
      reasoning: 'Exogenous carbohydrate intake during exercise >90min improves performance by maintaining blood glucose and sparing muscle glycogen. The gut can absorb ~60g/hr.',
      carbsG: 60,
      caloriesEstimate: 240,
      priority: 'high',
    });
  }

  // Post-run recovery
  if (distanceKm > 3) {
    recs.push({
      category: 'post_run',
      mealTiming: 'post',
      title: `Post-run recovery (within 30 minutes)`,
      content: `Consume ${Math.round(weight * 1.2)}g carbs + ${Math.round(weight * 0.4)}g protein (3:1 ratio). Examples: chocolate milk (500ml), or smoothie with banana + protein powder + milk. Total ~${Math.round(weight * 8)} calories.`,
      reasoning: 'The 30-minute post-exercise window has heightened insulin sensitivity and muscle blood flow. A 3:1 or 4:1 carb:protein ratio optimizes glycogen replenishment and muscle protein synthesis.',
      caloriesEstimate: Math.round(weight * 8),
      carbsG: Math.round(weight * 1.2),
      proteinG: Math.round(weight * 0.4),
      priority: 'high',
    });
  }

  // Hydration
  recs.push({
    category: 'hydration',
    title: 'Hydration plan',
    content: distanceKm > 10
      ? `Pre-hydrate: 500ml water 2hrs before. During: 400-800ml/hr. Post: 1.25L per kg of weight lost. Add electrolytes if >90min or hot.`
      : `Sip 300-500ml water 1hr before this run. For ${distanceKm.toFixed(1)}km, you likely won't need water during, but have 500ml ready for after.`,
    reasoning: 'Even 2% body weight dehydration reduces performance by 6-7% and increases perceived exertion. Individual sweat rates vary from 0.5-2.0 L/hr.',
    priority: 'medium',
  });

  return recs;
}

/**
 * Get daily meal plan based on training load
 */
export function getDailyMealPlan(
  todayRuns: RunRecord[],
  profile: CoachProfile,
  existingCalories?: { total: number; goal: number }
): DayMealPlan {
  const weight = profile.weightKg || 70;
  const todayKm = todayRuns.reduce((sum, r) => sum + metersToKm(r.distance), 0);
  const isHardDay = todayKm > 10 || todayRuns.some(r => r.runType === 'tempo' || r.runType === 'interval');
  const isRestDay = todayKm === 0;
  
  // Determine macro targets based on training load
  let carbG: number, proteinG: number, fatG: number, totalCal: number;
  
  if (isRestDay) {
    carbG = Math.round(weight * 3.5);
    proteinG = Math.round(weight * 1.8);
    fatG = Math.round(weight * 1.2);
    totalCal = carbG * 4 + proteinG * 4 + fatG * 9;
  } else if (isHardDay) {
    carbG = Math.round(weight * 8);
    proteinG = Math.round(weight * 2.0);
    fatG = Math.round(weight * 0.8);
    totalCal = carbG * 4 + proteinG * 4 + fatG * 9;
  } else {
    carbG = Math.round(weight * 5);
    proteinG = Math.round(weight * 1.8);
    fatG = Math.round(weight * 1.0);
    totalCal = carbG * 4 + proteinG * 4 + fatG * 9;
  }

  const meals: MealSuggestion[] = [];

  // Breakfast
  if (isHardDay && todayKm > 5) {
    meals.push({
      mealType: 'breakfast',
      name: 'Oatmeal with Berries & Eggs',
      description: `Rolled oats (80g) with milk, mixed berries (100g), 2 scrambled eggs. ~${Math.round(weight * 2.5)}g carbs pre-loaded.`,
      calories: Math.round(weight * 9),
      proteinG: Math.round(weight * 0.5),
      carbsG: Math.round(weight * 1.5),
      fatG: Math.round(weight * 0.2),
      reasoning: 'Oats provide low-GI carbs for sustained energy release. Eggs supply high-quality protein for overnight muscle repair. Berries add antioxidants for inflammation management.',
    });
  } else {
    meals.push({
      mealType: 'breakfast',
      name: isRestDay ? 'Greek Yogurt Parfait' : 'Toast with Peanut Butter & Banana',
      description: isRestDay
        ? `Greek yogurt (200g) with granola (30g) and honey — lighter on carbs, higher in protein for recovery.`
        : `Whole grain toast (2 slices) + peanut butter (2 tbsp) + banana. Quick, balanced, easy to digest.`,
      calories: isRestDay ? Math.round(weight * 5) : Math.round(weight * 7),
      proteinG: isRestDay ? Math.round(weight * 0.4) : Math.round(weight * 0.3),
      carbsG: isRestDay ? Math.round(weight * 0.6) : Math.round(weight * 1.0),
      fatG: Math.round(weight * 0.15),
      reasoning: isRestDay
        ? 'Higher protein at breakfast on rest days improves satiety and supports the overnight recovery processes still underway.'
        : 'Peanut butter provides healthy fats and protein that slow carb absorption, providing steady energy. Banana provides fast carbs for morning energy.',
    });
  }

  // Lunch
  meals.push({
    mealType: 'lunch',
    name: isHardDay ? 'Chicken & Rice Bowl' : 'Quinoa Salad Bowl',
    description: isHardDay
      ? `Grilled chicken breast (150g), brown rice (200g cooked), roasted vegetables, olive oil dressing. High carb for glycogen replenishment.`
      : `Quinoa (150g cooked), chickpeas (100g), mixed greens, cherry tomatoes, cucumber, tahini dressing. Light but nutrient-dense.`,
    calories: isHardDay ? Math.round(weight * 10) : Math.round(weight * 7),
    proteinG: isHardDay ? Math.round(weight * 0.6) : Math.round(weight * 0.3),
    carbsG: isHardDay ? Math.round(weight * 1.2) : Math.round(weight * 0.8),
    fatG: Math.round(weight * 0.2),
    reasoning: isHardDay
      ? 'Post-hard-day lunch should prioritize glycogen resynthesis. The 2:1 carb:protein ratio in this meal aligns with sports nutrition guidelines for rapid recovery.'
      : 'Plant-based protein with complex carbs provides steady energy without the insulin spike of heavy carbs. Ideal for moderate training days.',
  });

  // Dinner
  meals.push({
    mealType: 'dinner',
    name: isRestDay ? 'Salmon with Roasted Veggies' : 'Lean Steak with Sweet Potato & Greens',
    description: isRestDay
      ? `Salmon fillet (150g), roasted broccoli and sweet potato (200g), mixed salad. Omega-3s reduce inflammation.`
      : `Lean beef steak (150g), large sweet potato (250g), sauteed spinach with garlic. Iron + carbs + antioxidants.`,
    calories: isHardDay ? Math.round(weight * 12) : Math.round(weight * 9),
    proteinG: Math.round(weight * 0.5),
    carbsG: isHardDay ? Math.round(weight * 1.5) : Math.round(weight * 0.9),
    fatG: Math.round(weight * 0.3),
    reasoning: isRestDay
      ? 'Salmon provides omega-3 fatty acids (EPA/DHA) which reduce exercise-induced inflammation. Sweet potato offers low-GI carbs without overloading rest-day calories.'
      : 'Red meat provides highly bioavailable iron and zinc — two minerals runners commonly lack. Sweet potato provides potassium to replace electrolyte losses from training.',
  });

  // Snacks based on training load
  if (isHardDay) {
    meals.push({
      mealType: 'snack',
      name: 'Recovery Smoothie',
      description: `Banana (1), whey protein (30g), milk (300ml), honey (1 tbsp). Quick post-run refuel.`,
      calories: Math.round(weight * 3),
      proteinG: Math.round(weight * 0.3),
      carbsG: Math.round(weight * 0.4),
      fatG: 3,
      reasoning: 'Liquid nutrition is absorbed faster post-run when blood flow is diverted away from digestion. The 2:1 carb:protein ratio matches the optimal window for glycogen synthesis.',
    });
  }

  const totals = meals.reduce(
    (acc, m) => ({
      totalCalories: acc.totalCalories + m.calories,
      totalProtein: acc.totalProtein + m.proteinG,
      totalCarbs: acc.totalCarbs + m.carbsG,
      totalFat: acc.totalFat + m.fatG,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );

  const trainingDesc = isHardDay ? 'hard training' : isRestDay ? 'rest' : 'moderate training';

  return {
    meals,
    ...totals,
    reasoning: `This ${trainingDesc} day meal plan targets ${totalCal.toLocaleString()} calories with ` +
      `${carbG}g carbs, ${proteinG}g protein, and ${fatG}g fat. ` +
      `For a ${weight}kg runner, this provides ` +
      `${(carbG / weight).toFixed(1)}g/kg carbs ${isHardDay ? '(high-end for glycogen loading)' : isRestDay ? '(moderate, matching reduced demand)' : '(adequate for maintenance)'} ` +
      `and ${(proteinG / weight).toFixed(1)}g/kg protein (above the RDA of 0.8g/kg, appropriate for athletic recovery). ` +
      `${isHardDay ? 'The carb focus today supports your workout demands.' : isRestDay ? 'Lower carbs today match reduced energy expenditure.' : 'Balanced macros for steady training.'}`,
  };
}

/**
 * Weekly nutrition review — coordinates with training load
 */
export function getWeeklyNutritionReview(
  weekRuns: RunRecord[],
  profile: CoachProfile
): NutritionRecommendation[] {
  const recs: NutritionRecommendation[] = [];
  const weight = profile.weightKg || 70;
  const totalKm = weekRuns.reduce((sum, r) => sum + metersToKm(r.distance), 0);
  const runCount = weekRuns.length;
  const hardSessions = weekRuns.filter(r => r.runType === 'tempo' || r.runType === 'interval').length;

  // Weekly carb periodization summary
  const avgDailyCarbs = weight * 4.5;
  recs.push({
    category: 'weekly_review',
    title: 'Weekly Macro Overview',
    content: `This week: ${totalKm.toFixed(1)}km across ${runCount} runs with ${hardSessions} hard sessions. ` +
      `Average daily target: ${Math.round(avgDailyCarbs)}g carbs (${(avgDailyCarbs / weight).toFixed(1)}g/kg). ` +
      `On hard days, increase to ${Math.round(weight * 8)}g; on rest days, drop to ${Math.round(weight * 3.5)}g.`,
    reasoning: 'Carb periodization — matching carbohydrate intake to training load — improves insulin sensitivity and metabolic flexibility. The principle is "eat for what you did, not for what you will do."',
    priority: 'medium',
  });

  // Iron check for runners
  if (totalKm > 30) {
    recs.push({
      category: 'weekly_review',
      title: 'Iron Status Check',
      content: `At ${totalKm.toFixed(1)}km/week, you're at risk of iron depletion. Runners lose iron through foot-strike hemolysis, sweat, and GI bleeding. Include iron-rich foods: red meat (2-3x/week), spinach, lentils, fortified cereals.`,
      reasoning: 'Iron deficiency affects 25-50% of runners. Even mild deficiency impairs VO2max and increases perceived effort by reducing oxygen delivery. Pair iron sources with vitamin C (citrus, peppers) to triple absorption.',
      priority: 'high',
    });
  }

  // Caloric deficit warning
  if (totalKm > 40 && weight < 65) {
    recs.push({
      category: 'weekly_review',
      title: 'Energy Availability',
      content: `High volume (${totalKm.toFixed(1)}km) at your body weight requires ~${Math.round(weight * 38)} cal/kg/day. RED-S (Relative Energy Deficiency in Sport) is a real risk for runners. Ensure you're eating enough to support training.`,
      reasoning: 'Low energy availability impairs bone density, immune function, and hormonal health. In runners, it\'s the most common cause of stress fractures, frequent illness, and performance plateau.',
      priority: 'high',
    });
  }

  return recs;
}

/**
 * Get combined daily dashboard recommendations
 */
export function getDailyNutritionSummary(
  todayRuns: RunRecord[],
  profile: CoachProfile,
  existingCalories?: { total: number; goal: number }
): {
  preRun: NutritionRecommendation[];
  postRun: NutritionRecommendation[];
  mealPlan: DayMealPlan;
  hydrationAdvice: NutritionRecommendation[];
} {
  const todayKm = todayRuns.reduce((sum, r) => sum + metersToKm(r.distance), 0);
  const hardestRun = todayRuns.sort((a, b) => b.distance - a.distance)[0];
  
  const preRun = hardestRun
    ? getPreRunFueling(hardestRun.runType || 'easy', metersToKm(hardestRun.distance), profile)
    : [];
  
  const mealPlan = getDailyMealPlan(todayRuns, profile, existingCalories);
  
  const postRun = preRun.filter(r => r.category === 'post_run');
  
  const hydrationAdvice = preRun.filter(r => r.category === 'hydration');

  return { preRun, postRun, mealPlan, hydrationAdvice };
}

/**
 * Get analytics summary for nutrition trends
 */
export function getNutritionAnalytics(
  meals: { date: string; calories: number; protein: number; carbs: number; fat: number; mealType: string }[],
  runs: RunRecord[],
  profile: CoachProfile
): {
  averageDailyCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  macrosByDayType: { type: string; calories: number; carbsPct: number; proteinPct: number; fatPct: number }[];
  recommendation: string;
} {
  if (meals.length === 0) {
    return {
      averageDailyCalories: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFat: 0,
      macrosByDayType: [],
      recommendation: 'Log some meals to get nutrition analytics and personalized macro recommendations.',
    };
  }

  const dailyTotals: Record<string, { cal: number; pro: number; carbs: number; fat: number }> = {};
  
  meals.forEach(m => {
    const day = m.date.split('T')[0];
    if (!dailyTotals[day]) dailyTotals[day] = { cal: 0, pro: 0, carbs: 0, fat: 0 };
    dailyTotals[day].cal += m.calories;
    dailyTotals[day].pro += m.protein || 0;
    dailyTotals[day].carbs += m.carbs || 0;
    dailyTotals[day].fat += m.fat || 0;
  });

  const days = Object.values(dailyTotals);
  const avgCal = Math.round(days.reduce((s, d) => s + d.cal, 0) / days.length);
  const avgPro = Math.round(days.reduce((s, d) => s + d.pro, 0) / days.length);
  const avgCarbs = Math.round(days.reduce((s, d) => s + d.carbs, 0) / days.length);
  const avgFat = Math.round(days.reduce((s, d) => s + d.fat, 0) / days.length);

  const weight = profile.weightKg || 70;
  const recCarbs = Math.round(weight * 5);

  let rec = '';
  if (avgCarbs < recCarbs * 0.8) {
    rec = `You're averaging ${avgCarbs}g carbs/day — below the recommended ${recCarbs}g for your weight and activity. Try adding a carb-rich snack (banana, oats, rice) to each meal to hit your training energy needs.`;
  } else if (avgPro < Math.round(weight * 1.6)) {
    rec = `Protein intake (${avgPro}g/day) is below the ${Math.round(weight * 1.6)}g target for runners. Add a protein source to each meal — eggs at breakfast, chicken/beans at lunch, fish at dinner.`;
  } else {
    rec = `Your average macros are well-aligned: ${avgCarbs}g carbs, ${avgPro}g protein, ${avgFat}g fat. Continue to periodize carbs based on training load — more on hard days, less on rest days.`;
  }

  return {
    averageDailyCalories: avgCal,
    averageProtein: avgPro,
    averageCarbs: avgCarbs,
    averageFat: avgFat,
    macrosByDayType: [], // Will be populated with run vs rest day breakdown when we have run data
    recommendation: rec,
  };
}

/**
 * World-Class Running Coach Engine
 * 
 * Scientific principles applied:
 * - Periodization: 4-week cycles (3 build + 1 recovery)
 * - Heart Rate Zone training using Karvonen formula
 * - Progressive overload: max 10% weekly mileage increase
 * - Specific stimulus based on goal race distance
 * - Recovery weeks at 50-60% of peak volume
 * - Long run cap of 30% of weekly volume
 * - Hard day / easy day alternation
 */

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type GoalType = 'general' | '5k' | '10k' | 'half_marathon' | 'marathon' | 'ultra' | 'comrades' | 'weight_loss' | 'speed';
export type RunType = 'easy' | 'tempo' | 'interval' | 'long_run' | 'recovery' | 'race' | 'fartlek';
export type InjuryStatus = 'healthy' | 'niggled' | 'injured' | 'recovering';
export type WorkoutIntensity = 'low' | 'moderate' | 'high' | 'maximal';

export interface CoachProfile {
  experienceLevel: ExperienceLevel;
  maxHr?: number;
  restingHr?: number;
  weightKg?: number;
  goalType: GoalType;
  weeklyGoalKm: number;
  birthYear?: number;
  injuryStatus?: InjuryStatus;
  injuryType?: string;
  injuryNotes?: string;
  injurySince?: string;
  returnToRunDate?: string;
}

export interface RunRecord {
  id: string;
  distance: number; // meters
  movingTime: number; // seconds
  startDate: string;
  averageSpeed?: number; // m/s
  averageHeartrate?: number;
  source?: string;
  runType?: RunType;
  perceivedEffort?: number;
  notes?: string;
}

export interface DayPlan {
  day: string;
  date: string;
  type: string;
  description: string;
  distanceKm: number | null;
  durationMin: number | null;
  intensity: WorkoutIntensity;
  hrZone: string;
  targetHrRange: string;
  completed: boolean;
  notes: string;
}

export interface CoachTip {
  category: 'training' | 'recovery' | 'form' | 'motivation' | 'strategy';
  content: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

// HR Zone thresholds as % of max HR (using %HRR for accuracy when resting HR available)
export interface HrZones {
  zone1: [number, number]; // Recovery: 50-60% or 30-40% HRR
  zone2: [number, number]; // Aerobic: 60-70% or 40-55% HRR
  zone3: [number, number]; // Tempo: 70-80% or 55-70% HRR
  zone4: [number, number]; // Threshold: 80-90% or 70-85% HRR
  zone5: [number, number]; // Max: 90-100% or 85-100% HRR
}

function getAge(birthYear?: number): number {
  if (!birthYear) return 30;
  return new Date().getFullYear() - birthYear;
}

function estimateMaxHr(age: number): number {
  // Tanaka formula (more accurate than 220-age for athletes)
  return Math.round(208 - 0.7 * age);
}

function calculateHrZones(profile: CoachProfile): HrZones {
  const age = getAge(profile.birthYear);
  const maxHr = profile.maxHr || estimateMaxHr(age);
  const restingHr = profile.restingHr || 60;

  // Karvonen formula: HR_target = ((maxHR - restingHR) × %Intensity) + restingHR
  if (profile.restingHr) {
    return {
      zone1: [Math.round((maxHr - restingHr) * 0.3 + restingHr), Math.round((maxHr - restingHr) * 0.4 + restingHr)],
      zone2: [Math.round((maxHr - restingHr) * 0.4 + restingHr), Math.round((maxHr - restingHr) * 0.55 + restingHr)],
      zone3: [Math.round((maxHr - restingHr) * 0.55 + restingHr), Math.round((maxHr - restingHr) * 0.7 + restingHr)],
      zone4: [Math.round((maxHr - restingHr) * 0.7 + restingHr), Math.round((maxHr - restingHr) * 0.85 + restingHr)],
      zone5: [Math.round((maxHr - restingHr) * 0.85 + restingHr), maxHr],
    };
  }

  // Fallback to % of max HR
  return {
    zone1: [Math.round(maxHr * 0.5), Math.round(maxHr * 0.6)],
    zone2: [Math.round(maxHr * 0.6), Math.round(maxHr * 0.7)],
    zone3: [Math.round(maxHr * 0.7), Math.round(maxHr * 0.8)],
    zone4: [Math.round(maxHr * 0.8), Math.round(maxHr * 0.9)],
    zone5: [Math.round(maxHr * 0.9), maxHr],
  };
}

function getZoneForRunType(runType: string): string {
  const map: Record<string, string> = {
    'recovery': 'Zone 1',
    'easy': 'Zone 2',
    'long_run': 'Zone 2',
    'tempo': 'Zone 3',
    'fartlek': 'Zone 3-4',
    'interval': 'Zone 4',
    'race': 'Zone 4-5',
  };
  return map[runType] || 'Zone 2';
}

export function getPaceFromSpeed(speedMs: number): string {
  if (speedMs <= 0) return '--:--';
  const paceMinPerKm = 1000 / 60 / speedMs;
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

export function metersToKm(m: number): number {
  return m / 1000;
}

export function secondsToMin(s: number): number {
  return s / 60;
}

/**
 * Determine training phase based on week number in current cycle
 */
function getTrainingPhase(weekInCycle: number): string {
  const phases = ['Base Building', 'Development', 'Peak', 'Recovery'];
  return phases[weekInCycle % 4] || 'Base Building';
}

/**
 * Get recommended long run distance based on weekly goal and phase
 */
function getLongRunDistance(weeklyGoalKm: number, phase: string): number {
  // Long run should be 25-35% of weekly volume
  const baseLongRun = weeklyGoalKm * 0.3;
  if (phase === 'Recovery') return Math.round(weeklyGoalKm * 0.25 * 0.6); // 60% of normal during recovery
  if (phase === 'Peak') return Math.round(weeklyGoalKm * 0.35);
  return Math.round(baseLongRun);
}

/**
 * Generate a scientifically-structured weekly training plan
 */
export function generateWeeklyPlan(
  runs: RunRecord[],
  profile: CoachProfile,
  weekOffset: number = 0
): { plan: DayPlan[]; phase: string; weekInCycle: number; reasoning: string } {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + (weekOffset * 7));
  
  // Ultra uses 4-week cycles for consistency, but Comrades uses 16-week macrocycles
  // We'll use 4-week cycle internally (matches the existing system)
  const weekInCycle = Math.floor(Math.abs(startOfWeek.getTime() / (7 * 24 * 60 * 60 * 1000))) % 4;
  const phase = getTrainingPhase(weekInCycle);
  const zones = calculateHrZones(profile);
  const isUltra = profile.goalType === 'ultra' || profile.goalType === 'comrades';
  const isInjured = profile.injuryStatus === 'injured' || profile.injuryStatus === 'recovering';
  
  const recentRuns = runs.slice(0, 10);
  const avgWeeklyKm = recentRuns.length > 0 
    ? recentRuns.reduce((sum, r) => sum + metersToKm(r.distance), 0) / Math.max(1, recentRuns.length) * 3
    : profile.weeklyGoalKm;
  
  // Adjust weekly goal based on phase and injury
  let weeklyKm = profile.weeklyGoalKm;
  
  if (isInjured) {
    // Injury protocol: drastically reduce or modify
    weeklyKm = profile.injuryStatus === 'injured' ? Math.round(profile.weeklyGoalKm * 0.2) : Math.round(profile.weeklyGoalKm * 0.5);
  } else if (phase === 'Recovery' && avgWeeklyKm > 0) {
    weeklyKm = Math.round(avgWeeklyKm * 0.55);
  } else if (phase === 'Peak' && avgWeeklyKm > 0) {
    weeklyKm = Math.round(Math.min(avgWeeklyKm * 1.08, avgWeeklyKm + (isUltra ? 8 : 5)));
  } else if (recentRuns.length >= 4) {
    weeklyKm = Math.min(profile.weeklyGoalKm, Math.round(avgWeeklyKm * 1.1));
  }

  const experienceMultiplier = profile.experienceLevel === 'beginner' ? 0.8 
    : profile.experienceLevel === 'advanced' ? 1.2 : 1.0;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // How many running days per week
  let runDays: number;
  if (isInjured) {
    runDays = profile.injuryStatus === 'injured' ? 0 : 3; // recovery: cross-train + short runs
  } else if (isUltra) {
    runDays = profile.experienceLevel === 'beginner' ? 4 : 5; // ultra needs more volume
  } else {
    runDays = profile.experienceLevel === 'beginner' ? 3 
      : profile.experienceLevel === 'intermediate' ? 4 : 5;
  }
  
  const workoutSchedule: Record<string, string> = {};
  
  if (isInjured) {
    // Injury protocol: all easy, focus on cross-training
    if (profile.injuryStatus === 'injured') {
      workoutSchedule['Monday'] = 'cross_train';
      workoutSchedule['Wednesday'] = 'cross_train';
      workoutSchedule['Friday'] = 'cross_train';
    } else {
      // Recovering: return to run gradually
      workoutSchedule['Monday'] = 'easy';
      workoutSchedule['Wednesday'] = 'easy';
      workoutSchedule['Friday'] = 'easy';
      workoutSchedule['Saturday'] = 'long_run';
    }
  } else if (isUltra) {
    // Ultra/Comrades schedule: back-to-back long runs on weekends
    workoutSchedule['Monday'] = 'recovery';
    workoutSchedule['Wednesday'] = 'tempo';
    workoutSchedule['Thursday'] = 'easy';
    workoutSchedule['Friday'] = 'easy';
    workoutSchedule['Saturday'] = 'long_run';
    workoutSchedule['Sunday'] = 'back_to_back';
    if (runDays >= 5) {
      workoutSchedule['Tuesday'] = 'easy';
    }
  } else if (runDays >= 3) {
    workoutSchedule['Monday'] = 'easy';
    workoutSchedule['Wednesday'] = profile.goalType === 'marathon' || profile.goalType === 'half_marathon' ? 'tempo' : 'interval';
    workoutSchedule['Friday'] = 'easy';
    workoutSchedule['Saturday'] = 'long_run';
  }
  if (!isUltra && !isInjured && runDays >= 4) {
    workoutSchedule['Thursday'] = profile.goalType === 'marathon' ? 'easy' : 'tempo';
  }
  if (!isUltra && !isInjured && runDays >= 5) {
    workoutSchedule['Tuesday'] = 'recovery';
  }

  // Adjust for recovery phase
  if (phase === 'Recovery') {
    // Reduce intensity: no hard workouts
    Object.keys(workoutSchedule).forEach(day => {
      if (workoutSchedule[day] === 'interval' || workoutSchedule[day] === 'tempo') {
        workoutSchedule[day] = 'easy';
      }
    });
  }

  // Build the plan
  const plan: DayPlan[] = daysOfWeek.map((day, i) => {
    const d = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    
    const existingRun = runs.find(r => {
      const rd = new Date(r.startDate);
      return rd.getDate() === d.getDate() && rd.getMonth() === d.getMonth();
    });

    if (existingRun) {
      const distKm = metersToKm(existingRun.distance);
      return {
        day, date: dateStr,
        type: 'Run',
        description: existingRun.runType 
          ? `${existingRun.runType.charAt(0).toUpperCase() + existingRun.runType.slice(1)} run — ${distKm.toFixed(1)}km`
          : `Run — ${distKm.toFixed(1)}km`,
        distanceKm: Math.round(distKm * 100) / 100,
        durationMin: Math.round(secondsToMin(existingRun.movingTime)),
        intensity: 'moderate',
        hrZone: existingRun.runType ? getZoneForRunType(existingRun.runType) : 'Zone 2',
        targetHrRange: '',
        completed: true,
        notes: existingRun.notes || '',
      };
    }

    const plannedType = workoutSchedule[day];
    if (!plannedType) {
      return {
        day, date: dateStr,
        type: 'Rest',
        description: 'Rest or active recovery (light walking, stretching)',
        distanceKm: null, durationMin: null,
        intensity: 'low',
        hrZone: '—',
        targetHrRange: '—',
        completed: false,
        notes: 'Rest is when your body rebuilds. Don\'t skip it.',
      };
    }

    return createWorkoutForDay(day, dateStr, plannedType, weeklyKm, phase, zones, profile, experienceMultiplier);
  });

  // Calculate total planned km
  const totalPlannedKm = plan.reduce((sum, d) => sum + (d.distanceKm || 0), 0);

  return {
    plan,
    phase,
    weekInCycle: weekInCycle + 1,
    reasoning: generatePhaseReasoning(phase, weekInCycle, weeklyKm, profile, totalPlannedKm),
  };
}

function createWorkoutForDay(
  day: string, dateStr: string, workoutType: string,
  weeklyKm: number, phase: string, zones: HrZones,
  profile: CoachProfile, expMultiplier: number
): DayPlan {
  const base = {
    day, date: dateStr, completed: false, notes: '',
  };

  switch (workoutType) {
    case 'easy': {
      const dist = Math.round((weeklyKm * 0.15) * expMultiplier * 10) / 10;
      const pace = profile.experienceLevel === 'beginner' ? '6:30-7:30' 
        : profile.experienceLevel === 'intermediate' ? '5:45-6:30' 
        : '5:00-5:45';
      return {
        ...base,
        type: 'Easy Run',
        description: `Easy aerobic run — ${dist.toFixed(1)}km at conversational pace`,
        distanceKm: dist, durationMin: Math.round(dist * (profile.experienceLevel === 'beginner' ? 7 : 5.5)),
        intensity: 'low',
        hrZone: 'Zone 2',
        targetHrRange: `${zones.zone2[0]}-${zones.zone2[1]} bpm`,
        notes: `Target pace: ${pace}/km. Should be able to speak in full sentences.`,
      };
    }
    case 'tempo': {
      const warmup = 2;
      const cooldown = 1;
      const tempoDist = Math.round((weeklyKm * 0.2) * expMultiplier * 10) / 10;
      const total = Math.round((warmup + tempoDist + cooldown) * 10) / 10;
      return {
        ...base,
        type: 'Tempo Run',
        description: `Warm up ${warmup}km → ${tempoDist.toFixed(1)}km at threshold → cool down ${cooldown}km`,
        distanceKm: total, durationMin: Math.round(total * 5.5),
        intensity: 'high',
        hrZone: 'Zone 3-4',
        targetHrRange: `${zones.zone3[0]}-${zones.zone4[1]} bpm`,
        notes: 'Tempo portion: "comfortably hard" — you can say 3-4 words at a time. This builds lactate threshold.',
      };
    }
    case 'interval': {
      const reps = profile.experienceLevel === 'beginner' ? 4 : profile.experienceLevel === 'intermediate' ? 6 : 8;
      const dist = profile.goalType === '5k' ? 400 : profile.goalType === '10k' ? 800 : 400;
      const totalDist = Math.round(((reps * dist / 1000) + 3) * 10) / 10; // + warmup/cooldown
      return {
        ...base,
        type: 'Interval Training',
        description: `${reps} × ${dist}m at VO2max pace with ${dist === 400 ? '90s' : '2min'} recovery jogs`,
        distanceKm: totalDist, durationMin: Math.round(totalDist * 5),
        intensity: 'maximal',
        hrZone: 'Zone 4-5',
        targetHrRange: `${zones.zone4[0]}-${zones.zone5[1]} bpm`,
        notes: `Interval pace: hard but controlled. Each rep should be within 2 seconds of each other. Rest fully between reps.`,
      };
    }
    case 'long_run': {
      const isUltra = profile.goalType === 'ultra' || profile.goalType === 'comrades';
      let longDist = getLongRunDistance(weeklyKm, phase);
      if (isUltra) {
        // Ultra long runs are longer: up to 40-50% of weekly volume
        const ultraLongRun = weeklyKm * (phase === 'Peak' ? 0.4 : phase === 'Recovery' ? 0.2 : 0.3);
        longDist = Math.round(Math.max(longDist, ultraLongRun));
      }
      const hours = (longDist * (profile.experienceLevel === 'beginner' ? 7 : 5.5)) / 60;
      return {
        ...base,
        type: 'Long Run',
        description: isUltra
          ? `Long endurance run — ${longDist}km (~${hours.toFixed(1)}h). Time on feet builds ultra resilience.`
          : `Long endurance run — ${longDist}km at aerobic pace`,
        distanceKm: longDist, durationMin: Math.round(longDist * (profile.experienceLevel === 'beginner' ? 7 : 5.5)),
        intensity: isUltra ? 'low' : 'moderate',
        hrZone: 'Zone 2',
        targetHrRange: `${zones.zone2[0]}-${zones.zone2[1]} bpm`,
        notes: isUltra
          ? 'Ultra long run: keep HR strictly in Zone 2. Practice race-day nutrition (real food + electrolytes). Walk uphills if needed. The adaptation comes from time on feet, not speed.'
          : 'Keep the effort easy. Goal is time on feet, not speed. Practice nutrition/hydration if > 90min.',
      };
    }
    case 'back_to_back': {
      // Second half of back-to-back long runs (ultra/Comrades specific)
      // ~60% of Saturday's long run distance, easy effort
      const satPlan = weeklyKm * (phase === 'Peak' ? 0.35 : phase === 'Recovery' ? 0.15 : 0.25);
      const b2bDist = Math.round(satPlan * 0.65 * 10) / 10;
      const hours = (b2bDist * (profile.experienceLevel === 'beginner' ? 7 : 6)) / 60;
      return {
        ...base,
        type: 'Back-to-Back',
        description: `Back-to-back long run — ${b2bDist.toFixed(1)}km easy effort (~${hours.toFixed(1)}h). Run on tired legs — this builds ultra-specific endurance.`,
        distanceKm: b2bDist, durationMin: Math.round(b2bDist * 6.5),
        intensity: 'low',
        hrZone: 'Zone 2',
        targetHrRange: `${zones.zone2[0]}-${zones.zone2[1]} bpm`,
        notes: 'This is the most important workout for ultra training. Start slow and stay in Zone 2. Practice race-day nutrition. The goal is time on feet, not speed. If pacing feels hard, walk.',
      };
    }
    case 'cross_train': {
      return {
        ...base,
        type: 'Cross-Training',
        description: 'Injury recovery: cross-training session (swimming 30-40min, cycling easy, or strength training upper body)',
        distanceKm: null, durationMin: 35,
        intensity: 'low',
        hrZone: 'Zone 1-2',
        targetHrRange: `${zones.zone1[0]}-${zones.zone2[1]} bpm`,
        notes: profile.injuryType 
          ? `Your ${profile.injuryType} needs rest from impact. Swimming maintains aerobic fitness with zero impact. Avoid any movement that causes pain.`
          : 'Cross-training maintains aerobic fitness while giving your running muscles and connective tissue a break. Focus on form and mobility.',
      };
    }
    case 'recovery': {
      const recDist = 3 + (profile.experienceLevel === 'advanced' ? 2 : 0);
      return {
        ...base,
        type: 'Recovery Run',
        description: `Very easy recovery — ${recDist}km to flush out legs`,
        distanceKm: recDist, durationMin: Math.round(recDist * 7),
        intensity: 'low',
        hrZone: 'Zone 1',
        targetHrRange: `${zones.zone1[0]}-${zones.zone1[1]} bpm`,
        notes: 'Keep it painfully slow. If you\'re breathing hard, you\'re going too fast. This aids recovery.',
      };
    }
    default:
      return {
        ...base, type: 'Rest',
        description: 'Rest or active recovery',
        distanceKm: null, durationMin: null,
        intensity: 'low', hrZone: '—', targetHrRange: '—',
        notes: '',
      };
  }
}

function generatePhaseReasoning(
  phase: string, weekInCycle: number, weeklyKm: number, 
  profile: CoachProfile, totalPlannedKm: number
): string {
  const age = getAge(profile.birthYear);
  const maxHr = profile.maxHr || estimateMaxHr(age);
  const isUltra = profile.goalType === 'ultra' || profile.goalType === 'comrades';
  const isInjured = profile.injuryStatus === 'injured' || profile.injuryStatus === 'recovering';
  
  // Injury recovery reasoning
  if (profile.injuryStatus === 'injured') {
    return `⚠️ INJURY PROTOCOL: You're currently managing "${profile.injuryType || 'an injury'}" — no running this week. Focus on cross-training (swim, bike, upper body strength) to maintain aerobic fitness without impact. Rest is treatment. If you run through pain, you'll lose more time.`;
  }
  if (profile.injuryStatus === 'recovering') {
    return `🔄 RETURN-TO-RUN: Easing back from "${profile.injuryType || 'your injury'}". This week is reduced volume (${weeklyKm}km) with NO hard efforts. Follow the rule: if it hurts, stop and walk. Three pain-free runs in a row → next week add 10% volume.`;
  }
  
  // Ultra-specific reasoning
  if (isUltra) {
    switch (phase) {
      case 'Base Building':
        return `🏔️ ULTRA BASE: Week ${weekInCycle + 1} of 4 — building your ultra foundation. ` +
          `Volume: ~${weeklyKm}km with back-to-back long runs on weekends (the key ultra workout). ` +
          `Keep intensity low — all running should be at conversational pace (Zone 2 at ${Math.round(maxHr * 0.6)}-${Math.round(maxHr * 0.7)} bpm). ` +
          `Your body is adapting to handle time on feet, not speed. This is the most important adaptation for ${profile.goalType === 'comrades' ? 'Comrades' : 'ultra'} distance.`;
      case 'Development':
        return `🏔️ ULTRA DEVELOPMENT: Week ${weekInCycle + 1} of 4 — building resilience. ` +
          `Volume continues to climb (${totalPlannedKm}km this week). The Saturday long run + Sunday back-to-back is your most important stimulus. ` +
          `Focus on nutrition practice during long runs: test what foods your gut tolerates. ` +
          `Add walk breaks on steep hills — this is race strategy, not weakness.`;
      case 'Peak':
        return `🏔️ ULTRA PEAK: Week ${weekInCycle + 1} of 4 — highest volume (~${weeklyKm}km). ` +
          `Peak weekend: Saturday long run + Sunday back-to-back will be your longest combined mileage. ` +
          `Sleep and nutrition are critical. After this week: recovery at 55% volume. ` +
          `Trust the training — the adaptations from this week will materialize during the recovery week.`;
      case 'Recovery':
        return `🛌 ULTRA RECOVERY: Volume drops to ${weeklyKm}km (55% of peak). No back-to-back, no intensity. ` +
          `This is when your body supercompensates — bone density increases, connective tissue strengthens, glycogen stores super-load. ` +
          `Do not skip this. For ${profile.goalType === 'comrades' ? 'Comrades' : 'ultra'} training, recovery weeks are mandatory, not optional.`;
      default:
        return `Phase: ${phase}. Ultra training focus: time on feet, nutrition practice, consistent volume ~${weeklyKm}km.`;
    }
  }
  
  switch (phase) {
    case 'Base Building':
      return `You're in a base-building phase (Week ${weekInCycle + 1} of 4). ` +
        `The goal is to increase your aerobic engine by spending time in Zone 2 (${Math.round(maxHr * 0.6)}-${Math.round(maxHr * 0.7)} bpm). ` +
        `Volume builds progressively — this week targets ~${weeklyKm}km total. ` +
        `Keep 80% of your runs easy. Only 20% should be hard effort.`;
    case 'Development':
      return `Development phase (Week ${weekInCycle + 1} of 4). We're introducing more intensity. ` +
        `Your body has adapted to the base volume, now we add stimulus. ` +
        `The tempo and interval sessions this week (~${totalPlannedKm}km total) will improve your lactate threshold and VO2max. ` +
        `Hard days are hard, easy days are easy — don't blur the line.`;
    case 'Peak':
      return `Peak week (Week ${weekInCycle + 1} of 4)! This is your highest stimulus week. ` +
        `Volume peaks at ~${weeklyKm}km with the toughest workouts. ` +
        `This is where fitness gains accelerate. Pay extra attention to sleep and nutrition. ` +
        `After this week, you'll drop to 55% volume for recovery. Trust the process.`;
    case 'Recovery':
      return `Recovery week — the most important phase. Volume drops to ~${weeklyKm}km ` +
        `(about 55% of your peak). No hard workouts. ` +
        `This is when your body supercompensates — you actually get fitter during rest. ` +
        `By the start of the next cycle, you'll be stronger than before. Don't skip this.`;
    default:
      return `Training phase: ${phase}. Focus on consistent effort and listen to your body. ` +
        `This week targets ~${weeklyKm}km with planned workouts.`;
  }
}

/**
 * Analyze recent runs and generate personalized coaching tips
 */
export function analyzeRuns(
  runs: RunRecord[],
  profile: CoachProfile,
  allTimeRuns?: RunRecord[]
): CoachTip[] {
  if (runs.length === 0) {
    return generateNewRunnerTips(profile);
  }

  const tips: CoachTip[] = [];
  const zones = calculateHrZones(profile);
  const recentKm = runs.reduce((sum, r) => sum + metersToKm(r.distance), 0);
  const runCount = runs.length;
  const totalTimeMin = runs.reduce((sum, r) => sum + secondsToMin(r.movingTime), 0);
  
  // Calculate pace stats
  const runsWithSpeed = runs.filter(r => r.averageSpeed && r.averageSpeed > 0);
  const avgSpeed = runsWithSpeed.length > 0 
    ? runsWithSpeed.reduce((sum, r) => sum + r.averageSpeed!, 0) / runsWithSpeed.length 
    : 0;
  const avgPace = avgSpeed > 0 ? getPaceFromSpeed(avgSpeed) : '--:--';
  
  const runsWithHr = runs.filter(r => r.averageHeartrate && r.averageHeartrate > 0);
  const avgHr = runsWithHr.length > 0 
    ? runsWithHr.reduce((sum, r) => sum + r.averageHeartrate!, 0) / runsWithHr.length 
    : 0;

  // === Training Volume Analysis ===
  if (runCount === 1) {
    tips.push({
      category: 'training',
      content: `You ran once this week (${recentKm.toFixed(1)}km). To build consistency, aim for 3 runs per week — even short ones.`,
      reasoning: 'Research shows that running frequency matters more than individual run length for building aerobic base. 3+ runs per week creates the consistent stimulus needed for adaptation.',
      priority: 'high',
    });
  } else if (runCount < 3 && profile.experienceLevel !== 'beginner') {
    tips.push({
      category: 'training',
      content: `Only ${runCount} runs this week. At your level, 4 runs/week is optimal for continued progress. Try adding a short recovery run.`,
      reasoning: 'For intermediate runners, 4 weekly sessions provide the right balance of stimulus and recovery. Dropping below 3 risks detraining.',
      priority: 'medium',
    });
  }

  if (runCount >= 3 && recentKm > 0) {
    const avgPerRun = recentKm / runCount;
    const longRuns = runs.filter(r => metersToKm(r.distance) > avgPerRun * 1.5);
    if (longRuns.length === 0) {
      tips.push({
        category: 'training',
        content: 'You don\'t have a dedicated long run this week. Adding one longer session (25-30% of weekly volume) builds endurance disproportionately.',
        reasoning: 'The long run stimulates capillary density, mitochondrial biogenesis, and muscular endurance in ways shorter runs cannot replicate.',
        priority: 'high',
      });
    }
  }

  // === Pace Analysis ===
  if (runsWithSpeed.length >= 2) {
    const paces = runsWithSpeed.map(r => r.averageSpeed!);
    const paceVariation = Math.max(...paces) - Math.min(...paces);
    
    if (paceVariation < 0.3 && profile.goalType !== 'general') {
      tips.push({
        category: 'training',
        content: `All your runs are at a similar pace (variation: ${(paceVariation * 3.6).toFixed(1)} km/h). For race training, you need distinct easy days and hard days.`,
        reasoning: 'Training polarization (80% easy, 20% hard) is backed by decades of exercise science. Same-pace running creates a "grey zone" — you get the recovery benefits of neither easy nor hard.',
        priority: 'high',
      });
    }
    
    // Check if easy runs are too fast
    if (avgHr > 0 && profile.maxHr) {
      const zone2Max = profile.restingHr 
        ? Math.round((profile.maxHr - profile.restingHr) * 0.55 + profile.restingHr)
        : Math.round(profile.maxHr * 0.7);
      
      const easyRuns = runs.filter(r => 
        r.runType === 'easy' && r.averageHeartrate && r.averageHeartrate > 0
      );
      const easyHrTooHigh = easyRuns.filter(r => r.averageHeartrate! > zone2Max);
      
      if (easyHrTooHigh.length > 0) {
        tips.push({
          category: 'form',
          content: `Your easy runs are at ${easyHrTooHigh[0].averageHeartrate} bpm average — above your Zone 2 ceiling of ${zone2Max} bpm. Slow down.`,
          reasoning: 'Above Zone 2, you shift from fat-burning aerobic metabolism to carbohydrate-burning. This limits mitochondrial development and delays recovery.',
          priority: 'high',
        });
      }
    }
  }

  // === Heart Rate Analysis ===
  if (runsWithHr.length >= 2) {
    if (avgHr > 160) {
      tips.push({
        category: 'recovery',
        content: `Your average HR across runs is ${Math.round(avgHr)} bpm. This is high, suggesting accumulated fatigue or insufficient recovery.`,
        reasoning: 'Elevated heart rate during easy efforts is a reliable marker of non-functional overreaching. Consider an extra rest day or cut volume by 30%.',
        priority: 'high',
      });
    }
    
    // Check HR drift
    const longRunsWithHr = runs.filter(r => 
      r.runType === 'long_run' && r.averageHeartrate && r.averageHeartrate > 0
    );
    if (longRunsWithHr.length > 0) {
      tips.push({
        category: 'recovery',
        content: 'Monitor heart rate drift during your long runs. A drift of >5% per hour suggests dehydration or poor fueling.',
        reasoning: 'Cardiac drift (HR rising despite steady pace) is a key indicator of heat stress and glycogen depletion. It directly affects marathon performance.',
        priority: 'medium',
      });
    }
  }

  // === Weekly Mileage Trend (all-time) ===
  if (allTimeRuns && allTimeRuns.length >= 14) {
    const recent4Weeks = getWeeklyMileage(allTimeRuns, 4);
    if (recent4Weeks.length >= 3) {
      const trend = recent4Weeks[recent4Weeks.length - 1] - recent4Weeks[0];
      const avgVol = recent4Weeks.reduce((a, b) => a + b, 0) / recent4Weeks.length;
      
      if (trend > 0.15 * avgVol) {
        tips.push({
          category: 'training',
          content: `Your weekly mileage has increased by ${Math.round(trend)}km over 4 weeks. That's above the 10% rule — risk of overuse injury.`,
          reasoning: 'The 10% rule isn\'t arbitrary — bone, tendon, and connective tissue adapt slower than muscle. Exceeding 10% weekly increase correlates strongly with stress fractures and tendonitis.',
          priority: 'high',
        });
      }
      
      if (trend < -0.2 * avgVol && profile.goalType !== 'general') {
        tips.push({
          category: 'motivation',
          content: `Your volume has dropped ~${Math.round(Math.abs(trend))}km over 4 weeks. A cutback is fine, but ensure it's intentional — not from lost consistency.`,
          reasoning: 'Consistency is the single strongest predictor of running performance. Even during planned recovery weeks, maintaining 3 runs/week preserves neuromuscular adaptation.',
          priority: 'medium',
        });
      }
    }
  }

  // === Race-Specific Guidance ===
  if (profile.goalType !== 'general' && profile.goalType !== 'weight_loss') {
    tips.push(...getRaceSpecificTips(profile, recentKm, avgPace));
  }

  // === Form & Efficiency ===
  if (runCount >= 3 && recentKm > 20) {
    tips.push({
      category: 'form',
      content: 'At your volume, consider adding 2 × 20s strides 2-3 times per week after easy runs. They improve running economy with minimal fatigue.',
      reasoning: 'Strides improve neuromuscular coordination and running economy by reinforcing efficient movement patterns. Studies show 2-3% improvement in running economy within 6 weeks.',
      priority: 'low',
    });
  }

  // Sort by priority
  tips.sort((a, b) => { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority]; });
  
  // Limit to top 5
  return tips.slice(0, 6);
}

function generateNewRunnerTips(profile: CoachProfile): CoachTip[] {
  return [
    {
      category: 'motivation',
      content: 'Welcome! The hardest run is the first one. Start with 20 minutes of run-walk (run 1min, walk 2min). Do this 3 times this week.',
      reasoning: 'Run-walk intervals allow beginners to accumulate volume without excessive muscle damage or cardiac strain. It builds tendon resilience safely.',
      priority: 'high',
    },
    {
      category: 'training',
      content: `This week's goal: ${3} runs totaling ${profile.weeklyGoalKm}km. Consistency > intensity for the first month.`,
      reasoning: 'During the first 4 weeks, the priority is establishing the habit and allowing connective tissue to adapt. Intensity comes later.',
      priority: 'high',
    },
    {
      category: 'form',
      content: 'Focus on cadence: aim for 170-180 steps per minute. A quicker cadence reduces ground contact time and injury risk.',
      reasoning: 'Elite runners almost universally settle at 180+ spm. Higher cadence (even 5% increase) reduces peak impact forces at the hip and knee.',
      priority: 'medium',
    },
    {
      category: 'recovery',
      content: 'Stretch after runs (not before). Static stretching before running temporarily reduces muscle force production.',
      reasoning: 'Pre-run static stretching decreases muscle activation for up to 60 minutes. Dynamic warm-ups (leg swings, walking lunges) are superior before running.',
      priority: 'medium',
    },
  ];
}

function getRaceSpecificTips(profile: CoachProfile, weeklyKm: number, avgPace: string): CoachTip[] {
  const tips: CoachTip[] = [];
  
  switch (profile.goalType) {
    case '5k':
      tips.push({
        category: 'strategy',
        content: `For 5K training, your key workout is VO2max intervals: 4-8 × 400-800m at 3K-5K race pace with equal rest. This directly improves your 5K power.`,
        reasoning: '5K performance is limited by VO2max and lactate threshold. Interval training at ~3K-5K pace is the most specific stimulus for both systems.',
        priority: 'high',
      });
      if (weeklyKm < 25) {
        tips.push({
          category: 'training',
          content: `For a sub-20 5K, most runners need 40-50km/week. Currently at ~${weeklyKm}km. Build volume through longer easy runs.`,
          reasoning: 'Even for a 5K, total weekly volume is the strongest predictor of performance. Elite 5K runners often run 80-100 miles/week.',
          priority: 'medium',
        });
      }
      break;
    case '10k':
      tips.push({
        category: 'strategy',
        content: 'For 10K, your key workouts are: (1) Cruise intervals: 3-5 × 1 mile at threshold pace, (2) Long runs up to 16-18km.',
        reasoning: 'The 10K is ~85% aerobic. Threshold work improves lactate clearance while long runs build the aerobic base to sustain 10K effort.',
        priority: 'high',
      });
      break;
    case 'half_marathon':
      tips.push({
        category: 'strategy',
        content: `For half marathon, build long runs to 18-21km and include marathon-pace segments within them. Weekly volume should approach 50-65km.`,
        reasoning: 'The half marathon demands both aerobic endurance and lactate threshold. Long runs with threshold segments simulate race demands better than either alone.',
        priority: 'high',
      });
      break;
    case 'marathon':
      tips.push({
        category: 'strategy',
        content: `For marathon training: (1) Long runs up to 32km with race-pace segments, (2) Back-to-back long runs on weekends simulate fatigue.`,
        reasoning: 'Marathon performance is determined by glycogen storage, fat oxidation efficiency, and the ability to maintain pace with depleted glycogen. Long runs train all three.',
        priority: 'high',
      });
      break;
    case 'ultra':
    case 'comrades': {
      const isComrades = profile.goalType === 'comrades';
      tips.push({
        category: 'strategy',
        content: isComrades
          ? `COMRADES TRAINING: Your goal is 90km with a 12-hour cutoff. Key workouts: (1) Back-to-back long runs (Sat 30-35km + Sun 20-25km) build ultra-specific resilience. (2) Time-on-feet sessions up to 5-6 hours. (3) Practise race-pace (target ~${weeklyKm > 70 ? '6:30-7:00' : '7:30-8:30'}/km) on cutback weeks.`
          : `ULTRA TRAINING: Your goal is 50km+. Key workouts: (1) Back-to-back long runs build fatigue resistance. (2) Time-on-feet: build to 4+ hour runs. (3) Practice race nutrition early — your gut needs training too.`,
        reasoning: isComrades
          ? 'The Comrades Marathon is unique: 90km of rolling hills with a strict 12-hour cutoff. Success depends on: (a) back-to-back long runs to build bone/tendon resilience, (b) learning to run efficiently on tired legs, and (c) nailing nutrition (real food, not just gels) for 9-12 hours of continuous effort.'
          : 'Ultra running success is 70% aerobic fitness, 20% nutrition strategy, and 10% mental resilience. Back-to-back long runs are the single most effective training stimulus because they simulate the fatigue state of the latter half of your race.',
        priority: 'high',
      });
      if (weeklyKm < 60) {
        tips.push({
          category: 'training',
          content: `For ${isComrades ? 'Comrades (90km)' : 'an ultra'}, most finishers train at 70-100km/week. You're at ~${weeklyKm}km. Prioritize consistent weekly volume before adding intensity.`,
          reasoning: `The primary predictor of ${isComrades ? 'Comrades' : 'ultra'} success is total weekly volume. Bone density, tendon strength, and fat oxidation adapt slowly (12-16 weeks). Build volume at 10%/week before introducing back-to-back long runs.`,
          priority: 'high',
        });
      }
      if (isComrades) {
        tips.push({
          category: 'strategy',
          content: `The Comrades is net downhill (Pietermaritzburg to Durban) but has significant climbs, including Polly Shortts. Incorporate downhill running practice — it stresses your quads differently than flat running. Do 3-5km downhill repeats at race effort once every 2 weeks.`,
          reasoning: 'Eccentric loading from downhill running causes unique muscle damage. Practising downhill technique reduces post-race soreness and prevents "dead quads" around the 70km mark — the most common reason for DNF at Comrades.',
          priority: 'high',
        });
        tips.push({
          category: 'strategy',
          content: `Comrades cutoff pace: 12 hours for 90km = 8:00/km average (including aid station stops). In training, learn to negative-split: start at 8:30-9:00/km, speed up to 7:30-8:00/km in the second half. The first 40km should feel easy.`,
          reasoning: 'The Comrades is won or lost in the second half. Most runners go out too fast due to adrenaline and crowd energy. A conservative start with 5-10s/km positive split in the first half correlates with a faster overall time. Walking early (before you need to) preserves energy.',
          priority: 'high',
        });
        tips.push({
          category: 'strategy',
          content: `Ultra nutrition: Train your gut with real food. Target 60-90g carbs/hour (∼240-360 cal/hr) from a mix of sources: gels, bananas, potatoes, sports drink. Practice with the same aid-station foods you'll use on race day. Add sodium: 500-1000mg/hr in hot conditions.`,
          reasoning: 'For 9-12 hours of exercise, gel-only nutrition causes GI distress. Real food (potatoes, bananas, watermelon) provides variety and is often better tolerated. Sodium replacement prevents hyponatremia — a leading medical issue at Comrades.',
          priority: 'high',
        });
      }
      break;
    }
    case 'speed':
      tips.push({
        category: 'strategy',
        content: 'For speed focus, mix short sprints (100-200m) with hill repeats. Hill running builds power without the impact stress of flat sprinting.',
        reasoning: 'Hill repeats combine strength training with speed work — they increase stride power, recruit more motor units, and reduce injury risk vs track sprinting.',
        priority: 'high',
      });
      break;
  }
  
  return tips;
}

/**
 * Calculate weekly mileage from a list of runs
 */
function getWeeklyMileage(runs: RunRecord[], weeks: number): number[] {
  const now = new Date();
  const weeklyTotals: number[] = [];
  
  for (let w = 0; w < weeks; w++) {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - (w * 7));
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekRuns = runs.filter(r => {
      const d = new Date(r.startDate);
      return d >= start && d < end;
    });
    
    const total = weekRuns.reduce((sum, r) => sum + metersToKm(r.distance), 0);
    weeklyTotals.push(Math.round(total * 10) / 10);
  }
  
  return weeklyTotals.reverse();
}

/**
 * Analytics: Get mileage trend data for charts
 */
export function getMileageTrend(runs: RunRecord[], weeks: number = 12): { week: string; km: number }[] {
  const now = new Date();
  const trend: { week: string; km: number }[] = [];
  
  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - (w * 7));
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekRuns = runs.filter(r => {
      const d = new Date(r.startDate);
      return d >= start && d < end;
    });
    
    const total = weekRuns.reduce((sum, r) => sum + metersToKm(r.distance), 0);
    const label = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    trend.push({ week: label, km: Math.round(total * 10) / 10 });
  }
  
  return trend;
}

/**
 * Analytics: Get pace breakdown
 */
export function getPaceDistribution(runs: RunRecord[]): { pace: string; count: number; avgHr: number }[] {
  const buckets: Record<string, { count: number; hrSum: number; hrCount: number }> = {};
  
  runs.forEach(r => {
    if (!r.averageSpeed) return;
    const pace = getPaceFromSpeed(r.averageSpeed);
    if (!buckets[pace]) buckets[pace] = { count: 0, hrSum: 0, hrCount: 0 };
    buckets[pace].count++;
    if (r.averageHeartrate) {
      buckets[pace].hrSum += r.averageHeartrate;
      buckets[pace].hrCount++;
    }
  });
  
  return Object.entries(buckets)
    .map(([pace, data]) => ({
      pace,
      count: data.count,
      avgHr: data.hrCount > 0 ? Math.round(data.hrSum / data.hrCount) : 0,
    }))
    .sort((a, b) => a.pace.localeCompare(b.pace))
    .slice(0, 10);
}

/**
 * Analytics: Workout type breakdown
 */
export function getWorkoutTypeBreakdown(runs: RunRecord[]): { type: string; count: number; totalKm: number; totalMin: number }[] {
  const breakdown: Record<string, { count: number; totalKm: number; totalMin: number }> = {};
  
  runs.forEach(r => {
    const type = r.runType || 'easy';
    if (!breakdown[type]) breakdown[type] = { count: 0, totalKm: 0, totalMin: 0 };
    breakdown[type].count++;
    breakdown[type].totalKm += metersToKm(r.distance);
    breakdown[type].totalMin += secondsToMin(r.movingTime);
  });
  
  return Object.entries(breakdown)
    .map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: data.count,
      totalKm: Math.round(data.totalKm * 10) / 10,
      totalMin: Math.round(data.totalMin),
    }))
    .sort((a, b) => b.totalKm - a.totalKm);
}

/**
 * Calculate HR zone distribution from runs
 */
export function getHrZoneDistribution(runs: RunRecord[], profile: CoachProfile): { zone: string; minutes: number; percentage: number }[] {
  const zones = calculateHrZones(profile);
  const zoneMinutes = [0, 0, 0, 0, 0]; // zones 1-5
  
  runs.forEach(r => {
    if (!r.averageHeartrate || !r.movingTime) return;
    const hr = r.averageHeartrate;
    const min = secondsToMin(r.movingTime);
    
    if (hr <= zones.zone1[1]) zoneMinutes[0] += min;
    else if (hr <= zones.zone2[1]) zoneMinutes[1] += min;
    else if (hr <= zones.zone3[1]) zoneMinutes[2] += min;
    else if (hr <= zones.zone4[1]) zoneMinutes[3] += min;
    else zoneMinutes[4] += min;
  });
  
  const total = zoneMinutes.reduce((a, b) => a + b, 0);
  
  return zoneMinutes.map((min, i) => ({
    zone: `Zone ${i + 1}`,
    minutes: Math.round(min),
    percentage: total > 0 ? Math.round((min / total) * 100) : 0,
  }));
}

/**
 * Get recent running summary for dashboard
 */
export function getDashboardSummary(
  weekRuns: RunRecord[],
  allRuns: RunRecord[],
  profile: CoachProfile
) {
  const totalKm = weekRuns.reduce((sum, r) => sum + metersToKm(r.distance), 0);
  const runCount = weekRuns.length;
  const totalMin = weekRuns.reduce((sum, r) => sum + secondsToMin(r.movingTime), 0);
  
  const runsWithSpeed = weekRuns.filter(r => r.averageSpeed);
  const avgPace = runsWithSpeed.length > 0 
    ? getPaceFromSpeed(runsWithSpeed.reduce((s, r) => s + r.averageSpeed!, 0) / runsWithSpeed.length)
    : '--:--';
  
  const runsWithHr = weekRuns.filter(r => r.averageHeartrate);
  const avgHr = runsWithHr.length > 0
    ? Math.round(runsWithHr.reduce((s, r) => s + r.averageHeartrate!, 0) / runsWithHr.length)
    : 0;

  const trend = getMileageTrend(allRuns, 4);
  const trendDirection = trend.length >= 2
    ? trend[trend.length - 1].km - trend[0].km
    : 0;

  return {
    weeklyKm: Math.round(totalKm * 10) / 10,
    runCount,
    totalMinutes: Math.round(totalMin),
    avgPace,
    avgHr,
    weeklyGoal: profile.weeklyGoalKm,
    progressPercent: Math.min(100, Math.round((totalKm / profile.weeklyGoalKm) * 100)),
    trendDirection: trendDirection > 0 ? 'up' : trendDirection < 0 ? 'down' : 'stable',
    trendAmount: Math.round(Math.abs(trendDirection) * 10) / 10,
    recentRuns: weekRuns.slice(0, 5).map(r => ({
      id: r.id,
      distance: metersToKm(r.distance),
      duration: secondsToMin(r.movingTime),
      date: r.startDate,
      type: r.runType || 'run',
      pace: r.averageSpeed ? getPaceFromSpeed(r.averageSpeed) : '--:--',
      hr: r.averageHeartrate,
    })),
    injuryStatus: profile.injuryStatus || 'healthy',
    injuryType: profile.injuryType || undefined,
    isUltraGoal: profile.goalType === 'ultra' || profile.goalType === 'comrades',
    goalLabel: profile.goalType === 'comrades' ? 'Comrades (90km)' 
      : profile.goalType === 'ultra' ? 'Ultra (50km+)'
      : profile.goalType === 'marathon' ? 'Marathon'
      : profile.goalType === 'half_marathon' ? 'Half Marathon'
      : profile.goalType === '5k' ? '5K'
      : profile.goalType === '10k' ? '10K'
      : profile.goalType === 'speed' ? 'Speed'
      : profile.goalType === 'weight_loss' ? 'Weight Loss'
      : 'General Fitness',
  };
}

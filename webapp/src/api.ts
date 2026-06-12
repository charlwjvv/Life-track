const BASE_URL = '/api';

let authToken: string | null = localStorage.getItem('token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export function getToken(): string | null {
  return authToken;
}

export function isAuthenticated(): boolean {
  return !!authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (e) {
    if (e instanceof SyntaxError) throw new Error('Server returned invalid response');
    throw e;
  }
}

// ─── Auth ───
export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name?: string) =>
    request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  demo: () =>
    request<{ token: string; user: { id: string; email: string; name: string } }>('/auth/demo', {
      method: 'POST',
    }),

  // ─── Coach Dashboard ───
  getDashboard: () =>
    request<{
      weeklyKm: number; runCount: number; totalMinutes: number; avgPace: string;
      avgHr: number; weeklyGoal: number; progressPercent: number;
      trendDirection: string; trendAmount: number;
      recentRuns: any[];
      nutrition: any;
    }>('/coach/dashboard'),

  // ─── Weekly Plan ───
  getWeeklyPlan: (weekOffset = 0) =>
    request<{
      plan: any[]; phase: string; weekInCycle: number; reasoning: string;
      weeklyGoal: number; totalPlannedKm: number; completedKm: number; progress: number;
    }>(`/coach/plan?week=${weekOffset}`),

  // ─── Advice / Analysis ───
  getAdvice: () =>
    request<any[]>('/coach/advice'),

  analyzeWeek: () =>
    request<{ advice: any[]; tips: number; nutritionRecs: number }>('/coach/analyze', { method: 'POST' }),

  // ─── Analytics ───
  getMileageTrend: (weeks = 12) =>
    request<{ week: string; km: number }[]>(`/coach/analytics/mileage-trend?weeks=${weeks}`),

  getPaceDistribution: () =>
    request<{ pace: string; count: number; avgHr: number }[]>('/coach/analytics/pace-distribution'),

  getWorkoutBreakdown: () =>
    request<{ type: string; count: number; totalKm: number; totalMin: number }[]>('/coach/analytics/workout-breakdown'),

  getHrZones: () =>
    request<{ zone: string; minutes: number; percentage: number }[]>('/coach/analytics/hr-zones'),

  getNutritionAnalytics: () =>
    request<any>('/coach/analytics/nutrition'),

  // ─── Manual Runs ───
  logRun: (data: { distanceKm: number; durationMinutes: number; runDate?: string; runType: string; perceivedEffort?: number; notes?: string }) =>
    request<any>('/coach/runs', { method: 'POST', body: JSON.stringify(data) }),

  // ─── Nutrition Coach ───
  getNutrition: () =>
    request<any>('/coach/nutrition'),

  getMealPlan: (date?: string) =>
    request<any[]>(`/coach/nutrition/meal-plan${date ? `?date=${date}` : ''}`),

  generateMealPlan: () =>
    request<any>('/coach/nutrition/meal-plan', { method: 'POST' }),

  // ─── Profile ───
  getProfile: () =>
    request<any>('/coach/profile'),

  updateProfile: (data: any) =>
    request<any>('/coach/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // ─── Calories (from existing) ───
  getCalories: (date?: string) =>
    request<any>(`/calories${date ? `?date=${date}` : ''}`),

  addMeal: (data: any) =>
    request<any>('/calories/meal', { method: 'POST', body: JSON.stringify(data) }),

  setCalorieGoal: (goal: number) =>
    request<any>('/calories/goal', { method: 'PUT', body: JSON.stringify({ goal }) }),

  getCalorieHistory: () =>
    request<any[]>('/calories/history'),

  // ─── Strava ───
  getStravaAuthUrl: () =>
    request<{ url: string }>('/strava/auth-url'),

  getStravaStatus: () =>
    request<{ connected: boolean; athleteId: number | null; totalRuns: number }>('/strava/status'),
};

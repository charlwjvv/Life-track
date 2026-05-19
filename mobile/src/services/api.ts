import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.22.24.77:3001/api';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (email: string, password: string, name?: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  // Budget
  setBudget: (month: number, year: number, amount: number) =>
    request('/budget/set', { method: 'POST', body: JSON.stringify({ month, year, amount }) }),

  getBudget: () => request('/budget/current'),

  addExpense: (data: { amount: number; category: string; description: string; isRecurring?: boolean; date?: string }) =>
    request('/budget/expense', { method: 'POST', body: JSON.stringify(data) }),

  getExpenses: (params?: { month?: number; year?: number; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.month) q.set('month', String(params.month));
    if (params?.year) q.set('year', String(params.year));
    if (params?.category) q.set('category', params.category);
    return request(`/budget/expenses?${q}`);
  },

  getAnalysis: () => request('/budget/analysis'),

  // Goals
  getGoals: (weekStart?: string, weekEnd?: string) => {
    const q = new URLSearchParams();
    if (weekStart) q.set('weekStart', weekStart);
    if (weekEnd) q.set('weekEnd', weekEnd);
    return request(`/goals?${q}`);
  },

  createGoal: (data: { title: string; description?: string; weekStart: string; weekEnd: string }) =>
    request('/goals', { method: 'POST', body: JSON.stringify(data) }),

  toggleGoal: (id: string) => request(`/goals/${id}/toggle`, { method: 'PATCH' }),

  deleteGoal: (id: string) => request(`/goals/${id}`, { method: 'DELETE' }),

  // Calories
  getCalories: (date?: string) => {
    const q = date ? `?date=${date}` : '';
    return request(`/calories${q}`);
  },

  addMeal: (data: { name: string; calories: number; protein?: number; carbs?: number; fat?: number; mealType: string; date?: string }) =>
    request('/calories/meal', { method: 'POST', body: JSON.stringify(data) }),

  setCalorieGoal: (goal: number) =>
    request('/calories/goal', { method: 'PUT', body: JSON.stringify({ goal }) }),

  getCalorieHistory: () => request('/calories/history'),

  // Strava
  getStravaAuthUrl: () => request('/strava/auth-url'),

  connectStrava: (code: string) =>
    request('/strava/token', { method: 'POST', body: JSON.stringify({ code }) }),

  getStravaActivities: () => request('/strava/activities'),

  getWeeklyRuns: () => request('/strava/weekly'),

  getRoutes: () => request('/strava/routes'),

  getStravaStatus: () => request('/strava/status'),

  // Coach
  getAdvice: () => request('/coach/advice'),

  generateAdvice: () => request('/coach/generate', { method: 'POST' }),

  getWeeklyPlan: () => request('/coach/plan'),
};

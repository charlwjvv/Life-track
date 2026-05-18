export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  expenses?: Expense[];
}

export interface BudgetResponse {
  budget: Budget | null;
  spent: number;
  remaining: number;
  tips: string[];
}

export interface Expense {
  id: string;
  userId: string;
  budgetId?: string;
  amount: number;
  category: string;
  description: string;
  isRecurring: boolean;
  date: string;
}

export interface CategoryInsight {
  category: string;
  amount: number;
  percentage: number;
  tip: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  weekStart: string;
  weekEnd: string;
  completed: boolean;
}

export interface CalorieLog {
  id: string;
  date: string;
  total: number;
  goal: number;
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface Run {
  id: string;
  stravaId?: number;
  name?: string;
  distance: number;
  movingTime: number;
  startDate: string;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartrate?: number;
  mapSummary?: string;
}

export interface WeeklyRunning {
  runs: Run[];
  totalDistance: number;
  totalDistanceKm: string;
  totalTimeMinutes: number;
  runCount: number;
}

export interface CoachAdvice {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface WeeklyPlan {
  plan: DayPlan[];
  weeklyGoal: number;
  progressKm: string;
  progress: number;
}

export interface DayPlan {
  day: string;
  date: string;
  type: string;
  distance: string | null;
  completed: boolean;
}

-- LifeTrack Supabase Schema
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/upgcveutdbjceihotbbl/sql-editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Budgets
create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2020 and 2100),
  amount float not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, month, year)
);

-- Expenses
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  budget_id uuid references public.budgets on delete set null,
  amount float not null,
  category text not null,
  description text not null default '',
  is_recurring boolean default false,
  date timestamptz default now(),
  created_at timestamptz default now()
);

-- Goals
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  description text,
  week_start timestamptz not null,
  week_end timestamptz not null,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Calorie Logs
create table public.calorie_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date timestamptz not null,
  total int default 0,
  goal int default 2000,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Meals
create table public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  calorie_log_id uuid references public.calorie_logs on delete set null,
  name text not null,
  calories int not null,
  protein float,
  carbs float,
  fat float,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  date timestamptz default now(),
  created_at timestamptz default now()
);

-- Strava Tokens
create table public.strava_tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade unique not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  athlete_id int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Runs
create table public.runs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  strava_id int unique,
  name text,
  distance float not null,
  moving_time int not null,
  elapsed_time int not null,
  total_elevation float,
  start_date timestamptz not null,
  average_speed float,
  max_speed float,
  average_heartrate float,
  max_heartrate float,
  map_polyline text,
  map_summary text,
  created_at timestamptz default now()
);

-- Coach Advice
create table public.coach_advice (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  type text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Coach Plans
create table public.coach_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade unique not null,
  plan jsonb not null default '[]',
  weekly_goal float default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.expenses enable row level security;
alter table public.goals enable row level security;
alter table public.calorie_logs enable row level security;
alter table public.meals enable row level security;
alter table public.strava_tokens enable row level security;
alter table public.runs enable row level security;
alter table public.coach_advice enable row level security;
alter table public.coach_plans enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Budgets
create policy "Users manage own budgets" on public.budgets using (auth.uid() = user_id);
create policy "Users insert own budgets" on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users update own budgets" on public.budgets for update using (auth.uid() = user_id);
create policy "Users delete own budgets" on public.budgets for delete using (auth.uid() = user_id);

-- Expenses
create policy "Users manage own expenses" on public.expenses using (auth.uid() = user_id);
create policy "Users insert own expenses" on public.expenses for insert with check (auth.uid() = user_id);
create policy "Users update own expenses" on public.expenses for update using (auth.uid() = user_id);
create policy "Users delete own expenses" on public.expenses for delete using (auth.uid() = user_id);

-- Goals
create policy "Users manage own goals" on public.goals using (auth.uid() = user_id);
create policy "Users insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- Calorie Logs
create policy "Users manage own calorie logs" on public.calorie_logs using (auth.uid() = user_id);
create policy "Users insert own calorie logs" on public.calorie_logs for insert with check (auth.uid() = user_id);
create policy "Users update own calorie logs" on public.calorie_logs for update using (auth.uid() = user_id);

-- Meals
create policy "Users manage own meals" on public.meals using (auth.uid() = user_id);
create policy "Users insert own meals" on public.meals for insert with check (auth.uid() = user_id);
create policy "Users update own meals" on public.meals for update using (auth.uid() = user_id);
create policy "Users delete own meals" on public.meals for delete using (auth.uid() = user_id);

-- Strava Tokens
create policy "Users manage own strava tokens" on public.strava_tokens using (auth.uid() = user_id);
create policy "Users insert own strava tokens" on public.strava_tokens for insert with check (auth.uid() = user_id);
create policy "Users update own strava tokens" on public.strava_tokens for update using (auth.uid() = user_id);
create policy "Users delete own strava tokens" on public.strava_tokens for delete using (auth.uid() = user_id);

-- Runs
create policy "Users manage own runs" on public.runs using (auth.uid() = user_id);
create policy "Users insert own runs" on public.runs for insert with check (auth.uid() = user_id);
create policy "Users update own runs" on public.runs for update using (auth.uid() = user_id);
create policy "Users delete own runs" on public.runs for delete using (auth.uid() = user_id);

-- Coach Advice
create policy "Users manage own coach advice" on public.coach_advice using (auth.uid() = user_id);
create policy "Users insert own coach advice" on public.coach_advice for insert with check (auth.uid() = user_id);
create policy "Users delete own coach advice" on public.coach_advice for delete using (auth.uid() = user_id);

-- Coach Plans
create policy "Users manage own coach plans" on public.coach_plans using (auth.uid() = user_id);
create policy "Users insert own coach plans" on public.coach_plans for insert with check (auth.uid() = user_id);
create policy "Users update own coach plans" on public.coach_plans for update using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
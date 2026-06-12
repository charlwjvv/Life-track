-- Migration 002: Add coach profile fields and manual runs table
-- Run this in Supabase SQL Editor after schema.sql

-- Add profile fields for coaching personalization
alter table public.profiles add column if not exists experience_level text default 'beginner' 
  check (experience_level in ('beginner', 'intermediate', 'advanced'));
alter table public.profiles add column if not exists max_heart_rate int;
alter table public.profiles add column if not exists resting_heart_rate int;
alter table public.profiles add column if not exists weight_kg float;
alter table public.profiles add column if not exists goal_type text default 'general' 
  check (goal_type in ('general', '5k', '10k', 'half_marathon', 'marathon', 'weight_loss', 'speed'));
alter table public.profiles add column if not exists weekly_goal_km float default 20.0;
alter table public.profiles add column if not exists birth_year int;

-- Add source column to runs to differentiate Strava vs manual
alter table public.runs add column if not exists source text default 'strava' 
  check (source in ('strava', 'manual'));
alter table public.runs add column if not exists run_type text default 'easy' 
  check (run_type in ('easy', 'tempo', 'interval', 'long_run', 'recovery', 'race', 'fartlek'));
alter table public.runs add column if not exists perceived_effort int 
  check (perceived_effort between 1 and 10);
alter table public.runs add column if not exists notes text;

-- Nutrition recommendations table
create table if not exists public.nutrition_advice (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date timestamptz not null,
  category text not null, -- 'pre_run', 'post_run', 'daily', 'weekly_review'
  meal_timing text, -- 'pre', 'post', 'breakfast', 'lunch', 'dinner', 'snack'
  title text not null,
  content text not null,
  reasoning text, -- scientific explanation
  calories_estimate int,
  protein_g float,
  carbs_g float,
  fat_g float,
  created_at timestamptz default now()
);

-- Meal plan table for structured nutrition planning
create table if not exists public.meal_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date timestamptz not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'pre_run', 'post_run')),
  name text not null,
  description text,
  calories int,
  protein_g float,
  carbs_g float,
  fat_g float,
  recipe_link text,
  created_at timestamptz default now(),
  unique(user_id, date, meal_type)
);

-- RLS policies for new tables
alter table public.nutrition_advice enable row level security;
alter table public.meal_plans enable row level security;

create policy "Users manage own nutrition advice" on public.nutrition_advice 
  using (auth.uid() = user_id);
create policy "Users insert own nutrition advice" on public.nutrition_advice 
  for insert with check (auth.uid() = user_id);
create policy "Users delete own nutrition advice" on public.nutrition_advice 
  for delete using (auth.uid() = user_id);

create policy "Users manage own meal plans" on public.meal_plans 
  using (auth.uid() = user_id);
create policy "Users insert own meal plans" on public.meal_plans 
  for insert with check (auth.uid() = user_id);
create policy "Users update own meal plans" on public.meal_plans 
  for update using (auth.uid() = user_id);
create policy "Users delete own meal plans" on public.meal_plans 
  for delete using (auth.uid() = user_id);

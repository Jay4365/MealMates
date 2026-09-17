-- ==============================================================================
-- MealMates - Roommate Meal Expense Sharing App Database Schema
-- Compatible with Supabase PostgreSQL (Supports both Real-time Sync & RLS)
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Groups Table (Households / Rooms)
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  currency text default '₹' not null,
  owner_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Group Members Table (All roommates in a group)
create table if not exists public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups on delete cascade not null,
  name text not null,
  user_id uuid,
  avatar_color text default '#10B981',
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Meals Table (Lunch and Dinner entries)
create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups on delete cascade not null,
  date date not null,
  meal_type text check (meal_type in ('lunch', 'dinner')) not null,
  total_amount numeric(10, 2) check (total_amount > 0) not null,
  paid_by uuid references public.group_members on delete cascade not null,
  notes text,
  created_by uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Meal Members (Many-to-Many: People who ate each meal and their share)
create table if not exists public.meal_members (
  id uuid default gen_random_uuid() primary key,
  meal_id uuid references public.meals on delete cascade not null,
  member_id uuid references public.group_members on delete cascade not null,
  share_amount numeric(10, 2) check (share_amount >= 0) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (meal_id, member_id)
);

-- 6. Settlements Table (Recorded settlement payments between members)
create table if not exists public.settlements (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups on delete cascade not null,
  from_member_id uuid references public.group_members on delete cascade not null,
  to_member_id uuid references public.group_members on delete cascade not null,
  amount numeric(10, 2) check (amount > 0) not null,
  date date not null default current_date,
  notes text,
  created_by uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- Row Level Security (RLS) - Permissive for shared room members
-- ==============================================================================

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.meals enable row level security;
alter table public.meal_members enable row level security;
alter table public.settlements enable row level security;

-- Allow read & write so roommates sharing the app can sync live data
drop policy if exists "Allow public access to groups" on public.groups;
create policy "Allow public access to groups" on public.groups for all using (true) with check (true);

drop policy if exists "Allow public access to group_members" on public.group_members;
create policy "Allow public access to group_members" on public.group_members for all using (true) with check (true);

drop policy if exists "Allow public access to meals" on public.meals;
create policy "Allow public access to meals" on public.meals for all using (true) with check (true);

drop policy if exists "Allow public access to meal_members" on public.meal_members;
create policy "Allow public access to meal_members" on public.meal_members for all using (true) with check (true);

drop policy if exists "Allow public access to settlements" on public.settlements;
create policy "Allow public access to settlements" on public.settlements for all using (true) with check (true);

-- Enable Realtime for all tables
alter publication supabase_realtime add table public.groups;
alter publication supabase_realtime add table public.group_members;
alter publication supabase_realtime add table public.meals;
alter publication supabase_realtime add table public.meal_members;
alter publication supabase_realtime add table public.settlements;

-- ==============================================================================
-- Initial Seed Data: Group "Our Room" & Roommates (Jay, Aniket, Gautam, Rohit, Parth)
-- ==============================================================================

do $$
declare
  v_group_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_m_jay uuid := 'b0000000-0000-0000-0000-000000000001'::uuid;
  v_m_aniket uuid := 'b0000000-0000-0000-0000-000000000002'::uuid;
  v_m_gautam uuid := 'b0000000-0000-0000-0000-000000000003'::uuid;
  v_m_rohit uuid := 'b0000000-0000-0000-0000-000000000004'::uuid;
  v_m_parth uuid := 'b0000000-0000-0000-0000-000000000005'::uuid;
begin
  -- Insert group if not exists
  if not exists (select 1 from public.groups where id = v_group_id) then
    insert into public.groups (id, name, currency)
    values (v_group_id, 'Our Room', '₹');
  end if;

  -- Insert members
  insert into public.group_members (id, group_id, name, avatar_color, is_active)
  values 
    (v_m_jay, v_group_id, 'Jay', '#10B981', true),
    (v_m_aniket, v_group_id, 'Aniket', '#3B82F6', true),
    (v_m_gautam, v_group_id, 'Gautam', '#F59E0B', true),
    (v_m_rohit, v_group_id, 'Rohit', '#EC4899', true),
    (v_m_parth, v_group_id, 'Parth', '#8B5CF6', true)
  on conflict (id) do nothing;
end $$;

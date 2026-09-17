-- ==============================================================================
-- MealMates - Roommate Meal Expense Sharing App Database Schema
-- Compatible with Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  active_group_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Groups Table (Households / Rooms)
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  currency text default '₹' not null,
  owner_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Group Members Table (All roommates in a group)
create table if not exists public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups on delete cascade not null,
  name text not null,
  user_id uuid references auth.users on delete set null,
  avatar_color text default '#10B981',
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Meals Table (Lunch and Dinner entries)
create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups on delete cascade not null,
  date date not null,
  meal_type text check (meal_type in ('lunch', 'dinner')) not null,
  total_amount numeric(10, 2) check (total_amount > 0) not null,
  paid_by uuid references public.group_members on delete restrict not null,
  notes text,
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Meal Members (Many-to-Many: People who ate each meal and their share)
create table if not exists public.meal_members (
  id uuid default gen_random_uuid() primary key,
  meal_id uuid references public.meals on delete cascade not null,
  member_id uuid references public.group_members on delete restrict not null,
  share_amount numeric(10, 2) check (share_amount >= 0) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (meal_id, member_id)
);

-- 7. Settlements Table (Recorded settlement payments between members)
create table if not exists public.settlements (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups on delete cascade not null,
  from_member_id uuid references public.group_members on delete restrict not null,
  to_member_id uuid references public.group_members on delete restrict not null,
  amount numeric(10, 2) check (amount > 0) not null,
  date date not null default current_date,
  notes text,
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.meals enable row level security;
alter table public.meal_members enable row level security;
alter table public.settlements enable row level security;

-- Profiles: Users can view all profiles, but only update their own
create policy "Users can view profiles" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Groups: Members can view groups they belong to or created
create policy "Users can view groups they own or belong to" on public.groups
  for select using (
    auth.uid() = owner_id or 
    exists (
      select 1 from public.group_members 
      where group_members.group_id = groups.id and group_members.user_id = auth.uid()
    )
  );

create policy "Users can create groups" on public.groups
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update their groups" on public.groups
  for update using (auth.uid() = owner_id);

create policy "Owners can delete their groups" on public.groups
  for delete using (auth.uid() = owner_id);

-- Group Members: Accessible by group members
create policy "Members can view members in their group" on public.group_members
  for select using (
    exists (
      select 1 from public.groups 
      where groups.id = group_members.group_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

create policy "Members can add or modify members in group" on public.group_members
  for all using (
    exists (
      select 1 from public.groups 
      where groups.id = group_members.group_id and groups.owner_id = auth.uid()
    )
  );

-- Meals: Group members can read, create, update, delete
create policy "Group members can view meals" on public.meals
  for select using (
    exists (
      select 1 from public.groups 
      where groups.id = meals.group_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

create policy "Group members can insert meals" on public.meals
  for insert with check (
    exists (
      select 1 from public.groups 
      where groups.id = meals.group_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

create policy "Group members can update meals" on public.meals
  for update using (
    exists (
      select 1 from public.groups 
      where groups.id = meals.group_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

create policy "Group members can delete meals" on public.meals
  for delete using (
    exists (
      select 1 from public.groups 
      where groups.id = meals.group_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

-- Meal Members: Same as meals
create policy "Group members can view meal members" on public.meal_members
  for select using (
    exists (
      select 1 from public.meals
      join public.groups on groups.id = meals.group_id
      where meals.id = meal_members.meal_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

create policy "Group members can manage meal members" on public.meal_members
  for all using (
    exists (
      select 1 from public.meals
      join public.groups on groups.id = meals.group_id
      where meals.id = meal_members.meal_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

-- Settlements: Group members can view & manage settlements
create policy "Group members can view settlements" on public.settlements
  for select using (
    exists (
      select 1 from public.groups 
      where groups.id = settlements.group_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

create policy "Group members can manage settlements" on public.settlements
  for all using (
    exists (
      select 1 from public.groups 
      where groups.id = settlements.group_id and (
        groups.owner_id = auth.uid() or 
        exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
      )
    )
  );

-- Automatic profile creation on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

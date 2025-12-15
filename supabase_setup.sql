-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Profiles table (extends default auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- 3. Create Receipts table
create table public.receipts (
  id uuid default uuid_generate_v4() primary key,
  receipt_number text not null,
  date date not null,
  client text not null,
  total_value numeric(10,2) not null,
  description text,
  status text not null default 'Em Aberto',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

-- 4. Create Deductions table
create table public.deductions (
  id uuid default uuid_generate_v4() primary key,
  receipt_id uuid references public.receipts on delete cascade not null,
  date date not null,
  value numeric(10,2) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users not null,
  receiver_id uuid references auth.users not null,
  sender_username text not null, -- Denormalized for easier display
  receiver_username text not null, -- Denormalized for easier display
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.receipts enable row level security;
alter table public.deductions enable row level security;
alter table public.messages enable row level security;

-- 7. Create Policies

-- Profiles: Everyone can read usernames, User can update own
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Receipts: Users can see and edit only their own receipts (or everyone sees everything? Let's assume shared for now based on "admin sees receipts")
-- For this app, let's make receipts visible to authenticated users (Shared Dashboard)
create policy "Receipts are viewable by authenticated users" on public.receipts for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert receipts" on public.receipts for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update receipts" on public.receipts for update using (auth.role() = 'authenticated');

-- Deductions: Same as receipts
create policy "Deductions are viewable by authenticated users" on public.deductions for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert deductions" on public.deductions for insert with check (auth.role() = 'authenticated');

-- Messages: Users can see messages sent to them or by them
create policy "Users can see their own messages" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can insert messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Users can update (mark read) messages sent to them" on public.messages for update using (auth.uid() = receiver_id);

-- 8. Function to handle new user signup (Trigger)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Loans
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My Loan',
  total_amount numeric(12,2) not null,
  interest_amount numeric(12,2) not null default 0,
  daily_installment numeric(12,2) not null,
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.loans enable row level security;
create policy "Users view own loans" on public.loans for select using (auth.uid() = user_id);
create policy "Users insert own loans" on public.loans for insert with check (auth.uid() = user_id);
create policy "Users update own loans" on public.loans for update using (auth.uid() = user_id);
create policy "Users delete own loans" on public.loans for delete using (auth.uid() = user_id);

-- Payments
create type public.payment_status as enum ('pending', 'paid', 'verified', 'missed');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  proof_url text,
  note text,
  status public.payment_status not null default 'paid',
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create policy "Users view own payments" on public.payments for select using (auth.uid() = user_id);
create policy "Users insert own payments" on public.payments for insert with check (auth.uid() = user_id);
create policy "Users update own payments" on public.payments for update using (auth.uid() = user_id);
create policy "Users delete own payments" on public.payments for delete using (auth.uid() = user_id);

create index payments_loan_idx on public.payments(loan_id, payment_date desc);
create index loans_user_idx on public.loans(user_id);

-- Storage bucket for payment proofs
insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', true);

create policy "Anyone can view proofs" on storage.objects for select using (bucket_id = 'payment-proofs');
create policy "Users upload own proofs" on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own proofs" on storage.objects for update
  using (bucket_id = 'payment-proofs' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own proofs" on storage.objects for delete
  using (bucket_id = 'payment-proofs' and auth.uid()::text = (storage.foldername(name))[1]);

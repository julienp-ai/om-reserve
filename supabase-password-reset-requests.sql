-- A executer dans le SQL Editor du dashboard Supabase
-- Project Settings > SQL Editor

create table if not exists public.password_reset_requests (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  user_id     uuid references auth.users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'done')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null
);

-- Index pour trier facilement par statut/date
create index if not exists idx_password_reset_requests_status on public.password_reset_requests(status, created_at desc);

-- RLS : seuls les admins peuvent lire et modifier
alter table public.password_reset_requests enable row level security;

create policy "Admins can read reset requests"
  on public.password_reset_requests for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update reset requests"
  on public.password_reset_requests for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Tout le monde peut inserer (pour soumettre une demande sans etre connecte)
create policy "Anyone can insert reset requests"
  on public.password_reset_requests for insert
  with check (true);

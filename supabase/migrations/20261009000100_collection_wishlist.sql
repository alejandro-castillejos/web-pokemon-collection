-- Pokémon TCG Collection: user-owned collection and wishlist records.
-- This migration is safe to re-run and does not insert or delete user data.

create table if not exists public.collection (
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id text not null,
  created_at timestamptz default now() not null,
  primary key (user_id, card_id)
);

create table if not exists public.wishlist (
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id text not null,
  created_at timestamptz default now() not null,
  primary key (user_id, card_id)
);

create index if not exists collection_user_created_at_idx
  on public.collection (user_id, created_at desc);

create index if not exists wishlist_user_created_at_idx
  on public.wishlist (user_id, created_at desc);

alter table public.collection enable row level security;
alter table public.wishlist enable row level security;

grant select, insert, delete on table public.collection to authenticated;
grant select, insert, delete on table public.wishlist to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'collection'
      and policyname = 'collection_select_own'
  ) then
    execute 'create policy collection_select_own on public.collection
      for select to authenticated using (auth.uid() = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'collection'
      and policyname = 'collection_insert_own'
  ) then
    execute 'create policy collection_insert_own on public.collection
      for insert to authenticated with check (auth.uid() = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'collection'
      and policyname = 'collection_delete_own'
  ) then
    execute 'create policy collection_delete_own on public.collection
      for delete to authenticated using (auth.uid() = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'wishlist'
      and policyname = 'wishlist_select_own'
  ) then
    execute 'create policy wishlist_select_own on public.wishlist
      for select to authenticated using (auth.uid() = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'wishlist'
      and policyname = 'wishlist_insert_own'
  ) then
    execute 'create policy wishlist_insert_own on public.wishlist
      for insert to authenticated with check (auth.uid() = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'wishlist'
      and policyname = 'wishlist_delete_own'
  ) then
    execute 'create policy wishlist_delete_own on public.wishlist
      for delete to authenticated using (auth.uid() = user_id)';
  end if;
end
$$;

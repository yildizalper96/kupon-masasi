-- Kupon Masasi: Supabase semasi. Supabase panelinde "SQL Editor" > "New query" icine yapistirip "Run" ile calistir.
-- Guvenli tekrar calistirilabilir (idempotent). Satir bazli guvenlik (RLS) acik: herkes yalnizca kendi verisini gorur.

-- 1) Kullaniciya ozel belgeler (kupon, favoriler, profil). path ornekleri: 'kupon', 'favs', 'profile'
create table if not exists public.user_docs (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  path       text        not null check (path ~ '^[a-z0-9_-]{1,40}$'),
  data       jsonb       not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  updated_at timestamptz not null default now(),
  primary key (user_id, path)
);
alter table public.user_docs enable row level security;

drop policy if exists "user_docs_select_own" on public.user_docs;
drop policy if exists "user_docs_insert_own" on public.user_docs;
drop policy if exists "user_docs_update_own" on public.user_docs;
drop policy if exists "user_docs_delete_own" on public.user_docs;
create policy "user_docs_select_own" on public.user_docs for select to authenticated using (auth.uid() = user_id);
create policy "user_docs_insert_own" on public.user_docs for insert to authenticated with check (auth.uid() = user_id);
create policy "user_docs_update_own" on public.user_docs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_docs_delete_own" on public.user_docs for delete to authenticated using (auth.uid() = user_id);

-- 2) Paylasilan kuponlar (6 harfli kod): herkes okur, yalnizca giris yapan olusturur, yalnizca sahibi degistirir/siler
create table if not exists public.shared_coupons (
  code       text        primary key check (code ~ '^[A-Z0-9]{4,12}$'),
  owner      uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  data       jsonb       not null check (pg_column_size(data) < 20000),
  created_at timestamptz not null default now()
);
alter table public.shared_coupons enable row level security;

drop policy if exists "shared_select_all"  on public.shared_coupons;
drop policy if exists "shared_insert_own"  on public.shared_coupons;
drop policy if exists "shared_update_own"  on public.shared_coupons;
drop policy if exists "shared_delete_own"  on public.shared_coupons;
create policy "shared_select_all" on public.shared_coupons for select to anon, authenticated using (true);
create policy "shared_insert_own" on public.shared_coupons for insert to authenticated with check (auth.uid() = owner);
create policy "shared_update_own" on public.shared_coupons for update to authenticated using (auth.uid() = owner) with check (auth.uid() = owner);
create policy "shared_delete_own" on public.shared_coupons for delete to authenticated using (auth.uid() = owner);

-- 3) Acik yetkiler (yeni Supabase projelerinde Data API icin gerekli; RLS yukaridaki kurallarla sinirlar)
grant usage on schema public to anon, authenticated;
grant select on public.shared_coupons to anon, authenticated;
grant insert, update, delete on public.shared_coupons to authenticated;
grant select, insert, update, delete on public.user_docs to authenticated;
-- 4) Sertlestirme (12 Kas 2026'da panelde calistirildi): giris yapmamis (anon) kullanici user_docs'a hic erisemez,
--    shared_coupons'a yalnizca okur (yazma yetkisi yok). RLS zaten engelliyordu; bu ikinci kilit.
revoke all on public.user_docs from anon;
revoke insert, update, delete on public.shared_coupons from anon;
-- 5) Sahip kimligi (owner) herkese acik olmasin: anon yalnizca code, data, created_at sutunlarini okur
--    (istemci yalnizca select=data kullanir; select=* anon icin artik izin yok hatasi verir). 12 Kas 2026'da calistirildi.
revoke select on public.shared_coupons from anon;
grant select (code, data, created_at) on public.shared_coupons to anon;

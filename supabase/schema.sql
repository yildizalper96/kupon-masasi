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

-- 6) Hesap silme (20 Kas 2026): giris yapan kullanici yalnizca KENDI hesabini siler; user_docs ve shared_coupons on delete cascade ile gider.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 7) Istemci hata kaydi (23 Kas 2026) — HENUZ CALISTIRILMADI. Calistirinca js/hata.js icinde GONDER = true yap.
--    Herkes (anon dahil) yalnizca EKLEYEBILIR; okuma yalniz panelden (service role). Boyut sinirli, 30 gunden eski kayitlar silinebilir.
create table if not exists public.client_errors (
  id         bigserial   primary key,
  created_at timestamptz not null default now(),
  msg        text        not null check (length(msg) <= 300),
  src        text        check (length(src) <= 160),
  stack      text        check (length(stack) <= 600),
  page       text        check (length(page) <= 160),
  ua         text        check (length(ua) <= 160)
);
alter table public.client_errors enable row level security;
drop policy if exists "client_errors_insert_all" on public.client_errors;
create policy "client_errors_insert_all" on public.client_errors for insert to anon, authenticated with check (true);
revoke all on public.client_errors from anon, authenticated;
grant insert (msg, src, stack, page, ua) on public.client_errors to anon, authenticated;
grant usage on sequence public.client_errors_id_seq to anon, authenticated;

-- 8) Paylasilan kupon listesini kapat + kullanici basina kayit siniri (23 Kas 2026) — HENUZ CALISTIRILMADI.
--    Once istemci (js/data-shim.js, get_shared_coupon kullanir, yoksa eski yola duser) yayinda olmali; sonra bu blok.
--    a) Kodu bilen okur: tek kupon donduren fonksiyon. Tablo artik anon'a ve baskasinin kuponuna kapali (liste cekilemez).
create or replace function public.get_shared_coupon(p_code text) returns jsonb
language sql stable security definer set search_path = public as $$
  select data from public.shared_coupons where code = upper(p_code) limit 1
$$;
revoke all on function public.get_shared_coupon(text) from public;
grant execute on function public.get_shared_coupon(text) to anon, authenticated;
drop policy if exists "shared_select_all" on public.shared_coupons;
drop policy if exists "shared_select_own" on public.shared_coupons;
create policy "shared_select_own" on public.shared_coupons for select to authenticated using (auth.uid() = owner);
revoke select on public.shared_coupons from anon;
revoke select (code, data, created_at) on public.shared_coupons from anon;
--    b) Sinirlar: kullanici basina en cok 20 belge (su an 4 tur kullaniliyor: kupon, favs, profile, prefs) ve 200 paylasilan kupon.
--       Var olan satirin guncellenmesi (upsert) sinira takilmaz.
create or replace function public.limit_user_docs() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.user_docs where user_id = new.user_id and path = new.path) then return new; end if;
  if (select count(*) from public.user_docs where user_id = new.user_id) >= 20 then
    raise exception 'belge siniri asildi' using errcode = '54000';
  end if;
  return new;
end $$;
drop trigger if exists user_docs_limit on public.user_docs;
create trigger user_docs_limit before insert on public.user_docs for each row execute function public.limit_user_docs();
create or replace function public.limit_shared_coupons() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.shared_coupons where code = new.code) then return new; end if;
  if (select count(*) from public.shared_coupons where owner = new.owner) >= 200 then
    raise exception 'paylasim siniri asildi' using errcode = '54000';
  end if;
  return new;
end $$;
drop trigger if exists shared_coupons_limit on public.shared_coupons;
create trigger shared_coupons_limit before insert on public.shared_coupons for each row execute function public.limit_shared_coupons();

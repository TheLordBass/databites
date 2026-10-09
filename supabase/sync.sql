-- QueryCafe: sync across devices.
--
-- Paste this whole file into Supabase -> SQL Editor -> New query, and press Run.
-- Running it again is safe.
--
-- Progress is kept under a sync code, with no name or email. The code itself
-- isn't stored, only its SHA-256, so even a leaked copy of the table can't be
-- used to open anyone's progress. The app can't read, list or write the table
-- directly: it can only call the three functions at the bottom, each with a code.

create table if not exists public.sync (
  id         text primary key,                 -- SHA-256 of the sync code, as hex
  data       jsonb not null,                   -- the progress
  version    bigint not null default 1,        -- goes up by one on every save
  updated_at timestamptz not null default now()
);

-- Row level security on, and no policies: nobody gets at the table directly.
alter table public.sync enable row level security;
revoke all on table public.sync from anon, authenticated;

-- A code is 20 characters of Crockford base32: 0-9 and A-Z without I, L, O and U.
create or replace function public.sync_id(code text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if code is null or code !~ '^[0-9A-HJKMNP-TV-Z]{20}$' then
    raise exception 'not a sync code' using errcode = '22023';
  end if;
  return encode(sha256(convert_to(code, 'UTF8')), 'hex');
end;
$$;

-- The progress for a code, with its version. No row if there isn't any.
create or replace function public.sync_load(code text)
returns table (data jsonb, version bigint, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select s.data, s.version, s.updated_at
  from public.sync s
  where s.id = public.sync_id(code);
$$;

-- Saves progress on top of version `base` (0 for a new code) and returns the
-- new version. Returns null, saving nothing, if another device saved first:
-- the app then loads, merges and tries again. Also null if the copy was
-- deleted meanwhile.
create or replace function public.sync_save(code text, payload jsonb, base bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  sync_key text := public.sync_id(code);
  stored bigint;
begin
  if jsonb_typeof(payload) is distinct from 'object' then
    raise exception 'progress must be a JSON object' using errcode = '22023';
  end if;
  if octet_length(payload::text) > 200000 then
    raise exception 'progress is too big to sync' using errcode = '22023';
  end if;

  select s.version into stored from public.sync s where s.id = sync_key for update;

  if not found then
    if coalesce(base, 0) <> 0 then
      return null;                     -- it was deleted on another device
    end if;
    -- A cap, so nobody can fill the free tier with junk codes.
    if (select count(*) from public.sync) >= 2000 then
      raise exception 'sync is full' using errcode = '53400';
    end if;
    insert into public.sync (id, data, version) values (sync_key, payload, 1)
      on conflict (id) do nothing;
    if not found then
      return null;                     -- another device made it a moment ago
    end if;
    return 1;
  end if;

  if stored <> base then
    return null;                       -- another device saved first
  end if;

  update public.sync s
    set data = payload, version = stored + 1, updated_at = now()
    where s.id = sync_key;
  return stored + 1;
end;
$$;

-- Erases the copy for a code. True if there was one.
create or replace function public.sync_delete(code text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with gone as (
    delete from public.sync s where s.id = public.sync_id(code) returning 1
  )
  select exists (select 1 from gone);
$$;

-- Only those three are callable from the app.
revoke all on function public.sync_id(text) from public, anon, authenticated;
revoke all on function public.sync_load(text) from public;
revoke all on function public.sync_save(text, jsonb, bigint) from public;
revoke all on function public.sync_delete(text) from public;
grant execute on function public.sync_load(text) to anon, authenticated;
grant execute on function public.sync_save(text, jsonb, bigint) to anon, authenticated;
grant execute on function public.sync_delete(text) to anon, authenticated;

notify pgrst, 'reload schema';

create or replace function public.prevent_panache_360_vote_after_close()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if now() >= timestamptz '2026-07-12 02:00:00+01' then
    raise exception 'Panache 360 voting has ended.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_panache_360_vote_after_close on public.panache_360_vote_payments;

create trigger prevent_panache_360_vote_after_close
before insert on public.panache_360_vote_payments
for each row
execute function public.prevent_panache_360_vote_after_close();

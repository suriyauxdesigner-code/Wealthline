-- Wealthline — foreign-currency investments + a shared exchange rate table
--
-- Adds a currency to each investment (defaulting to INR, so every existing
-- row keeps meaning exactly what it always did — its price was always in
-- INR) so a holding like a US stock can be priced in USD instead.
--
-- exchange_rates is a small shared table, not user-scoped: a currency pair's
-- rate is the same for everyone, so any signed-in user can read it, and any
-- signed-in client may also refresh it (upsert) if it looks stale — the
-- primary writer is a daily Vercel Cron job (see
-- src/app/api/cron/exchange-rate/route.ts) hitting a free, keyless FX API,
-- with the client-side refresh as a fallback for days the cron hasn't run
-- yet (e.g. right after this migration, before the first cron tick).

alter table public.investments add column if not exists currency text not null default 'INR';
alter table public.investments add constraint investments_currency_check check (currency in ('INR', 'USD'));

create table public.exchange_rates (
  pair text primary key,
  rate numeric not null,
  updated_at timestamptz not null default now()
);

insert into public.exchange_rates (pair, rate) values ('USDINR', 83)
on conflict (pair) do nothing;

alter table public.exchange_rates enable row level security;

create policy "select exchange rates" on public.exchange_rates for select using (auth.uid () is not null);

create policy "insert exchange rates" on public.exchange_rates for insert
  with check (auth.uid () is not null);

create policy "update exchange rates" on public.exchange_rates for update using (auth.uid () is not null)
  with check (auth.uid () is not null);

-- Wealthline — profile financial snapshot
--
-- The onboarding wizard's "Financial profile" step (monthly income/expenses,
-- current savings/investments, existing debt) doesn't map onto any table in
-- 0001_init.sql — these are one-off, per-user snapshot facts captured once at
-- onboarding, not transactional data, so they live on `profiles` rather than
-- a new table. `monthly_expenses` isn't duplicated here — it's folded into
-- fire_profiles.annual_expenses at write time.

alter table public.profiles
add column monthly_income numeric,
add column current_savings numeric,
add column current_investments numeric,
add column existing_debt numeric;

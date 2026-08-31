-- Wealthline — link transactions to a debt
--
-- Lets a transaction represent a payment toward a liability: when set,
-- liability_id means "this transaction's amount reduces that debt's
-- outstanding balance" (always a payment, never a new charge — enforced in
-- application code in src/lib/store.ts, not by a DB trigger, since the
-- decision of which direction a payment moves is a product choice, not a
-- data-integrity rule).

alter table public.transactions
add column liability_id uuid references public.liabilities (id) on delete set null;

create index transactions_liability_id_idx on public.transactions (liability_id);

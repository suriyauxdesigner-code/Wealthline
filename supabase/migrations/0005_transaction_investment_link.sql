-- Wealthline — link transactions to an investment holding
--
-- Lets an "investment" transaction logged from the main Transactions dialog
-- point at a specific holding, so buying/selling a fund there also updates
-- that holding's quantity/average cost (unit-based) or invested amount
-- (value-based: FD/EPF/PPF/Bonds), not just the linked accounts' balances.
--
-- For unit-based holdings, the resulting buy/sell is recorded as its own
-- row in investment_transactions (linked_transaction_id), reusing the same
-- full-history replay that the holding's own detail page already uses —
-- editing or deleting the transaction cascades to that row and the holding
-- is recomputed from what remains, so it can never drift out of sync.

alter table public.transactions
add column investment_id uuid references public.investments (id) on delete set null;

create index transactions_investment_id_idx on public.transactions (investment_id);

alter table public.investment_transactions
add column linked_transaction_id uuid references public.transactions (id) on delete cascade;

create index investment_transactions_linked_transaction_id_idx on public.investment_transactions (linked_transaction_id);

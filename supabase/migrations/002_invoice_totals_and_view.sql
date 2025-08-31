-- Keep invoice totals in sync with items
create or replace function update_invoice_totals()
returns trigger language plpgsql set search_path = public as $$
declare v_inv uuid;
begin
  v_inv := coalesce(new.invoice_id, old.invoice_id);
  update invoices i
     set amount_subtotal = coalesce((select sum(amount) from invoice_items where invoice_id = v_inv),0)
   where i.id = v_inv;
  return coalesce(new, old);
end$$;

drop trigger if exists trg_items_update_totals on invoice_items;
create trigger trg_items_update_totals
after insert or update or delete on invoice_items
for each row
execute function update_invoice_totals();

-- View: computed overdue status (without security definer)
create or replace view invoice_public as
select
  i.*,
  case
    when i.status in ('sent','overdue') and i.due_date is not null and i.due_date < now()::date
      then 'overdue'
    else i.status
  end as computed_status
from invoices i;

grant select on invoice_public to anon, authenticated;

-- Positioning & indexes (idempotent)
alter table tasks add column if not exists position int not null default 0;
create index if not exists idx_tasks_day_pos on tasks (due_date, position);

-- Recurrence columns
alter table tasks
  add column if not exists recur_rule text check (recur_rule in ('WEEKLY','MONTHLY')),
  add column if not exists recur_interval int,
  add column if not exists recur_count int,
  add column if not exists recur_until date;

-- (Optional) helper resequencer if you ever want server-side resequence
create or replace function clamp_task_positions(p_org uuid, p_date date)
returns void language plpgsql SET search_path = public as $$
declare rec record; i int := 0;
begin
  for rec in
    select id from tasks where org_id=p_org and due_date=p_date order by position asc, created_at asc
  loop
    update tasks set position = i where id = rec.id;
    i := i + 1;
  end loop;
end$$;

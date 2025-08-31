-- UUID helpers
create extension if not exists "uuid-ossp";

-- Organizations & membership
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  default_org_id uuid references organizations(id),
  created_at timestamptz default now()
);

create table if not exists memberships (
  user_id uuid references auth.users(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  role text check (role in ('owner','member')) not null default 'owner',
  primary key (user_id, org_id),
  created_at timestamptz default now()
);

-- Clients (Leads)
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz default now()
);

-- Projects (optional right now)
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  status text not null default 'active',
  description text,
  start_date date,
  due_date date,
  created_at timestamptz default now()
);

-- Tasks (T)
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  estimate_minutes int,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoices (I)
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  issue_date date default now(),
  due_date date,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue')),
  notes text,
  amount_subtotal numeric(12,2) default 0,
  amount_tax numeric(12,2) default 0,
  amount_total numeric(12,2) generated always as (coalesce(amount_subtotal,0)+coalesce(amount_tax,0)) stored,
  created_at timestamptz default now()
);

-- Invoice items
create table if not exists invoice_items (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  amount numeric(12,2) generated always as (quantity*unit_price) stored
);

-- Payments (optional for now)
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_at timestamptz default now(),
  method text,
  status text default 'succeeded'
);

-- Functions (must be created before policies)
create or replace function is_member(check_org uuid)
returns boolean language sql stable set search_path = public as $$
  select exists(
    select 1 from memberships
    where user_id = auth.uid()
      and org_id = check_org
  );
$$;

create or replace function ensure_membership()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_profile profiles%rowtype;
  v_membership memberships%rowtype;
begin
  -- Get user's profile
  select * into v_profile from profiles where id = auth.uid();
  
  if v_profile.default_org_id is not null then
    -- Check if membership exists
    select * into v_membership from memberships where user_id = auth.uid() and org_id = v_profile.default_org_id;
    if v_membership.user_id is null then
      -- Create missing membership
      insert into memberships(user_id, org_id, role) values (auth.uid(), v_profile.default_org_id, 'owner');
    end if;
  end if;
end$$;

-- init_user RPC
create or replace function init_user(p_full_name text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_profile profiles%rowtype;
  v_org organizations%rowtype;
  v_membership memberships%rowtype;
begin
  -- Check if profile exists
  select * into v_profile from profiles where id = auth.uid();
  
  if v_profile.id is null then
    -- Create organization and profile
    insert into organizations(name) values (coalesce(p_full_name, 'My Workspace')) returning * into v_org;
    insert into profiles(id, full_name, default_org_id) values (auth.uid(), p_full_name, v_org.id);
    insert into memberships(user_id, org_id, role) values (auth.uid(), v_org.id, 'owner');
  else
    -- Profile exists, check if membership exists
    select * into v_membership from memberships where user_id = auth.uid() and org_id = v_profile.default_org_id;
    if v_membership.user_id is null then
      -- Create missing membership
      insert into memberships(user_id, org_id, role) values (auth.uid(), v_profile.default_org_id, 'owner');
    end if;
  end if;
end$$;

-- RLS
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;

-- Policies
create policy orgs_read on organizations
for select using (is_member(id));

create policy profiles_me on profiles
for select using (id = auth.uid());

create policy memberships_rw on memberships
for all using (user_id = auth.uid());

create policy clients_rw on clients
for all using (is_member(org_id));

create policy projects_rw on projects
for all using (is_member(org_id));

create policy tasks_rw on tasks
for all using (is_member(org_id));

create policy invoices_rw on invoices
for all using (is_member(org_id));

create policy items_rw on invoice_items
for all using (is_member(org_id));

create policy payments_rw on payments
for all using (is_member(org_id));

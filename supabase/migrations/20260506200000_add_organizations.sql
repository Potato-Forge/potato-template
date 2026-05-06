-- Creates the organizations feature:
-- - organizations table
-- - org_members table (org ↔ user)
-- - org_roles table (org ↔ role, for default roles)

-- ─────────────────────────────────────────────
-- 1. organizations
-- ─────────────────────────────────────────────
create table if not exists public.organizations (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  status      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.organizations is 'Top-level organizational units. Users can belong to one or more organizations.';

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- 2. org_members  (org ↔ user many-to-many)
-- ─────────────────────────────────────────────
create table if not exists public.org_members (
  org_id     uuid        not null references public.organizations(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

comment on table public.org_members is 'Membership mapping between organizations and users.';

-- ─────────────────────────────────────────────
-- 3. org_roles  (org ↔ role many-to-many)
-- ─────────────────────────────────────────────
create table if not exists public.org_roles (
  org_id     uuid        not null references public.organizations(id) on delete cascade,
  role_code  text        not null references public.roles(code)       on delete cascade,
  created_at timestamptz not null default now(),
  primary key (org_id, role_code)
);

comment on table public.org_roles is 'Default roles attached to an organization. Members inherit these role permissions automatically.';

-- ─────────────────────────────────────────────
-- 4. RLS
-- ─────────────────────────────────────────────
alter table public.organizations enable row level security;
alter table public.org_members   enable row level security;
alter table public.org_roles     enable row level security;

-- Organizations: admin full access, authenticated read
create policy "admin can manage organizations"
  on public.organizations
  for all
  to authenticated
  using      (public.has_roles(array['admin', 'super_admin']))
  with check (public.has_roles(array['admin', 'super_admin']));

create policy "authenticated users can view organizations"
  on public.organizations
  for select
  to authenticated
  using (true);

-- org_members: admin full access, members can view their own
create policy "admin can manage org_members"
  on public.org_members
  for all
  to authenticated
  using      (public.has_roles(array['admin', 'super_admin']))
  with check (public.has_roles(array['admin', 'super_admin']));

create policy "users can view their own memberships"
  on public.org_members
  for select
  to authenticated
  using (user_id = auth.uid());

-- org_roles: admin full access, authenticated read
create policy "admin can manage org_roles"
  on public.org_roles
  for all
  to authenticated
  using      (public.has_roles(array['admin', 'super_admin']))
  with check (public.has_roles(array['admin', 'super_admin']));

create policy "authenticated users can view org_roles"
  on public.org_roles
  for select
  to authenticated
  using (true);

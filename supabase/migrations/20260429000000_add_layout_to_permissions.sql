alter table public.permissions
add column if not exists layout text;

comment on column public.permissions.layout is
  'App layout template key used by dynamic route generation.';
/*
  @target permissions
  @action backfill and normalize permissions.sort
  @date 2026-04-20
*/

-- Backfill sort per sibling group, preserving relative order as much as possible.
with ranked as (
  select
    p.id,
    row_number() over (
      partition by p.parent_id
      order by
        case when p.sort is null then 1 else 0 end,
        p.sort asc nulls last,
        p.created_at asc,
        p.id asc
    ) as next_sort
  from permissions p
), updated as (
  update permissions p
  set sort = ranked.next_sort
  from ranked
  where p.id = ranked.id
    and p.sort is distinct from ranked.next_sort
  returning p.id
)
select count(*) as updated_rows from updated;

create index if not exists permissions_parent_sort_idx
  on permissions(parent_id, sort);

-- Keep future values sane while still allowing null during transition periods.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'permissions_sort_positive_check'
  ) then
    alter table permissions
      add constraint permissions_sort_positive_check
      check (sort is null or sort >= 1);
  end if;
end
$$;

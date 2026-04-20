/*
  @target permissions
  @action add rpc to reorder permissions by tree drag
  @date 2026-04-20
*/

create or replace function reorder_permissions(updates jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_id bigint;
  v_parent_id bigint;
  v_sort integer;
begin
  if not has_roles(array['admin', 'super_admin']) then
    raise exception 'Insufficient permissions to reorder permissions';
  end if;

  if updates is null or jsonb_typeof(updates) <> 'array' then
    raise exception 'Invalid payload: updates must be a json array';
  end if;

  for item in select * from jsonb_array_elements(updates)
  loop
    v_id := nullif(item->>'id', '')::bigint;
    v_parent_id := nullif(item->>'parent_id', '')::bigint;
    v_sort := nullif(item->>'sort', '')::integer;

    if v_id is null then
      raise exception 'Invalid payload: id is required';
    end if;

    if v_sort is null or v_sort < 1 then
      raise exception 'Invalid payload: sort must be an integer >= 1';
    end if;

    if not exists (select 1 from permissions where id = v_id) then
      raise exception 'Permission % does not exist', v_id;
    end if;

    if v_parent_id is not null then
      if v_parent_id = v_id then
        raise exception 'Invalid parent relation: permission % cannot parent itself', v_id;
      end if;

      if not exists (select 1 from permissions where id = v_parent_id) then
        raise exception 'Parent permission % does not exist', v_parent_id;
      end if;

      if exists (
        with recursive descendants as (
          select id, parent_id
          from permissions
          where parent_id = v_id
          union all
          select p.id, p.parent_id
          from permissions p
          inner join descendants d on p.parent_id = d.id
        )
        select 1
        from descendants
        where id = v_parent_id
      ) then
        raise exception 'Invalid parent relation: cyclic hierarchy detected for permission %', v_id;
      end if;
    end if;

    update permissions
    set
      parent_id = v_parent_id,
      sort = v_sort
    where id = v_id;
  end loop;
end;
$$;

comment on function reorder_permissions(jsonb) is
'Batch reorder permissions tree by updating parent_id and sort. Requires admin or super_admin role.';

-- Run AFTER math-topics.sql. Additive: keep all existing records and RPCs.
begin;
create table if not exists public.kg_player_profiles(
 owner_id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null check(char_length(btrim(nickname)) between 2 and 12 and nickname ~ '^[A-Za-z0-9一-龥 _-]+$'),
 avatar text not null check(avatar in ('boy','girl','slime','dragon'))
);
alter table public.kg_player_profiles enable row level security;
revoke all on public.kg_player_profiles from public,anon,authenticated;
create or replace function public.kg_set_player_profile(p_nickname text,p_avatar text)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 if p_nickname is null or char_length(btrim(p_nickname)) not between 2 and 12 or p_nickname !~ '^[A-Za-z0-9一-龥 _-]+$' then raise exception 'invalid nickname'; end if;
 if p_avatar is null or p_avatar not in ('boy','girl','slime','dragon') then raise exception 'invalid avatar'; end if;
 insert into public.kg_player_profiles(owner_id,nickname,avatar) values(auth.uid(),btrim(p_nickname),p_avatar)
 on conflict(owner_id) do update set nickname=excluded.nickname,avatar=excluded.avatar;
 return jsonb_build_object('saved',true);
end $$;
create or replace function public.kg_submit_profile_score(p_ticket uuid,p_nickname text,p_avatar text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 result:=public.kg_submit_score(p_ticket,p_nickname);
 perform public.kg_set_player_profile(p_nickname,p_avatar);
 return result;
end $$;
create or replace function public.kg_read_player_board(p_topic text,p_difficulty text)
returns table(nickname text,weapon text,duration_ms bigint,accuracy numeric,hp integer,achieved_at timestamptz,avatar text)
language sql security definer set search_path='' as $$
 select coalesce(p.nickname,best.nickname),best.weapon,best.duration_ms,best.accuracy,best.hp,best.achieved_at,coalesce(p.avatar,'boy')
 from (
  select distinct on(s.owner_id) s.owner_id,s.nickname,s.weapon,s.duration_ms,s.accuracy,s.hp,s.achieved_at
  from public.kg_scores s where s.topic=p_topic and s.difficulty=p_difficulty
  order by s.owner_id,s.duration_ms,s.accuracy desc,s.hp desc,s.achieved_at,s.route
 ) best left join public.kg_player_profiles p on p.owner_id=best.owner_id
 order by best.duration_ms,best.accuracy desc,best.hp desc,best.achieved_at,best.owner_id limit 50
$$;
revoke all on function public.kg_set_player_profile(text,text),public.kg_submit_profile_score(uuid,text,text),public.kg_read_player_board(text,text) from public,anon;
grant execute on function public.kg_set_player_profile(text,text),public.kg_submit_profile_score(uuid,text,text),public.kg_read_player_board(text,text) to authenticated;
commit;

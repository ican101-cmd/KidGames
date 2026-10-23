-- Merge old route records at read time; retain all existing data and RPC compatibility.
create or replace function public.kg_read_board(p_difficulty text,p_route text)
returns table(nickname text,weapon text,duration_ms bigint,accuracy numeric,hp integer,achieved_at timestamptz)
language sql security definer set search_path='' as $$
 select best.nickname,best.weapon,best.duration_ms,best.accuracy,best.hp,best.achieved_at
 from (
   select distinct on (s.owner_id) s.owner_id,s.nickname,s.weapon,s.duration_ms,s.accuracy,s.hp,s.achieved_at
   from public.kg_scores s where s.difficulty=p_difficulty
   order by s.owner_id,s.duration_ms asc,s.accuracy desc,s.hp desc,s.achieved_at asc,s.route asc
 ) best
 order by best.duration_ms asc,best.accuracy desc,best.hp desc,best.achieved_at asc,best.owner_id asc limit 50
$$;
revoke all on function public.kg_read_board(text,text) from public,anon;
grant execute on function public.kg_read_board(text,text) to authenticated;

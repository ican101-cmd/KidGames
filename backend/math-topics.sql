-- Run AFTER leaderboard.sql (existing players already have it). Additive, no record deletion.
begin;
alter table public.kg_runs add column if not exists topic text not null default 'arithmetic' check(topic in ('arithmetic','factors','decimals','fractions'));
alter table public.kg_scores add column if not exists topic text not null default 'arithmetic' check(topic in ('arithmetic','factors','decimals','fractions'));
-- Upgrade the existing two-topic constraints without deleting any records.
alter table public.kg_runs drop constraint if exists kg_runs_topic_check;
alter table public.kg_runs add constraint kg_runs_topic_check check(topic in ('arithmetic','factors','decimals','fractions'));
alter table public.kg_scores drop constraint if exists kg_scores_topic_check;
alter table public.kg_scores add constraint kg_scores_topic_check check(topic in ('arithmetic','factors','decimals','fractions'));
alter table public.kg_scores drop constraint if exists kg_scores_pkey;
alter table public.kg_scores add constraint kg_scores_pkey primary key(owner_id,topic,difficulty,route);

create or replace function public.kg_start_topic_run(p_topic text,p_difficulty text,p_weapon text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare ticket jsonb;
begin
 if p_topic is null or p_topic not in ('arithmetic','factors','decimals','fractions') then raise exception 'invalid topic'; end if;
 ticket:=public.kg_start_run(p_difficulty,p_weapon);
 update public.kg_runs set topic=p_topic where id=(ticket->>'id')::uuid and owner_id=auth.uid();
 return ticket;
end $$;

create or replace function public.kg_submit_score(p_ticket uuid,p_nickname text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.kg_runs; ratio numeric;
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 if p_nickname is null or char_length(btrim(p_nickname)) not between 2 and 12 or p_nickname !~ '^[A-Za-z0-9一-龥 _-]+$' then raise exception 'invalid nickname'; end if;
 select * into r from public.kg_runs where id=p_ticket and owner_id=auth.uid() for update;
 if not found or r.finished_at is null then raise exception 'unfinished result'; end if;
 if r.submitted then return jsonb_build_object('accepted',true); end if;
 ratio:=r.correct::numeric/r.attempts;
 insert into public.kg_scores as best(owner_id,topic,difficulty,route,nickname,weapon,duration_ms,accuracy,hp,achieved_at)
 values(r.owner_id,r.topic,r.difficulty,r.route,btrim(p_nickname),r.weapon,r.duration_ms,ratio,r.hp,r.finished_at)
 on conflict(owner_id,topic,difficulty,route) do update
 set nickname=excluded.nickname,weapon=excluded.weapon,duration_ms=excluded.duration_ms,accuracy=excluded.accuracy,hp=excluded.hp,achieved_at=excluded.achieved_at
 where (excluded.duration_ms,-excluded.accuracy,-excluded.hp)<(best.duration_ms,-best.accuracy,-best.hp);
 update public.kg_runs set submitted=true where id=p_ticket;
 return jsonb_build_object('accepted',true);
end $$;

create or replace function public.kg_read_topic_board(p_topic text,p_difficulty text)
returns table(nickname text,weapon text,duration_ms bigint,accuracy numeric,hp integer,achieved_at timestamptz)
language sql security definer set search_path='' as $$
 select best.nickname,best.weapon,best.duration_ms,best.accuracy,best.hp,best.achieved_at
 from (
  select distinct on(s.owner_id) s.owner_id,s.nickname,s.weapon,s.duration_ms,s.accuracy,s.hp,s.achieved_at
  from public.kg_scores s where s.topic=p_topic and s.difficulty=p_difficulty
  order by s.owner_id,s.duration_ms asc,s.accuracy desc,s.hp desc,s.achieved_at asc,s.route asc
 ) best
 order by best.duration_ms asc,best.accuracy desc,best.hp desc,best.achieved_at asc,best.owner_id asc limit 50
$$;
-- Existing clients continue to read only the arithmetic board.
create or replace function public.kg_read_board(p_difficulty text,p_route text)
returns table(nickname text,weapon text,duration_ms bigint,accuracy numeric,hp integer,achieved_at timestamptz)
language sql security definer set search_path='' as $$
 select * from public.kg_read_topic_board('arithmetic',p_difficulty)
$$;
revoke all on function public.kg_start_topic_run(text,text,text),public.kg_read_topic_board(text,text) from public,anon;
grant execute on function public.kg_start_topic_run(text,text,text),public.kg_read_topic_board(text,text) to authenticated;
commit;

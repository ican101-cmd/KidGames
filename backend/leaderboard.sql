-- Run once in Supabase SQL Editor. No table is directly writable by the browser.
create table if not exists public.kg_runs (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 difficulty text not null check (difficulty in ('easy','medium','boss')),
 weapon text not null check (weapon in ('wood_sword','iron_sword','magic_wand','silver_spear','golden_bow','diamond_sword')),
 started_at timestamptz not null default clock_timestamp(),
 finished_at timestamptz, route text check (route in ('safe','risk')),
 correct integer, attempts integer, hp integer, duration_ms bigint, submitted boolean not null default false
);
create index if not exists kg_runs_owner_started on public.kg_runs(owner_id,started_at desc);
create table if not exists public.kg_scores (
 owner_id uuid not null references auth.users(id) on delete cascade,
 difficulty text not null, route text not null,
 nickname text not null, weapon text not null,
 duration_ms bigint not null, accuracy numeric not null, hp integer not null,
 achieved_at timestamptz not null,
 primary key(owner_id,difficulty,route)
);
alter table public.kg_runs enable row level security;
alter table public.kg_scores enable row level security;
revoke all on public.kg_runs,public.kg_scores from anon,authenticated;

create or replace function public.kg_start_run(p_difficulty text,p_weapon text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'authentication required'; end if;
 -- Serialize starts per account, preventing parallel requests from evading the limit.
 perform pg_advisory_xact_lock(hashtextextended(v_uid::text,0));
 if (select count(*) from public.kg_runs where owner_id=v_uid and started_at>clock_timestamp()-interval '1 hour')>=30 then raise exception 'start limit'; end if;
 insert into public.kg_runs(owner_id,difficulty,weapon) values(v_uid,p_difficulty,p_weapon) returning id into v_id;
 return jsonb_build_object('id',v_id);
end $$;

create or replace function public.kg_finish_run(p_ticket uuid,p_route text,p_correct integer,p_attempts integer,p_hp integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.kg_runs; elapsed bigint; minimum integer;
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 select * into r from public.kg_runs where id=p_ticket and owner_id=auth.uid() for update;
 if not found then raise exception 'unknown run'; end if;
 if r.finished_at is not null then return jsonb_build_object('duration_ms',r.duration_ms); end if;
 elapsed:=floor(extract(epoch from(clock_timestamp()-r.started_at))*1000);
 minimum:=case when p_route='safe' then 8 else 6 end;
 if p_route is null or p_route not in ('safe','risk') or p_correct is null or p_attempts is null or p_hp is null
 or p_correct<minimum or p_attempts<p_correct or p_attempts>10000 or p_hp<1 or p_hp>100
 or elapsed<greatest(6000,p_attempts*450) or elapsed>604800000 then raise exception 'invalid result'; end if;
 update public.kg_runs set finished_at=clock_timestamp(),route=p_route,correct=p_correct,attempts=p_attempts,hp=p_hp,duration_ms=elapsed where id=p_ticket;
 return jsonb_build_object('duration_ms',elapsed);
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
 insert into public.kg_scores as best(owner_id,difficulty,route,nickname,weapon,duration_ms,accuracy,hp,achieved_at)
 values(r.owner_id,r.difficulty,r.route,btrim(p_nickname),r.weapon,r.duration_ms,ratio,r.hp,r.finished_at)
 on conflict(owner_id,difficulty,route) do update
 set nickname=excluded.nickname,weapon=excluded.weapon,duration_ms=excluded.duration_ms,accuracy=excluded.accuracy,hp=excluded.hp,achieved_at=excluded.achieved_at
 where (excluded.duration_ms,-excluded.accuracy,-excluded.hp)<(best.duration_ms,-best.accuracy,-best.hp);
 update public.kg_runs set submitted=true where id=p_ticket;
 return jsonb_build_object('accepted',true);
end $$;

create or replace function public.kg_read_board(p_difficulty text,p_route text)
returns table(nickname text,weapon text,duration_ms bigint,accuracy numeric,hp integer,achieved_at timestamptz)
language sql security definer set search_path='' as $$
 select s.nickname,s.weapon,s.duration_ms,s.accuracy,s.hp,s.achieved_at
 from public.kg_scores s where s.difficulty=p_difficulty and s.route=p_route
 order by s.duration_ms asc,s.accuracy desc,s.hp desc,s.achieved_at asc,s.owner_id asc limit 50
$$;
revoke all on function public.kg_start_run(text,text),public.kg_finish_run(uuid,text,integer,integer,integer),public.kg_submit_score(uuid,text),public.kg_read_board(text,text) from public,anon;
grant execute on function public.kg_start_run(text,text),public.kg_finish_run(uuid,text,integer,integer,integer),public.kg_submit_score(uuid,text),public.kg_read_board(text,text) to authenticated;

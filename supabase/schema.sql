-- Colle tout ce fichier dans Supabase > SQL Editor > Run
create table sessions(id int primary key,label text,title text,description text,capacity int,open bool default true);
insert into sessions values
(1,'16h','Première intervention','Découverte du Lead d''intervention, première mise en situation et observation des capacités de commandement.',null,true),
(2,'18h','Deuxième intervention','Mise en pratique des techniques abordées et évaluation dans une situation encadrée.',null,true),
(3,'19h','Troisième intervention','Nouvelle opportunité de découvrir le Lead d''intervention et de démontrer ses compétences.',null,true);
create table settings(k text primary key,v text);
insert into settings values('final_capacity','30'),('final_open','true');
create table registrations(id uuid primary key default gen_random_uuid(),created_at timestamptz default now(),
 discord text not null,rp_name text not null,grade text not null,session_id int references sessions(id),motivation text not null,
 status text not null default 'confirmed' check(status in('confirmed','waitlist','pending','refused')),
 token text not null default encode(gen_random_bytes(6),'hex'));
create unique index reg_discord on registrations(lower(discord));
create table final_signups(id uuid primary key default gen_random_uuid(),created_at timestamptz default now(),
 discord text not null,rp_name text not null,status text not null default 'confirmed' check(status in('confirmed','waitlist','pending','refused')),
 team int check(team in(1,2)),token text not null default encode(gen_random_bytes(6),'hex'));
create unique index fin_discord on final_signups(lower(discord));
create table evaluations(registration_id uuid primary key references registrations(id) on delete cascade,
 scores jsonb,comments jsonb,strengths text,improvements text,final_comment text,result text);
create table admins(email text primary key);
-- Sécurité : RLS activée SANS aucune règle = personne n'accède aux données depuis le navigateur.
-- Seul le serveur du site (clé service_role) lit/écrit.
alter table sessions enable row level security;alter table settings enable row level security;
alter table registrations enable row level security;alter table final_signups enable row level security;
alter table evaluations enable row level security;alter table admins enable row level security;
-- Inscription atomique (évite les dépassements de places si 2 personnes cliquent en même temps)
create function register_session(p_discord text,p_rp text,p_grade text,p_session int,p_motiv text)
returns table(o_token text,o_status text) language plpgsql security definer as $$
declare s sessions;n int;st text;
begin perform pg_advisory_xact_lock(1);
 select * into s from sessions where id=p_session;
 if s.id is null or not s.open then raise exception 'closed';end if;
 select count(*) into n from registrations where session_id=p_session and status='confirmed';
 st:=case when s.capacity is not null and n>=s.capacity then 'waitlist' else 'confirmed' end;
 insert into registrations(discord,rp_name,grade,session_id,motivation,status)values(p_discord,p_rp,p_grade,p_session,p_motiv,st)
 returning registrations.token,registrations.status into o_token,o_status;return next;end$$;
create function register_final(p_discord text,p_rp text)
returns table(o_token text,o_status text) language plpgsql security definer as $$
declare cap int;n int;st text;
begin perform pg_advisory_xact_lock(2);
 if (select v from settings where k='final_open')<>'true' then raise exception 'closed';end if;
 select v::int into cap from settings where k='final_capacity';
 select count(*) into n from final_signups where status='confirmed';
 st:=case when n>=cap then 'waitlist' else 'confirmed' end;
 insert into final_signups(discord,rp_name,status)values(p_discord,p_rp,st)
 returning final_signups.token,final_signups.status into o_token,o_status;return next;end$$;
revoke execute on function register_session,register_final from public,anon,authenticated;

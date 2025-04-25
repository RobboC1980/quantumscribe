-- Enable UUID generation and extensions
create extension if not exists "pgcrypto";

-- ──────────── 1) USERS ─────────────────――――――――――――――――――――
create table auth.users (
  id            uuid          primary key default gen_random_uuid(),
  email         text          not null unique,
  password_hash text          not null,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);

alter table auth.users enable row level security;

create policy users_select_own on auth.users
  for select using (auth.uid() = id);

create policy users_insert_own on auth.users
  for insert with check (auth.uid() = id);

create policy users_update_own on auth.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ──────────── 2) PROJECTS ─────────────────――――――――――――――
create table public.projects (
  id          uuid          primary key default gen_random_uuid(),
  owner_id    uuid          not null references auth.users(id) on delete cascade,
  name        text          not null,
  description text          default '',
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

alter table public.projects enable row level security;

create policy projects_select_own on public.projects
  for select using (owner_id = auth.uid());

create policy projects_insert_own on public.projects
  for insert with check (owner_id = auth.uid());

create policy projects_update_own on public.projects
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy projects_delete_own on public.projects
  for delete using (owner_id = auth.uid());

-- ──────────── 3) EPICS ─────────────────――――――――――――――――――――
create table public.epics (
  id          uuid          primary key default gen_random_uuid(),
  project_id  uuid          not null references public.projects(id) on delete cascade,
  title       text          not null,
  description text          default '',
  sort_order  int           not null default 0,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

alter table public.epics enable row level security;

create policy epics_select_own on public.epics
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = public.epics.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy epics_insert_own on public.epics
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = new.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy epics_update_own on public.epics
  for update using (
    exists (
      select 1 from public.projects p
      where p.id = public.epics.project_id
        and p.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = new.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy epics_delete_own on public.epics
  for delete using (
    exists (
      select 1 from public.projects p
      where p.id = public.epics.project_id
        and p.owner_id = auth.uid()
    )
  );

-- ──────────── 4) STORIES ─────────────────――――――――――――――――――
create type public.story_status as enum ('todo','in_progress','done');

create table public.stories (
  id          uuid               primary key default gen_random_uuid(),
  epic_id     uuid               not null references public.epics(id) on delete cascade,
  title       text               not null,
  description text               default '',
  status      public.story_status not null default 'todo',
  sort_order  int                not null default 0,
  created_at  timestamptz        not null default now(),
  updated_at  timestamptz        not null default now()
);

alter table public.stories enable row level security;

create policy stories_select_own on public.stories
  for select using (
    exists (
      select 1 from public.epics e
      join public.projects p on p.id = e.project_id
      where e.id = public.stories.epic_id
        and p.owner_id = auth.uid()
    )
  );

create policy stories_insert_own on public.stories
  for insert with check (
    exists (
      select 1 from public.epics e
      join public.projects p on p.id = e.project_id
      where e.id = new.epic_id
        and p.owner_id = auth.uid()
    )
  );

create policy stories_update_own on public.stories
  for update using (
    exists (
      select 1 from public.epics e
      join public.projects p on p.id = e.project_id
      where e.id = public.stories.epic_id
        and p.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.epics e
      join public.projects p on p.id = e.project_id
      where e.id = new.epic_id
        and p.owner_id = auth.uid()
    )
  );

create policy stories_delete_own on public.stories
  for delete using (
    exists (
      select 1 from public.epics e
      join public.projects p on p.id = e.project_id
      where e.id = public.stories.epic_id
        and p.owner_id = auth.uid()
    )
  );

-- ──────────── 5) UTILITY: STATS VIEW ─────────────────――――
create view public.dashboard_stats as
select
  auth.uid() as user_id,
  (select count(1) from public.projects p where p.owner_id = auth.uid())   as project_count,
  (select count(1) from public.epics e                                          where exists (
        select 1 from public.projects p
        where p.id = e.project_id and p.owner_id = auth.uid()
      )
  ) as epic_count,
  (select count(1) from public.stories s                                        where exists (
        select 1 from public.epics e
        join public.projects p on p.id = e.project_id
        where e.id = s.epic_id and p.owner_id = auth.uid()
      )
  ) as story_count; 
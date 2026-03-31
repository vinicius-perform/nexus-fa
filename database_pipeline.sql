-- Modelagem para Gestão Dinâmica de Pipeline (FA Nexus)

-- Tabela: fa_roles (Cargos)
create table public.fa_roles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text default 'UserCircle',
  is_active boolean default true not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela: fa_pipeline_stages (Etapas do Cargo)
create table public.fa_pipeline_stages (
  id uuid default gen_random_uuid() primary key,
  role_id uuid references public.fa_roles(id) on delete cascade not null,
  title text not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela: fa_pipeline_tasks (Tarefas de uma Etapa)
create table public.fa_pipeline_tasks (
  id uuid default gen_random_uuid() primary key,
  stage_id uuid references public.fa_pipeline_stages(id) on delete cascade not null,
  title text not null,
  description text,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Permitir leitura e escrita para funcionar de modo dinâmico no App
alter table public.fa_roles enable row level security;
alter table public.fa_pipeline_stages enable row level security;
alter table public.fa_pipeline_tasks enable row level security;

create policy "Allow all on fa_roles" on public.fa_roles for all using (true);
create policy "Allow all on fa_pipeline_stages" on public.fa_pipeline_stages for all using (true);
create policy "Allow all on fa_pipeline_tasks" on public.fa_pipeline_tasks for all using (true);

-- Indexes para performance
create index idx_fa_pipeline_stages_role_id on public.fa_pipeline_stages(role_id);
create index idx_fa_pipeline_tasks_stage_id on public.fa_pipeline_tasks(stage_id);

-- Triggers de timestamp existiam do arquivo anterior (handle_updated_at function)
create trigger trigger_fa_roles_updated_at before update on public.fa_roles for each row execute function public.handle_updated_at();
create trigger trigger_fa_pipeline_stages_updated_at before update on public.fa_pipeline_stages for each row execute function public.handle_updated_at();
create trigger trigger_fa_pipeline_tasks_updated_at before update on public.fa_pipeline_tasks for each row execute function public.handle_updated_at();

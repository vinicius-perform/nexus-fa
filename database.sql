-- Tabela: fa_checklists
create table public.fa_checklists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  public_id text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela: fa_checklist_groups
create table public.fa_checklist_groups (
  id uuid default gen_random_uuid() primary key,
  checklist_id uuid references public.fa_checklists(id) on delete cascade not null,
  name text not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela: fa_checklist_tasks
create table public.fa_checklist_tasks (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.fa_checklist_groups(id) on delete cascade not null,
  name text not null,
  responsible text,
  is_completed boolean default false not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Permitir Acesso Público Anônimo para Visualização e Edição de TAREFAS
-- (Recomendado apenas se você quiser que qualquer pessoa com o link gerencie sem auth real. No entanto, em um dashboard interno, você faria um check de login. Pro módulo de checklist "public" funcionar sem login, precisamos liberar esse RLS)

alter table public.fa_checklists enable row level security;
alter table public.fa_checklist_groups enable row level security;
alter table public.fa_checklist_tasks enable row level security;

-- Políticas: Acesso Público Total (ou ajustar conforme painel do Supabase se necessário)
create policy "Allow all on fa_checklists" on public.fa_checklists for all using (true);
create policy "Allow all on fa_checklist_groups" on public.fa_checklist_groups for all using (true);
create policy "Allow all on fa_checklist_tasks" on public.fa_checklist_tasks for all using (true);

-- Indexes para performance do banco
create index idx_fa_checklists_public_id on public.fa_checklists(public_id);
create index idx_fa_checklist_groups_checklist_id on public.fa_checklist_groups(checklist_id);
create index idx_fa_checklist_tasks_group_id on public.fa_checklist_tasks(group_id);

-- Função simples de atualização de updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers de timestamp
create trigger trigger_fa_checklists_updated_at before update on public.fa_checklists for each row execute function public.handle_updated_at();
create trigger trigger_fa_checklist_groups_updated_at before update on public.fa_checklist_groups for each row execute function public.handle_updated_at();
create trigger trigger_fa_checklist_tasks_updated_at before update on public.fa_checklist_tasks for each row execute function public.handle_updated_at();

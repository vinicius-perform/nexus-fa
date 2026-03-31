import { supabase } from './supabase';

/**
 * Funções auxiliares para lidar com a comunicação com o Supabase para o módulo de Gestão de Pipeline.
 */

// Buscar Cargos, Etapas e Tarefas de forma aninhada
export const getFullPipelineData = async () => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('fa_roles')
        .select(`
            *,
            fa_pipeline_stages (
                *,
                fa_pipeline_tasks (*)
            )
        `)
        .order('order', { ascending: true });

    if (error) {
        console.error('Error fetching pipeline data:', error);
        throw error;
    }

    // Ordenar itens aninhados para exibição correta
    if (data) {
        data.forEach(role => {
            if (role.fa_pipeline_stages) {
                // Ordenar etapas
                role.fa_pipeline_stages.sort((a, b) => a.order - b.order);
                role.fa_pipeline_stages.forEach(stage => {
                    // Mapeia o nome "title" também para "name" para retro-compatibilidade do pipeline
                    stage.title = stage.title || stage.name;
                    if (stage.fa_pipeline_tasks) {
                        // Ordenar tarefas
                        stage.fa_pipeline_tasks.sort((a, b) => a.order - b.order);
                    }
                });
            }
        });
    }

    return data;
};

// ----------------- CARGOS (ROLES) -----------------

export const createRole = async (roleData) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
        .from('fa_roles')
        .insert({
            name: roleData.name,
            description: roleData.description || '',
            icon: roleData.icon || 'UserCircle',
            order: roleData.order || 0,
            is_active: roleData.is_active !== undefined ? roleData.is_active : true
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateRole = async (id, roleData) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
        .from('fa_roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteRole = async (id) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
        .from('fa_roles')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export const updateRolesOrder = async (orderMap) => {
    if (!supabase) return;

    // orderMap = [{ id: 'uuid', order: 0 }, { id: 'uuid2', order: 1 }]
    for (const item of orderMap) {
        await supabase.from('fa_roles').update({ order: item.order }).eq('id', item.id);
    }
};

// ----------------- ETAPAS (STAGES) -----------------

export const createStage = async (stageData) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
        .from('fa_pipeline_stages')
        .insert(stageData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateStage = async (id, stageData) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
        .from('fa_pipeline_stages')
        .update(stageData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteStage = async (id) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
        .from('fa_pipeline_stages')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export const updateStagesOrder = async (orderMap) => {
    if (!supabase) return;

    for (const item of orderMap) {
        await supabase.from('fa_pipeline_stages').update({ order: item.order }).eq('id', item.id);
    }
};


// ----------------- TAREFAS (TASKS) -----------------

export const createTask = async (taskData) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
        .from('fa_pipeline_tasks')
        .insert(taskData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateTask = async (id, taskData) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
        .from('fa_pipeline_tasks')
        .update(taskData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteTask = async (id) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
        .from('fa_pipeline_tasks')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export const updateTasksOrder = async (orderMap) => {
    if (!supabase) return;

    for (const item of orderMap) {
        await supabase.from('fa_pipeline_tasks').update({ order: item.order }).eq('id', item.id);
    }
};

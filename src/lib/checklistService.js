import { supabase } from './supabase';

/**
 * Funções auxiliares para lidar com a comunicação com o Supabase para o módulo Checklist.
 */

export const getChecklists = async () => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('fa_checklists')
        .select(`
            *,
            fa_checklist_groups(
                *,
                fa_checklist_tasks(*)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching checklists:', error);
        throw error;
    }
    return data;
};

export const getPublicChecklist = async (publicId) => {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('fa_checklists')
        .select(`
            *,
            fa_checklist_groups(
                *,
                fa_checklist_tasks(*)
            )
        `)
        .eq('public_id', publicId)
        .single();

    if (error) {
        console.error('Error fetching public checklist:', error);
        throw error;
    }

    // Ordenar grupos e tarefas
    if (data && data.fa_checklist_groups) {
        data.fa_checklist_groups.sort((a, b) => a.order - b.order);
        data.fa_checklist_groups.forEach(group => {
            if (group.fa_checklist_tasks) {
                group.fa_checklist_tasks.sort((a, b) => a.order - b.order);
            }
        });
    }

    return data;
};

export const createChecklist = async (checklistData) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    // 1. Inserir checklist
    const publicId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data: checklist, error: checklistError } = await supabase
        .from('fa_checklists')
        .insert({
            name: checklistData.name,
            public_id: publicId
        })
        .select()
        .single();

    if (checklistError) {
        console.error('Error creating checklist:', checklistError);
        throw checklistError;
    }

    // 2. Inserir grupos
    for (let i = 0; i < checklistData.groups.length; i++) {
        const groupData = checklistData.groups[i];
        
        const { data: group, error: groupError } = await supabase
            .from('fa_checklist_groups')
            .insert({
                checklist_id: checklist.id,
                name: groupData.name,
                order: i
            })
            .select()
            .single();
            
        if (groupError) {
            console.error('Error creating group:', groupError);
            throw groupError;
        }

        // 3. Inserir tarefas (com responsável opcional)
        if (groupData.tasks && groupData.tasks.length > 0) {
            const tasksToInsert = groupData.tasks.map((task, index) => ({
                group_id: group.id,
                name: task.name,
                responsible: task.responsible || null,
                order: index,
                is_completed: false
            }));

            const { error: tasksError } = await supabase
                .from('fa_checklist_tasks')
                .insert(tasksToInsert);

            if (tasksError) {
                console.error('Error creating tasks:', tasksError);
                throw tasksError;
            }
        }
    }

    return checklist;
};

export const deleteChecklist = async (id) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
        .from('fa_checklists')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting checklist:', error);
        throw error;
    }
    return true;
};

export const toggleTaskStatus = async (taskId, isCompleted) => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
        .from('fa_checklist_tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId);

    if (error) {
        console.error('Error updating task status:', error);
        throw error;
    }
    return true;
};

export const updateTaskResponsible = async (taskId, responsible) => {
    const { error } = await supabase
        .from('fa_checklist_tasks')
        .update({ responsible: responsible })
        .eq('id', taskId);

    if (error) {
        console.error('Error updating task responsible:', error);
        throw error;
    }
    return true;
};

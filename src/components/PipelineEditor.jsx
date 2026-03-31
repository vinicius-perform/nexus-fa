import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { 
  createStage, deleteStage, updateStagesOrder, updateStage,
  createTask, deleteTask, updateTasksOrder, updateTask
} from '../lib/pipelineService';
import * as Icons from 'lucide-react';

const TaskItem = ({ task, onTaskDelete, onTaskMove, onTaskEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');

  const handleSave = () => {
    onTaskEdit(task.id, editTitle, editDesc);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white/5 rounded-2xl border border-accent/50 mt-3 p-4">
        <input 
          className="w-full bg-black/50 border-b border-white/10 px-4 py-3 mb-3 focus:outline-none focus:border-accent text-white rounded-t-xl"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          autoFocus
        />
        <textarea 
          className="w-full bg-black/50 border border-white/10 rounded-xl rounded-t-none px-4 py-3 text-sm focus:outline-none focus:border-accent text-white resize-none min-h-[80px]"
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setIsEditing(false)} className="text-sm text-text-secondary hover:text-white px-4 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="text-sm bg-accent text-black font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.3)]">Salvar Alterações</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/5 mt-3 group transition-all hover:bg-white/10">
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <Icons.GripVertical size={16} className="text-white/20" />
          <span className="font-medium">{task.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsEditing(true)} className="p-1 hover:text-accent"><Icons.Edit2 size={16} /></button>
            <button onClick={() => onTaskMove(task, -1)} className="p-1 hover:text-accent"><Icons.ArrowUp size={16} /></button>
            <button onClick={() => onTaskMove(task, 1)} className="p-1 hover:text-accent"><Icons.ArrowDown size={16} /></button>
            <button onClick={() => onTaskDelete(task.id)} className="p-1 text-red-500 hover:text-red-400 ml-2"><Icons.Trash2 size={16} /></button>
          </div>
          <Icons.ChevronDown size={18} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 text-sm text-text-secondary border-t border-white/5 mt-2 whitespace-pre-wrap">
              {task.description || 'Nenhuma instrução detalhada.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StageCard = ({ stage, onStageDelete, onStageMove, onStageEdit, refreshGlobalState }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingStageTitle, setIsEditingStageTitle] = useState(false);
  const [editStageTitle, setEditStageTitle] = useState(stage.title);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const tasks = stage.fa_pipeline_tasks || [];

  const handleStageSave = async () => {
    if(!editStageTitle.trim()) return;
    await onStageEdit(stage.id, editStageTitle);
    setIsEditingStageTitle(false);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setLoading(true);
    try {
      const created = await createTask({
        stage_id: stage.id,
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        order: tasks.length
      });
      stage.fa_pipeline_tasks = [...tasks, created];
      refreshGlobalState();
      setIsAddingTask(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (e) {
      alert('Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if(!confirm('Excluir tarefa?')) return;
    await deleteTask(taskId);
    stage.fa_pipeline_tasks = tasks.filter(t => t.id !== taskId);
    refreshGlobalState();
  };

  const handleTaskEdit = async (taskId, title, desc) => {
    try {
      const updated = await updateTask(taskId, {
        title: title.trim(),
        description: desc.trim()
      });
      const idx = tasks.findIndex(t => t.id === taskId);
      tasks[idx] = updated;
      refreshGlobalState();
    } catch (e) {
      alert('Erro ao editar tarefa');
    }
  };

  const handleTaskMove = async (task, step) => {
    const idx = tasks.findIndex(t => t.id === task.id);
    const newIdx = idx + step;
    if (newIdx < 0 || newIdx >= tasks.length) return;
    
    // Swap
    const newTasks = [...tasks];
    [newTasks[idx], newTasks[newIdx]] = [newTasks[newIdx], newTasks[idx]];
    
    // Reassing orders
    const orderMap = newTasks.map((t, i) => {
      t.order = i;
      return { id: t.id, order: i };
    });
    
    stage.fa_pipeline_tasks = newTasks;
    refreshGlobalState();
    await updateTasksOrder(orderMap);
  };

  return (
    <div className="glass p-6 rounded-[32px] border border-white/10 relative group">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-black">{stage.order + 1}</div>
          {isEditingStageTitle ? (
            <div className="flex items-center gap-2">
              <input 
                className="bg-black/50 border-b border-white/20 px-3 py-1 text-xl font-bold focus:outline-none focus:border-accent text-white"
                value={editStageTitle}
                onChange={e => setEditStageTitle(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleStageSave()}
              />
              <button onClick={handleStageSave} className="text-accent hover:scale-110"><Icons.Check size={20} /></button>
              <button onClick={() => setIsEditingStageTitle(false)} className="text-red-400 hover:scale-110"><Icons.X size={20} /></button>
            </div>
          ) : (
            <h4 className="text-xl font-bold flex items-center gap-2 group/title cursor-pointer" onClick={() => setIsEditingStageTitle(true)}>
              {stage.title}
              <Icons.Edit2 size={16} className="text-text-secondary opacity-0 group-hover/title:opacity-100 transition-opacity" />
            </h4>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onStageMove(stage, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10"><Icons.ArrowUp size={16} /></button>
          <button onClick={() => onStageMove(stage, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10"><Icons.ArrowDown size={16} /></button>
          <button onClick={() => onStageDelete(stage.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 ml-2"><Icons.Trash2 size={16} /></button>
        </div>
      </div>

      <div className="mb-6">
        {tasks.map(task => (
           <TaskItem 
             key={task.id} 
             task={task} 
             onTaskDelete={handleTaskDelete} 
             onTaskMove={handleTaskMove} 
             onTaskEdit={handleTaskEdit} 
           />
        ))}
        {tasks.length === 0 && <p className="text-text-secondary text-sm my-4">Nenhuma tarefa nesta etapa.</p>}
      </div>

      {isAddingTask ? (
        <div className="bg-black/40 p-4 rounded-2xl border border-accent/20">
          <input 
            className="w-full bg-transparent border-b border-white/10 px-2 py-2 mb-3 focus:outline-none focus:border-accent text-white placeholder:text-white/30"
            placeholder="Título da Tarefa"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            autoFocus
          />
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent text-white resize-none min-h-[80px] placeholder:text-white/30"
            placeholder="Instruções / Descrição detalhada (SOP)"
            value={newTaskDesc}
            onChange={e => setNewTaskDesc(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsAddingTask(false)} className="text-sm text-text-secondary hover:text-white px-4">Cancelar</button>
            <button onClick={handleAddTask} disabled={loading} className="text-sm bg-accent text-black font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform">{loading ? '...' : 'Salvar'}</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsAddingTask(true)}
          className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Icons.Plus size={18} /> Add Tarefa
        </button>
      )}
    </div>
  );
};

const PipelineEditor = ({ role, onBack }) => {
  const { roles, setRoles, pipelines, setPipelines } = useAppContext();
  const [newStageTitle, setNewStageTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Derive current stages from global context to keep reactivity
  const currentRole = roles.find(r => r.id === role.id) || role;
  const stages = currentRole.fa_pipeline_stages || [];

  // Helper para atualizar o global state do Context
  const refreshGlobalState = () => {
    const updatedRoles = [...roles];
    const roleIdx = updatedRoles.findIndex(r => r.id === role.id);
    if(roleIdx > -1) {
       updatedRoles[roleIdx] = {...currentRole};
    }
    setRoles(updatedRoles);

    // Sync do pipeline derivado para a tela Operacional (Dashboard)
    const newPipelines = {...pipelines};
    newPipelines[role.id] = updatedRoles[roleIdx].fa_pipeline_stages.map(st => ({
       ...st,
       tasks: st.fa_pipeline_tasks || [],
       completedTasks: [] // Clear on edit just to be safe, or preserve if needed.
    }));
    setPipelines(newPipelines);
  };

  const handleAddStage = async () => {
    if (!newStageTitle.trim()) return;
    setLoading(true);
    try {
      const created = await createStage({
        role_id: role.id,
        title: newStageTitle.trim(),
        order: stages.length
      });
      created.fa_pipeline_tasks = [];
      currentRole.fa_pipeline_stages = [...stages, created];
      refreshGlobalState();
      setNewStageTitle('');
    } catch(e) {
      alert("Erro ao criar etapa.");
    } finally {
      setLoading(false);
    }
  };

  const handleStageDelete = async (stageId) => {
    if(!confirm("Tem certeza que deseja apagar essa etapa inteira?")) return;
    await deleteStage(stageId);
    currentRole.fa_pipeline_stages = stages.filter(s => s.id !== stageId);
    refreshGlobalState();
  };

  const handleStageEdit = async (stageId, newTitle) => {
    try {
      const updated = await updateStage(stageId, { title: newTitle.trim() });
      const idx = stages.findIndex(s => s.id === stageId);
      stages[idx].title = updated.title;
      refreshGlobalState();
    } catch(e) {
      alert("Erro ao editar etapa.");
    }
  };

  const handleStageMove = async (stage, step) => {
    const idx = stages.findIndex(s => s.id === stage.id);
    const newIdx = idx + step;
    if (newIdx < 0 || newIdx >= stages.length) return;

    const newStages = [...stages];
    [newStages[idx], newStages[newIdx]] = [newStages[newIdx], newStages[idx]];

    const orderMap = newStages.map((s, i) => {
       s.order = i;
       return { id: s.id, order: i };
    });
    
    currentRole.fa_pipeline_stages = newStages;
    refreshGlobalState();
    await updateStagesOrder(orderMap);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 pb-8 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
             <Icons.ArrowLeft size={24} />
          </button>
          <div>
            <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] block mb-2">Editando Cargo</span>
            <h2 className="text-4xl font-black text-white">{currentRole.name}</h2>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 flex flex-col gap-6">
        {stages.map(stage => (
           <StageCard 
             key={stage.id} 
             stage={stage} 
             onStageDelete={handleStageDelete} 
             onStageMove={handleStageMove} 
             onStageEdit={handleStageEdit}
             refreshGlobalState={refreshGlobalState}
           />
        ))}

        <div className="glass p-8 rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center mt-4">
           <h4 className="text-xl font-bold mb-4">Adicionar Nova Etapa</h4>
           <div className="flex w-full max-w-xl relative">
              <input 
                 className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 pr-16 text-white focus:outline-none focus:border-accent"
                 placeholder="Ex: Receber Cliente"
                 value={newStageTitle}
                 onChange={e => setNewStageTitle(e.target.value)}
              />
              <button 
                onClick={handleAddStage}
                disabled={loading || !newStageTitle.trim()}
                className="absolute right-2 top-2 bottom-2 w-12 bg-accent text-black rounded-lg flex items-center justify-center hover:scale-105 disabled:opacity-50"
              >
                 <Icons.Plus size={24} strokeWidth={3} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default PipelineEditor;

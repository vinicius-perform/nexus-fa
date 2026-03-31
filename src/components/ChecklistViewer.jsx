import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getPublicChecklist, toggleTaskStatus, updateTaskResponsible } from '../lib/checklistService';

const ChecklistViewer = ({ checklistId, onBack }) => {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const data = await getPublicChecklist(checklistId);
      setChecklist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checklistId) {
      fetchChecklist();
      
      // Setup simple polling para atualizar em tempo real internamente
      // Em produção real, usaríamos Supabase Realtime subscriptions
      const interval = setInterval(fetchChecklist, 10000);
      return () => clearInterval(interval);
    }
  }, [checklistId]);

  const handleToggle = async (taskId, currentStatus) => {
    try {
      // Optimistic update
      const newStatus = !currentStatus;
      setChecklist(prev => {
        const nc = { ...prev };
        nc.fa_checklist_groups = nc.fa_checklist_groups.map(g => {
          g.fa_checklist_tasks = g.fa_checklist_tasks.map(t => {
            if (t.id === taskId) t.is_completed = newStatus;
            return t;
          });
          return g;
        });
        return nc;
      });

      await toggleTaskStatus(taskId, newStatus);
    } catch (err) {
      // Revert in case of error
      fetchChecklist();
    }
  };

  const calculateProgress = () => {
    let total = 0;
    let completed = 0;
    if (!checklist || !checklist.fa_checklist_groups) return 0;
    
    checklist.fa_checklist_groups.forEach(group => {
      if (group.fa_checklist_tasks) {
        group.fa_checklist_tasks.forEach(task => {
          total++;
          if (task.is_completed) completed++;
        });
      }
    });

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/c/${checklist.public_id}`;
    navigator.clipboard.writeText(url);
    alert('Link público copiado!');
  };

  const handleSaveResponsible = async (taskId, value) => {
    try {
      await updateTaskResponsible(taskId, value);
      setEditingTaskId(null);
      // Optional: don't need to re-fetch as we kept the optimistic state in the input or we can rely on polling
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !checklist) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold mb-4">Checklist não encontrado</h2>
        <button onClick={onBack} className="text-accent underline">Voltar para a lista</button>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-accent font-medium mb-6 transition-colors"
        >
          <Icons.ArrowLeft size={16} />
          Voltar para Lista
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{checklist.name}</h2>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
               <span className="flex items-center gap-1"><Icons.Calendar size={14} /> Criado em {new Date(checklist.created_at).toLocaleDateString()}</span>
               <span className="flex items-center gap-1 font-mono hover:text-white transition-colors cursor-copy" onClick={handleCopyLink} title="Copiar ID Público">
                  <Icons.Hash size={14} /> {checklist.public_id}
               </span>
            </div>
          </div>
          <div>
            <button 
              onClick={handleCopyLink}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2 whitespace-nowrap"
            >
              <Icons.Share2 size={16} /> Acessar Link Público
            </button>
          </div>
        </div>

        {/* Global Progress Board */}
        <div className="mt-8 p-8 premium-card bg-bg-secondary rounded-[32px] flex items-center gap-6">
           <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center relative shrink-0">
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="36" cy="36" r="34" className="stroke-white/5" strokeWidth="4" fill="none" />
                <motion.circle 
                  cx="36" cy="36" r="34" 
                  className="stroke-accent" 
                  strokeWidth="4" fill="none" 
                  strokeDasharray="214" 
                  initial={{ strokeDashoffset: 214 }}
                  animate={{ strokeDashoffset: 214 - (214 * progress) / 100 }}
                  transition={{ duration: 1 }}
                />
             </svg>
             <span className="text-xl font-black text-white">{progress}%</span>
           </div>
           <div className="flex-1">
             <h4 className="text-lg font-bold text-white mb-1">Progresso Global do Checklist</h4>
             <p className="text-text-secondary text-sm">Atualizado em tempo real quando sua equipe marca as tarefas através do link público.</p>
           </div>
        </div>
      </header>

      {/* Task List */}
      <div className="space-y-12">
        {checklist.fa_checklist_groups?.map((group) => {
           const groupTasks = group.fa_checklist_tasks || [];
           const groupCompleted = groupTasks.filter(t => t.is_completed).length;
           const isGroupFullCompleted = groupTasks.length > 0 && groupCompleted === groupTasks.length;

           return (
             <div key={group.id} className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${isGroupFullCompleted ? 'bg-accent shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`}></span>
                    {group.name}
                  </h3>
                  <span className="text-sm font-bold text-text-secondary bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                     {groupCompleted}/{groupTasks.length} concluídas
                  </span>
                </div>

                <div className="grid gap-3">
                  {groupTasks.map((task) => (
                     <div 
                        key={task.id} 
                        className={`group p-4 md:p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${task.is_completed ? 'bg-accent/5 border-accent/20' : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/50'}`}
                     >
                        <button 
                          onClick={() => handleToggle(task.id, task.is_completed)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.is_completed ? 'border-accent bg-accent text-black scale-110' : 'border-white/20 text-transparent hover:border-white/50'}`}
                        >
                          <Icons.Check size={16} strokeWidth={4} />
                        </button>

                        <div className="flex-1">
                           <span className={`text-base font-medium transition-colors ${task.is_completed ? 'text-white/50 line-through' : 'text-white'}`}>
                              {task.name}
                           </span>
                        </div>

                        {/* Internal Panel Responsible Edit */}
                        <div className="w-48 shrink-0 relative flex items-center justify-end">
                           {editingTaskId === task.id ? (
                              <input 
                                autoFocus
                                type="text"
                                defaultValue={task.responsible || ''}
                                onBlur={(e) => handleSaveResponsible(task.id, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveResponsible(task.id, e.target.value) }}
                                className="w-full bg-white/10 border border-accent rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                              />
                           ) : (
                              <button 
                                onClick={() => setEditingTaskId(task.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${task.responsible ? 'bg-white/10 text-white hover:bg-white/20' : 'text-text-secondary hover:text-white'}`}
                              >
                                {task.responsible ? (
                                  <>
                                    <div className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center uppercase">{task.responsible.substring(0, 1)}</div>
                                    <span className="truncate max-w-[100px]">{task.responsible}</span>
                                  </>
                                ) : (
                                  <><Icons.UserPlus size={14} /> Adicionar Responsável</>
                                )}
                              </button>
                           )}
                        </div>
                     </div>
                  ))}
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default ChecklistViewer;

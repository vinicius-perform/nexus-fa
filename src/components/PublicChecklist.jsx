import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getPublicChecklist, toggleTaskStatus } from '../lib/checklistService';

const PublicChecklist = ({ publicId }) => {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchChecklist = async () => {
    try {
      const data = await getPublicChecklist(publicId);
      if (data) {
        setChecklist(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    if (publicId) {
      fetchChecklist();
      
      const interval = setInterval(fetchChecklist, 5000); // Polling 5s for the public view
      return () => clearInterval(interval);
    }
  }, [publicId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary text-white">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary text-white p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-12 rounded-[40px] text-center max-w-md w-full"
        >
          <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.FileQuestion size={48} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Checklist Não Encontrado</h2>
          <p className="text-text-secondary text-sm">O link que você tentou acessar pode estar incorreto, expirado ou ter sido excluído.</p>
        </motion.div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white overflow-y-auto premium-gradient pb-24">
      {/* Top Banner Branding */}
      <div className="w-full bg-black/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 py-4 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(34,197,94,0.3)]">
               FA
             </div>
             <div>
               <h1 className="text-sm font-black text-white tracking-widest leading-none">NEXUS</h1>
               <span className="text-[9px] uppercase tracking-[0.3em] text-accent font-bold">Colaborador Externo</span>
             </div>
           </div>
           
           <div className="text-text-secondary text-xs font-mono hidden md:block">
             <Icons.Lock size={12} className="inline mr-1 -mt-0.5" /> Acesso Público Seguro
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        {/* Header and Progress */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-bold uppercase tracking-widest mb-6">
             Tarefa Colaborativa
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
             {checklist.name}
          </h2>

          <div className="premium-card p-6 md:p-8 rounded-[32px] md:rounded-[40px] flex max-md:flex-col items-center gap-8 shadow-2xl relative overflow-hidden bg-[#0D0D0D] border-white/10">
             <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 blur-[50px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

             <div className="w-28 h-28 md:w-32 md:h-32 rounded-full flex justify-center items-center relative shrink-0">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="46%" className="stroke-white/5" strokeWidth="8" fill="none" />
                  <motion.circle 
                    cx="50%" cy="50%" r="46%" 
                    className="stroke-accent" 
                    strokeLinecap="round"
                    strokeWidth="8" fill="none" 
                    strokeDasharray="289" 
                    initial={{ strokeDashoffset: 289 }}
                    animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
                    transition={{ duration: 1.5, type: "spring" }}
                  />
               </svg>
               <span className="text-3xl font-black text-white">{progress}%</span>
             </div>
             
             <div className="text-left flex-1 space-y-3">
               <h4 className="text-2xl font-bold text-white">Progresso Global</h4>
               <p className="text-text-secondary text-sm leading-relaxed max-w-md">
                 Este link é público e compartilhado com a equipe. Ao marcar uma tarefa, o ambiente interno é sincronizado automaticamente em tempo real e todos verão esta evolução.
               </p>
             </div>
          </div>
        </motion.header>

        {/* Tasks View for Public */}
        <div className="space-y-10 relative">
          <div className="absolute left-6 top-10 bottom-6 w-0.5 bg-white/5 hidden md:block z-0"></div>

          {checklist.fa_checklist_groups?.map((group, groupIndex) => {
             const groupTasks = group.fa_checklist_tasks || [];
             const groupCompleted = groupTasks.filter(t => t.is_completed).length;
             const isComplete = groupTasks.length > 0 && groupCompleted === groupTasks.length;

             return (
               <motion.div 
                 key={group.id} 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.1 * groupIndex }}
                 className="relative z-10 pl-0 md:pl-16"
               >
                  {/* Timeline dot */}
                  <div className="absolute left-[-21px] top-4 hidden md:flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0B0B0B] bg-bg-secondary text-accent z-20">
                    {isComplete ? <Icons.CheckCircle2 size={24} className="text-accent bg-accent/10 rounded-full" /> : <Icons.Circle size={20} className="text-white/20" />}
                  </div>

                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-2xl font-black text-white tracking-tight">{group.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                       <span className={groupCompleted === groupTasks.length && groupTasks.length > 0 ? "text-accent" : "text-white"}>{groupCompleted}</span>
                       <span className="text-white/20">/</span>
                       <span className="text-text-secondary">{groupTasks.length}</span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                     {groupTasks.map((task) => (
                       <button 
                          key={task.id} 
                          onClick={() => handleToggle(task.id, task.is_completed)}
                          className={`w-full group/task text-left p-4 md:p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 overflow-hidden relative cursor-pointer
                             ${task.is_completed ? 'bg-accent/5 border-accent/20 hover:bg-accent/10' : 'bg-[#0D0D0D] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'}
                          `}
                       >
                          {task.is_completed && <div className="absolute inset-y-0 left-0 w-1 bg-accent"></div>}
                          
                          <div className="flex items-center gap-4 md:gap-6 flex-1 pr-4">
                              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all 
                                 ${task.is_completed ? 'border-accent bg-accent text-black scale-105' : 'border-white/20 text-transparent group-hover/task:border-white/50 group-hover/task:text-white/20'}
                              `}>
                                <Icons.Check size={16} strokeWidth={4} />
                              </div>

                              <div className="flex-1 min-w-0">
                                 <span className={`block text-base md:text-lg font-medium transition-colors break-words ${task.is_completed ? 'text-white/40 line-through' : 'text-white'}`}>
                                    {task.name}
                                 </span>
                              </div>
                          </div>

                          {task.responsible && (
                             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors shrink-0 max-md:max-w-[40%]
                                ${task.is_completed ? 'border-accent/10 bg-accent/5 text-accent/60' : 'border-white/5 bg-black/50 text-text-secondary group-hover/task:bg-white/5'}
                             `}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center uppercase text-[10px] font-black
                                   ${task.is_completed ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white'}
                                `}>
                                   {task.responsible.substring(0, 1)}
                                </div>
                                <span className="text-xs font-medium truncate">{task.responsible}</span>
                             </div>
                          )}
                       </button>
                     ))}
                  </div>
               </motion.div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicChecklist;

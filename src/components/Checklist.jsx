'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Check, ChevronDown, Info } from 'lucide-react';

const TaskExecutionItem = ({ task, isCompleted, onToggle, isGuest, index }) => {
  const [expanded, setExpanded] = useState(false);
  const taskId = task.id || task;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative flex flex-col p-6 rounded-3xl transition-all duration-500 border ${
        isCompleted
          ? 'bg-accent/[0.02] border-accent/10 opacity-60' 
          : 'bg-white/[0.01] border-white/[0.03] hover:border-white/10 hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-center gap-6">
        {/* Custom Modern Checkbox */}
        <motion.div 
          whileHover={!isGuest ? { scale: 1.1 } : {}}
          whileTap={!isGuest ? { scale: 0.9 } : {}}
          onClick={() => !isGuest && onToggle(taskId)}
          className={`relative w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${!isGuest ? 'cursor-pointer' : ''} ${
            isCompleted 
              ? 'bg-accent border-accent shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
              : 'border-white/10 group-hover:border-accent/40'
          }`}
        >
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
              >
                <Check size={16} strokeWidth={4} className="text-black" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div 
           className="flex-1 flex justify-between items-center cursor-pointer py-1"
           onClick={() => task.description && setExpanded(!expanded)}
        >
           <div className="flex flex-col">
              <span className={`text-lg font-semibold transition-all duration-700 tracking-tight ${isCompleted ? 'text-white/40 line-through' : 'text-white/90'}`}>
                {task.title || task}
              </span>
              {task.description && !expanded && (
                <span className="text-[10px] text-accent/50 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                   <Info size={10} /> Clique para detalhes
                </span>
              )}
           </div>
           
           {task.description && (
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                className={`p-2 rounded-xl transition-colors ${expanded ? 'bg-accent/10 text-accent' : 'text-white/20'}`}
              >
                <ChevronDown size={20} />
              </motion.div>
           )}
        </div>
      </div>
      
      {task.description && (
        <AnimatePresence>
          {expanded && (
            <motion.div 
               initial={{ height: 0, opacity: 0 }} 
               animate={{ height: 'auto', opacity: 1 }} 
               exit={{ height: 0, opacity: 0 }}
               className="overflow-hidden"
            >
               <div className="pt-6 mt-6 border-t border-white/[0.05] text-sm text-white/40 leading-relaxed font-medium pl-14">
                  {task.description}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const Checklist = ({ stage, roleId, stageIdx }) => {
  const { pipelines, updatePipeline, isGuest } = useAppContext();

  const tasks = stage.tasks || [];
  const completedTasks = stage.completedTasks || [];

  const handleToggle = (taskId) => {
    const newCompleted = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    
    const currentPipeline = pipelines[roleId] || [];
    const newPipeline = [...currentPipeline];
    if (newPipeline[stageIdx]) {
        newPipeline[stageIdx] = { ...stage, completedTasks: newCompleted };
        updatePipeline(roleId, newPipeline);
    }
  };

  const progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
             <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Em Execução</span>
          </div>
          <h3 className="text-4xl font-bold text-white tracking-tight">{stage.title}</h3>
          <p className="text-white/30 text-sm mt-2 font-medium">Complete as diretrizes operacionais para validar esta etapa.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <div className="px-6 py-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center gap-4 shadow-xl">
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest whitespace-nowrap">Status da Etapa</span>
              <div className="flex items-center gap-2">
                 <span className="text-xl font-bold text-white">{completedTasks.length}</span>
                 <span className="text-white/20 text-xs font-bold leading-none translate-y-0.5">/ {tasks.length}</span>
              </div>
           </div>
           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-accent shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              />
           </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 mb-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, idx) => {
            const taskId = task.id || task;
            const isCompleted = completedTasks.includes(taskId);
            return (
               <TaskExecutionItem 
                 key={taskId} 
                 index={idx}
                 task={typeof task === 'string' ? { id: task, title: task } : task} 
                 isCompleted={isCompleted}
                 onToggle={handleToggle}
                 isGuest={isGuest}
               />
            );
          })}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-white/20 border-2 border-dashed border-white/5 rounded-[40px] gap-4">
             <Icons.Inbox size={40} strokeWidth={1} />
             <p className="font-medium italic">Nenhuma diretriz operacional cadastrada nesta etapa.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checklist;


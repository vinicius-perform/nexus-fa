'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import * as Icons from 'lucide-react';
import Checklist from './Checklist';

const StageCard = ({ stage, idx, isActive, onClick, progress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.1, duration: 0.5 }}
      onClick={onClick}
      className={`relative flex-shrink-0 w-80 h-44 p-8 rounded-[32px] cursor-pointer transition-all duration-500 overflow-hidden ${
        isActive 
          ? 'bg-accent text-black scale-105 shadow-[0_20px_60px_rgba(34,197,94,0.3)] z-10' 
          : 'bg-[#111817] text-white/50 border border-white/[0.03] hover:border-white/10 hover:text-white'
      }`}
    >
      {/* Background glow for active state */}
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />
      )}

      <div className="flex justify-between items-start mb-6">
        <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isActive ? 'opacity-70' : 'opacity-40'}`}>Etapa {idx + 1}</span>
        {progress === 100 && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className={isActive ? 'text-black' : 'text-accent'}
          >
            <Icons.CheckCircle2 size={22} fill={isActive ? "currentColor" : "none"} strokeWidth={2.5} />
          </motion.div>
        )}
      </div>
      
      <h3 className="text-xl font-bold leading-tight mb-auto tracking-tight">{stage.title}</h3>
      
      <div className="mt-6">
        <div className="flex justify-between items-center text-[9px] mb-2 font-bold uppercase tracking-widest">
           <span className={isActive ? 'opacity-70' : 'opacity-40'}>Conclusão</span>
           <span className={isActive ? 'opacity-100' : 'text-accent'}>{Math.round(progress)}%</span>
        </div>
        <div className={`h-1.5 rounded-full ${isActive ? 'bg-black/10' : 'bg-white/5 overflow-hidden'}`}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "circOut" }}
            className={`h-full rounded-full ${isActive ? 'bg-black' : 'bg-accent shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const Pipeline = ({ setActiveTab }) => {
  const { activeRole, setActiveRole, pipelines, updatePipeline, isGuest } = useAppContext();
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);

  if (!activeRole) return null;

  const currentPipeline = pipelines[activeRole.id] || [];
  const activeStage = currentPipeline[selectedStageIdx];

  const calculateProgress = (stage) => {
    if (!stage.tasks || stage.tasks.length === 0) return 0;
    const completed = stage.completedTasks || [];
    return (completed.length / stage.tasks.length) * 100;
  };

  const Icon = Icons[activeRole.icon] || Icons.User;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header with Title and Overall Stats */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <button 
              onClick={() => setActiveRole(null)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all group"
            >
              <Icons.ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-accent/[0.05] border border-accent/10 rounded-2xl">
               <Icon size={18} className="text-accent" />
               <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">{activeRole.name}</span>
            </div>
          </motion.div>
          
          <h2 className="text-5xl font-bold text-white tracking-tight leading-none mb-4">Pipeline <span className="text-white/30">Operacional</span></h2>
          <p className="text-lg text-white/40 font-medium">Gerencie seu fluxo de trabalho etapa por etapa com precisão.</p>
        </div>

        <div className="hidden lg:flex gap-4">
           <div className="bg-white/5 border border-white/5 px-8 py-5 rounded-[28px] flex flex-col items-end">
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Total de Etapas</span>
              <span className="text-3xl font-bold text-white">{currentPipeline.length}</span>
           </div>
        </div>
      </header>

      {/* Horizontal Scroll Pipeline */}
      <div className="relative mb-16">
        <div className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth p-4 -m-4">
          {currentPipeline.map((stage, idx) => (
            <StageCard 
              key={idx}
              stage={stage}
              idx={idx}
              isActive={selectedStageIdx === idx}
              onClick={() => setSelectedStageIdx(idx)}
              progress={calculateProgress(stage)}
            />
          ))}
          {currentPipeline.length === 0 && (
            <div className="w-full p-20 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-white/20 italic font-medium">
               <Icons.Inbox size={40} className="mb-4 opacity-50" />
               Nenhuma etapa configurada para este cargo.
            </div>
          )}
        </div>
      </div>

      {/* Task Area / Checklist */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeStage ? (
            <motion.div
              key={selectedStageIdx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111817] border border-white/[0.03] rounded-[48px] p-8 md:p-14 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative accent background for task area */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
              
              <Checklist 
                stage={activeStage} 
                roleId={activeRole.id}
                stageIdx={selectedStageIdx}
              />
            </motion.div>
          ) : (
            <div className="flex-1 p-20 bg-white/[0.02] border border-white/[0.05] rounded-[48px] flex flex-col items-center justify-center text-white/20 text-center gap-4">
               <Icons.MousePointer2 size={40} className="mb-2 animate-bounce" strokeWidth={1} />
               <p className="max-w-xs font-medium text-lg leading-relaxed">
                 Clique em uma das etapas acima para visualizar e gerenciar as tarefas pendentes.
               </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Pipeline;


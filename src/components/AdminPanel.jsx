'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import * as Icons from 'lucide-react';

const AdminPanel = () => {
  const { roles, setRoles, pipelines, setPipelines } = useAppContext();
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id);
  const [newRoleName, setNewRoleName] = useState('');
  const [newStageTitle, setNewStageTitle] = useState('');

  const activeRole = roles.find(r => r.id === selectedRoleId);
  const currentPipeline = pipelines[selectedRoleId] || [];

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const id = newRoleName.toLowerCase().replace(/\s+/g, '-');
    const newRole = { id, name: newRoleName, icon: 'User', description: 'Cargo operacional recém-adicionado.' };
    setRoles([...roles, newRole]);
    setPipelines({ ...pipelines, [id]: [] });
    setNewRoleName('');
    setSelectedRoleId(id);
  };

  const handleDeleteRole = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cargo e todo o seu pipeline?')) return;
    setRoles(roles.filter(r => r.id !== id));
    const newPipelines = { ...pipelines };
    delete newPipelines[id];
    setPipelines(newPipelines);
    if (selectedRoleId === id) setSelectedRoleId(roles[0]?.id);
  };

  const handleAddStage = () => {
    if (!newStageTitle.trim() || !selectedRoleId) return;
    const newStage = { title: newStageTitle, tasks: [], completedTasks: [] };
    const newPipeline = [...currentPipeline, newStage];
    setPipelines({ ...pipelines, [selectedRoleId]: newPipeline });
    setNewStageTitle('');
  };

  const handleDeleteStage = (idx) => {
    if (!window.confirm('Excluir esta etapa?')) return;
    const newPipeline = currentPipeline.filter((_, i) => i !== idx);
    setPipelines({ ...pipelines, [selectedRoleId]: newPipeline });
  };

  return (
    <div className="flex h-full text-white overflow-hidden bg-[#0B0F0D]">
      {/* Sidebar: Roles List */}
      <div className="w-80 border-r border-white/5 p-10 overflow-y-auto bg-[#080B0A] no-scrollbar">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-1.5 h-6 bg-accent rounded-full" />
           <h2 className="text-2xl font-bold tracking-tight">Gestão</h2>
        </div>
        
        <div className="space-y-2 mb-12">
          {roles.map((role, idx) => (
            <motion.div 
              key={role.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedRoleId(role.id)}
              className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                selectedRoleId === role.id 
                  ? 'bg-accent/10 border-accent/20 text-accent' 
                  : 'bg-white/[0.02] border-transparent hover:border-white/10 text-white/40 hover:text-white/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <Icons.User size={18} strokeWidth={selectedRoleId === role.id ? 2.5 : 1.5} />
                <span className="font-semibold text-sm tracking-tight">{role.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500`}
              >
                <Icons.Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
          <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4 px-2">Novo Cargo</label>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Ex: Supervisor"
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-accent/40 text-white placeholder:text-white/10 transition-all font-medium"
            />
            <button 
              onClick={handleAddRole}
              className="w-full h-11 bg-accent/10 border border-accent/20 text-accent font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent hover:text-black transition-all text-xs uppercase tracking-widest shadow-lg active:scale-95"
            >
              <Icons.Plus size={16} /> Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Main Area: Pipeline Editor */}
      <div className="flex-1 p-14 overflow-y-auto no-scrollbar relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.02] blur-[120px] rounded-full pointer-events-none" />
        
        {activeRole ? (
          <div className="max-w-4xl">
            <header className="flex justify-between items-end mb-16 relative z-10">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-4"
                >
                   <Icons.Edit3 size={14} className="text-accent" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Editor de Pipeline</span>
                </motion.div>
                <h3 className="text-5xl font-bold tracking-tight text-white">{activeRole.name}</h3>
              </div>
              <div className="text-right">
                 <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest block mb-2">Fluxo de Trabalho</span>
                 <span className="text-4xl font-bold text-accent shadow-sm">{currentPipeline.length} <span className="text-lg text-white/40 font-medium">Etapas</span></span>
              </div>
            </header>

            <div className="space-y-4 relative z-10">
              <AnimatePresence mode="popLayout">
                {currentPipeline.map((stage, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group bg-[#111817] border border-white/[0.03] p-7 rounded-[28px] flex items-center justify-between hover:border-white/10 transition-all duration-500 shadow-xl"
                  >
                    <div className="flex items-center gap-8">
                       <div className="w-14 h-14 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-white/20 font-bold text-xl group-hover:text-accent/40 group-hover:border-accent/10 transition-all duration-500">
                          {idx + 1}
                       </div>
                       <div>
                          <h4 className="text-xl font-bold text-white/90 group-hover:text-white transition-colors">{stage.title}</h4>
                          <p className="text-[10px] text-accent/40 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                             <Icons.CheckCircle2 size={12} /> {stage.tasks?.length || 0} Diretrizes operacionais
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                       <button className="p-3 bg-white/[0.05] hover:bg-accent rounded-xl transition-all text-white/40 hover:text-black">
                          <Icons.Settings2 size={18} />
                       </button>
                       <button 
                        onClick={() => handleDeleteStage(idx)}
                        className="p-3 bg-white/[0.05] hover:bg-red-500 rounded-xl transition-all text-white/40 hover:text-white"
                       >
                          <Icons.Trash2 size={18} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="pt-10">
                 <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/[0.01] border-2 border-dashed border-white/[0.05] p-12 rounded-[40px] flex flex-col items-center justify-center text-center transition-all hover:bg-accent/[0.01] hover:border-accent/20 group"
                 >
                    <h5 className="text-xl font-bold mb-6 text-white/40 group-hover:text-white transition-colors">Expandir Ciclo Operacional</h5>
                    <div className="flex gap-3 w-full max-w-lg">
                      <input 
                        type="text" 
                        value={newStageTitle}
                        onChange={(e) => setNewStageTitle(e.target.value)}
                        placeholder="Nome da etapa (ex: Setup Inicial)"
                        className="flex-1 bg-[#0B0F0D] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent/40 placeholder:text-white/10 transition-all"
                      />
                      <button 
                        onClick={handleAddStage}
                        className="bg-accent text-black px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)]"
                      >
                        Adicionar
                      </button>
                    </div>
                 </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/10 gap-6">
             <Icons.LayoutDashboard size={80} strokeWidth={1} />
             <p className="text-xl font-medium tracking-tight uppercase tracking-[0.2em]">Selecione um cargo para gerenciar o fluxo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;


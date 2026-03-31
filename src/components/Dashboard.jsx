'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import * as Icons from 'lucide-react';
import ChecklistManager from './ChecklistManager';
import PipelineManager from './PipelineManager';

const RoleCard = ({ role, onClick }) => {
  const Icon = Icons[role.icon] || Icons.HelpCircle;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(role)}
      className="premium-card rounded-[32px] p-10 cursor-pointer flex flex-col items-center group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.02] transition-colors duration-500" />
      
      <div className="w-24 h-24 rounded-[28px] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40 mb-8 group-hover:text-accent group-hover:bg-accent/5 group-hover:border-accent/20 group-hover:scale-110 transition-all duration-700 shadow-2xl relative z-10">
        <Icon size={44} strokeWidth={1.2} />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors duration-500 relative z-10 tracking-tight">{role.name}</h3>
      <p className="text-sm text-white/40 text-center px-4 leading-relaxed group-hover:text-white/70 transition-colors duration-500 relative z-10 font-medium">
        {role.description}
      </p>

      {/* Decorative gradient glow on hover */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </motion.div>
  );
};

const DashboardContent = ({ roles, setActiveRole, isGuest }) => {
  const displayRoles = roles.filter(role => role.is_active !== false && role.isActive !== false);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-24 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
             <div className="h-[1px] w-8 bg-accent/50"></div>
             <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] block">
                {isGuest ? 'Acesso Colaborador' : 'Plataforma Operacional'}
             </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            Escolha sua <span className="text-accent italic font-light drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">Função</span>
          </h2>
          <p className="text-xl text-white/40 max-w-2xl leading-relaxed font-medium">
            O núcleo logístico e operacional da Fazendo Acontecer. <br className="hidden md:block"/>
            Selecione seu cargo para acessar seu fluxo de responsabilidades.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(displayRoles || []).map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
          >
            <RoleCard role={role} onClick={setActiveRole} />
          </motion.div>
        ))}
        
        {/* Placeholder for adding more cargo in the same style if desired by admin? 
            Or just keep the grid clean. */}
      </div>
    </div>
  );
};

const CardControlView = ({ roles, onToggle, onNavigateBuilder }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?mode=guest`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <div className="flex items-center gap-3 mb-6">
             <div className="h-[1px] w-8 bg-accent/50"></div>
             <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] block">Painel Administrativo</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Controle de Cards</h2>
          <p className="text-lg text-white/40 font-medium">Gerencie a visibilidade dos cargos para acessos externos.</p>
        </div>
        <button 
          onClick={handleCopyLink}
          className="flex items-center gap-3 px-8 py-5 bg-accent text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(34,197,94,0.3)]"
        >
          {copied ? <Icons.Check size={20} /> : <Icons.Link size={20} />}
          {copied ? 'Link Copiado!' : 'Gerar Convite'}
        </button>
      </header>

      <div className="grid gap-6">
        {roles.map((role, idx) => {
          const Icon = Icons[role.icon] || Icons.HelpCircle;
          const isRoleActive = role.is_active !== false && role.isActive !== false;
          return (
            <motion.div 
              key={role.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="premium-card p-8 flex items-center justify-between rounded-[28px] group"
            >
              <div className="flex items-center gap-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isRoleActive ? 'bg-accent/10 text-accent shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-white/5 text-white/20'}`}>
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-white group-hover:text-accent transition-colors">{role.name}</h4>
                  <p className="text-sm text-white/30 font-medium">{role.description}</p>
                </div>
              </div>
              <button 
                onClick={() => onToggle(role.id)}
                className={`w-16 h-9 rounded-full relative transition-all duration-500 p-1 ${isRoleActive ? 'bg-accent' : 'bg-white/5 border border-white/5'}`}
              >
                <motion.div 
                  animate={{ x: isRoleActive ? 28 : 0 }}
                  className={`w-7 h-7 rounded-full shadow-xl ${isRoleActive ? 'bg-black' : 'bg-white/20'}`}
                />
              </button>
            </motion.div>
          );
        })}
        
        <motion.div 
           whileHover={{ scale: 1.01 }}
           whileTap={{ scale: 0.99 }}
           onClick={onNavigateBuilder}
           className="mt-6 w-full border-2 border-dashed border-white/5 rounded-[28px] p-10 flex items-center justify-center cursor-pointer group hover:border-accent/40 hover:bg-accent/[0.02] transition-all duration-500"
        >
           <div className="flex items-center gap-4 text-white/20 group-hover:text-accent group-hover:scale-105 transition-all duration-500">
              <Icons.Plus size={28} />
              <span className="font-bold uppercase tracking-[0.3em] text-sm">Novo Cargo Operacional</span>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout, isGuest, onShowLogin, activeTab, setActiveTab }) => {
  const { roles, setActiveRole, toggleRoleVisibility } = useAppContext();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === 'dashboard' ? (
          <DashboardContent roles={roles} setActiveRole={setActiveRole} isGuest={isGuest} />
        ) : activeTab === 'control' ? (
          <CardControlView roles={roles} onToggle={toggleRoleVisibility} onNavigateBuilder={() => setActiveTab('pipeline-manager')} />
        ) : activeTab === 'checklist' ? (
          <ChecklistManager setActiveTab={setActiveTab} />
        ) : (
          <PipelineManager />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;


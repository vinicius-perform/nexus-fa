'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MainLayout = ({ children, activeTab, setActiveTab, onLogout, isGuest, onShowLogin }) => {
  const { activeRole, setActiveRole } = useAppContext();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'control', label: 'Controle de Cards', icon: 'Shield' },
    { id: 'checklist', label: 'Checklist', icon: 'ListChecks' },
    { id: 'pipeline-manager', label: 'Gestão de Pipeline', icon: 'GitMerge' },
  ];

  return (
    <div className="flex h-screen bg-bg-primary text-white overflow-hidden font-sans">
      {/* Premium Sidebar */}
      <aside className="w-20 md:w-72 bg-[#080B0A] border-r border-white/5 flex flex-col py-10 z-30 transition-all duration-500">
        <div className="mb-16 px-8 flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-[0_0_30px_rgba(34,197,94,0.2)]"
          >
            FA
          </motion.div>
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">NEXUS</h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold opacity-80">Operacional</span>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col w-full">
          {menuItems.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = activeTab === item.id && !activeRole;
            
            // Only show admin items if not guest
            if (isGuest && item.id !== 'dashboard') return null;

            return (
              <div 
                key={item.id}
                onClick={() => {
                   setActiveRole(null);
                   setActiveTab(item.id);
                }}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={22} strokeWidth={1.5} />
                <span className="hidden md:block font-medium tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                  />
                )}
              </div>
            );
          })}

          {activeRole && (
            <div 
              onClick={() => setActiveTab('pipeline')}
              className={`sidebar-item active mt-4`}
            >
              <Icons.Activity size={22} strokeWidth={1.5} />
              <span className="hidden md:block font-medium tracking-tight">Pipeline Ativo</span>
              <motion.div 
                layoutId="active-pill-role"
                className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
              />
            </div>
          )}
        </nav>
        
        <div className="mt-auto px-6 flex flex-col items-center w-full gap-4">
          {!isGuest ? (
            <div 
              onClick={onLogout}
              className="sidebar-item w-full justify-start text-red-500/50 hover:text-red-500 border-none hover:bg-red-500/5 cursor-pointer"
            >
              <Icons.LogOut size={22} strokeWidth={1.5} />
              <span className="hidden md:block font-medium">Sair</span>
            </div>
          ) : (
            <div 
              onClick={onShowLogin}
              className="sidebar-item w-full justify-start text-accent/80 hover:text-accent border-none hover:bg-accent/10 cursor-pointer"
            >
              <Icons.Lock size={22} strokeWidth={1.5} />
              <span className="hidden md:block font-medium tracking-tight">Acesso Restrito</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative no-scrollbar premium-gradient">
        {/* Abstract background elements */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/[0.02] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none -z-10"></div>
        <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-accent/[0.01] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none -z-10"></div>
        
        <div className="min-h-full">
           {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

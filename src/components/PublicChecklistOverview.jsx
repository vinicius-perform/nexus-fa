import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getChecklists } from '../lib/checklistService';

const PublicChecklistOverview = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setLoading(true);
        const data = await getChecklists();
        setChecklists(data || []);
      } catch (err) {
        console.error('Failed to load checklists', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  const calculateProgress = (checklist) => {
    let total = 0;
    let completed = 0;
    if (!checklist.fa_checklist_groups) return 0;
    
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

  const getActiveDays = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Criado hoje";
    if (diffDays === 1) return "Ativo há 1 dia";
    return `Ativo há ${diffDays} dias`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 md:p-16">
      <header className="mb-16">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Portal Público</span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
             Acompanhamento de <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">Checklists</span>
          </h2>

          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
             Acompanhe o progresso de todos os checklists operacionais da Fazendo Acontecer em tempo real. Clique em um checklist para ver os detalhes.
          </p>
        </motion.div>
      </header>

      {checklists.length === 0 ? (
        <div className="text-center p-20 border border-dashed border-white/10 rounded-[40px] bg-white/[0.02]">
           <Icons.SearchX size={64} className="mx-auto text-text-secondary mb-6" />
           <h3 className="text-2xl font-bold text-white mb-2">Nenhum checklist disponível</h3>
           <p className="text-text-secondary">Os checklists compartilhados aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {checklists.map((item, idx) => {
              const progress = calculateProgress(item);
              const activeDays = getActiveDays(item.created_at);
              
              return (
                 <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => window.location.href = `/c/${item.public_id}`}
                    className="premium-card rounded-[32px] p-8 cursor-pointer group bg-bg-secondary hover:bg-white/5 transition-all flex flex-col h-[320px]"
                 >
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-500">
                       <Icons.ListChecks size={28} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-1">{item.name}</h3>
                    
                    <div className="flex flex-col gap-1 mb-10">
                       <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Icons.Calendar size={14} />
                          {new Date(item.created_at).toLocaleDateString()}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-bold text-accent/80">
                          <Icons.Clock size={12} />
                          {activeDays}
                       </div>
                    </div>

                    <div className="mt-auto">
                       <div className="flex justify-between items-end mb-3">
                          <span className="text-sm font-medium text-text-secondary">Checklist em {progress}%</span>
                          <span className="text-2xl font-black text-white">{progress}%</span>
                       </div>
                       <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             transition={{ duration: 1, ease: "easeOut" }}
                             className="h-full bg-gradient-to-r from-emerald-500 to-accent shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                          />
                       </div>
                    </div>
                 </motion.div>
              );
           })}
        </div>
      )}
    </div>
  );
};

export default PublicChecklistOverview;

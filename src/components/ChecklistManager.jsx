import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { getChecklists, deleteChecklist } from '../lib/checklistService';
import ChecklistCreator from './ChecklistCreator';
import ChecklistViewer from './ChecklistViewer';

const ChecklistManager = () => {
  const [view, setView] = useState('list'); // 'list', 'create', 'view'
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

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

  useEffect(() => {
    if (view === 'list') {
      fetchChecklists();
    }
  }, [view]);

  const handleCreateNew = () => {
    setView('create');
  };

  const handleView = (checklist) => {
    setSelectedChecklist(checklist);
    setView('view');
  };

  const handleBackToList = () => {
    setSelectedChecklist(null);
    setView('list');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este checklist?')) {
      try {
        await deleteChecklist(id);
        fetchChecklists();
      } catch (err) {
        alert('Erro ao excluir checklist');
      }
    }
  };

  const copyPublicLink = (e, publicId) => {
    e.stopPropagation();
    const url = `${window.location.origin}/c/${publicId}`;
    navigator.clipboard.writeText(url);
    alert('Link público copiado!');
  };

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

  if (view === 'create') {
    return <ChecklistCreator onBack={handleBackToList} onSuccess={handleBackToList} />;
  }

  if (view === 'view') {
    return <ChecklistViewer checklistId={selectedChecklist?.public_id} onBack={handleBackToList} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Módulo Colaborativo</span>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Gestão de Checklists</h2>
          <p className="text-text-secondary max-w-xl">Crie e gerencie checklists estruturados. Compartilhe o link público para que sua equipe possa marcar tarefas em tempo real.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        >
          <Icons.Plus size={20} />
          Criar Novo Checklist
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : checklists.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-dashed border-white/10 rounded-[32px] p-16 flex flex-col items-center justify-center text-center bg-white/[0.02]"
        >
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-text-secondary mb-6">
             <Icons.ListTodo size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum checklist encontrado</h3>
          <p className="text-text-secondary mb-8 max-w-md">Você ainda não criou nenhum checklist. Adicione o seu primeiro checklist para começar a organizar as tarefas com sua equipe.</p>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
          >
            Começar agora
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {checklists.map((item, idx) => {
              const progress = calculateProgress(item);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleView(item)}
                  className="premium-card rounded-[24px] p-6 cursor-pointer group bg-bg-secondary hover:bg-white/5 transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                      <Icons.ListChecks size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => copyPublicLink(e, item.public_id)}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                        title="Copiar Link Público"
                      >
                         <Icons.Link size={16} />
                      </button>
                      <button 
                         onClick={(e) => handleDelete(e, item.id)}
                         className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                         title="Excluir"
                      >
                         <Icons.Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-8">
                     <Icons.Calendar size={14} />
                     {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-medium text-text-secondary">Progresso</span>
                       <span className="text-lg font-black text-white">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className="h-full bg-gradient-to-r from-emerald-500 to-accent"
                       />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ChecklistManager;

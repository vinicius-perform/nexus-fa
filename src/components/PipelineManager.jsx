import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { createRole, deleteRole } from '../lib/pipelineService';
import * as Icons from 'lucide-react';
import PipelineEditor from './PipelineEditor';

const AVAILABLE_ICONS = ['UserCircle', 'BarChart', 'Share2', 'Video', 'PhoneOutgoing', 'CheckCircle', 'Settings', 'Megaphone', 'Target', 'Briefcase', 'Layers', 'Mail', 'PenTool', 'Monitor', 'Camera', 'Code'];

const PipelineManager = () => {
  const { roles, setRoles } = useAppContext();
  const [editingRole, setEditingRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', icon: 'UserCircle' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newRole.name.trim()) return;
    setLoading(true);
    try {
      const created = await createRole({
        name: newRole.name,
        description: newRole.description,
        icon: newRole.icon,
        is_active: true,
        order: roles.length
      });
      // Attach initial pipeline format to conform with AppContext state
      const newRoleState = { ...created, fa_pipeline_stages: [] };
      setRoles(prev => [...prev, newRoleState]);
      setIsCreating(false);
      setNewRole({ name: '', description: '', icon: 'UserCircle' });
      setEditingRole(newRoleState); // Opcional: já abrir o construtor do novo cargo imediatamente
    } catch (err) {
      console.error(err);
      alert('Erro ao criar cargo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if(window.confirm('CUIDADO: Tem certeza que deseja excluir permanentemente este cargo e TODO o seu pipeline atrelado?')) {
        try {
            await deleteRole(id);
            setRoles(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir cargo.');
        }
    }
  };

  if (editingRole) {
    return <PipelineEditor role={editingRole} onBack={() => setEditingRole(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Builder</span>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Gestão de Pipeline</h2>
          <p className="text-text-secondary">Cadastre cargos, desenhe etapas e defina as instruções operacionais padrão.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        >
          <Icons.Plus size={20} />
          Criar Novo Cargo
        </button>
      </header>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="glass p-8 rounded-[32px] border border-accent/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Novo Cargo</h3>
                <button onClick={() => setIsCreating(false)} className="text-text-secondary hover:text-white"><Icons.X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-text-secondary font-bold mb-2 uppercase tracking-widest">Nome do Cargo</label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={e => setNewRole({...newRole, name: e.target.value})}
                    placeholder="Ex: Gestor de Tráfego"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary font-bold mb-2 uppercase tracking-widest">Descrição Crta (Opcional)</label>
                  <input
                    type="text"
                    value={newRole.description}
                    onChange={e => setNewRole({...newRole, description: e.target.value})}
                    placeholder="Ex: Gestão de anúncios pagos..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm text-text-secondary font-bold mb-4 uppercase tracking-widest">Ícone</label>
                <div className="flex flex-wrap gap-4">
                  {AVAILABLE_ICONS.map(iconName => {
                    const IconComp = Icons[iconName];
                    const isSelected = newRole.icon === iconName;
                    return (
                        <div 
                          key={iconName}
                          onClick={() => setNewRole({...newRole, icon: iconName})}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-accent text-black scale-110 shadow-lg' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                        >
                          <IconComp size={24} />
                        </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={handleCreate}
                disabled={loading || !newRole.name.trim()}
                className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {loading ? 'Salvando...' : 'Salvar Novo Cargo'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <div className="grid gap-4">
          {roles.map((role) => {
            const Icon = Icons[role.icon] || Icons.HelpCircle;
            const stageCount = role.fa_pipeline_stages ? role.fa_pipeline_stages.length : 0;
            return (
              <motion.div 
                key={role.id} 
                whileHover={{ scale: 1.01 }}
                onClick={() => setEditingRole(role)}
                className="premium-card p-6 flex items-center justify-between rounded-[24px] cursor-pointer group hover:border-accent/30"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 text-white flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                    <Icon size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-white mb-1 group-hover:text-accent transition-colors">{role.name}</h4>
                    <p className="text-sm text-text-secondary">{role.description || 'Sem descrição'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                     <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Etapas Cadastradas</span>
                     <span className="text-xl font-black text-white">{stageCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDelete(role.id, e)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <Icons.Trash2 size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white group-hover:bg-accent group-hover:text-black transition-all">
                        <Icons.ChevronRight size={20} />
                      </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {roles.length === 0 && !isCreating && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[32px]">
                  <p className="text-text-secondary text-lg">Nenhum cargo cadastrado no banco de dados.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineManager;

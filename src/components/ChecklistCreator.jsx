import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { createChecklist } from '../lib/checklistService';

const ChecklistCreator = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 = input, 2 = review
  const [name, setName] = useState('');
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parser: Interpreta o texto e converte para array de objetos
  const handleParse = () => {
    setError('');
    if (!name.trim()) {
      setError('Por favor, informe o nome do checklist.');
      return;
    }
    if (!rawText.trim()) {
      setError('O conteúdo estrutural não pode estar vazio.');
      return;
    }

    const lines = rawText.split('\n');
    let groups = [];
    let currentGroup = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Se começa com '-', é uma tarefa
      if (line.startsWith('-')) {
        const taskName = line.substring(1).trim();
        if (!currentGroup) {
          setError(`Linha ${i + 1}: Uma tarefa ("${line}") foi encontrada antes de definir um grupo!`);
          return;
        }
        currentGroup.tasks.push({ name: taskName, responsible: '' });
      } 
      // Se não, é um grupo
      else {
        currentGroup = { name: line, tasks: [] };
        groups.push(currentGroup);
      }
    }

    if (groups.length === 0) {
      setError('Nenhum grupo válido foi encontrado.');
      return;
    }

    setParsedData(groups);
    setStep(2);
  };

  const handleResponsibleChange = (gIndex, tIndex, value) => {
    const newData = [...parsedData];
    newData[gIndex].tasks[tIndex].responsible = value;
    setParsedData(newData);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const payload = {
        name,
        groups: parsedData
      };

      const result = await createChecklist(payload);
      alert(`Checklist criado com sucesso! Link Público: ${window.location.origin}/c/${result.public_id}`);
      onSuccess();

    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao salvar o checklist. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-accent font-medium mb-6 transition-colors"
          >
            <Icons.ArrowLeft size={16} />
            Voltar
          </button>
          <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Novo Registro</span>
          <h2 className="text-4xl font-black text-white tracking-tight">
             {step === 1 ? 'Estrutura do Checklist' : 'Revisão e Responsáveis'}
          </h2>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400">
           <Icons.AlertCircle size={20} className="shrink-0 mt-0.5" />
           <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {step === 1 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-8 md:p-12 rounded-[32px] bg-bg-secondary"
        >
          <div className="mb-8">
            <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wider">Nome do Checklist</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lançamento de Campanha Q1"
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium text-lg placeholder:text-white/20"
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-white uppercase tracking-wider">Estrutura de Grupos e Tarefas</label>
              <div className="group relative flex items-center">
                <Icons.Info size={16} className="text-text-secondary group-hover:text-accent cursor-help transition-colors" />
                <div className="absolute right-0 bottom-full mb-2 w-64 bg-black border border-white/10 rounded-xl p-4 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10 text-xs text-text-secondary leading-relaxed">
                  Digite normalmente o nome para Grupos. Use um hífen (-) no início para definir uma tarefa daquele grupo.
                </div>
              </div>
            </div>
            
            <textarea 
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="TÍTULO DO GRUPO
- tarefa 1
- tarefa 2

OUTRO GRUPO
- tarefa 3"
              className="w-full h-80 bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none font-mono text-sm leading-8 placeholder:text-white/20"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleParse}
              className="flex items-center gap-2 px-8 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
            >
              Interpretar Textos
              <Icons.ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="premium-card p-6 md:p-10 rounded-[32px] bg-bg-secondary flex-1">
             <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-6">{name}</h3>

             <div className="space-y-10">
               {parsedData.map((group, gIndex) => (
                 <div key={gIndex} className="bg-black/30 rounded-3xl p-6 border border-white/5">
                   <h4 className="text-xl font-black text-accent mb-6 flex items-center gap-3">
                      <Icons.FolderOpen size={24} className="opacity-80" />
                      {group.name}
                   </h4>
                   <div className="space-y-4">
                     {group.tasks.map((task, tIndex) => (
                       <div key={tIndex} className="flex flex-col md:flex-row md:items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl gap-4 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3 text-text-secondary">
                            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">{tIndex + 1}</span>
                            <span className="font-medium">{task.name}</span>
                          </div>
                          <div className="w-full md:w-64">
                             <input 
                               type="text"
                               placeholder="Responsável (Opcional)"
                               value={task.responsible}
                               onChange={(e) => handleResponsibleChange(gIndex, tIndex, e.target.value)}
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-all placeholder:text-white/20"
                             />
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button 
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
            >
              Editar Texto
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? (
                 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <Icons.Check size={20} />
              )}
              {isSubmitting ? 'Gerando...' : 'Gerar Checklist Definitivo'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChecklistCreator;

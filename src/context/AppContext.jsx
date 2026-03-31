import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

import { getFullPipelineData } from '../lib/pipelineService';

export const AppProvider = ({ children }) => {
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('fa_nexus_roles');
    return saved ? JSON.parse(saved) : [];
  });

  const [pipelines, setPipelines] = useState(() => {
    const saved = localStorage.getItem('fa_nexus_pipelines');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true); // Default to guest, App.jsx will configure this based on auth

  useEffect(() => {
    const fetchRemoteData = async () => {
      setLoading(true);
      try {
        const fullData = await getFullPipelineData();
        if (fullData) {
          setRoles(fullData);

          const newPipelines = {};
          fullData.forEach(role => {
            newPipelines[role.id] = (role.fa_pipeline_stages || []).map(stage => ({
              ...stage,
              tasks: stage.fa_pipeline_tasks || [],
            }));
          });

          // Mesclar o cache de progresso local (completedTasks) mantendo a estrutura atualizada
          const savedPipelines = JSON.parse(localStorage.getItem('fa_nexus_pipelines') || '{}');
          Object.keys(newPipelines).forEach(roleId => {
            newPipelines[roleId] = newPipelines[roleId].map((stage, idx) => {
              const savedStage = savedPipelines[roleId]?.[idx];
              return {
                ...stage,
                completedTasks: savedStage ? savedStage.completedTasks || [] : []
              };
            });
          });

          setPipelines(newPipelines);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, relying on local storage if available', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRemoteData();
  }, []);

  useEffect(() => {
    localStorage.setItem('fa_nexus_roles', JSON.stringify(roles));
    localStorage.setItem('fa_nexus_pipelines', JSON.stringify(pipelines));
  }, [roles, pipelines]);

  const addRole = (role) => setRoles([...roles, role]);
  const updatePipeline = (roleId, newPipeline) => {
    setPipelines({ ...pipelines, [roleId]: newPipeline });
  };

  const toggleRoleVisibility = async (roleId) => {
    const updatedRoles = roles.map(r => 
      r.id === roleId ? { ...r, is_active: !r.isActive && !r.is_active } : r
    );
    setRoles(updatedRoles);
    
    // Suporte retrocompatível se antes fosse role e virou fa_roles
    try {
      await supabase.from('fa_roles').update({ is_active: updatedRoles.find(r => r.id === roleId).is_active }).eq('id', roleId);
    } catch (err) {
      console.warn('Ocorreu um erro ao atualizar status do cargo remotamente');
    }
  };

  return (
    <AppContext.Provider value={{ 
      roles, setRoles, 
      pipelines, setPipelines, 
      activeRole, setActiveRole,
      loading, setLoading,
      isGuest, setIsGuest,
      addRole, updatePipeline,
      toggleRoleVisibility
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

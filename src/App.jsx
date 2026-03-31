import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Preloader from './components/Preloader';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import PublicChecklist from './components/PublicChecklist';
import MainLayout from './components/MainLayout';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { activeRole, setActiveRole, loading, setLoading, isGuest, setIsGuest, toggleRoleVisibility, roles } = useAppContext();
  const [showPreloader, setShowPreloader] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fa_nexus_auth') === 'true';
  });
  const [publicChecklistId, setPublicChecklistId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setIsGuest(!isAuthenticated);
    
    // Check for guest url param explicitly (legacy support)
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'guest') {
      setIsGuest(true);
    }
    
    // Check for public checklist route
    if (window.location.pathname.startsWith('/c/')) {
        const id = window.location.pathname.split('/c/')[1];
        if (id) setPublicChecklistId(id);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    localStorage.setItem('fa_nexus_auth', 'true');
    setIsAuthenticated(true);
    setIsGuest(false);
    setShowLoginModal(false);
    setShowPreloader(true); // Restart preloader on login for effect
  };

  const handleLogout = () => {
    localStorage.removeItem('fa_nexus_auth');
    setIsAuthenticated(false);
    setIsGuest(true);
    setActiveRole(null);
    setActiveTab('dashboard');
  };

  // If viewing a public checklist, ignore authentication and roles
  if (publicChecklistId) {
    return (
      <div className="min-h-screen bg-[#0B0F0D] text-white">
        <AnimatePresence>
          {showPreloader && (
            <Preloader onFinish={() => setShowPreloader(false)} />
          )}
        </AnimatePresence>
        {!showPreloader && <PublicChecklist publicId={publicChecklistId} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-white selection:bg-accent selection:text-black">
      <AnimatePresence>
        {showPreloader && (
          <Preloader onFinish={() => setShowPreloader(false)} />
        )}
      </AnimatePresence>

      {!showPreloader && (
        <MainLayout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
          isGuest={isGuest}
          onShowLogin={() => setShowLoginModal(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole ? 'pipeline' : activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-16"
            >
              {activeRole ? (
                <Pipeline setActiveTab={setActiveTab} />
              ) : (
                <Dashboard 
                   activeTab={activeTab}
                   setActiveTab={setActiveTab}
                   onLogout={handleLogout} 
                   isGuest={isGuest} 
                   onShowLogin={() => setShowLoginModal(true)} 
                />
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Admin Toggle button - positioned fixed for easy access */}
          {!isGuest && !isAdminOpen && (
            <div className="fixed bottom-10 right-10 z-50">
               <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAdminOpen(true)}
                className="w-14 h-14 bg-white/5 hover:bg-accent backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-black transition-all shadow-2xl group"
              >
                <Settings size={28} />
              </motion.button>
            </div>
          )}

          <AnimatePresence>
            {isAdminOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 overflow-hidden"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-6xl h-full max-h-[90vh] bg-[#0B0F0D] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)]"
                >
                   <button 
                    onClick={() => setIsAdminOpen(false)}
                    className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors z-[110] p-2 bg-white/5 rounded-full hover:bg-white/10"
                   >
                     <X size={24} />
                   </button>
                   <div className="h-full overflow-y-auto no-scrollbar">
                     <AdminPanel />
                   </div>
                </motion.div>
              </motion.div>
            )}

            {showLoginModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              >
                <div className="relative w-full max-w-md">
                   <button 
                    onClick={() => setShowLoginModal(false)}
                    className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors p-2"
                   >
                     <X size={32} />
                   </button>
                   <Login onLogin={handleLogin} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </MainLayout>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;


import { useState, useEffect } from "react";
import { LayoutDashboard, Smartphone, Sparkles } from "lucide-react";
import { Header } from "./components/Header";
import { LiveMatchCard } from "./components/LiveMatchCard";
import { LiveVotingSection } from "./components/LiveVotingSection";
import { NextMatchCard } from "./components/NextMatchCard";
import { ActionGrid } from "./components/ActionGrid";
import { SponsorSection } from "./components/SponsorSection";
import { BottomNav } from "./components/BottomNav";
import { LoginPage } from "./components/LoginPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import AdminApp from "./AdminApp";
import { useAuth } from "./contexts/AuthContext";
import { MatchProvider } from "./contexts/MatchContext";
import { VotingProvider } from "./contexts/VotingContext";
import { PlayerProvider } from "./contexts/PlayerContext";

// Importar herramientas de diagnóstico (disponibles en consola del navegador)
import "./utils/fixPlayerNumbers";

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { currentUser, logout } = useAuth();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Welcome toast on login
  useEffect(() => {
    if (currentUser) {
      toast.success(`¡Bienvenido, ${currentUser.name}!`);
    }
  }, [currentUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setShowPreview(false);
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  // Show login page (default initial view)
  if (!currentUser) {
    return (
      <div className="animate-fade-in">
        <LoginPage darkMode={darkMode} />
      </div>
    );
  }

  // Show admin dashboard (authenticated users only)
  if (currentUser && !showPreview) {
    return (
      <div className="animate-fade-in">
        <Toaster richColors position="top-center" />
                
                {/* Preview Button - Fixed position bottom-right (respecting main content area) */}
                <div className="fixed bottom-8 right-8 z-50 animate-slide-in-right">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="glass-button group relative overflow-hidden shadow-lg"
                    style={{
                      background: darkMode 
                        ? 'linear-gradient(135deg, #C8A963 0%, #b89850 100%)'
                        : 'linear-gradient(135deg, #0C2340 0%, #1e3a5f 100%)',
                      boxShadow: darkMode
                        ? '0 8px 24px rgba(200, 169, 99, 0.3)'
                        : '0 8px 24px rgba(12, 35, 64, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '16px',
                      padding: '12px 20px',
                      color: 'white',
                      transition: 'all var(--transition-base)'
                    }}
                    title="Vista Previa de App de Fans"
                  >
                    <div className="flex items-center gap-2.5 relative z-10">
                      <Smartphone size={20} className="transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm font-medium whitespace-nowrap">Vista Previa</span>
                      <Sparkles size={16} className="animate-shimmer-glow" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  </button>
                </div>
                
                <AdminApp currentUser={currentUser} onLogout={handleLogout} />
      </div>
    );
  }

  // Show preview mode (when admin wants to see the fan app)
  if (showPreview && currentUser) {
    return (
      <div className="animate-fade-in">
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0F172A]' : 'bg-[#F2F4F7]'}`}>
                <Toaster richColors position="top-center" />
        
                {/* Back to Dashboard Button - Improved styling */}
                <button
                  onClick={() => setShowPreview(false)}
                  className="glass-button fixed top-4 right-4 z-50 flex items-center gap-2.5 group animate-slide-in-right shadow-lg"
                  style={{
                    background: darkMode 
                      ? 'rgba(30, 41, 59, 0.9)' 
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(var(--glass-blur))',
                    border: darkMode 
                      ? '1px solid rgba(255, 255, 255, 0.15)' 
                      : '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: darkMode
                      ? 'var(--shadow-xl-dark)'
                      : 'var(--shadow-xl-light)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    color: darkMode ? '#F1F5F9' : '#0F172A',
                    transition: 'all var(--transition-base)'
                  }}
                  title="Volver al Dashboard"
                >
                  <LayoutDashboard size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-sm font-medium">Volver al Dashboard</span>
                </button>
        
                {/* Main container - mobile optimized */}
                <div className="max-w-md mx-auto min-h-screen pb-20 relative">
                  {/* Header */}
                  <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                  {/* Content with stagger animation */}
                  <main className="px-4 py-5 space-y-5">
                    {/* Live Match Card */}
                    <div className="animate-scale-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                      <LiveMatchCard darkMode={darkMode} />
                    </div>

                    {/* Live Voting Section */}
                    <div className="animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                      <LiveVotingSection darkMode={darkMode} />
                    </div>

                    {/* Next Match */}
                    <div className="animate-scale-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                      <NextMatchCard darkMode={darkMode} />
                    </div>

                    {/* Action Grid */}
                    <div className="animate-scale-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                      <ActionGrid darkMode={darkMode} />
                    </div>

                    {/* Sponsor Section */}
                    <div className="animate-scale-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                      <SponsorSection darkMode={darkMode} />
                    </div>
                  </main>

                  {/* Bottom Navigation */}
                  <BottomNav darkMode={darkMode} />
                </div>

                {/* Background decorative elements with animation */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                  <div className="animate-float absolute top-1/4 -left-20 w-64 h-64 bg-[#0C2340]/5 dark:bg-[#C8A963]/5 rounded-full blur-3xl" style={{ animationDelay: '0s' }}></div>
                  <div className="animate-float absolute bottom-1/4 -right-20 w-64 h-64 bg-[#E01E37]/5 dark:bg-[#E01E37]/5 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
                  <div className="animate-float absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C8A963]/3 dark:bg-[#0C2340]/3 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
                </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}

export default function App() {
  return (
    <PlayerProvider>
      <MatchProvider>
        <VotingProvider>
          <AppContent />
        </VotingProvider>
      </MatchProvider>
    </PlayerProvider>
  );
}

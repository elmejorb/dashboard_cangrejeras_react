import { useState, useEffect, Suspense, lazy } from "react";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { AdminHeader } from "./components/admin/AdminHeader";
import { AdminLoadingFallback } from "./components/admin/LoadingStates";
import { Toaster } from "./components/ui/sonner";
import { User } from "./utils/auth";

// Lazy load components
const DashboardOverview = lazy(() => import("./components/admin/DashboardOverview").then(m => ({ default: m.DashboardOverview })));
const PlayerManagement = lazy(() => import("./components/admin/PlayerManagement").then(m => ({ default: m.PlayerManagement })));
const VotingManagement = lazy(() => import("./components/admin/VotingManagement").then(m => ({ default: m.VotingManagement })));
const NewsManagement = lazy(() => import("./components/admin/NewsManagement").then(m => ({ default: m.NewsManagement })));
const MatchManagement = lazy(() => import("./components/admin/MatchManagement").then(m => ({ default: m.MatchManagement })));
const StandingsManagement = lazy(() => import("./components/admin/StandingsManagement").then(m => ({ default: m.StandingsManagement })));
const MediaManagement = lazy(() => import("./components/admin/MediaManagement").then(m => ({ default: m.MediaManagement })));
const BannerManagement = lazy(() => import("./components/admin/BannerManagement").then(m => ({ default: m.BannerManagement })));
const SettingsManagement = lazy(() => import("./components/admin/SettingsManagement").then(m => ({ default: m.SettingsManagement })));
const UserProfile = lazy(() => import("./components/admin/UserProfile").then(m => ({ default: m.UserProfile })));

interface AdminAppProps {
  currentUser: User;
  onLogout?: () => void;
}

export default function AdminApp({ currentUser, onLogout }: AdminAppProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User>(currentUser);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

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

  const renderSection = () => {
    return (
      <Suspense fallback={<AdminLoadingFallback darkMode={darkMode} />}>
        {activeSection === 'dashboard' && <DashboardOverview darkMode={darkMode} setActiveSection={setActiveSection} />}
        {activeSection === 'players' && <PlayerManagement darkMode={darkMode} />}
        {activeSection === 'matches' && <MatchManagement darkMode={darkMode} />}
        {activeSection === 'voting' && <VotingManagement darkMode={darkMode} />}
        {activeSection === 'news' && <NewsManagement darkMode={darkMode} />}
        {activeSection === 'standings' && <StandingsManagement darkMode={darkMode} />}
        {activeSection === 'media' && <MediaManagement darkMode={darkMode} />}
        {activeSection === 'banners' && <BannerManagement darkMode={darkMode} />}
        {activeSection === 'settings' && <SettingsManagement darkMode={darkMode} />}
        {activeSection === 'profile' && <UserProfile darkMode={darkMode} currentUser={user} onUserUpdate={handleUserUpdate} />}
      </Suspense>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <Toaster richColors position="top-center" />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <AdminHeader 
            darkMode={darkMode} 
            activeSection={activeSection} 
            currentUser={user} 
            onLogout={onLogout}
            onNavigateToProfile={() => setActiveSection('profile')}
          />

          {/* Content */}
          <main className="p-6 lg:p-8">
            {renderSection()}
          </main>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0C2340]/5 dark:bg-[#C8A963]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#E01E37]/5 dark:bg-[#E01E37]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C8A963]/3 dark:bg-[#0C2340]/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

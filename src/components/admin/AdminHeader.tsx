import { Search, Bell, ChevronRight, Save, Check, User as UserIcon, Settings, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { User } from "../../utils/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner@2.0.3";

interface AdminHeaderProps {
  darkMode: boolean;
  activeSection: string;
  saveStatus?: 'saved' | 'saving' | 'idle';
  currentUser?: User;
  onLogout?: () => void;
  onNavigateToProfile?: () => void;
}

export function AdminHeader({ darkMode, activeSection, saveStatus = 'idle', currentUser, onLogout, onNavigateToProfile }: AdminHeaderProps) {
  const [notifications] = useState(3);
  
  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      toast.info("Próximamente: Editar Perfil de Administrador");
    }
  };

  const handleSettings = () => {
    toast.info("Próximamente: Configuración de Administrador");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      toast.success("Sesión cerrada exitosamente");
    }
  };

  const sectionTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    players: 'Gestión de Jugadoras',
    matches: 'Partidos',
    standings: 'Tabla de Posiciones',
    voting: 'Votaciones en Vivo',
    news: 'Noticias',
    media: 'Contenido Multimedia',
    settings: 'Configuración',
    profile: 'Mi Perfil',
  };

  return (
    <header 
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        darkMode 
          ? 'bg-[#1E293B]/95 border-white/10 backdrop-blur-xl' 
          : 'bg-white/95 border-gray-200 backdrop-blur-xl'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
            Admin
          </span>
          <ChevronRight size={16} className={darkMode ? 'text-white/30' : 'text-gray-400'} />
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {sectionTitles[activeSection] || 'Dashboard'}
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10">
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-[#10B981]">Guardando...</span>
                </>
              ) : (
                <>
                  <Check size={16} className="text-[#10B981]" />
                  <span className="text-sm text-[#10B981]">Guardado</span>
                </>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search 
              size={18} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-white/40' : 'text-gray-400'
              }`}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className={`pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C2340]/20 ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
              style={{ width: '240px' }}
            />
          </div>

          {/* Notifications */}
          <button 
            className={`relative p-2 rounded-lg transition-all duration-200 ${
              darkMode
                ? 'hover:bg-white/10 text-white/70 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell size={20} />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E01E37] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{notifications}</span>
              </div>
            )}
          </button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  darkMode
                    ? 'hover:bg-white/10'
                    : 'hover:bg-gray-100'
                }`}
                title={currentUser ? `${currentUser.name} - ${currentUser.role}` : 'Usuario'}
              >
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover shadow-md ring-2 ring-[#C8A963]/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#C8A963] flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {currentUser ? getUserInitials(currentUser.name) : 'AD'}
                    </span>
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.name || 'Admin'}
                  </div>
                  {currentUser && (
                    <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                      {currentUser.role}
                    </div>
                  )}
                </div>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${
                    darkMode ? 'text-white/60' : 'text-gray-500'
                  }`} 
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 mt-2 animate-scale-in"
              style={{
                background: darkMode 
                  ? 'rgba(30, 41, 59, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: darkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: darkMode
                  ? '0 12px 48px rgba(0, 0, 0, 0.6)'
                  : '0 12px 48px rgba(0, 0, 0, 0.15)',
              }}
            >
              <DropdownMenuLabel className="flex items-center gap-3 py-3">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-[#C8A963]/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#C8A963] flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold">
                      {currentUser ? getUserInitials(currentUser.name) : 'AD'}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{currentUser?.name || 'Admin'}</span>
                  <span className="text-xs opacity-60">{currentUser?.role || 'Super Admin'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleEditProfile}
                className="cursor-pointer py-2.5 px-3 transition-all duration-200 hover:bg-[#C8A963]/10"
              >
                <UserIcon className="w-4 h-4 mr-2 text-[#C8A963]" />
                <span>Editar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSettings}
                className="cursor-pointer py-2.5 px-3 transition-all duration-200 hover:bg-[#0C2340]/10"
              >
                <Settings className="w-4 h-4 mr-2 text-[#0C2340] dark:text-[#C8A963]" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer py-2.5 px-3 transition-all duration-200 hover:bg-[#E01E37]/10 text-[#E01E37]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

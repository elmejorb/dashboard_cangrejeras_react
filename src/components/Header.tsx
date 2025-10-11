import { Bell, Moon, Sun, Settings, User, LogOut, ChevronDown, Shield } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner@2.0.3";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const [notificationCount] = useState(3);
  const [userName] = useState("Fanático Cangrejero");

  const handleEditProfile = () => {
    toast.info("Próximamente: Editar Perfil");
  };

  const handleSettings = () => {
    toast.info("Próximamente: Configuración");
  };

  const handleLogout = () => {
    toast.success("Sesión cerrada exitosamente");
  };

  return (
    <header 
      className="relative overflow-hidden rounded-b-3xl shadow-lg animate-slide-in-top"
      style={{
        background: 'linear-gradient(135deg, #0C2340 0%, #1e3a5f 50%, #0C2340 100%)',
        boxShadow: '0 8px 32px rgba(12, 35, 64, 0.3)'
      }}
    >
      <div className="px-5 py-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="glass-button w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20">
              <Shield size={24} className="text-[#C8A963]" />
            </div>
            <button
              onClick={toggleDarkMode}
              className="glass-button w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20 group"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-[#C8A963] transition-transform duration-300 group-hover:rotate-180" />
              ) : (
                <Moon className="w-5 h-5 text-white transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="glass-button relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20 group">
              <Bell className="w-5 h-5 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E01E37] rounded-full flex items-center justify-center text-[10px] text-white animate-pulse-glow border-2 border-[#0C2340] shadow-lg">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="glass-button flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 group transition-all duration-300">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C8A963] to-[#E01E37] flex items-center justify-center border-2 border-white/30 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/80 transition-transform duration-300 group-hover:translate-y-0.5" />
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
                <DropdownMenuLabel className="flex flex-col gap-1 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A963] to-[#E01E37] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">{userName}</span>
                      <span className="text-xs opacity-60">Fanático Oficial</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleEditProfile}
                  className="cursor-pointer py-2.5 px-3 transition-all duration-200 hover:bg-[#C8A963]/10"
                >
                  <User className="w-4 h-4 mr-2 text-[#C8A963]" />
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

        <div className="space-y-1">
          <h1 className="text-white">
            Cangrejeras de Santurce
          </h1>
          <p className="text-[#C8A963] text-sm font-medium">
            Liga de Voleibol Superior Femenino
          </p>
        </div>
      </div>

      {/* Decorative elements with animation */}
      <div className="animate-float absolute top-0 right-0 w-32 h-32 bg-[#C8A963]/10 rounded-full blur-3xl" style={{ animationDelay: '0.5s' }}></div>
      <div className="animate-float absolute bottom-0 left-0 w-24 h-24 bg-[#E01E37]/10 rounded-full blur-2xl" style={{ animationDelay: '1.5s' }}></div>
    </header>
  );
}

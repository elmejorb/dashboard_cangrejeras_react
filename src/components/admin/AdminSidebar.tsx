import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  BarChart3,
  Newspaper,
  ImageIcon,
  Megaphone,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface AdminSidebarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ 
  darkMode, 
  toggleDarkMode, 
  activeSection, 
  setActiveSection,
  collapsed,
  setCollapsed 
}: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#3B82F6' },
    { id: 'players', icon: Users, label: 'Gestión de Jugadoras', color: '#0C2340' },
    { id: 'matches', icon: Calendar, label: 'Partidos', color: '#10B981' },
    { id: 'standings', icon: Trophy, label: 'Tabla de Posiciones', color: '#C8A963' },
    { id: 'voting', icon: BarChart3, label: 'Votaciones en Vivo', color: '#E01E37' },
    { id: 'news', icon: Newspaper, label: 'Noticias', color: '#F97316' },
    { id: 'media', icon: ImageIcon, label: 'Contenido Multimedia', color: '#8B5CF6' },
    { id: 'banners', icon: Megaphone, label: 'Banners de Promoción', color: '#EC4899' },
    { id: 'settings', icon: Settings, label: 'Configuración', color: '#475569' },
  ];

  return (
    <aside 
      className={`${collapsed ? 'w-20' : 'w-64'} h-screen sticky top-0 transition-all duration-300 ease-in-out`}
      style={{
        background: darkMode 
          ? 'linear-gradient(180deg, #0C2340 0%, #1e3a5f 100%)'
          : 'linear-gradient(180deg, #0C2340 0%, #1e3a5f 100%)'
      }}
    >
      <div className="h-full flex flex-col">
        {/* Logo & Brand */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C8A963] flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Cangrejeras</div>
                <div className="text-white/60 text-xs">Admin Panel</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/15 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : ''}
              >
                <div 
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                  style={{ backgroundColor: isActive ? item.color : 'transparent' }}
                >
                  <Icon size={18} />
                </div>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle & User */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            title={collapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : ''}
          >
            <div className="p-1.5">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            {!collapsed && (
              <span className="text-sm font-medium">
                {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
            )}
          </button>

          {/* User Profile */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-[#C8A963] flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">Admin</div>
                <div className="text-white/60 text-xs truncate">Super Admin</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

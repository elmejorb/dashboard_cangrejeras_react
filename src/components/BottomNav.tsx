import { Home, Calendar, Trophy, Users, Settings } from "lucide-react";
import { useState } from "react";

interface BottomNavProps {
  darkMode: boolean;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'matches', icon: Calendar, label: 'Partidos' },
  { id: 'standings', icon: Trophy, label: 'Tabla' },
  { id: 'roster', icon: Users, label: 'Roster' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

export function BottomNav({ darkMode }: BottomNavProps) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t z-50"
      style={{
        background: darkMode 
          ? 'rgba(15, 23, 42, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(var(--glass-blur))',
        borderColor: darkMode 
          ? 'var(--glass-border-dark)' 
          : 'var(--glass-border-light)',
        boxShadow: darkMode
          ? '0 -8px 32px rgba(0, 0, 0, 0.5)'
          : '0 -8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all var(--transition-base)'
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="glass-button flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[60px] group/nav"
              style={{
                backgroundColor: isActive 
                  ? darkMode ? 'rgba(12, 35, 64, 0.3)' : 'rgba(12, 35, 64, 0.1)'
                  : 'transparent',
                transition: 'all var(--transition-base)'
              }}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive 
                    ? 'text-[#0C2340] dark:text-[#C8A963] scale-110' 
                    : darkMode ? 'text-[#94A3B8] group-hover/nav:text-[#C8A963]' : 'text-[#475569] group-hover/nav:text-[#0C2340]'
                } ${!isActive && 'group-hover/nav:scale-105 group-hover/nav:-translate-y-0.5'}`}
              />
              <span
                className={`text-[10px] transition-all duration-300 ${
                  isActive 
                    ? 'text-[#0C2340] dark:text-[#C8A963] font-semibold' 
                    : darkMode ? 'text-[#94A3B8] group-hover/nav:text-[#C8A963]' : 'text-[#475569] group-hover/nav:text-[#0C2340]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0C2340] dark:bg-[#C8A963] rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

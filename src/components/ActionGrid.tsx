import { BarChart3, Bell, Calendar, ShoppingBag } from "lucide-react";

interface ActionGridProps {
  darkMode: boolean;
}

const actions = [
  {
    id: 1,
    icon: BarChart3,
    title: "Estadísticas",
    subtitle: "Ver todas",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)"
  },
  {
    id: 2,
    icon: Bell,
    title: "Noticias",
    subtitle: "Últimas",
    color: "#EC4899",
    bgColor: "rgba(236, 72, 153, 0.1)"
  },
  {
    id: 3,
    icon: Calendar,
    title: "Boletos",
    subtitle: "Comprar",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.1)"
  },
  {
    id: 4,
    icon: ShoppingBag,
    title: "Tienda",
    subtitle: "Merchandising",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.1)"
  }
];

export function ActionGrid({ darkMode }: ActionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            className="glass-card card-interactive relative overflow-hidden rounded-xl p-4 border group"
            style={{
              background: darkMode 
                ? 'var(--glass-bg-dark)' 
                : 'var(--glass-bg-light)',
              borderColor: darkMode 
                ? 'var(--glass-border-dark)' 
                : 'var(--glass-border-light)',
              boxShadow: darkMode
                ? 'var(--shadow-md-dark)'
                : 'var(--shadow-md-light)',
              transition: 'all var(--transition-base)'
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{ 
                backgroundColor: action.bgColor,
                boxShadow: `0 4px 12px ${action.color}20`
              }}
            >
              <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" style={{ color: action.color }} />
            </div>
            <div className="text-left">
              <h4 className={`font-semibold mb-0.5 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                {action.title}
              </h4>
              <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                {action.subtitle}
              </p>
            </div>

            {/* Hover gradient effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${action.color} 0%, transparent 100%)`
              }}
            ></div>
          </button>
        );
      })}
    </div>
  );
}

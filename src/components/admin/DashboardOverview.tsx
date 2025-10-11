import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  BarChart3,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  Vote,
  FileText,
  Trophy
} from "lucide-react";
import { StatsCard, ActionCard, CardPremium } from "./CardPremium";
import { BadgePremium, DotBadge } from "./BadgePremium";
import { playerService } from "../../services/playerService";
import { matchService } from "../../services/matchService";

interface DashboardOverviewProps {
  darkMode: boolean;
  setActiveSection: (section: string) => void;
}

export function DashboardOverview({ darkMode, setActiveSection }: DashboardOverviewProps) {
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [activePlayers, setActivePlayers] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [upcomingMatches, setUpcomingMatches] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load player stats
      const playerStats = await playerService.getTeamStats();
      setTotalPlayers(playerStats.totalPlayers);
      setActivePlayers(playerStats.activePlayers);

      // Load match stats
      const matchStats = await matchService.getSeasonStats();
      setTotalMatches(matchStats.totalMatches);
      setUpcomingMatches(matchStats.upcomingMatches);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const stats = [
    {
      title: 'Total Jugadoras',
      value: totalPlayers,
      icon: Users,
      iconColor: '#C8A963',
      iconBg: 'rgba(200, 169, 99, 0.15)',
      trend: {
        value: activePlayers,
        label: 'activas',
        isPositive: true
      }
    },
    {
      title: 'Partidos Jugados',
      value: totalMatches,
      icon: Trophy,
      iconColor: '#E01E37',
      iconBg: 'rgba(224, 30, 55, 0.15)',
      trend: {
        value: upcomingMatches,
        label: 'próximos',
        isPositive: true
      }
    },
    {
      title: 'Votaciones Activas',
      value: 1,
      icon: Vote,
      iconColor: '#8B5CF6',
      iconBg: 'rgba(139, 92, 246, 0.15)',
      trend: {
        value: 0,
        label: 'en vivo ahora',
        isPositive: true
      }
    },
    {
      title: 'Engagement Total',
      value: '8.5K',
      icon: TrendingUp,
      iconColor: '#10B981',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      trend: {
        value: 15,
        label: 'vs mes anterior',
        isPositive: true
      }
    },
  ];

  const quickActions = [
    { 
      icon: UserPlus, 
      label: 'Gestionar Jugadoras', 
      description: 'Ver y editar el roster del equipo',
      color: '#C8A963',
      action: () => setActiveSection('players')
    },
    { 
      icon: CalendarPlus, 
      label: 'Gestionar Partidos', 
      description: 'Programar y actualizar encuentros',
      color: '#E01E37',
      action: () => setActiveSection('matches')
    },
    { 
      icon: Vote, 
      label: 'Votaciones en Vivo', 
      description: 'Activar polls para los fans',
      color: '#8B5CF6',
      action: () => setActiveSection('voting')
    },
    { 
      icon: FileText, 
      label: 'Gestionar Noticias', 
      description: 'Publicar artículos y actualizaciones',
      color: '#10B981',
      action: () => setActiveSection('news')
    },
  ];

  const recentActivity = [
    { 
      user: 'Admin', 
      action: 'publicó un partido', 
      target: 'CAN vs CRI', 
      time: 'Hace 5 min',
      status: 'live',
      color: '#E01E37'
    },
    { 
      user: 'Content Manager', 
      action: 'actualizó estadísticas de', 
      target: 'Andrea Rangel', 
      time: 'Hace 15 min',
      status: 'updated',
      color: '#3B82F6'
    },
    { 
      user: 'Admin', 
      action: 'inició votación para', 
      target: 'Partido vs Criollas', 
      time: 'Hace 1 hora',
      status: 'live',
      color: '#8B5CF6'
    },
    { 
      user: 'Content Manager', 
      action: 'guardó borrador de', 
      target: 'Noticia: Victoria importante', 
      time: 'Hace 2 horas',
      status: 'draft',
      color: '#F97316'
    },
  ];

  const statusLabels = {
    published: 'Publicado',
    updated: 'Actualizado',
    live: 'En Vivo',
    draft: 'Borrador',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <CardPremium darkMode={darkMode} className="overflow-hidden relative">
        <div className="relative z-10 flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8A963] to-[#b89850] flex items-center justify-center shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ¡Bienvenido al Dashboard!
            </h2>
            <p className={`text-base ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
              Gestiona todo el contenido de las Cangrejeras de Santurce desde aquí
            </p>
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 opacity-10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #C8A963 0%, transparent 70%)'
          }}
        />
      </CardPremium>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="animate-scale-in"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              iconBg={stat.iconBg}
              trend={stat.trend}
              darkMode={darkMode}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <CardPremium darkMode={darkMode}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Acciones Rápidas
              </h3>
              <BadgePremium variant="default" size="sm">
                {quickActions.length}
              </BadgePremium>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <div 
                  key={index}
                  className="animate-scale-in"
                  style={{ 
                    animationDelay: `${(index + 4) * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <ActionCard
                    title={action.label}
                    description={action.description}
                    icon={action.icon}
                    iconColor={action.color}
                    darkMode={darkMode}
                    onClick={action.action}
                  />
                </div>
              ))}
            </div>
          </CardPremium>
        </div>

        {/* Recent Activity */}
        <div>
          <CardPremium darkMode={darkMode}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Actividad Reciente
              </h3>
              <DotBadge color="#10B981" pulse size={8} />
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex gap-3 animate-scale-in"
                  style={{ 
                    animationDelay: `${(index + 8) * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="relative">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${activity.color} 0%, ${activity.color}dd 100%)`,
                        boxShadow: `0 4px 12px ${activity.color}40`
                      }}
                    >
                      <span className="text-white text-xs">
                        {activity.user.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    {index < recentActivity.length - 1 && (
                      <div 
                        className={`absolute left-4 top-9 w-px h-4 ${
                          darkMode ? 'bg-white/10' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm mb-1.5 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium">{activity.target}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <BadgePremium 
                        variant={activity.status === 'live' ? 'live' : activity.status === 'draft' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {statusLabels[activity.status as keyof typeof statusLabels]}
                      </BadgePremium>
                      
                      <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardPremium>
        </div>
      </div>
    </div>
  );
}

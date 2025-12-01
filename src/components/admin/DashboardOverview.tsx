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
import { activityLogService } from "../../services/activityLogService";
import { useAuth } from "../../contexts/AuthContext";
import { ActivityLog } from "../../utils/auth";
import { UserRole, canAccessSection, Section } from "../../utils/permissions";

interface DashboardOverviewProps {
  darkMode: boolean;
  setActiveSection: (section: string) => void;
  userRole?: UserRole;
}

export function DashboardOverview({ darkMode, setActiveSection, userRole = 'Super Admin' }: DashboardOverviewProps) {
  const { currentUser } = useAuth();
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [activePlayers, setActivePlayers] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [upcomingMatches, setUpcomingMatches] = useState(0);
  const [recentActivityLogs, setRecentActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
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

  const loadRecentActivity = async () => {
    if (!currentUser) {
      console.log('🔍 loadRecentActivity: No hay currentUser');
      return;
    }

    try {
      console.log('🔍 loadRecentActivity: Cargando logs para userId:', currentUser.id);
      // Cargar las últimas 5 actividades del usuario
      const logs = await activityLogService.getRecentLogs(currentUser.id, 5);
      console.log('🔍 loadRecentActivity: Logs recibidos:', logs);
      setRecentActivityLogs(logs);
    } catch (error) {
      console.error('Error loading recent activity:', error);
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

  const allQuickActions = [
    {
      id: 'players' as Section,
      icon: UserPlus,
      label: 'Gestionar Jugadoras',
      description: 'Ver y editar el roster del equipo',
      color: '#C8A963',
      action: () => setActiveSection('players')
    },
    {
      id: 'matches' as Section,
      icon: CalendarPlus,
      label: 'Gestionar Partidos',
      description: 'Programar y actualizar encuentros',
      color: '#E01E37',
      action: () => setActiveSection('matches')
    },
    {
      id: 'voting' as Section,
      icon: Vote,
      label: 'Votaciones en Vivo',
      description: 'Activar polls para los fans',
      color: '#8B5CF6',
      action: () => setActiveSection('voting')
    },
    {
      id: 'news' as Section,
      icon: FileText,
      label: 'Gestionar Noticias',
      description: 'Publicar artículos y actualizaciones',
      color: '#10B981',
      action: () => setActiveSection('news')
    },
  ];

  // Filter quick actions based on user role permissions
  const quickActions = allQuickActions.filter(action => canAccessSection(userRole, action.id));

  // Helper para obtener color según el tipo de actividad
  const getActivityColor = (type: ActivityLog['type']): string => {
    const colors = {
      match: '#E01E37',
      player: '#C8A963',
      voting: '#8B5CF6',
      news: '#10B981',
      standings: '#F59E0B',
      media: '#EC4899',
      settings: '#6B7280',
      auth: '#3B82F6',
    };
    return colors[type] || '#6B7280';
  };

  // Helper para obtener status de la actividad
  const getActivityStatus = (action: string): 'live' | 'updated' | 'published' | 'draft' => {
    if (action === 'create') return 'published';
    if (action === 'update') return 'updated';
    if (action === 'activate') return 'live';
    return 'updated';
  };

  // Formatear timestamp relativo
  const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return `Hace ${diffDays}d`;
  };

  const statusLabels = {
    published: 'Publicado',
    updated: 'Actualizado',
    live: 'En Vivo',
    draft: 'Borrador',
  };

  // Convertir logs de actividad al formato del UI
  const recentActivity = recentActivityLogs.map((log) => {
    const activity = {
      user: currentUser?.name || 'Admin',
      action: log.description.split(' ').slice(0, 3).join(' '), // Primeras 3 palabras
      target: log.description.split(' ').slice(3).join(' ') || log.description, // Resto de la descripción
      time: formatRelativeTime(log.timestamp),
      status: getActivityStatus(log.action),
      color: getActivityColor(log.type),
    };
    console.log('🔍 Activity formateada:', activity);
    return activity;
  });

  console.log('🔍 Total recentActivity:', recentActivity.length);

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
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp
                    size={48}
                    className={`mx-auto mb-3 ${darkMode ? 'text-white/20' : 'text-gray-300'}`}
                  />
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    No hay actividad reciente
                  </p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
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
              ))
              )}
            </div>
          </CardPremium>
        </div>
      </div>
    </div>
  );
}

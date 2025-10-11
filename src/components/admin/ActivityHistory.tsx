import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  User,
  MapPin
} from "lucide-react";
import { ActivityLog } from "../../utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner@2.0.3";
import { CardPremium } from "./CardPremium";
import { BadgePremium } from "./BadgePremium";

interface ActivityHistoryProps {
  darkMode: boolean;
  userId: string;
}

export function ActivityHistory({ darkMode, userId }: ActivityHistoryProps) {
  const { getActivityLogs, clearActivityLogs } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 10;

  // Load activity logs on mount
  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await getActivityLogs();
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Error al cargar el historial');
    } finally {
      setIsLoading(false);
    }
  };

  // Type icons and colors
  const getTypeConfig = (type: ActivityLog['type']) => {
    const configs = {
      match: { icon: Calendar, color: '#C8A963', label: 'Partido' },
      player: { icon: User, color: '#10B981', label: 'Jugadora' },
      voting: { icon: CheckCircle, color: '#8B5CF6', label: 'Votación' },
      news: { icon: FileText, color: '#3B82F6', label: 'Noticia' },
      standings: { icon: FileText, color: '#F59E0B', label: 'Posiciones' },
      media: { icon: FileText, color: '#EC4899', label: 'Multimedia' },
      settings: { icon: Info, color: '#6B7280', label: 'Configuración' },
      auth: { icon: User, color: '#0C2340', label: 'Autenticación' },
    };
    return configs[type] || configs.settings;
  };

  // Action labels
  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      create: 'Crear',
      update: 'Actualizar',
      delete: 'Eliminar',
      publish: 'Publicar',
      upload: 'Subir',
      activate: 'Activar',
      deactivate: 'Desactivar',
      login: 'Inicio de sesión',
      logout: 'Cierre de sesión',
    };
    return labels[action] || action;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
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
    
    return date.toLocaleDateString('es-PR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format full date
  const formatFullDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-PR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = activityLogs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        const diffDays = Math.floor((now.getTime() - logDate.getTime()) / 86400000);
        
        if (dateFilter === 'today') return diffDays === 0;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    return filtered;
  }, [activityLogs, searchQuery, typeFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadActivityLogs();
      toast.success('Historial actualizado');
    } catch (error) {
      toast.error('Error al actualizar el historial');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle clear history
  const handleClearHistory = async () => {
    if (confirm('¿Estás seguro que deseas eliminar todo el historial? Esta acción no se puede deshacer.')) {
      try {
        await clearActivityLogs();
        setActivityLogs([]);
        toast.success('Historial eliminado');
      } catch (error) {
        toast.error('Error al eliminar el historial');
      }
    }
  };

  // Handle export
  const handleExport = () => {
    const csv = [
      ['Fecha', 'Tipo', 'Acción', 'Descripción', 'IP'].join(','),
      ...filteredLogs.map(log => [
        formatFullDate(log.timestamp),
        getTypeConfig(log.type).label,
        getActionLabel(log.action),
        log.description,
        log.ipAddress || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actividad_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Historial exportado');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className={`text-2xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Historial de Actividad
          </h2>
          <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>

          <button
            onClick={handleExport}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            <Download size={16} />
            Exportar
          </button>

          {activityLogs.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 bg-[#E01E37]/10 hover:bg-[#E01E37]/20 text-[#E01E37]"
            >
              <Trash2 size={16} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <CardPremium darkMode={darkMode} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search 
              size={18} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-white/40' : 'text-gray-400'
              }`}
            />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter 
              size={18} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-white/40' : 'text-gray-400'
              }`}
            />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">Todos los tipos</option>
              <option value="match">Partidos</option>
              <option value="player">Jugadoras</option>
              <option value="voting">Votaciones</option>
              <option value="news">Noticias</option>
              <option value="standings">Posiciones</option>
              <option value="media">Multimedia</option>
              <option value="settings">Configuración</option>
              <option value="auth">Autenticación</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar 
              size={18} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-white/40' : 'text-gray-400'
              }`}
            />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">Todo el tiempo</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>
      </CardPremium>

      {/* Activity List */}
      <CardPremium darkMode={darkMode} className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw size={48} className={`mx-auto mb-4 animate-spin ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <h3 className={`text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Cargando historial...
            </h3>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <h3 className={`text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No hay actividad registrada
            </h3>
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                ? 'Intenta ajustar los filtros para ver más resultados'
                : 'Tu actividad aparecerá aquí cuando comiences a usar el dashboard'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}>
            {paginatedLogs.map((log) => {
              const typeConfig = getTypeConfig(log.type);
              const TypeIcon = typeConfig.icon;
              
              return (
                <div
                  key={log.id}
                  className={`p-4 transition-colors duration-200 ${
                    darkMode
                      ? 'hover:bg-white/5'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: `${typeConfig.color}20`,
                      }}
                    >
                      <TypeIcon size={18} style={{ color: typeConfig.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1">
                          <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {log.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <BadgePremium variant="default" className="text-xs">
                              {typeConfig.label}
                            </BadgePremium>
                            <BadgePremium variant="default" className="text-xs">
                              {getActionLabel(log.action)}
                            </BadgePremium>
                            {log.ipAddress && (
                              <span className={`text-xs flex items-center gap-1 ${
                                darkMode ? 'text-white/40' : 'text-gray-500'
                              }`}>
                                <MapPin size={12} />
                                {log.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span 
                            className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}
                            title={formatFullDate(log.timestamp)}
                          >
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className={`mt-2 text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              <strong>{key}:</strong> {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardPremium>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardPremium darkMode={darkMode} className="p-4">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white disabled:opacity-30'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-30'
                } disabled:cursor-not-allowed`}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                          page === currentPage
                            ? 'bg-[#C8A963] text-white'
                            : darkMode
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className={darkMode ? 'text-white/40' : 'text-gray-400'}>
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white disabled:opacity-30'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-30'
                } disabled:cursor-not-allowed`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </CardPremium>
      )}
    </div>
  );
}

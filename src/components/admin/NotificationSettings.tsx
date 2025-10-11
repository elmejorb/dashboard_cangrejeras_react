import { useState, useEffect } from "react";
import { 
  Mail, 
  Bell, 
  Smartphone,
  Calendar,
  CheckCircle,
  FileText,
  Users,
  TrendingUp,
  Save,
  AlertCircle,
  Check,
  Info
} from "lucide-react";
import { NotificationPreferences, auth } from "../../utils/auth";
import { toast } from "sonner@2.0.3";
import { CardPremium } from "./CardPremium";
import { BadgePremium } from "./BadgePremium";

interface NotificationSettingsProps {
  darkMode: boolean;
  userId: string;
}

type ChannelType = 'email' | 'push' | 'inApp';
type EventType = 'matches' | 'voting' | 'news' | 'players' | 'standings';

export function NotificationSettings({ darkMode, userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    auth.getNotificationPreferences(userId)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Notification channels config
  const channels = [
    {
      id: 'email' as ChannelType,
      name: 'Email',
      icon: Mail,
      description: 'Recibe notificaciones en tu correo electrónico',
      color: '#3B82F6',
      available: true,
    },
    {
      id: 'push' as ChannelType,
      name: 'Push',
      icon: Bell,
      description: 'Notificaciones push en tu navegador',
      color: '#8B5CF6',
      available: false, // Demo: not yet available
    },
    {
      id: 'inApp' as ChannelType,
      name: 'En la App',
      icon: Smartphone,
      description: 'Notificaciones dentro del dashboard',
      color: '#10B981',
      available: true,
    },
  ];

  // Event types config
  const eventTypes = [
    {
      id: 'matches' as EventType,
      name: 'Partidos',
      icon: Calendar,
      description: 'Recordatorios de partidos próximos y resultados',
      examples: ['Partido en 1 hora', 'Resultado del partido']
    },
    {
      id: 'voting' as EventType,
      name: 'Votaciones',
      icon: CheckCircle,
      description: 'Votaciones activas y resultados',
      examples: ['Votación iniciada', 'Resultados de votación']
    },
    {
      id: 'news' as EventType,
      name: 'Noticias',
      icon: FileText,
      description: 'Nuevas publicaciones y actualizaciones',
      examples: ['Nueva noticia publicada', 'Noticia destacada']
    },
    {
      id: 'players' as EventType,
      name: 'Jugadoras',
      icon: Users,
      description: 'Cambios en el roster y logros',
      examples: ['Nueva jugadora agregada', 'Logro desbloqueado']
    },
    {
      id: 'standings' as EventType,
      name: 'Posiciones',
      icon: TrendingUp,
      description: 'Actualizaciones de la tabla de posiciones',
      examples: ['Tabla actualizada', 'Cambio de posición']
    },
  ];

  // Toggle channel
  const toggleChannel = (channel: ChannelType) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled: !prev[channel].enabled
      }
    }));
    setHasChanges(true);
  };

  // Toggle event for channel
  const toggleEvent = (channel: ChannelType, event: EventType) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [event]: !prev[channel][event]
      }
    }));
    setHasChanges(true);
  };

  // Enable all for channel
  const enableAllForChannel = (channel: ChannelType) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        enabled: true,
        matches: true,
        voting: true,
        news: true,
        players: true,
        standings: true,
      }
    }));
    setHasChanges(true);
  };

  // Disable all for channel
  const disableAllForChannel = (channel: ChannelType) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        enabled: false,
        matches: false,
        voting: false,
        news: false,
        players: false,
        standings: false,
      }
    }));
    setHasChanges(true);
  };

  // Save preferences
  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      auth.updateNotificationPreferences(userId, preferences);
      setHasChanges(false);
      setIsSaving(false);
      toast.success('Preferencias guardadas exitosamente');
    }, 800);
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('¿Deseas restaurar la configuración predeterminada de notificaciones?')) {
      const defaultPrefs = auth.getNotificationPreferences('new_user');
      setPreferences(defaultPrefs);
      setHasChanges(true);
      toast.info('Configuración restaurada');
    }
  };

  // Get channel status
  const getChannelStatus = (channel: ChannelType) => {
    const channelPrefs = preferences[channel];
    const enabledCount = Object.entries(channelPrefs)
      .filter(([key, value]) => key !== 'enabled' && value === true)
      .length;
    
    if (!channelPrefs.enabled) return { text: 'Desactivado', color: 'default' as const };
    if (enabledCount === 0) return { text: 'Sin eventos', color: 'warning' as const };
    if (enabledCount === 5) return { text: 'Todos los eventos', color: 'success' as const };
    return { text: `${enabledCount} eventos`, color: 'info' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className={`text-2xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Notificaciones
          </h2>
          <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Personaliza cómo y cuándo recibes notificaciones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  darkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Restaurar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 bg-[#C8A963] hover:bg-[#b89850] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <CardPremium darkMode={darkMode} className="p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-[#3B82F6] flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <strong>Sobre las notificaciones</strong>
            </p>
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Las notificaciones te ayudan a mantenerte al día con la actividad del equipo. 
              Puedes personalizar cada canal de forma independiente según tus preferencias.
            </p>
          </div>
        </div>
      </CardPremium>

      {/* Channels */}
      <div className="space-y-4">
        {channels.map((channel) => {
          const ChannelIcon = channel.icon;
          const status = getChannelStatus(channel.id);
          const channelPrefs = preferences[channel.id];

          return (
            <CardPremium key={channel.id} darkMode={darkMode} className="overflow-hidden">
              {/* Channel Header */}
              <div className="p-6 border-b" style={{
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${channel.color}20` }}
                    >
                      <ChannelIcon size={24} style={{ color: channel.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {channel.name}
                        </h3>
                        <BadgePremium variant={status.color}>
                          {status.text}
                        </BadgePremium>
                        {!channel.available && (
                          <BadgePremium variant="default" className="text-xs">
                            Próximamente
                          </BadgePremium>
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                        {channel.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      disabled={!channel.available}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        channelPrefs.enabled
                          ? 'bg-[#C8A963]'
                          : darkMode
                            ? 'bg-white/20'
                            : 'bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          channelPrefs.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {channelPrefs.enabled && channel.available && (
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => enableAllForChannel(channel.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        darkMode
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Activar todos
                    </button>
                    <button
                      onClick={() => disableAllForChannel(channel.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        darkMode
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Desactivar todos
                    </button>
                  </div>
                )}
              </div>

              {/* Event Types */}
              {channelPrefs.enabled && channel.available && (
                <div className="p-6 space-y-4">
                  {eventTypes.map((event) => {
                    const EventIcon = event.icon;
                    const isEnabled = channelPrefs[event.id];

                    return (
                      <div
                        key={event.id}
                        className={`flex items-start justify-between gap-4 p-4 rounded-lg transition-all duration-200 ${
                          isEnabled
                            ? darkMode
                              ? 'bg-white/5'
                              : 'bg-gray-50'
                            : ''
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isEnabled
                              ? 'bg-[#C8A963]/20'
                              : darkMode
                                ? 'bg-white/10'
                                : 'bg-gray-200'
                          }`}>
                            <EventIcon 
                              size={16} 
                              className={isEnabled ? 'text-[#C8A963]' : darkMode ? 'text-white/40' : 'text-gray-400'}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {event.name}
                            </h4>
                            <p className={`text-sm mb-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                              {event.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {event.examples.map((example, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded ${
                                    darkMode
                                      ? 'bg-white/5 text-white/40'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {example}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleEvent(channel.id, event.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                            isEnabled
                              ? 'bg-[#C8A963]'
                              : darkMode
                                ? 'bg-white/20'
                                : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardPremium>
          );
        })}
      </div>

      {/* Summary */}
      <CardPremium darkMode={darkMode} className="p-6">
        <h3 className={`text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Resumen de Configuración
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const ChannelIcon = channel.icon;
            const channelPrefs = preferences[channel.id];
            const enabledEvents = Object.entries(channelPrefs)
              .filter(([key, value]) => key !== 'enabled' && value === true);

            return (
              <div
                key={channel.id}
                className={`p-4 rounded-lg ${
                  darkMode ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ChannelIcon size={16} style={{ color: channel.color }} />
                  <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {channel.name}
                  </span>
                </div>
                
                {!channel.available ? (
                  <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                    No disponible
                  </p>
                ) : !channelPrefs.enabled ? (
                  <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                    Desactivado
                  </p>
                ) : enabledEvents.length === 0 ? (
                  <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                    Sin eventos configurados
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {enabledEvents.map(([key]) => (
                      <li key={key} className={`text-xs flex items-center gap-1 ${
                        darkMode ? 'text-white/60' : 'text-gray-600'
                      }`}>
                        <Check size={12} className="text-[#10B981]" />
                        {eventTypes.find(e => e.id === key)?.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </CardPremium>
    </div>
  );
}

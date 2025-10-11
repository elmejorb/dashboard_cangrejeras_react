import { useState, useEffect } from "react";
import { Play, Square, RotateCcw, TrendingUp, Users, Circle, Plus, Edit, Trash2, Clock, Zap, Calendar, CheckSquare, XSquare, History, Trophy, Award, FileText, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useVoting } from "../../contexts/VotingContext";
import { useMatches } from "../../contexts/MatchContext";
import { usePlayers } from "../../contexts/PlayerContext";
import { useAuth } from "../../contexts/AuthContext";
import { liveVotingService } from "../../services/liveVotingService";
import { formatDateTimePR } from "../../utils/timeFormat";
import { BadgePremium } from "./BadgePremium";
// import { TimeFormatHelper } from "./TimeFormatHelper"; // Optional: Show 24h format examples

interface VotingManagementProps {
  darkMode: boolean;
}

export function VotingManagement({ darkMode }: VotingManagementProps) {
  const {
    polls,
    activePoll,
    templates,
    createPoll,
    updatePoll,
    deletePoll,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    togglePollStatus,
    resetPollVotes,
    getArchivedPolls,
    getPollsByMatch,
    // New Live Voting functions
    livePoll,
    openLiveVoting,
    activateLiveVoting,
    closeLiveVoting,
  } = useVoting();

  const { matches, liveMatch } = useMatches();
  const { activePlayers, players } = usePlayers();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('active');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<any>(null);
  const [allFirestorePolls, setAllFirestorePolls] = useState<any[]>([]);
  
  // Template dialog states
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    matchId: 0,
    title: 'Jugadora Destacada del Partido',
    description: '¡Vota por la mejor jugadora del partido!',
    isActive: false,
    autoStartEnabled: false,
    scheduledStartEnabled: false,
    scheduledStartDate: '',
    scheduledStartTime: '',
    scheduledEndDate: '',
    scheduledEndTime: '',
    options: [] as any[],
  });

  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  
  // Template dialog - separate player selection state
  const [selectedTemplatePlayers, setSelectedTemplatePlayers] = useState<number[]>([]);

  // Template form data
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    description: '',
    defaultAutoStart: false,
    defaultScheduledStart: false,
  });

  // Load all polls from Firestore on mount
  useEffect(() => {
    console.log('🔄 Iniciando carga de votaciones...');
    const loadPolls = async () => {
      try {
        console.log('📥 Solicitando votaciones a Firestore...');
        const polls = await liveVotingService.getAllPolls();
        console.log('📊 Votaciones recibidas:', polls);
        setAllFirestorePolls(polls);
        console.log(`✅ Cargadas ${polls.length} votaciones desde Firestore`);
      } catch (error) {
        console.error('❌ Error loading polls:', error);
      }
    };

    loadPolls();
  }, []);

  const handleOpenDialog = (poll?: any) => {
    if (poll) {
      setEditingPoll(poll);
      setFormData({
        matchId: poll.matchId,
        title: poll.title,
        description: poll.description,
        isActive: poll.isActive,
        autoStartEnabled: poll.autoStartEnabled,
        scheduledStartEnabled: poll.scheduledStartEnabled || false,
        scheduledStartDate: poll.scheduledStartDate || '',
        scheduledStartTime: poll.scheduledStartTime || '',
        scheduledEndDate: poll.scheduledEndDate || '',
        scheduledEndTime: poll.scheduledEndTime || '',
        options: poll.options,
      });
      setSelectedPlayers(poll.options.map((o: any) => o.playerId));
    } else {
      const upcomingMatch = liveMatch || matches.find(m => m.status === 'upcoming');
      setFormData({
        matchId: upcomingMatch?.id || 0,
        title: 'Jugadora Destacada del Partido',
        description: '¡Vota por la mejor jugadora del partido!',
        isActive: false,
        autoStartEnabled: false,
        scheduledStartEnabled: false,
        scheduledStartDate: '',
        scheduledStartTime: '',
        scheduledEndDate: '',
        scheduledEndTime: '',
        options: [],
      });
      setSelectedPlayers([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPoll(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlayers.length < 2) {
      toast.error('Selecciona al menos 2 jugadoras');
      return;
    }

    if (!currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      if (editingPoll) {
        // TODO: Implement edit for Firestore polls
        toast.info('Edición de votaciones en desarrollo');
      } else {
        // Create new poll in Firestore
        const loadingToast = toast.loading('Creando votación...');

        await liveVotingService.createLivePoll({
          matchId: formData.matchId || 0, // 0 = sin partido asignado
          title: formData.title,
          description: formData.description,
          playerIds: selectedPlayers,
          createdBy: currentUser.id,
        }, false); // Start inactive

        // Reload polls to show the new one
        const polls = await liveVotingService.getAllPolls();
        setAllFirestorePolls(polls);

        toast.success('✅ Votación creada exitosamente', { id: loadingToast });
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast.error('Error al crear votación: ' + error.message);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta votación?')) {
      deletePoll(id);
    }
  };

  const handleReset = (pollId: number) => {
    if (confirm('¿Estás seguro de reiniciar los votos? Esta acción no se puede deshacer.')) {
      resetPollVotes(pollId);
    }
  };

  const togglePlayerSelection = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const selectAllPlayers = () => {
    setSelectedPlayers(activePlayers.map(p => p.id));
  };

  const deselectAllPlayers = () => {
    setSelectedPlayers([]);
  };

  // Template player selection handlers
  const toggleTemplatePlayerSelection = (playerId: number) => {
    if (selectedTemplatePlayers.includes(playerId)) {
      setSelectedTemplatePlayers(selectedTemplatePlayers.filter(id => id !== playerId));
    } else {
      setSelectedTemplatePlayers([...selectedTemplatePlayers, playerId]);
    }
  };

  const selectAllTemplatePlayers = () => {
    setSelectedTemplatePlayers(activePlayers.map(p => p.id));
  };

  const deselectAllTemplatePlayers = () => {
    setSelectedTemplatePlayers([]);
  };

  const archivedPolls = getArchivedPolls();

  // Template dialog handlers
  const handleOpenTemplateDialog = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateFormData({
        name: template.name,
        description: template.description,
        defaultAutoStart: template.defaultAutoStart,
        defaultScheduledStart: template.defaultScheduledStart,
      });
      setSelectedTemplatePlayers(template.defaultPlayerIds || []);
    } else {
      setTemplateFormData({
        name: '',
        description: '',
        defaultAutoStart: false,
        defaultScheduledStart: false,
      });
      setSelectedTemplatePlayers([]);
    }
    setIsTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
    setSelectedTemplatePlayers([]);
  };

  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTemplatePlayers.length < 2) {
      return;
    }
    
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        ...templateFormData,
        defaultPlayerIds: selectedTemplatePlayers,
        updatedAt: new Date().toISOString(),
      });
    } else {
      createTemplate({
        ...templateFormData,
        defaultPlayerIds: selectedTemplatePlayers,
        type: 'template',
      });
    }
    
    handleCloseTemplateDialog();
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
      deleteTemplate(id);
    }
  };

  // Handler to open live voting from template
  const handleOpenLiveVotingFromTemplate = async (template: any) => {
    if (!liveMatch) {
      toast.error('No hay un partido en vivo actualmente');
      return;
    }

    if (livePoll && livePoll.isActive) {
      toast.error('Ya hay una votación activa. Cierra la votación actual primero.');
      return;
    }

    if (!currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      // Use template's default player IDs or all active players
      const playerIds = template.defaultPlayerIds && template.defaultPlayerIds.length > 0
        ? template.defaultPlayerIds
        : activePlayers.map(p => p.id);

      await openLiveVoting(
        liveMatch.id,
        template.name,
        template.description,
        playerIds,
        currentUser.id // ✅ Real admin user ID from AuthContext
      );
    } catch (error) {
      console.error('Error opening live voting:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Votaciones en Vivo
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Gestiona las votaciones con inicio automático o programado
          </p>
          <div className="flex gap-2 mt-2">
            <BadgePremium variant="live" size="sm">
              {polls.filter(p => p.status !== 'archived').length} votación{polls.filter(p => p.status !== 'archived').length !== 1 ? 'es' : ''} activa{polls.filter(p => p.status !== 'archived').length !== 1 ? 's' : ''}
            </BadgePremium>
            <BadgePremium variant="purple" size="sm">
              {templates.length} plantilla{templates.length !== 1 ? 's' : ''}
            </BadgePremium>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleOpenTemplateDialog()}
            variant="outline"
            className={`${
              darkMode 
                ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' 
                : 'border-purple-500 text-purple-600 hover:bg-purple-500/10'
            }`}
          >
            <FileText size={18} className="mr-2" />
            Crear Plantilla
          </Button>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-[#0C2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#0C2340] text-white shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Crear Votación
          </Button>
        </div>
      </div>

      {/* Tabs for Active vs History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full max-w-md grid-cols-2 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Circle size={16} />
            Activas ({polls.filter(p => p.status !== 'archived').length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            Historial ({archivedPolls.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Polls Tab */}
        <TabsContent value="active" className="space-y-6 mt-6">

      {/* Templates Section */}
      <div
        className={`rounded-xl border p-6 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-purple-500" />
            <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Plantillas de Votación
            </h3>
            <BadgePremium variant="purple" size="sm">
              {templates.length}
            </BadgePremium>
          </div>
        </div>
        
        <p className={`text-sm mb-4 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
          Configuraciones reutilizables para crear votaciones rápidamente
        </p>

        {templates.length === 0 ? (
          <div className={`p-8 rounded-lg border-2 border-dashed text-center ${
            darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
          }`}>
            <FileText size={32} className={`mx-auto mb-3 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              No hay plantillas creadas aún
            </p>
            <Button
              onClick={() => handleOpenTemplateDialog()}
              variant="outline"
              size="sm"
              className={`mt-3 ${
                darkMode 
                  ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' 
                  : 'border-purple-500 text-purple-600 hover:bg-purple-500/10'
              }`}
            >
              <Plus size={16} className="mr-2" />
              Crear Primera Plantilla
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border transition-all ${
                  darkMode
                    ? 'bg-[#C8A963]/5 border-[#C8A963]/20 hover:border-[#C8A963]/40'
                    : 'bg-[#C8A963]/5 border-[#C8A963]/20 hover:border-[#C8A963]/40'
                }`}
              >
                <div className="mb-3">
                  <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {template.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    {template.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={`${darkMode ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-700'}`}>
                    <Users size={12} className="mr-1" />
                    {template.defaultPlayerIds?.length || 0} jugadoras
                  </Badge>
                  {template.defaultAutoStart && (
                    <Badge className="bg-[#C8A963]/20 text-[#C8A963] hover:bg-[#C8A963]/30">
                      <Zap size={12} className="mr-1" />
                      Auto-inicio
                    </Badge>
                  )}
                  {template.defaultScheduledStart && (
                    <Badge className="bg-[#0C2340]/20 text-[#0C2340] hover:bg-[#0C2340]/30">
                      <Calendar size={12} className="mr-1" />
                      Programable
                    </Badge>
                  )}
                  {!template.defaultAutoStart && !template.defaultScheduledStart && (
                    <Badge variant="outline" className={darkMode ? 'border-white/20 text-white/60' : 'border-gray-300 text-gray-600'}>
                      Manual
                    </Badge>
                  )}
                </div>

                <div className={`flex gap-2 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  {liveMatch && !livePoll?.isActive && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenLiveVotingFromTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-[#E01E37] to-[#DC2626] hover:from-[#DC2626] hover:to-[#E01E37] text-white"
                    >
                      <Play size={14} className="mr-1" />
                      Usar en Vivo
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenTemplateDialog(template)}
                    className={`${!liveMatch || livePoll?.isActive ? 'flex-1' : ''} ${
                      darkMode
                        ? 'border-[#C8A963]/30 text-[#C8A963] hover:bg-[#C8A963]/10'
                        : 'border-[#C8A963] text-[#C8A963] hover:bg-[#C8A963]/10'
                    }`}
                  >
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-[#E01E37] hover:bg-[#E01E37]/10 border-[#E01E37]/30"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Poll Control Panel (NEW - Firestore-based) */}
      {livePoll && (
        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Votación {livePoll.isActive ? 'en Vivo' : 'Preparada'} (Tiempo Real)
                </h3>
                {livePoll.isActive ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E01E37]/10">
                    <Circle size={8} fill="#E01E37" className="text-[#E01E37] animate-pulse" />
                    <span className="text-sm text-[#E01E37]">EN VIVO</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A963]/10">
                    <Clock size={12} className="text-[#C8A963]" />
                    <span className="text-sm text-[#C8A963]">INACTIVA</span>
                  </div>
                )}
                <Badge className="bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30">
                  <Zap size={12} className="mr-1" />
                  Firestore Real-Time
                </Badge>
              </div>
              <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {livePoll.title}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                {livePoll.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {livePoll.isActive ? (
                <Button
                  onClick={closeLiveVoting}
                  className="bg-[#E01E37] hover:bg-[#DC2626] text-white"
                >
                  <Square size={18} className="mr-2" />
                  Cerrar Votación
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => activateLiveVoting(livePoll.id)}
                    className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white"
                  >
                    <Play size={18} className="mr-2" />
                    Activar Votación
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info('Votaciones en Vivo no se pueden editar', {
                        description: 'Para cambiar configuración, crea el partido nuevamente con otra plantilla',
                        duration: 4000
                      });
                    }}
                    className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10' : ''}
                  >
                    <Info size={18} className="mr-2" />
                    Info
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                  <Users size={20} className="text-[#3B82F6]" />
                </div>
                <div>
                  <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {livePoll.totalVotes.toLocaleString()}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Votos Totales
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#10B981]/10">
                  <TrendingUp size={20} className="text-[#10B981]" />
                </div>
                <div>
                  <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {livePoll.options.length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Jugadoras en Votación
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results - Live Poll (Real-time from Firestore) - Solo si está activa */}
      {livePoll && livePoll.isActive && (
        <div
          className={`rounded-xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <h3 className={`text-lg mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Resultados en Tiempo Real
          </h3>

          <div className="space-y-6">
            {livePoll.options
              .sort((a, b) => b.votes - a.votes)
              .map((option, index) => {
                // Join with PlayerContext to get current player data
                const player = players.find(p => p.id === option.playerId);
                if (!player) return null;

                const percentage = livePoll.totalVotes > 0
                  ? (option.votes / livePoll.totalVotes) * 100
                  : 0;

                return (
                  <div key={option.playerId}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                            index === 0 ? 'bg-[#C8A963]' :
                            index === 1 ? 'bg-[#E01E37]' :
                            'bg-[#0C2340]'
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {player.name}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            {player.position} • #{player.jerseyNumber}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {percentage.toFixed(1)}%
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                          {option.votes.toLocaleString()} votos
                        </div>
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-[#C8A963]' :
                          index === 1 ? 'bg-[#E01E37]' :
                          'bg-[#0C2340]'
                        }`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Polls List */}
      <div
        className={`rounded-xl border p-6 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className={darkMode ? 'text-white/70' : 'text-gray-700'} />
          <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Todas las Votaciones ({allFirestorePolls.length})
          </h3>
        </div>

        <div className="space-y-3">
          {allFirestorePolls.map((poll) => {
            const match = matches.find(m => m.id === poll.matchId);
            return (
              <div
                key={poll.id}
                className={`p-4 rounded-lg border transition-all ${
                  darkMode
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {poll.title}
                      </h4>
                      {poll.isActive && (
                        <Badge className="bg-[#E01E37]/20 text-[#E01E37]">
                          <Circle size={8} fill="#E01E37" className="mr-1 animate-pulse" />
                          Activa
                        </Badge>
                      )}
                      {poll.autoStartEnabled && (
                        <Badge className="bg-[#C8A963]/20 text-[#C8A963]">
                          <Zap size={12} className="mr-1" />
                          Auto
                        </Badge>
                      )}
                      {poll.scheduledStartEnabled && (
                        <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6]">
                          <Calendar size={12} className="mr-1" />
                          Programado
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      {match ? `${match.homeTeam} vs ${match.awayTeam}` : 'Sin partido asignado'} • {poll.totalVotes.toLocaleString()} votos
                    </p>
                    {poll.scheduledStartDate && poll.scheduledStartTime && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        <Clock size={12} className="inline mr-1" />
                        Inicio: {formatDateTimePR(poll.scheduledStartDate, poll.scheduledStartTime)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!poll.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePollStatus(poll.id)}
                        className={`${darkMode ? 'border-white/10 text-[#10B981] hover:bg-[#10B981]/10' : 'text-[#10B981]'}`}
                      >
                        <Play size={14} />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(poll)}
                      className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10' : ''}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(poll.id)}
                      className="text-[#E01E37] hover:bg-[#E01E37]/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div className={`${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    <Users size={12} className="inline mr-1" />
                    {poll.options.length} jugadoras
                  </div>
                  {poll.autoStartEnabled && (
                    <div className="text-[#C8A963]">
                      <Zap size={12} className="inline mr-1" />
                      Auto-inicio
                    </div>
                  )}
                  {poll.scheduledStartEnabled && (
                    <div className="text-[#8B5CF6]">
                      <Calendar size={12} className="inline mr-1" />
                      Programado
                    </div>
                  )}
                </div>

                {/* Jugadoras Asignadas */}
                <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                    Jugadoras en votación:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {poll.options.slice(0, 5).map((option: any) => {
                      const player = players.find(p => p.id === option.playerId);
                      return player ? (
                        <span
                          key={option.playerId}
                          className={`text-xs px-2 py-0.5 rounded ${
                            darkMode
                              ? 'bg-[#0C2340]/30 text-white/80'
                              : 'bg-[#0C2340]/10 text-[#0C2340]'
                          }`}
                        >
                          #{player.jerseyNumber} {player.name.split(' ')[0]}
                        </span>
                      ) : null;
                    })}
                    {poll.options.length > 5 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          darkMode
                            ? 'bg-white/10 text-white/60'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        +{poll.options.length - 5} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Poll Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white'
        }`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
              {editingPoll ? 'Editar Votación' : 'Crear Nueva Votación'}
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : 'text-gray-600'}>
              Configura la votación con inicio automático o programado
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Match Selection */}
            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                Partido Asociado *
              </Label>
              <select
                value={formData.matchId}
                onChange={(e) => setFormData({ ...formData, matchId: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
                required
              >
                <option value="">Seleccionar partido</option>
                {matches.filter(m => m.status !== 'completed').map(match => (
                  <option key={match.id} value={match.id}>
                    {match.homeTeam} vs {match.awayTeam} - {match.date}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                Título *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                placeholder="Jugadora Destacada del Partido"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                Descripción
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                placeholder="¡Vota por la mejor jugadora del partido!"
                rows={2}
              />
            </div>

            <Separator className={darkMode ? 'bg-white/10' : ''} />

            {/* Auto-Start Toggle */}
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              formData.autoStartEnabled
                ? darkMode 
                  ? 'bg-[#C8A963]/10 border-[#C8A963]/30' 
                  : 'bg-[#C8A963]/5 border-[#C8A963]/20'
                : darkMode 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-[#C8A963]" />
                  <div>
                    <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                      Inicio Automático por Partido en Vivo
                    </Label>
                    <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Se abrirá cuando el partido pase a "En Vivo"
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.autoStartEnabled}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    autoStartEnabled: checked,
                    // Si se activa este, desactivar el otro
                    scheduledStartEnabled: checked ? false : formData.scheduledStartEnabled
                  })}
                />
              </div>
            </div>

            {/* Scheduled Start Toggle */}
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              formData.scheduledStartEnabled
                ? darkMode 
                  ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30' 
                  : 'bg-[#8B5CF6]/5 border-[#8B5CF6]/20'
                : darkMode 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-[#8B5CF6]" />
                  <div>
                    <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                      Inicio Programado (Schedule)
                    </Label>
                    <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Se abrirá en fecha y hora específica
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.scheduledStartEnabled}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    scheduledStartEnabled: checked,
                    // Si se activa este, desactivar el otro
                    autoStartEnabled: checked ? false : formData.autoStartEnabled
                  })}
                />
              </div>

              {formData.scheduledStartEnabled && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-2">
                    <Label className={`text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      Fecha de Inicio
                    </Label>
                    <Input
                      type="date"
                      value={formData.scheduledStartDate}
                      onChange={(e) => setFormData({ ...formData, scheduledStartDate: e.target.value })}
                      className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={`text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      Hora de Inicio (24h)
                    </Label>
                    <Input
                      type="time"
                      value={formData.scheduledStartTime}
                      onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                      className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                      placeholder="19:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={`text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      Fecha de Cierre (Opcional)
                    </Label>
                    <Input
                      type="date"
                      value={formData.scheduledEndDate}
                      onChange={(e) => setFormData({ ...formData, scheduledEndDate: e.target.value })}
                      className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={`text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      Hora de Cierre (Opcional, 24h)
                    </Label>
                    <Input
                      type="time"
                      value={formData.scheduledEndTime}
                      onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                      className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                      placeholder="22:00"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className={darkMode ? 'bg-white/10' : ''} />

            {/* Player Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                  Jugadoras en Votación * (mínimo 2)
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={selectAllPlayers}
                    className={`text-xs ${darkMode ? 'border-white/10 text-[#10B981] hover:bg-[#10B981]/10' : 'text-[#10B981]'}`}
                  >
                    <CheckSquare size={14} className="mr-1" />
                    Todas
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={deselectAllPlayers}
                    className={`text-xs ${darkMode ? 'border-white/10 text-[#E01E37] hover:bg-[#E01E37]/10' : 'text-[#E01E37]'}`}
                  >
                    <XSquare size={14} className="mr-1" />
                    Ninguna
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                {activePlayers.map((player) => (
                  <label
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      selectedPlayers.includes(player.id)
                        ? darkMode
                          ? 'bg-[#C8A963]/20 border-[#C8A963]'
                          : 'bg-[#C8A963]/10 border-[#C8A963]'
                        : darkMode
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayerSelection(player.id)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex-1">
                      <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {player.name}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                        #{player.jerseyNumber} • {player.position}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Seleccionadas: {selectedPlayers.length} / {activePlayers.length}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10' : ''}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#0C2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#0C2340] text-white"
                disabled={selectedPlayers.length < 2}
              >
                {editingPoll ? 'Guardar Cambios' : 'Crear Votación'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          {archivedPolls.length === 0 ? (
            <div className={`rounded-xl border p-12 text-center ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}>
              <History size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
              <h3 className={`text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No hay votaciones archivadas
              </h3>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Las votaciones completadas aparecerán aquí con sus resultados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {archivedPolls.map((poll) => {
                const match = poll.matchId ? matches.find(m => m.id === poll.matchId) : null;
                const winner = poll.results?.winner;
                const winnerPlayer = winner ? players.find(p => p.id === winner.playerId) : null;

                return (
                  <div
                    key={poll.id}
                    className={`rounded-xl border p-6 transition-all ${
                      darkMode
                        ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                        : 'bg-white/80 border-gray-200 backdrop-blur-xl'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {poll.title}
                          </h3>
                          <Badge className="bg-gray-500/20 text-gray-500 hover:bg-gray-500/20">
                            Archivada
                          </Badge>
                        </div>
                        {match && (
                          <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            {match.homeTeam} vs {match.awayTeam} • {match.date}
                          </p>
                        )}
                        {poll.results?.closedAt && (
                          <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                            Cerrada: {formatDateTimePR(poll.results.closedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Winner */}
                    {winnerPlayer && (
                      <div className={`p-4 rounded-lg mb-4 ${
                        darkMode
                          ? 'bg-gradient-to-r from-[#C8A963]/20 to-[#C8A963]/10 border border-[#C8A963]/30'
                          : 'bg-gradient-to-r from-[#C8A963]/20 to-[#C8A963]/10 border border-[#C8A963]/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Trophy size={24} className="text-[#C8A963]" />
                          <div className="flex-1">
                            <div className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                              Ganadora
                            </div>
                            <div className={`flex items-baseline gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              <span className="text-xl">{winnerPlayer.name}</span>
                              <span className="text-sm opacity-70">#{winnerPlayer.jerseyNumber}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-2xl text-[#C8A963]">
                                {winner.percentage.toFixed(1)}%
                              </span>
                              <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                {winner.votes.toLocaleString()} votos
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Results Rankings */}
                    {poll.results && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                            Resultados Completos
                          </h4>
                          <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            Total: {poll.results.totalVotes.toLocaleString()} votos
                          </span>
                        </div>
                        <div className="space-y-2">
                          {poll.results.rankings.map((option, index) => {
                            const player = players.find(p => p.id === option.playerId);
                            if (!player) return null;

                            return (
                              <div
                                key={option.playerId}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  darkMode
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                {/* Rank */}
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                  index === 0
                                    ? 'bg-[#C8A963]/20 text-[#C8A963]'
                                    : index === 1
                                      ? 'bg-gray-400/20 text-gray-400'
                                      : index === 2
                                        ? 'bg-[#CD7F32]/20 text-[#CD7F32]'
                                        : darkMode
                                          ? 'bg-white/10 text-white/60'
                                          : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {index === 0 && <Trophy size={16} />}
                                  {index === 1 && <Award size={16} />}
                                  {index === 2 && <Award size={16} />}
                                  {index > 2 && <span className="text-sm">{index + 1}</span>}
                                </div>

                                {/* Player Info */}
                                <div className="flex-1 min-w-0">
                                  <div className={`flex items-baseline gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <span className="truncate">{player.name}</span>
                                    <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                      #{player.jerseyNumber}
                                    </span>
                                  </div>
                                  {/* Progress Bar */}
                                  <div className={`mt-2 h-2 rounded-full overflow-hidden ${
                                    darkMode ? 'bg-white/10' : 'bg-gray-200'
                                  }`}>
                                    <div
                                      className="h-full bg-gradient-to-r from-[#0C2340] to-[#C8A963] transition-all duration-500"
                                      style={{ width: `${option.percentage}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Stats */}
                                <div className="text-right">
                                  <div className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {option.percentage.toFixed(1)}%
                                  </div>
                                  <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                    {option.votes.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={handleCloseTemplateDialog}>
        <DialogContent className={`max-w-xl max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white'
        }`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <FileText size={20} className="text-purple-500" />
              {editingTemplate ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : 'text-gray-600'}>
              Configura una plantilla reutilizable para votaciones futuras
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTemplate} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                Nombre de la Plantilla *
              </Label>
              <Input
                value={templateFormData.name}
                onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                placeholder="MVP del Partido"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                Descripción
              </Label>
              <Textarea
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                placeholder="¡Vota por la jugadora más valiosa del partido!"
                rows={3}
              />
            </div>

            <Separator className={darkMode ? 'bg-white/10' : ''} />

            {/* Default Auto-Start Toggle */}
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              templateFormData.defaultAutoStart
                ? darkMode 
                  ? 'bg-[#C8A963]/10 border-[#C8A963]/30' 
                  : 'bg-[#C8A963]/5 border-[#C8A963]/20'
                : darkMode 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-[#C8A963]" />
                  <div>
                    <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                      Inicio Automático por Defecto
                    </Label>
                    <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Las votaciones creadas con esta plantilla se abrirán automáticamente
                    </p>
                  </div>
                </div>
                <Switch
                  checked={templateFormData.defaultAutoStart}
                  onCheckedChange={(checked) => setTemplateFormData({ 
                    ...templateFormData, 
                    defaultAutoStart: checked,
                    defaultScheduledStart: checked ? false : templateFormData.defaultScheduledStart
                  })}
                />
              </div>
            </div>

            {/* Default Scheduled Start Toggle */}
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              templateFormData.defaultScheduledStart
                ? darkMode 
                  ? 'bg-purple-500/10 border-purple-500/30' 
                  : 'bg-purple-500/5 border-purple-500/20'
                : darkMode 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-purple-500" />
                  <div>
                    <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                      Inicio Programado por Defecto
                    </Label>
                    <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Las votaciones requerirán fecha y hora específica
                    </p>
                  </div>
                </div>
                <Switch
                  checked={templateFormData.defaultScheduledStart}
                  onCheckedChange={(checked) => setTemplateFormData({ 
                    ...templateFormData, 
                    defaultScheduledStart: checked,
                    defaultAutoStart: checked ? false : templateFormData.defaultAutoStart
                  })}
                />
              </div>
            </div>

            <Separator className={darkMode ? 'bg-white/10' : ''} />

            {/* Player Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                  Jugadoras por Defecto * (mínimo 2)
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={selectAllTemplatePlayers}
                    className={`text-xs ${darkMode ? 'border-white/10 text-[#10B981] hover:bg-[#10B981]/10' : 'text-[#10B981]'}`}
                  >
                    <CheckSquare size={14} className="mr-1" />
                    Todas
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={deselectAllTemplatePlayers}
                    className={`text-xs ${darkMode ? 'border-white/10 text-[#E01E37] hover:bg-[#E01E37]/10' : 'text-[#E01E37]'}`}
                  >
                    <XSquare size={14} className="mr-1" />
                    Ninguna
                  </Button>
                </div>
              </div>
              
              <div className={`grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg ${
                darkMode ? 'border-white/10' : 'border-gray-200'
              }`}>
                {activePlayers.map((player) => (
                  <label
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplatePlayers.includes(player.id)
                        ? darkMode
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-purple-100 border-purple-500'
                        : darkMode
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTemplatePlayers.includes(player.id)}
                      onChange={() => toggleTemplatePlayerSelection(player.id)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex-1">
                      <div className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {player.name}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                        #{player.jerseyNumber} • {player.position}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Seleccionadas: {selectedTemplatePlayers.length} / {activePlayers.length}
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${
              darkMode 
                ? 'bg-blue-500/10 border-blue-500/20' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                💡 <strong>Nota:</strong> Estas configuraciones son valores por defecto. Podrás ajustarlas al crear cada votación.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseTemplateDialog}
                className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10' : ''}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                disabled={selectedTemplatePlayers.length < 2}
              >
                {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

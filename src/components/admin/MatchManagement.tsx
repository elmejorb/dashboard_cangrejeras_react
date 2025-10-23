import { useState } from "react";
import { Plus, Edit, Trash2, Calendar as CalendarIcon, MapPin, Clock, Trophy, Users, X, Check, BarChart3, TrendingUp, Vote, Zap, Home, Plane, Circle, Volleyball, Swords, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useMatches, Match, MatchStats } from "../../contexts/MatchContext";
import { useVoting } from "../../contexts/VotingContext";
import { usePlayers } from "../../contexts/PlayerContext";
import { useAuth } from "../../contexts/AuthContext";
import { liveVotingService } from "../../services/liveVotingService";
import { EmptyMatches } from "./EmptyStates";
import { ConfirmModal } from "./ModalPremium";
import { BadgePremium } from "./BadgePremium";
import { DatePicker, TimePicker } from "./DateTimePicker";

interface MatchManagementProps {
  darkMode: boolean;
}

export function MatchManagement({ darkMode }: MatchManagementProps) {
  const {
    matches,
    isLoading,
    addMatch,
    updateMatch,
    deleteMatch,
    updateMatchStatus,
    updateMatchStats,
    venues,
    addVenue,
    deleteVenue,
    teams,
    addTeam,
    deleteTeam
  } = useMatches();

  const {
    templates,
    polls,
    createPollFromTemplate,
    createPoll,
    updatePoll,
    getUnassignedPolls
  } = useVoting();

  const { activePlayers } = usePlayers();
  const { currentUser } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isVenuesDialogOpen, setIsVenuesDialogOpen] = useState(false);
  const [isTeamsDialogOpen, setIsTeamsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [statsMatch, setStatsMatch] = useState<Match | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(9); // October (0-indexed)
  const [selectedYear] = useState(2025);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Venue autocomplete state
  const [venueInput, setVenueInput] = useState<string>('');
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);
  const [filteredVenues, setFilteredVenues] = useState<string[]>([]);

  // Team autocomplete state
  const [homeTeamInput, setHomeTeamInput] = useState<string>('Cangrejeras');
  const [awayTeamInput, setAwayTeamInput] = useState<string>('');
  const [showHomeTeamSuggestions, setShowHomeTeamSuggestions] = useState(false);
  const [showAwayTeamSuggestions, setShowAwayTeamSuggestions] = useState(false);
  const [filteredHomeTeams, setFilteredHomeTeams] = useState<string[]>([]);
  const [filteredAwayTeams, setFilteredAwayTeams] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Match>>({
    homeTeam: 'Cangrejeras',
    awayTeam: '',
    date: '',
    time: '',
    venue: '',
    status: 'upcoming',
    homeScore: 0,
    awayScore: 0,
    description: '',
    ticketUrl: '',
    streamUrl: '',
    votingId: undefined,
  });

  // Voting configuration state
  const [votingOption, setVotingOption] = useState<'none' | 'template' | 'new' | 'existing'>('none');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedPollId, setSelectedPollId] = useState<string>('');
  const [newPollTitle, setNewPollTitle] = useState<string>('');
  const [newPollDescription, setNewPollDescription] = useState<string>('');
  const [newPollAutoStart, setNewPollAutoStart] = useState<boolean>(true);

  // Stats form state
  const [statsFormData, setStatsFormData] = useState<{home: MatchStats, away: MatchStats}>({
    home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
    away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
  });

  const resetForm = () => {
    setFormData({
      homeTeam: 'Cangrejeras',
      awayTeam: '',
      date: '',
      time: '',
      venue: '',
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0,
      description: '',
      ticketUrl: '',
      streamUrl: '',
      votingId: undefined,
    });
    setEditingMatch(null);
    setVotingOption('none');
    setSelectedTemplateId('');
    setSelectedPollId('');
    setNewPollTitle('');
    setNewPollDescription('');
    setNewPollAutoStart(true);
    setVenueInput('');
    setShowVenueSuggestions(false);
    setFilteredVenues([]);
    setHomeTeamInput('Cangrejeras');
    setAwayTeamInput('');
    setShowHomeTeamSuggestions(false);
    setShowAwayTeamSuggestions(false);
    setFilteredHomeTeams([]);
    setFilteredAwayTeams([]);
  };

  const handleOpenDialog = (match?: Match) => {
    if (match) {
      setEditingMatch(match);

      // Extraer fecha y hora del timestamp
      const matchDate = match.date instanceof Date ? match.date : new Date(match.date);
      const dateString = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeString = matchDate.toTimeString().substring(0, 5); // HH:MM

      setFormData({
        ...match,
        description: match.description || '',
        ticketUrl: match.ticketUrl || '',
        streamUrl: match.streamUrl || '',
        awayTeam: match.awayTeam || '',
        date: dateString,
        time: timeString,
        venue: match.venue || '',
      });
      setVenueInput(match.venue || '');
      setHomeTeamInput(match.homeTeam || 'Cangrejeras');
      setAwayTeamInput(match.awayTeam || '');
    } else {
      resetForm();
      setVenueInput('');
      setHomeTeamInput('Cangrejeras');
      setAwayTeamInput('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsSubmitting(false); // Reset submitting state
    setTimeout(resetForm, 200);
  };

  const handleOpenStatsDialog = (match: Match) => {
    setStatsMatch(match);
    if (match.statistics) {
      setStatsFormData(match.statistics);
    } else {
      setStatsFormData({
        home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
        away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
      });
    }
    setIsStatsDialogOpen(true);
  };

  const handleCloseStatsDialog = () => {
    setIsStatsDialogOpen(false);
    setStatsMatch(null);
  };

  // Handle venue input change with autocomplete
  const handleVenueInputChange = (value: string) => {
    setVenueInput(value);
    setFormData({ ...formData, venue: value });

    if (value.trim()) {
      const filtered = venues.filter(v => 
        v.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVenues(filtered);
      setShowVenueSuggestions(true);
    } else {
      setFilteredVenues([]);
      setShowVenueSuggestions(false);
    }
  };

  const handleVenueSelect = (venue: string) => {
    setVenueInput(venue);
    setFormData({ ...formData, venue });
    setShowVenueSuggestions(false);
  };

  const handleVenueBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setShowVenueSuggestions(false);
      // If the input is not empty and not in the list, add it
      const trimmedVenue = venueInput.trim();
      if (trimmedVenue && !venues.includes(trimmedVenue)) {
        addVenue(trimmedVenue);
      }
    }, 200);
  };

  // Handle home team input change with autocomplete
  const handleHomeTeamInputChange = (value: string) => {
    setHomeTeamInput(value);
    setFormData({ ...formData, homeTeam: value });

    if (value.trim()) {
      const filtered = teams.filter(t => 
        t.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredHomeTeams(filtered);
      setShowHomeTeamSuggestions(true);
    } else {
      setFilteredHomeTeams([]);
      setShowHomeTeamSuggestions(false);
    }
  };

  const handleHomeTeamSelect = (team: string) => {
    setHomeTeamInput(team);
    setFormData({ ...formData, homeTeam: team });
    setShowHomeTeamSuggestions(false);
  };

  const handleHomeTeamBlur = () => {
    setTimeout(() => {
      setShowHomeTeamSuggestions(false);
      const trimmedTeam = homeTeamInput.trim();
      if (trimmedTeam && !teams.includes(trimmedTeam)) {
        addTeam(trimmedTeam);
      }
    }, 200);
  };

  // Handle away team input change with autocomplete
  const handleAwayTeamInputChange = (value: string) => {
    setAwayTeamInput(value);
    setFormData({ ...formData, awayTeam: value });

    if (value.trim()) {
      const filtered = teams.filter(t => 
        t.toLowerCase().includes(value.toLowerCase()) && t !== formData.homeTeam
      );
      setFilteredAwayTeams(filtered);
      setShowAwayTeamSuggestions(true);
    } else {
      setFilteredAwayTeams([]);
      setShowAwayTeamSuggestions(false);
    }
  };

  const handleAwayTeamSelect = (team: string) => {
    setAwayTeamInput(team);
    setFormData({ ...formData, awayTeam: team });
    setShowAwayTeamSuggestions(false);
  };

  const handleAwayTeamBlur = () => {
    setTimeout(() => {
      setShowAwayTeamSuggestions(false);
      const trimmedTeam = awayTeamInput.trim();
      if (trimmedTeam && !teams.includes(trimmedTeam)) {
        addTeam(trimmedTeam);
      }
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.awayTeam || !formData.date || !formData.time || !formData.venue) {
      return;
    }

    if (!currentUser) {
      console.error('No user authenticated');
      return;
    }

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Show loading toast
    const loadingToast = toast.loading(
      editingMatch ? 'Actualizando partido...' : 'Creando partido...',
      { duration: Infinity }
    );

    try {
      let createdMatch: Match;

      // First, create or update the match
      // El servicio matchService se encargará de convertir date+time a timestamp
      if (editingMatch) {
        await updateMatch(editingMatch.id, formData);
        createdMatch = { ...editingMatch, ...formData } as Match;
      } else {
        createdMatch = await addMatch(formData as Omit<Match, 'id'>);
      }

      // Then, handle voting creation if a template was selected
      if (votingOption === 'template' && selectedTemplateId && !editingMatch) {
        try {
          // Update loading message
          toast.loading('Creando votación desde plantilla...', { id: loadingToast });

          const template = templates.find(t => t.id === selectedTemplateId);

          if (!template) {
            console.error('❌ Template no encontrado:', selectedTemplateId);
            toast.error('Error: Plantilla no encontrada', { id: loadingToast });
            return;
          }

          // SIEMPRE usar jugadoras activas ACTUALES desde Firestore
          // Esto asegura que si se agregó una jugadora nueva, se incluye en la votación
          const playerIds = activePlayers.map(p => p.id);

          console.log('📊 Creando votación con jugadoras activas actuales:', {
            matchId: createdMatch.id,
            matchIdType: typeof createdMatch.id,
            templateName: template.name,
            playerIds,
            playerCount: playerIds.length,
            activePlayersCount: activePlayers.length,
            playersList: activePlayers.map(p => `${p.name} (#${p.jerseyNumber})`),
            createdBy: currentUser.id
          });

          if (playerIds.length === 0) {
            console.error('⚠️ No hay jugadoras activas para crear la votación');
            toast.error('No hay jugadoras activas para crear la votación', { id: loadingToast });
            return;
          }

          // Create live poll in Firestore (INACTIVE - starts inactive)
          // Will activate automatically at match time or manually by admin
          const newPoll = await liveVotingService.createLivePoll({
            matchId: createdMatch.id,
            title: template.name,
            description: template.description,
            playerIds,
            createdBy: currentUser.id,
          }, false); // ← false = start inactive

          console.log('✅ Votación creada exitosamente:', newPoll);
          toast.success('Votación creada', { id: loadingToast, duration: 2000 });
        } catch (votingError: any) {
          console.error('❌ ERROR al crear votación:', votingError);
          toast.error('Error al crear votación: ' + votingError.message, {
            id: loadingToast,
            duration: 5000
          });
          // No lanzar el error para que el partido se cree aunque falle la votación
        }
      }

      // Dismiss loading toast and show success
      toast.success(
        editingMatch ? 'Partido actualizado exitosamente' : '✅ Partido creado exitosamente',
        { id: loadingToast, duration: 3000 }
      );

      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving match:', error);

      // Dismiss loading toast and show error
      toast.error(
        `Error: ${error.message || 'No se pudo guardar el partido'}`,
        { id: loadingToast, duration: 4000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (statsMatch) {
      try {
        await updateMatchStats(statsMatch.id, statsFormData);
        handleCloseStatsDialog();
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este partido?')) {
      try {
        await deleteMatch(id);
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  };

  const handleQuickStatusChange = async (id: string, status: Match['status']) => {
    try {
      await updateMatchStatus(id, status);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return { bg: 'bg-[#E01E37]/10', text: 'text-[#E01E37]', border: 'border-[#E01E37]/30' };
      case 'upcoming':
        return { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]', border: 'border-[#F97316]/30' };
      case 'completed':
        return { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live':
        return 'En Vivo';
      case 'upcoming':
        return 'Próximo';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  // Calendar helpers
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getMatchesForDay = (day: number) => {
    return matches.filter(m => {
      const matchDate = m.date instanceof Date ? m.date : new Date(m.date);
      return matchDate.getDate() === day &&
             matchDate.getMonth() === selectedMonth &&
             matchDate.getFullYear() === selectedYear;
    });
  };

  const filteredMatches = filterStatus === 'all'
    ? matches
    : matches.filter(m => m.status === filterStatus);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Partidos
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Administra el calendario completo de partidos
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8A963]"></div>
        </div>
      </div>
    );
  }

  // Show empty state if no matches
  const showEmptyState = matches.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Partidos
          </h2>
          {!showEmptyState && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <BadgePremium variant="live" size="sm">
                {matches.length} partido{matches.length !== 1 ? 's' : ''}
              </BadgePremium>
              <BadgePremium variant="default" size="sm">
                {venues.length} estadio{venues.length !== 1 ? 's' : ''}
              </BadgePremium>
              <BadgePremium variant="default" size="sm">
                {teams.length} equipo{teams.length !== 1 ? 's' : ''}
              </BadgePremium>
            </div>
          )}
          {showEmptyState && (
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Administra el calendario completo de partidos
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setIsVenuesDialogOpen(true)}
            variant="outline"
            className={`${
              darkMode 
                ? 'border-[#C8A963]/30 text-[#C8A963] hover:bg-[#C8A963]/10' 
                : 'border-[#C8A963] text-[#C8A963] hover:bg-[#C8A963]/10'
            }`}
          >
            <MapPin size={18} className="mr-2" />
            Estadios
          </Button>
          <Button 
            onClick={() => setIsTeamsDialogOpen(true)}
            variant="outline"
            className={`${
              darkMode 
                ? 'border-[#E84C4C]/30 text-[#E84C4C] hover:bg-[#E84C4C]/10' 
                : 'border-[#E84C4C] text-[#E84C4C] hover:bg-[#E84C4C]/10'
            }`}
          >
            <Users size={18} className="mr-2" />
            Equipos
          </Button>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-[#0C2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#0C2340] text-white shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Crear Partido
          </Button>
        </div>
      </div>

      {/* Conditional Content */}
      {showEmptyState ? (
        <EmptyMatches
          darkMode={darkMode}
          onAction={() => handleOpenDialog()}
          actionLabel="Crear Primer Partido"
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-xl border p-4 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Partidos Totales
              </p>
              <p className={`text-2xl mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {matches.length}
              </p>
            </div>
            <Trophy className={`${darkMode ? 'text-[#C8A963]' : 'text-[#0C2340]'}`} size={32} />
          </div>
        </div>

        <div className={`rounded-xl border p-4 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Próximos
              </p>
              <p className={`text-2xl mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {matches.filter(m => m.status === 'upcoming').length}
              </p>
            </div>
            <CalendarIcon className="text-[#F97316]" size={32} />
          </div>
        </div>

        <div className={`rounded-xl border p-4 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Completados
              </p>
              <p className={`text-2xl mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {matches.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <Check className="text-[#10B981]" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="xl:col-span-2">
          <div
            className={`rounded-xl border p-6 ${
              darkMode
                ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border-gray-200 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <CalendarIcon size={18} className="text-[#C8A963]" />
                <span>{monthNames[selectedMonth]} {selectedYear}</span>
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                  className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10 hover:text-white' : ''}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))}
                  className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10 hover:text-white' : ''}
                >
                  →
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div
                  key={day}
                  className={`text-center text-xs py-2 ${
                    darkMode ? 'text-white/60' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}

              {/* Blank spaces */}
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="aspect-square"></div>
              ))}

              {/* Days */}
              {days.map((day) => {
                const dayMatches = getMatchesForDay(day);
                const today = new Date();
                const isToday = 
                  today.getDate() === day && 
                  today.getMonth() === selectedMonth && 
                  today.getFullYear() === selectedYear;

                return (
                  <div
                    key={day}
                    className={`aspect-square p-1 rounded-lg border transition-all cursor-pointer ${
                      isToday 
                        ? darkMode
                          ? 'bg-[#C8A963]/20 border-[#C8A963]'
                          : 'bg-[#C8A963]/10 border-[#C8A963]'
                        : darkMode
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (dayMatches.length === 0) {
                        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        setFormData({ ...formData, date: dateStr });
                        handleOpenDialog();
                      }
                    }}
                  >
                    <div className={`text-xs mb-1 ${
                      isToday 
                        ? 'text-[#C8A963]' 
                        : darkMode ? 'text-white/80' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    {dayMatches.length > 0 && (
                      <div className="space-y-0.5">
                        {dayMatches.slice(0, 2).map((match) => {
                          const colors = getStatusColor(match.status);
                          return (
                            <div
                              key={match.id}
                              className={`text-[10px] px-1 py-0.5 rounded ${colors.bg} ${colors.text} cursor-pointer hover:scale-105 transition-transform`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(match);
                              }}
                            >
                              <div className="truncate">
                                {match.isHomeTeam ? match.awayTeam : match.homeTeam}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 opacity-90">
                                {match.isHomeTeam ? (
                                  <Home size={8} />
                                ) : (
                                  <Plane size={8} />
                                )}
                                <span className="text-[9px]">
                                  {match.time ? match.time.substring(0, 5) : '--:--'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {dayMatches.length > 2 && (
                          <div className={`text-[10px] text-center ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                            +{dayMatches.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Match List with Filters */}
        <div className="space-y-4">
          {/* Filter */}
          <div className={`rounded-xl border p-4 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}>
            <Label className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
              Filtrar por Estado
            </Label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full mt-2 px-3 py-2 rounded-lg border transition-all ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">Todos</option>
              <option value="live">En Vivo</option>
              <option value="upcoming">Próximos</option>
              <option value="completed">Finalizados</option>
            </select>
          </div>

          <h3 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Lista de Partidos ({filteredMatches.length})
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredMatches.map((match) => {
              const colors = getStatusColor(match.status);
              return (
                <div
                  key={match.id}
                  className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${
                    darkMode
                      ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl hover:bg-[#1E293B]/70'
                      : 'bg-white/80 border-gray-200 backdrop-blur-xl hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${colors.bg} ${colors.text} hover:${colors.bg}`}>
                        {getStatusLabel(match.status)}
                      </Badge>
                      <Badge className={`${
                        match.isHomeTeam 
                          ? 'bg-[#C8A963]/20 text-[#C8A963]' 
                          : 'bg-[#0C2340]/20 text-[#0C2340] dark:text-[#C8A963]'
                      } flex items-center gap-1.5`}>
                        {match.isHomeTeam ? <Home size={12} /> : <Plane size={12} />}
                        <span>{match.isHomeTeam ? 'Local' : 'Visitante'}</span>
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {(match.status === 'live' || match.status === 'completed') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenStatsDialog(match)}
                          className={`${darkMode ? 'text-[#C8A963] hover:text-[#C8A963] hover:bg-white/10' : 'text-[#0C2340]'}`}
                          title="Gestionar Estadísticas"
                        >
                          <BarChart3 size={14} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenDialog(match)}
                        className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(match.id)}
                        className="text-[#E01E37] hover:text-[#E01E37] hover:bg-[#E01E37]/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className={`mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center justify-between">
                      <span>{match.homeTeam}</span>
                      {match.homeScore !== undefined && (
                        <span className="text-xl mx-2">{match.homeScore}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{match.awayTeam}</span>
                      {match.awayScore !== undefined && (
                        <span className="text-xl mx-2">{match.awayScore}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      <CalendarIcon size={12} />
                      <span>{match.date instanceof Date ? match.date.toLocaleDateString('es-PR') : new Date(match.date).toLocaleDateString('es-PR')}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      <Clock size={12} />
                      <span>{match.time || (match.date instanceof Date ? match.date.toLocaleTimeString('es-PR', { hour: '2-digit', minute: '2-digit' }) : new Date(match.date).toLocaleTimeString('es-PR', { hour: '2-digit', minute: '2-digit' }))}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      <MapPin size={12} />
                      <span className="truncate">{match.venue}</span>
                    </div>
                  </div>

                  {/* Quick Status Change */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickStatusChange(match.id, 'upcoming')}
                      className={`flex-1 text-xs flex items-center justify-center gap-1.5 ${
                        match.status === 'upcoming' 
                          ? 'bg-[#F97316]/20 border-[#F97316] text-[#F97316]' 
                          : darkMode ? 'border-white/10 text-white/60' : ''
                      }`}
                    >
                      <CalendarIcon size={14} />
                      <span>Próximo</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickStatusChange(match.id, 'live')}
                      className={`flex-1 text-xs flex items-center justify-center gap-1.5 ${
                        match.status === 'live' 
                          ? 'bg-[#E01E37]/20 border-[#E01E37] text-[#E01E37]' 
                          : darkMode ? 'border-white/10 text-white/60' : ''
                      }`}
                    >
                      <Zap size={14} />
                      <span>En Vivo</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickStatusChange(match.id, 'completed')}
                      className={`flex-1 text-xs flex items-center justify-center gap-1.5 ${
                        match.status === 'completed' 
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' 
                          : darkMode ? 'border-white/10 text-white/60' : ''
                      }`}
                    >
                      <Check size={14} />
                      <span>Finalizado</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
        </>
      )}

      {/* Create/Edit Match Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white'
        }`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
              {editingMatch ? 'Editar Partido' : 'Crear Nuevo Partido'}
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : 'text-gray-600'}>
              {editingMatch 
                ? 'Modifica la información del partido' 
                : 'Completa los detalles del nuevo partido'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                  <Users size={14} className="text-[#0C2340]" />
                  Equipo Local *
                </Label>
                <div className="relative">
                  <input
                    type="text"
                    value={homeTeamInput}
                    onChange={(e) => handleHomeTeamInputChange(e.target.value)}
                    onFocus={() => {
                      if (homeTeamInput.trim()) {
                        const filtered = teams.filter(t => 
                          t.toLowerCase().includes(homeTeamInput.toLowerCase())
                        );
                        setFilteredHomeTeams(filtered);
                        setShowHomeTeamSuggestions(true);
                      }
                    }}
                    onBlur={handleHomeTeamBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmedTeam = homeTeamInput.trim();
                        if (trimmedTeam && !teams.includes(trimmedTeam)) {
                          addTeam(trimmedTeam);
                        }
                        setShowHomeTeamSuggestions(false);
                      } else if (e.key === 'Escape') {
                        setShowHomeTeamSuggestions(false);
                      }
                    }}
                    placeholder="Escribe o selecciona un equipo..."
                    className={`w-full px-4 py-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                      darkMode
                        ? 'bg-gradient-to-br from-[#1E293B]/80 via-[#1E293B]/60 to-[#1E293B]/80 border-white/10 text-white hover:border-[#0C2340]/50 focus:border-[#0C2340]/50'
                        : 'bg-gradient-to-br from-white/95 via-white/80 to-white/95 border-gray-200 text-gray-900 hover:border-[#0C2340]/50 focus:border-[#0C2340]/50'
                    } backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-[#0C2340]/20`}
                    required
                  />
                  
                  {/* Autocomplete Suggestions */}
                  {showHomeTeamSuggestions && (filteredHomeTeams.length > 0 || homeTeamInput.trim()) && (
                    <div
                      className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl z-50 max-h-48 overflow-y-auto backdrop-blur-2xl ${
                        darkMode
                          ? 'bg-gradient-to-br from-[#1E293B]/95 via-[#0F172A]/95 to-[#1E293B]/95 border-white/10'
                          : 'bg-gradient-to-br from-white/98 via-gray-50/98 to-white/98 border-gray-200'
                      }`}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0C2340]/20 via-[#0C2340]/5 to-[#0C2340]/20 rounded-xl blur opacity-50" />
                      
                      <div className="relative">
                        {filteredHomeTeams.length > 0 ? (
                          <>
                            {filteredHomeTeams.map((team, index) => (
                              <button
                                key={team}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleHomeTeamSelect(team);
                                }}
                                className={`w-full px-4 py-3 text-left transition-all hover:scale-[1.02] ${
                                  index === 0 ? 'rounded-t-xl' : ''
                                } ${
                                  index === filteredHomeTeams.length - 1 ? 'rounded-b-xl' : ''
                                } ${
                                  darkMode
                                    ? 'hover:bg-[#0C2340]/20 text-white'
                                    : 'hover:bg-[#0C2340]/5 text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-[#0C2340]" />
                                  <span>{team}</span>
                                  {team === 'Cangrejeras' && (
                                    <BadgePremium variant="live" size="sm">Principal</BadgePremium>
                                  )}
                                </div>
                              </button>
                            ))}
                          </>
                        ) : homeTeamInput.trim() && (
                          <div
                            className={`px-4 py-3 rounded-xl ${
                              darkMode ? 'text-white/60' : 'text-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Plus size={14} className="text-[#C8A963]" />
                              <span>Presiona Enter para añadir "{homeTeamInput}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                  <Users size={14} className="text-[#E84C4C]" />
                  Equipo Visitante *
                </Label>
                <div className="relative">
                  <input
                    type="text"
                    value={awayTeamInput}
                    onChange={(e) => handleAwayTeamInputChange(e.target.value)}
                    onFocus={() => {
                      if (awayTeamInput.trim()) {
                        const filtered = teams.filter(t => 
                          t.toLowerCase().includes(awayTeamInput.toLowerCase()) && t !== formData.homeTeam
                        );
                        setFilteredAwayTeams(filtered);
                        setShowAwayTeamSuggestions(true);
                      }
                    }}
                    onBlur={handleAwayTeamBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmedTeam = awayTeamInput.trim();
                        if (trimmedTeam && !teams.includes(trimmedTeam)) {
                          addTeam(trimmedTeam);
                        }
                        setShowAwayTeamSuggestions(false);
                      } else if (e.key === 'Escape') {
                        setShowAwayTeamSuggestions(false);
                      }
                    }}
                    placeholder="Escribe o selecciona un equipo..."
                    className={`w-full px-4 py-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                      darkMode
                        ? 'bg-gradient-to-br from-[#1E293B]/80 via-[#1E293B]/60 to-[#1E293B]/80 border-white/10 text-white hover:border-[#E84C4C]/50 focus:border-[#E84C4C]/50'
                        : 'bg-gradient-to-br from-white/95 via-white/80 to-white/95 border-gray-200 text-gray-900 hover:border-[#E84C4C]/50 focus:border-[#E84C4C]/50'
                    } backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-[#E84C4C]/20`}
                    required
                  />
                  
                  {/* Autocomplete Suggestions */}
                  {showAwayTeamSuggestions && (filteredAwayTeams.length > 0 || awayTeamInput.trim()) && (
                    <div
                      className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl z-50 max-h-48 overflow-y-auto backdrop-blur-2xl ${
                        darkMode
                          ? 'bg-gradient-to-br from-[#1E293B]/95 via-[#0F172A]/95 to-[#1E293B]/95 border-white/10'
                          : 'bg-gradient-to-br from-white/98 via-gray-50/98 to-white/98 border-gray-200'
                      }`}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E84C4C]/20 via-[#E84C4C]/5 to-[#E84C4C]/20 rounded-xl blur opacity-50" />
                      
                      <div className="relative">
                        {filteredAwayTeams.length > 0 ? (
                          <>
                            {filteredAwayTeams.map((team, index) => (
                              <button
                                key={team}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleAwayTeamSelect(team);
                                }}
                                className={`w-full px-4 py-3 text-left transition-all hover:scale-[1.02] ${
                                  index === 0 ? 'rounded-t-xl' : ''
                                } ${
                                  index === filteredAwayTeams.length - 1 ? 'rounded-b-xl' : ''
                                } ${
                                  darkMode
                                    ? 'hover:bg-[#E84C4C]/20 text-white'
                                    : 'hover:bg-[#E84C4C]/5 text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-[#E84C4C]" />
                                  <span>{team}</span>
                                </div>
                              </button>
                            ))}
                          </>
                        ) : awayTeamInput.trim() && (
                          <div
                            className={`px-4 py-3 rounded-xl ${
                              darkMode ? 'text-white/60' : 'text-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Plus size={14} className="text-[#C8A963]" />
                              <span>Presiona Enter para añadir "{awayTeamInput}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                value={formData.date || ''}
                onChange={(value) => setFormData({ ...formData, date: value })}
                darkMode={darkMode}
                label="Fecha"
                required
              />

              <TimePicker
                value={formData.time || ''}
                onChange={(value) => setFormData({ ...formData, time: value })}
                darkMode={darkMode}
                label="Hora"
                required
              />
            </div>

            {/* Venue with Autocomplete */}
            <div className="space-y-2 relative">
              <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                <MapPin size={14} className="text-[#C8A963]" />
                Estadio *
              </Label>
              <div className="relative">
                <input
                  type="text"
                  value={venueInput}
                  onChange={(e) => handleVenueInputChange(e.target.value)}
                  onFocus={() => {
                    if (venueInput.trim()) {
                      const filtered = venues.filter(v => 
                        v.toLowerCase().includes(venueInput.toLowerCase())
                      );
                      setFilteredVenues(filtered);
                      setShowVenueSuggestions(true);
                    }
                  }}
                  onBlur={handleVenueBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmedVenue = venueInput.trim();
                      if (trimmedVenue && !venues.includes(trimmedVenue)) {
                        addVenue(trimmedVenue);
                      }
                      setShowVenueSuggestions(false);
                    } else if (e.key === 'Escape') {
                      setShowVenueSuggestions(false);
                    }
                  }}
                  placeholder="Escribe o selecciona un estadio..."
                  className={`w-full px-4 py-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                    darkMode
                      ? 'bg-gradient-to-br from-[#1E293B]/80 via-[#1E293B]/60 to-[#1E293B]/80 border-white/10 text-white hover:border-[#C8A963]/50 focus:border-[#C8A963]/50'
                      : 'bg-gradient-to-br from-white/95 via-white/80 to-white/95 border-gray-200 text-gray-900 hover:border-[#C8A963]/50 focus:border-[#C8A963]/50'
                  } backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-[#C8A963]/20`}
                  required
                />
                
                {/* Autocomplete Suggestions */}
                {showVenueSuggestions && (filteredVenues.length > 0 || venueInput.trim()) && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl z-50 max-h-48 overflow-y-auto backdrop-blur-2xl ${
                      darkMode
                        ? 'bg-gradient-to-br from-[#1E293B]/95 via-[#0F172A]/95 to-[#1E293B]/95 border-white/10'
                        : 'bg-gradient-to-br from-white/98 via-gray-50/98 to-white/98 border-gray-200'
                    }`}
                  >
                    {/* Animated glow border */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C8A963]/20 via-[#C8A963]/5 to-[#C8A963]/20 rounded-xl blur opacity-50" />
                    
                    <div className="relative">
                      {filteredVenues.length > 0 ? (
                        <>
                          {filteredVenues.map((venue, index) => (
                            <button
                              key={venue}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleVenueSelect(venue);
                              }}
                              className={`w-full px-4 py-3 text-left transition-all hover:scale-[1.02] ${
                                index === 0 ? 'rounded-t-xl' : ''
                              } ${
                                index === filteredVenues.length - 1 ? 'rounded-b-xl' : ''
                              } ${
                                darkMode
                                  ? 'text-white hover:bg-[#C8A963]/20 hover:text-[#C8A963]'
                                  : 'text-gray-900 hover:bg-[#C8A963]/10 hover:text-[#C8A963]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-[#C8A963]" />
                                <span>{venue}</span>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : venueInput.trim() && !venues.includes(venueInput.trim()) ? (
                        <div className={`px-4 py-3 rounded-xl ${
                          darkMode ? 'text-white/60' : 'text-gray-600'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Plus size={14} className="text-[#C8A963]" />
                            <span className="text-sm">Presiona Enter o haz clic afuera para añadir:</span>
                          </div>
                          <div className={`px-3 py-2 rounded-lg ${
                            darkMode ? 'bg-[#C8A963]/20 text-[#C8A963]' : 'bg-[#C8A963]/10 text-[#C8A963]'
                          }`}>
                            {venueInput.trim()}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                Escribe para buscar o crear un estadio nuevo
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                Estado del Partido
              </Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Match['status'] })}
                className={`w-full px-3 py-2 rounded-lg border transition-all ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="upcoming">Próximo</option>
                <option value="live">En Vivo</option>
                <option value="completed">Finalizado</option>
              </select>
            </div>

            {/* Scores (if completed or live) */}
            {(formData.status === 'completed' || formData.status === 'live') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                    Sets {formData.homeTeam}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={formData.homeScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, homeScore: parseInt(e.target.value) || 0 })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                    Sets {formData.awayTeam || 'Visitante'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={formData.awayScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, awayScore: parseInt(e.target.value) || 0 })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                Descripción
              </Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                placeholder="Información adicional sobre el partido..."
                rows={3}
              />
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                  URL de Boletos
                </Label>
                <Input
                  type="url"
                  value={formData.ticketUrl || ''}
                  onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  placeholder="https://tickets.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label className={darkMode ? 'text-white/90' : 'text-gray-700'}>
                  URL de Stream
                </Label>
                <Input
                  type="url"
                  value={formData.streamUrl || ''}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  placeholder="https://stream.example.com"
                />
              </div>
            </div>

            <Separator className={darkMode ? 'bg-white/10' : ''} />

            {/* Voting Section */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-[#8B5CF6]/5 border-[#8B5CF6]/20' : 'bg-[#8B5CF6]/5 border-[#8B5CF6]/20'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Vote size={20} className="text-[#8B5CF6]" />
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Votación para este Partido
                </h4>
              </div>

              <div className="space-y-3">
                {/* Option 1: No voting */}
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  votingOption === 'none'
                    ? darkMode
                      ? 'bg-white/10 border-[#C8A963]/30'
                      : 'bg-[#C8A963]/10 border-[#C8A963]/30'
                    : darkMode
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    name="votingOption"
                    value="none"
                    checked={votingOption === 'none'}
                    onChange={(e) => setVotingOption(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Sin votación
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Este partido no tendrá votación asociada
                    </p>
                  </div>
                </label>

                {/* Option 2: Create from template */}
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  votingOption === 'template'
                    ? darkMode
                      ? 'bg-white/10 border-[#C8A963]/30'
                      : 'bg-[#C8A963]/10 border-[#C8A963]/30'
                    : darkMode
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    name="votingOption"
                    value="template"
                    checked={votingOption === 'template'}
                    onChange={(e) => setVotingOption(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Crear desde plantilla
                    </div>
                    {votingOption === 'template' && (
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm transition-all ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Seleccionar plantilla...</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className={`text-xs mt-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Usa una plantilla predefinida y reutilizable
                    </p>
                  </div>
                </label>

                {/* Option 3: Create new custom */}
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  votingOption === 'new'
                    ? darkMode
                      ? 'bg-white/10 border-[#C8A963]/30'
                      : 'bg-[#C8A963]/10 border-[#C8A963]/30'
                    : darkMode
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    name="votingOption"
                    value="new"
                    checked={votingOption === 'new'}
                    onChange={(e) => setVotingOption(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Crear nueva votación personalizada
                    </div>
                    {votingOption === 'new' && (
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <Input
                          placeholder="Título de la votación..."
                          value={newPollTitle}
                          onChange={(e) => setNewPollTitle(e.target.value)}
                          className={`text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                        />
                        <Textarea
                          placeholder="Descripción (opcional)..."
                          value={newPollDescription}
                          onChange={(e) => setNewPollDescription(e.target.value)}
                          className={`text-sm ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <Zap size={16} className="text-[#C8A963]" />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newPollAutoStart}
                              onChange={(e) => setNewPollAutoStart(e.target.checked)}
                              className="rounded"
                            />
                            <span className={`text-xs ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                              Inicio automático cuando el partido esté en vivo
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                      Crea una votación personalizada para este partido
                    </p>
                  </div>
                </label>

                {/* Option 4: Associate existing unassigned poll */}
                {getUnassignedPolls().length > 0 && (
                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    votingOption === 'existing'
                      ? darkMode
                        ? 'bg-white/10 border-[#C8A963]/30'
                        : 'bg-[#C8A963]/10 border-[#C8A963]/30'
                      : darkMode
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <input
                      type="radio"
                      name="votingOption"
                      value="existing"
                      checked={votingOption === 'existing'}
                      onChange={(e) => setVotingOption(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Asociar votación existente
                      </div>
                      {votingOption === 'existing' && (
                        <select
                          value={selectedPollId}
                          onChange={(e) => setSelectedPollId(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm transition-all ${
                            darkMode
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Seleccionar votación...</option>
                          {getUnassignedPolls().map(poll => (
                            <option key={poll.id} value={poll.id}>
                              {poll.title} ({poll.status})
                            </option>
                          ))}
                        </select>
                      )}
                      <p className={`text-xs mt-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                        Usa una votación ya creada sin partido asignado
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
                className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10' : ''}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#0C2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#0C2340] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? (editingMatch ? 'Guardando...' : 'Creando...')
                  : (editingMatch ? 'Guardar Cambios' : 'Crear Partido')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={handleCloseStatsDialog}>
        <DialogContent className={`max-w-3xl max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white'
        }`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp size={24} className="text-[#C8A963]" />
              Gestionar Estadísticas
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : 'text-gray-600'}>
              {statsMatch && `${statsMatch.homeTeam} vs ${statsMatch.awayTeam}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStatsSubmit} className="space-y-6">
            {/* Home Team Stats */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Trophy size={18} className="text-[#0C2340]" />
                {statsMatch?.homeTeam}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Volleyball size={16} className="text-[#C8A963]" />
                    Aces
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.home.aces}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      home: { ...statsFormData.home, aces: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Shield size={16} className="text-[#0C2340]" />
                    Bloqueos
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.home.blocks}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      home: { ...statsFormData.home, blocks: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Zap size={16} className="text-[#E84C4C]" />
                    Ataques
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.home.attacks}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      home: { ...statsFormData.home, attacks: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Swords size={16} className="text-[#10B981]" />
                    Defensas
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.home.digs}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      home: { ...statsFormData.home, digs: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Away Team Stats */}
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Trophy size={18} className="text-[#E84C4C]" />
                {statsMatch?.awayTeam}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Volleyball size={16} className="text-[#C8A963]" />
                    Aces
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.away.aces}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      away: { ...statsFormData.away, aces: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Shield size={16} className="text-[#0C2340]" />
                    Bloqueos
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.away.blocks}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      away: { ...statsFormData.away, blocks: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Zap size={16} className="text-[#E84C4C]" />
                    Ataques
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.away.attacks}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      away: { ...statsFormData.away, attacks: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
                    <Swords size={16} className="text-[#10B981]" />
                    Defensas
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={statsFormData.away.digs}
                    onChange={(e) => setStatsFormData({
                      ...statsFormData,
                      away: { ...statsFormData.away, digs: parseInt(e.target.value) || 0 }
                    })}
                    className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseStatsDialog}
                className={darkMode ? 'border-white/10 text-white/70 hover:bg-white/10' : ''}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#C8A963] to-[#b89850] hover:from-[#b89850] hover:to-[#C8A963] text-[#0C2340]"
              >
                Guardar Estadísticas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Venues Management Dialog */}
      <Dialog open={isVenuesDialogOpen} onOpenChange={setIsVenuesDialogOpen}>
        <DialogContent className={`max-w-xl max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white'
        }`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <MapPin size={20} className="text-[#C8A963]" />
              Gestionar Estadios
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : 'text-gray-600'}>
              Administra la lista de estadios disponibles para los partidos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Venues Count */}
            <div className={`rounded-xl border p-4 ${
              darkMode
                ? 'bg-[#C8A963]/10 border-[#C8A963]/30 backdrop-blur-xl'
                : 'bg-[#C8A963]/5 border-[#C8A963]/20 backdrop-blur-xl'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-[#C8A963]/20' : 'bg-[#C8A963]/10'
                }`}>
                  <MapPin size={24} className="text-[#C8A963]" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Total de Estadios
                  </p>
                  <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {venues.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Venues List */}
            <div className="space-y-2">
              <Label className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                Lista de Estadios
              </Label>
              
              {venues.length === 0 ? (
                <div className={`text-center py-8 rounded-xl border ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white/60'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No hay estadios registrados</p>
                  <p className="text-sm mt-1">Añade uno al crear un partido</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {venues.map((venue, index) => {
                    const isInUse = matches.some(m => m.venue === venue);
                    const matchCount = matches.filter(m => m.venue === venue).length;
                    
                    return (
                      <div
                        key={venue}
                        className={`group rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                          darkMode
                            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl hover:bg-[#1E293B]/70'
                            : 'bg-white/80 border-gray-200 backdrop-blur-xl hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${
                              darkMode ? 'bg-[#C8A963]/20' : 'bg-[#C8A963]/10'
                            }`}>
                              <MapPin size={16} className="text-[#C8A963]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {venue}
                              </p>
                              {isInUse && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Trophy size={12} className="text-[#C8A963]" />
                                  <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                    Usado en {matchCount} partido{matchCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (isInUse) {
                                alert(`No se puede eliminar "${venue}" porque está siendo usado en ${matchCount} partido${matchCount !== 1 ? 's' : ''}.`);
                              } else if (confirm(`¿Estás seguro de eliminar el estadio "${venue}"?`)) {
                                deleteVenue(venue);
                              }
                            }}
                            className={`${
                              isInUse
                                ? 'opacity-40 cursor-not-allowed text-gray-400'
                                : 'text-[#E01E37] hover:text-[#E01E37] hover:bg-[#E01E37]/10'
                            }`}
                            title={isInUse ? 'No se puede eliminar porque está en uso' : 'Eliminar estadio'}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Helper Text */}
            <div className={`rounded-lg p-3 text-sm ${
              darkMode
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              <p className="flex items-center gap-2">
                <Circle size={12} className="fill-current" />
                <span>Los estadios se añaden automáticamente al crear partidos</span>
              </p>
              <p className="flex items-center gap-2 mt-1">
                <Circle size={12} className="fill-current" />
                <span>No puedes eliminar estadios que estén en uso</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsVenuesDialogOpen(false)}
              className="bg-gradient-to-r from-[#0C2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#0C2340] text-white"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teams Management Dialog */}
      <Dialog open={isTeamsDialogOpen} onOpenChange={setIsTeamsDialogOpen}>
        <DialogContent className={`max-w-xl max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white'
        }`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Users size={20} className="text-[#E84C4C]" />
              Gestionar Equipos
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : 'text-gray-600'}>
              Administra la lista de equipos disponibles para los partidos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Teams Count */}
            <div className={`rounded-xl border p-4 ${
              darkMode
                ? 'bg-[#E84C4C]/10 border-[#E84C4C]/30 backdrop-blur-xl'
                : 'bg-[#E84C4C]/5 border-[#E84C4C]/20 backdrop-blur-xl'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-[#E84C4C]/20' : 'bg-[#E84C4C]/10'
                }`}>
                  <Users size={24} className="text-[#E84C4C]" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    Total de Equipos
                  </p>
                  <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {teams.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Teams List */}
            <div className="space-y-2">
              <Label className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                Lista de Equipos
              </Label>
              
              {teams.length === 0 ? (
                <div className={`text-center py-8 rounded-xl border ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white/60'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No hay equipos registrados</p>
                  <p className="text-sm mt-1">Añade uno al crear un partido</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {teams.map((team, index) => {
                    const isInUse = matches.some(m => m.homeTeam === team || m.awayTeam === team);
                    const matchCount = matches.filter(m => m.homeTeam === team || m.awayTeam === team).length;
                    const isCangrejeras = team === 'Cangrejeras';
                    
                    return (
                      <div
                        key={team}
                        className={`group rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                          darkMode
                            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl hover:bg-[#1E293B]/70'
                            : 'bg-white/80 border-gray-200 backdrop-blur-xl hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${
                              isCangrejeras
                                ? darkMode ? 'bg-[#C8A963]/20' : 'bg-[#C8A963]/10'
                                : darkMode ? 'bg-[#E84C4C]/20' : 'bg-[#E84C4C]/10'
                            }`}>
                              <Users size={16} className={isCangrejeras ? 'text-[#C8A963]' : 'text-[#E84C4C]'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {team}
                                </p>
                                {isCangrejeras && (
                                  <BadgePremium variant="live" size="sm">
                                    Principal
                                  </BadgePremium>
                                )}
                              </div>
                              {isInUse && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Trophy size={12} className="text-[#C8A963]" />
                                  <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                    Usado en {matchCount} partido{matchCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (isCangrejeras) {
                                alert('No se puede eliminar el equipo Cangrejeras.');
                              } else if (isInUse) {
                                alert(`No se puede eliminar "${team}" porque está siendo usado en ${matchCount} partido${matchCount !== 1 ? 's' : ''}.`);
                              } else if (confirm(`¿Estás seguro de eliminar el equipo "${team}"?`)) {
                                deleteTeam(team);
                              }
                            }}
                            className={`${
                              isCangrejeras || isInUse
                                ? 'opacity-40 cursor-not-allowed text-gray-400'
                                : 'text-[#E01E37] hover:text-[#E01E37] hover:bg-[#E01E37]/10'
                            }`}
                            title={
                              isCangrejeras 
                                ? 'No se puede eliminar el equipo principal' 
                                : isInUse 
                                  ? 'No se puede eliminar porque está en uso' 
                                  : 'Eliminar equipo'
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Helper Text */}
            <div className={`rounded-lg p-3 text-sm ${
              darkMode
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              <p className="flex items-center gap-2">
                <Circle size={12} className="fill-current" />
                <span>Los equipos se añaden automáticamente al crear partidos</span>
              </p>
              <p className="flex items-center gap-2 mt-1">
                <Circle size={12} className="fill-current" />
                <span>No puedes eliminar Cangrejeras ni equipos que estén en uso</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsTeamsDialogOpen(false)}
              className="bg-gradient-to-r from-[#0C2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#0C2340] text-white"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

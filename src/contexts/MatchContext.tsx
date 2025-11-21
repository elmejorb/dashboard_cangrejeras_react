import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { matchService } from '../services/matchService';
import { teamService } from '../services/teamService';
import { venueService } from '../services/venueService';
import { liveVotingService } from '../services/liveVotingService';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from './AuthContext';

export interface MatchStats {
  aces: number;
  blocks: number;
  attacks: number;
  digs: number;
  set1: number;
  set2: number;
  set3: number;
  set4: number;
  set5: number;
}

export interface TeamStats {
  team: string;
  stats: MatchStats;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: Date; // Timestamp con fecha y hora del partido
  time?: string; // HH:MM format (solo para UI, se construye desde date)
  venue: string;
  status: 'live' | 'upcoming' | 'completed';
  homeScore: number;
  awayScore: number;
  description?: string;
  ticketUrl?: string;
  streamUrl?: string;
  isHomeTeam: boolean; // true if Cangrejeras is home team
  votingId?: string; // Associated poll instance ID
  statistics?: {
    home: MatchStats;
    away: MatchStats;
  };
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

interface MatchContextType {
  matches: Match[];
  liveMatch: Match | null;
  nextMatch: Match | null;
  venues: string[];
  teams: string[];
  isLoading: boolean;
  addMatch: (match: Omit<Match, 'id'>) => Promise<Match>;
  updateMatch: (id: string, match: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  updateMatchStatus: (id: string, status: Match['status']) => Promise<void>;
  updateMatchStats: (id: string, stats: { home: MatchStats; away: MatchStats }) => Promise<void>;
  loadMatches: () => Promise<void>;
  addVenue: (venue: string) => Promise<void>;
  deleteVenue: (venue: string) => Promise<void>;
  addTeam: (team: string) => Promise<void>;
  deleteTeam: (team: string) => Promise<void>;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [previousLiveMatchId, setPreviousLiveMatchId] = useState<string | null>(null);

  // Load venues from Firestore
  const loadVenues = async () => {
    try {
      const venuesData = await venueService.getAllVenues();
      setVenues(venuesData.map(v => v.name));
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  };

  // Load teams from Firestore
  const loadTeams = async () => {
    try {
      const teamsData = await teamService.getAllTeams();
      setTeams(teamsData.map(t => t.name));
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  // Load matches from Firestore
  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const data = await matchService.getAllMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Error al cargar partidos');
    } finally {
      setIsLoading(false);
    }
  };

  // Load matches, teams, and venues on mount
  useEffect(() => {
    const initialize = async () => {
      // NOTE: Auto-initialization disabled - user can create data manually
      // If you want to auto-create default data, uncomment the lines below:
      // await teamService.initializePrimaryTeam();
      // await venueService.initializeDefaultVenues();

      // Load all data
      await loadVenues();
      await loadTeams();
      await loadMatches();
    };
    initialize();
  }, []);

  // Get live match (prioritize Cangrejeras matches)
  const liveMatch = matches.find(m => m.status === 'live') || null;

  // Get next match (upcoming Cangrejeras matches sorted by date)
  const nextMatch = matches
    .filter(m => m.status === 'upcoming')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })[0] || null;

  // Notification system when match goes live
  useEffect(() => {
    const currentLiveMatchId = liveMatch?.id || null;
    
    // Check if a new match just went live
    if (currentLiveMatchId && currentLiveMatchId !== previousLiveMatchId) {
      const match = liveMatch;
      if (match) {
        const opponent = match.isHomeTeam ? match.awayTeam : match.homeTeam;
        
        toast.success('¡PARTIDO EN VIVO!', {
          description: `Cangrejeras vs ${opponent} - ${match.venue}`,
          duration: 5000,
        });

        // Browser notification (if permitted)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('¡Partido en Vivo!', {
            body: `Cangrejeras vs ${opponent}`,
            icon: '/favicon.ico',
            tag: `match-${match.id}`,
          });
        }
      }
    }
    
    setPreviousLiveMatchId(currentLiveMatchId);
  }, [liveMatch?.id]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addMatch = async (matchData: Omit<Match, 'id'>): Promise<Match> => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      throw new Error('User not authenticated');
    }

    try {
      const newMatch = await matchService.createMatch(matchData, currentUser.id);
      setMatches([...matches, newMatch]);
      // Reload teams and venues to reflect any new ones added
      await Promise.all([loadTeams(), loadVenues()]);

      // Log activity
      await activityLogService.logActivity(
        currentUser.id,
        'create',
        'match',
        `Creó partido ${matchData.homeTeam} vs ${matchData.awayTeam}`,
        {
          matchId: newMatch.id,
          homeTeam: matchData.homeTeam,
          awayTeam: matchData.awayTeam,
          venue: matchData.venue,
        }
      );

      toast.success('Partido creado exitosamente');
      return newMatch; // ← Devolver el match creado
    } catch (error) {
      toast.error('Error al crear partido');
      throw error;
    }
  };

  const updateMatch = async (id: string, matchData: Partial<Match>) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      const originalMatch = matches.find(m => m.id === id);

      await matchService.updateMatch(id, matchData, currentUser.id);
      setMatches(matches.map(m => {
        if (m.id === id) {
          const updated = { ...m, ...matchData };

          // Update isHomeTeam if teams changed
          if (matchData.homeTeam) {
            updated.isHomeTeam = matchData.homeTeam === 'Cangrejeras' || matchData.homeTeam === 'Cangrejeras de Santurce';
          }

          // Reconstruir Date si date y time vienen como strings (del formulario)
          if (matchData.date && typeof matchData.date === 'string' && matchData.time) {
            const [year, month, day] = matchData.date.split('-').map(Number);
            const [hours, minutes] = matchData.time.split(':').map(Number);
            updated.date = new Date(year, month - 1, day, hours, minutes, 0, 0);

            console.log('🔍 DEBUG MatchContext.updateMatch - Reconstruyendo fecha local:');
            console.log('  📅 Input date string:', matchData.date);
            console.log('  ⏰ Input time string:', matchData.time);
            console.log('  ✅ Date reconstruido:', updated.date);
            console.log('  ✅ toString():', updated.date.toString());
          }

          return updated;
        }
        return m;
      }));
      // Reload teams and venues in case new ones were added
      await Promise.all([loadTeams(), loadVenues()]);

      // Log activity
      if (originalMatch) {
        await activityLogService.logActivity(
          currentUser.id,
          'update',
          'match',
          `Actualizó partido ${originalMatch.homeTeam} vs ${originalMatch.awayTeam}`,
          {
            matchId: id,
            changes: Object.keys(matchData).join(', '),
          }
        );
      }

      toast.success('Partido actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar partido');
      throw error;
    }
  };

  const deleteMatch = async (id: string) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      const matchToDelete = matches.find(m => m.id === id);

      await matchService.deleteMatch(id);
      setMatches(matches.filter(m => m.id !== id));

      // Log activity
      if (matchToDelete) {
        await activityLogService.logActivity(
          currentUser.id,
          'delete',
          'match',
          `Eliminó partido ${matchToDelete.homeTeam} vs ${matchToDelete.awayTeam}`,
          {
            matchId: id,
          }
        );
      }

      toast.success('Partido eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar partido');
      throw error;
    }
  };

  const updateMatchStatus = async (id: string, status: Match['status']) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    // Validar que solo un partido pueda estar en vivo a la vez
    if (status === 'live') {
      const liveMatch = matches.find(m => m.id !== id && m.status === 'live');
      if (liveMatch) {
        const liveHomeTeam = typeof liveMatch.homeTeam === 'string' ? liveMatch.homeTeam : liveMatch.homeTeam;
        const liveAwayTeam = typeof liveMatch.awayTeam === 'string' ? liveMatch.awayTeam : liveMatch.awayTeam;

        toast.error('Ya hay un partido en vivo', {
          description: `El partido "${liveHomeTeam} vs ${liveAwayTeam}" está actualmente en vivo. Solo un partido puede estar en vivo a la vez.`
        });
        return;
      }
    }

    try {
      await matchService.updateMatchStatus(id, status, currentUser.id);
      setMatches(matches.map(m =>
        m.id === id ? { ...m, status } : m
      ));

      // Si el partido termina (completed), cerrar automáticamente las votaciones activas de ese partido
      if (status === 'completed') {
        try {
          const matchIdNumber = parseInt(id);
          const activePoll = await liveVotingService.getActivePollByMatch(matchIdNumber);

          if (activePoll) {
            await liveVotingService.closeLivePoll(activePoll.id);
            console.log(`✅ Votación cerrada automáticamente al finalizar partido: ${activePoll.id}`);
            toast.info('La votación del partido se cerró automáticamente');
          }
        } catch (votingError) {
          console.error('Error cerrando votación al finalizar partido:', votingError);
          // No lanzar error, solo registrar - el partido se actualizó correctamente
        }
      }

      const statusLabels = {
        live: 'En Vivo',
        upcoming: 'Próximo',
        completed: 'Finalizado'
      };

      // Log activity
      const match = matches.find(m => m.id === id);
      if (match) {
        await activityLogService.logActivity(
          currentUser.id,
          'update',
          'match',
          `Cambió estado de partido ${match.homeTeam} vs ${match.awayTeam} a ${statusLabels[status]}`,
          {
            matchId: id,
            newStatus: status,
          }
        );
      }

      toast.success(`Estado actualizado a ${statusLabels[status]}`);
    } catch (error) {
      toast.error('Error al actualizar estado');
      throw error;
    }
  };

  const updateMatchStats = async (id: string, stats: { home: MatchStats; away: MatchStats }) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      await matchService.updateMatchStatistics(id, stats, currentUser.id);
      setMatches(matches.map(m =>
        m.id === id ? { ...m, statistics: stats } : m
      ));

      // Log activity
      const match = matches.find(m => m.id === id);
      if (match) {
        await activityLogService.logActivity(
          currentUser.id,
          'update',
          'match',
          `Actualizó estadísticas del partido ${match.homeTeam} vs ${match.awayTeam}`,
          {
            matchId: id,
          }
        );
      }

      toast.success('Estadísticas actualizadas');
    } catch (error) {
      toast.error('Error al actualizar estadísticas');
      throw error;
    }
  };

  const addVenue = async (venue: string) => {
    const trimmedVenue = venue.trim();
    if (!trimmedVenue) return;

    try {
      await venueService.createVenue({ name: trimmedVenue });
      await loadVenues();
      toast.success(`Estadio "${trimmedVenue}" añadido`);
    } catch (error: any) {
      toast.error(error.message || 'Error al añadir estadio');
    }
  };

  const deleteVenue = async (venue: string) => {
    try {
      // Get venue to find its ID
      const venueData = await venueService.getVenueByName(venue);
      if (!venueData) {
        toast.error('Estadio no encontrado');
        return;
      }

      await venueService.deleteVenue(venueData.id);
      await loadVenues();
      toast.success(`Estadio "${venue}" eliminado`);
    } catch (error: any) {
      toast.error('No se puede eliminar', {
        description: error.message || 'Error al eliminar estadio'
      });
    }
  };

  const addTeam = async (team: string) => {
    const trimmedTeam = team.trim();
    if (!trimmedTeam) return;

    try {
      await teamService.createTeam({ name: trimmedTeam });
      await loadTeams();
      toast.success(`Equipo "${trimmedTeam}" añadido`);
    } catch (error: any) {
      toast.error(error.message || 'Error al añadir equipo');
    }
  };

  const deleteTeam = async (team: string) => {
    try {
      // Get team to find its ID
      const teamData = await teamService.getTeamByName(team);
      if (!teamData) {
        toast.error('Equipo no encontrado');
        return;
      }

      await teamService.deleteTeam(teamData.id);
      await loadTeams();
      toast.success(`Equipo "${team}" eliminado`);
    } catch (error: any) {
      toast.error('No se puede eliminar', {
        description: error.message || 'Error al eliminar equipo'
      });
    }
  };

  return (
    <MatchContext.Provider
      value={{
        matches,
        liveMatch,
        nextMatch,
        venues,
        teams,
        isLoading,
        addMatch,
        updateMatch,
        deleteMatch,
        updateMatchStatus,
        updateMatchStats,
        loadMatches,
        addVenue,
        deleteVenue,
        addTeam,
        deleteTeam,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
}

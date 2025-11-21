import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { useMatches } from './MatchContext';
import { usePlayers } from './PlayerContext';
import { votingTemplateService } from '../services/votingTemplateService';
import { liveVotingService, LivePoll } from '../services/liveVotingService';

// VotingOption now only stores playerId and votes
// Player data (name, jersey, photo) comes from PlayerContext in real-time
export interface VotingOption {
  playerId: number;
  votes: number;
  percentage: number;
}

// Poll Template - Reusable configuration
export interface PollTemplate {
  id: string;
  name: string;
  description: string;
  type: 'template';
  defaultAutoStart: boolean;
  defaultScheduledStart: boolean;
  defaultPlayerIds: number[]; // Default players to include in polls
  createdAt: string;
  updatedAt: string;
}

// Poll Results - Frozen snapshot when poll closes
export interface PollResults {
  winner: {
    playerId: number;
    votes: number;
    percentage: number;
  };
  rankings: VotingOption[];
  totalVotes: number;
  closedAt: string;
}

// Poll Instance - Unique per match
export interface PollInstance {
  id: string;
  templateId?: string; // If created from a template
  matchId?: number; // Associated match (optional for standalone polls)
  title: string;
  description: string;
  isActive: boolean;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  
  // Auto-start options (mutually exclusive)
  autoStartEnabled: boolean;
  scheduledStartEnabled: boolean;
  scheduledStartDate?: string;
  scheduledStartTime?: string;
  
  // End options
  scheduledEndDate?: string;
  scheduledEndTime?: string;
  
  // Voting data
  options: VotingOption[];
  totalVotes: number;
  userHasVoted: boolean;
  
  // Results (frozen when closed)
  results?: PollResults;
  
  // Timestamps
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

interface VotingContextType {
  // Templates
  templates: PollTemplate[];
  createTemplate: (template: Omit<PollTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PollTemplate>;
  updateTemplate: (id: string, template: Partial<PollTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Poll Instances (OLD - kept for backwards compatibility)
  polls: PollInstance[];
  activePoll: PollInstance | null;
  createPoll: (poll: Omit<PollInstance, 'id' | 'totalVotes' | 'userHasVoted' | 'createdAt' | 'status'>) => PollInstance;
  createPollFromTemplate: (templateId: string, matchId?: number, overrides?: Partial<PollInstance>) => PollInstance;
  updatePoll: (id: string, poll: Partial<PollInstance>) => void;
  deletePoll: (id: string) => void;
  togglePollStatus: (id: string) => void;
  archivePoll: (id: string) => void;

  // Voting
  vote: (pollId: string, playerId: number) => void;
  resetPollVotes: (pollId: string) => void;

  // Queries
  getPollsByMatch: (matchId: number) => PollInstance[];
  getArchivedPolls: () => PollInstance[];
  getAvailableTemplates: () => PollTemplate[];
  getUnassignedPolls: () => PollInstance[];

  // Live Voting (NEW - Firestore-based)
  livePoll: LivePoll | null;
  openLiveVoting: (matchId: number, title: string, description: string, playerIds: number[], createdBy: string) => Promise<void>;
  activateLiveVoting: (pollId: string) => Promise<void>;
  closeLiveVoting: () => Promise<void>;
  hasUserVoted: (userId: string, matchId: number) => Promise<boolean>;
  castVote: (userId: string, playerId: number) => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const { liveMatch, matches } = useMatches();
  const { players, activePlayers } = usePlayers();

  // Poll Templates - Load from Firestore
  const [templates, setTemplates] = useState<PollTemplate[]>([]);

  // Live Voting State (NEW - Firestore-based real-time voting)
  const [livePoll, setLivePoll] = useState<LivePoll | null>(null);

  // Load templates from Firestore
  const loadTemplates = async () => {
    try {
      // Wait for active players to be loaded
      if (activePlayers.length === 0) {
        console.log('⏳ Esperando que se carguen las jugadoras activas...');
        return;
      }

      // NOTE: initializeDefaultTemplates disabled - user can create templates manually
      // If you want to auto-create default templates, uncomment the lines below:
      // const activePlayerIds = activePlayers.map(p => p.id);
      // console.log('📊 Inicializando plantillas con jugadoras reales:', activePlayerIds);
      // await votingTemplateService.initializeDefaultTemplates(activePlayerIds);

      // Load all templates
      const templatesData = await votingTemplateService.getAllTemplates();
      setTemplates(templatesData.map(t => ({
        ...t,
        type: 'template' as const,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })));

      console.log(`✅ ${templatesData.length} plantillas cargadas desde Firebase`);
    } catch (error) {
      console.error('Error loading voting templates:', error);
    }
  };

  // Load templates when active players are loaded
  useEffect(() => {
    if (activePlayers.length > 0) {
      loadTemplates();
    }
  }, [activePlayers.length]);

  // Listen to live poll for current live match (ACTIVA O INACTIVA)
  useEffect(() => {
    if (!liveMatch) {
      setLivePoll(null);
      return;
    }

    // Load poll for this match (active or inactive)
    const loadPoll = async () => {
      try {
        const poll = await liveVotingService.getPollByMatch(liveMatch.id);
        setLivePoll(poll);
      } catch (error) {
        console.error('Error loading poll for match:', error);
      }
    };

    loadPoll();

    // Also subscribe to real-time updates for active polls
    const unsubscribe = liveVotingService.subscribeToMatchPoll(
      liveMatch.id,
      (poll) => {
        setLivePoll(poll);
      },
      (error) => {
        console.error('Error listening to live poll:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [liveMatch?.id]);

  // Auto-activate voting when match goes live
  useEffect(() => {
    const autoActivateVoting = async () => {
      if (!liveMatch) return;

      try {
        // Get any poll (active or inactive) for this match
        const poll = await liveVotingService.getPollByMatch(liveMatch.id);

        if (poll && !poll.isActive) {
          // Poll exists but is inactive - activate it automatically
          await liveVotingService.activateLivePoll(poll.id);

          toast.success('✅ ¡Votación Activada Automáticamente!', {
            description: poll.title,
            duration: 5000,
          });

          console.log(`✅ Votación activada automáticamente para el partido ${liveMatch.id}`);
        }
      } catch (error) {
        console.error('Error auto-activating voting:', error);
      }
    };

    autoActivateVoting();
  }, [liveMatch?.id]);

  // Auto-close voting when match is completed
  useEffect(() => {
    const autoCloseVoting = async () => {
      // Check all completed matches
      const completedMatches = matches.filter(m => m.status === 'completed');

      for (const match of completedMatches) {
        try {
          // Get active poll for this completed match
          const activePoll = await liveVotingService.getActivePollByMatch(match.id);

          if (activePoll && activePoll.isActive) {
            // Close the voting automatically
            await liveVotingService.closeLivePoll(activePoll.id);

            toast.info('✅ Votación Cerrada Automáticamente', {
              description: `${activePoll.title} - ${activePoll.totalVotes} votos totales`,
              duration: 4000,
            });

            console.log(`✅ Votación cerrada automáticamente para el partido ${match.id}`);
          }
        } catch (error) {
          console.error(`Error auto-closing voting for match ${match.id}:`, error);
        }
      }
    };

    autoCloseVoting();
  }, [matches]);

  // Poll Instances - No demo data, start with empty array
  // NOTE: Demo poll removed to avoid auto-creating "MVP del Partido"
  const [polls, setPolls] = useState<PollInstance[]>([]);

  const [previousLiveMatchId, setPreviousLiveMatchId] = useState<number | null>(null);
  const [checkedSchedules, setCheckedSchedules] = useState<Set<string>>(new Set());

  // Calculate percentages for all polls
  useEffect(() => {
    setPolls(currentPolls => 
      currentPolls.map(poll => {
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
        return {
          ...poll,
          totalVotes,
          options: poll.options.map(option => ({
            ...option,
            percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
          })),
        };
      })
    );
  }, []);

  // Auto-start voting when match goes live
  useEffect(() => {
    const currentLiveMatchId = liveMatch?.id || null;
    
    if (currentLiveMatchId && currentLiveMatchId !== previousLiveMatchId) {
      const autoStartPolls = polls.filter(
        poll => poll.matchId === currentLiveMatchId && poll.autoStartEnabled && !poll.isActive
      );

      if (autoStartPolls.length > 0) {
        setPolls(currentPolls =>
          currentPolls.map(poll =>
            autoStartPolls.some(asp => asp.id === poll.id)
              ? { 
                  ...poll, 
                  isActive: true, 
                  status: 'active' as const,
                  startedAt: new Date().toISOString() 
                }
              : poll
          )
        );

        toast.success('¡Votación Abierta!', {
          description: `Vota por la mejor jugadora del partido`,
          duration: 5000,
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('¡Votación Abierta!', {
            body: `Vota por la mejor jugadora del partido`,
            icon: '/favicon.ico',
          });
        }
      }
    }
    
    setPreviousLiveMatchId(currentLiveMatchId);
  }, [liveMatch?.id, polls]);

  // Auto-close and archive voting when match ends
  useEffect(() => {
    const completedMatches = matches.filter(m => m.status === 'completed');
    
    completedMatches.forEach(match => {
      const activeMatchPolls = polls.filter(
        poll => poll.matchId === match.id && poll.isActive
      );

      if (activeMatchPolls.length > 0) {
        setPolls(currentPolls =>
          currentPolls.map(poll => {
            if (activeMatchPolls.some(amp => amp.id === poll.id)) {
              // Freeze results
              const winner = poll.options.reduce((max, option) => 
                option.votes > max.votes ? option : max
              , poll.options[0]);
              
              const results: PollResults = {
                winner: {
                  playerId: winner.playerId,
                  votes: winner.votes,
                  percentage: winner.percentage,
                },
                rankings: [...poll.options].sort((a, b) => b.votes - a.votes),
                totalVotes: poll.totalVotes,
                closedAt: new Date().toISOString(),
              };

              return {
                ...poll,
                isActive: false,
                status: 'completed' as const,
                endedAt: new Date().toISOString(),
                results,
              };
            }
            return poll;
          })
        );

        toast.info('✅ Votación Cerrada', {
          description: `La votación ha finalizado`,
          duration: 3000,
        });
      }
    });
  }, [matches]);

  // Check scheduled start/end times
  useEffect(() => {
    const checkSchedules = () => {
      const now = new Date();
      
      polls.forEach(poll => {
        // Check scheduled start
        if (
          poll.scheduledStartEnabled &&
          !poll.isActive &&
          poll.scheduledStartDate &&
          poll.scheduledStartTime &&
          !checkedSchedules.has(poll.id)
        ) {
          const scheduledDateTime = new Date(`${poll.scheduledStartDate}T${poll.scheduledStartTime}`);
          
          if (now >= scheduledDateTime && now.getTime() - scheduledDateTime.getTime() < 60000) {
            setPolls(currentPolls =>
              currentPolls.map(p =>
                p.id === poll.id 
                  ? { 
                      ...p, 
                      isActive: true, 
                      status: 'active' as const,
                      startedAt: new Date().toISOString() 
                    } 
                  : p
              )
            );
            
            setCheckedSchedules(prev => new Set(prev).add(poll.id));
            
            toast.success('¡Votación Programada Iniciada!', {
              description: poll.title,
              duration: 5000,
            });

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('¡Votación Iniciada!', {
                body: poll.title,
                icon: '/favicon.ico',
              });
            }
          }
        }

        // Check scheduled end
        if (
          poll.isActive &&
          poll.scheduledEndDate &&
          poll.scheduledEndTime
        ) {
          const scheduledEndDateTime = new Date(`${poll.scheduledEndDate}T${poll.scheduledEndTime}`);
          
          if (now >= scheduledEndDateTime) {
            // Freeze results
            const winner = poll.options.reduce((max, option) => 
              option.votes > max.votes ? option : max
            , poll.options[0]);
            
            const results: PollResults = {
              winner: {
                playerId: winner.playerId,
                votes: winner.votes,
                percentage: winner.percentage,
              },
              rankings: [...poll.options].sort((a, b) => b.votes - a.votes),
              totalVotes: poll.totalVotes,
              closedAt: new Date().toISOString(),
            };

            setPolls(currentPolls =>
              currentPolls.map(p =>
                p.id === poll.id 
                  ? { 
                      ...p, 
                      isActive: false, 
                      status: 'completed' as const,
                      endedAt: new Date().toISOString(),
                      results 
                    } 
                  : p
              )
            );
            
            toast.info('✅ Votación Cerrada (Programada)', {
              description: poll.title,
              duration: 3000,
            });
          }
        }
      });
    };

    checkSchedules();
    const interval = setInterval(checkSchedules, 60000);
    return () => clearInterval(interval);
  }, [polls, checkedSchedules]);

  const activePoll = polls.find(p => p.isActive) || null;

  // Template functions
  const createTemplate = async (templateData: Omit<PollTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PollTemplate> => {
    try {
      const newTemplate = await votingTemplateService.createTemplate({
        name: templateData.name,
        description: templateData.description,
        defaultAutoStart: templateData.defaultAutoStart,
        defaultScheduledStart: templateData.defaultScheduledStart,
        defaultPlayerIds: templateData.defaultPlayerIds,
      });

      const pollTemplate: PollTemplate = {
        ...newTemplate,
        type: 'template',
        createdAt: newTemplate.createdAt.toISOString(),
        updatedAt: newTemplate.updatedAt.toISOString(),
      };

      setTemplates([...templates, pollTemplate]);
      toast.success('Plantilla de votación creada');
      return pollTemplate;
    } catch (error) {
      toast.error('Error al crear plantilla');
      throw error;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<PollTemplate>): Promise<void> => {
    try {
      await votingTemplateService.updateTemplate(id, {
        name: templateData.name,
        description: templateData.description,
        defaultAutoStart: templateData.defaultAutoStart,
        defaultScheduledStart: templateData.defaultScheduledStart,
        defaultPlayerIds: templateData.defaultPlayerIds,
      });

      setTemplates(templates.map(t =>
        t.id === id
          ? { ...t, ...templateData, updatedAt: new Date().toISOString() }
          : t
      ));
      toast.success('Plantilla actualizada');
    } catch (error) {
      toast.error('Error al actualizar plantilla');
      throw error;
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Eliminando plantilla:', id);
      await votingTemplateService.deleteTemplate(id);
      console.log('✅ Plantilla eliminada de Firebase');

      const newTemplates = templates.filter(t => t.id !== id);
      console.log('📊 Actualizando estado local. Plantillas antes:', templates.length, 'Plantillas después:', newTemplates.length);
      setTemplates(newTemplates);

      toast.success('Plantilla eliminada');
    } catch (error: any) {
      console.error('❌ Error al eliminar plantilla:', error);
      toast.error('Error al eliminar plantilla: ' + (error.message || 'Error desconocido'));
      throw error;
    }
  };

  // Poll Instance functions
  const createPoll = (pollData: Omit<PollInstance, 'id' | 'totalVotes' | 'userHasVoted' | 'createdAt' | 'status'>): PollInstance => {
    const newPoll: PollInstance = {
      ...pollData,
      id: `poll-${Date.now()}`,
      status: pollData.isActive ? 'active' : 'upcoming',
      totalVotes: 0,
      userHasVoted: false,
      options: pollData.options.map(option => ({
        ...option,
        votes: 0,
        percentage: 0,
      })),
      createdAt: new Date().toISOString(),
      startedAt: pollData.isActive ? new Date().toISOString() : undefined,
    };
    setPolls([...polls, newPoll]);
    toast.success('Votación creada exitosamente');
    return newPoll;
  };

  const createPollFromTemplate = (
    templateId: string, 
    matchId?: number,
    overrides?: Partial<PollInstance>
  ): PollInstance => {
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      toast.error('Plantilla no encontrada');
      throw new Error('Template not found');
    }

    // Get all active players for options
    const activePlayerIds = players.filter(p => p.active).map(p => p.id);

    const newPoll: PollInstance = {
      id: `poll-${Date.now()}`,
      templateId: template.id,
      matchId,
      title: template.name,
      description: template.description,
      isActive: false,
      status: 'upcoming',
      autoStartEnabled: template.defaultAutoStart,
      scheduledStartEnabled: template.defaultScheduledStart,
      totalVotes: 0,
      userHasVoted: false,
      options: activePlayerIds.map(playerId => ({
        playerId,
        votes: 0,
        percentage: 0,
      })),
      createdAt: new Date().toISOString(),
      ...overrides,
    };

    setPolls([...polls, newPoll]);
    toast.success(`Votación "${template.name}" creada desde plantilla`);
    return newPoll;
  };

  const updatePoll = (id: string, pollData: Partial<PollInstance>) => {
    setPolls(polls.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...pollData };
        
        // Recalculate percentages if options changed
        if (pollData.options) {
          const totalVotes = updated.options.reduce((sum, option) => sum + option.votes, 0);
          updated.totalVotes = totalVotes;
          updated.options = updated.options.map(option => ({
            ...option,
            percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
          }));
        }
        
        return updated;
      }
      return p;
    }));
    toast.success('Votación actualizada');
  };

  const deletePoll = (id: string) => {
    setPolls(polls.filter(p => p.id !== id));
    toast.success('Votación eliminada');
  };

  const togglePollStatus = (id: string) => {
    setPolls(polls.map(p => {
      if (p.id === id) {
        const newStatus = !p.isActive;
        
        if (newStatus) {
          toast.success('Votación Abierta', { description: p.title });
          return { 
            ...p, 
            isActive: true, 
            status: 'active' as const,
            startedAt: p.startedAt || new Date().toISOString() 
          };
        } else {
          // Close and create results
          const winner = p.options.reduce((max, option) => 
            option.votes > max.votes ? option : max
          , p.options[0]);
          
          const results: PollResults = {
            winner: {
              playerId: winner.playerId,
              votes: winner.votes,
              percentage: winner.percentage,
            },
            rankings: [...p.options].sort((a, b) => b.votes - a.votes),
            totalVotes: p.totalVotes,
            closedAt: new Date().toISOString(),
          };

          toast.info('✅ Votación Cerrada', { description: p.title });
          return { 
            ...p, 
            isActive: false, 
            status: 'completed' as const,
            endedAt: new Date().toISOString(),
            results 
          };
        }
      }
      return p;
    }));
  };

  const archivePoll = (id: string) => {
    setPolls(polls.map(p => 
      p.id === id 
        ? { ...p, status: 'archived' as const }
        : p
    ));
    toast.success('Votación archivada');
  };

  const vote = (pollId: string, playerId: number) => {
    const poll = polls.find(p => p.id === pollId);
    
    if (!poll) {
      toast.error('Votación no encontrada');
      return;
    }

    if (!poll.isActive) {
      toast.error('Esta votación está cerrada');
      return;
    }

    if (poll.userHasVoted) {
      toast.error('Ya has votado en esta votación');
      return;
    }

    setPolls(currentPolls =>
      currentPolls.map(p => {
        if (p.id === pollId) {
          const updatedOptions = p.options.map(option =>
            option.playerId === playerId
              ? { ...option, votes: option.votes + 1 }
              : option
          );
          
          const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0);
          
          return {
            ...p,
            userHasVoted: true,
            totalVotes,
            options: updatedOptions.map(option => ({
              ...option,
              percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
            })),
          };
        }
        return p;
      })
    );

    const player = players.find(p => p.id === playerId);
    toast.success('¡Voto registrado!', {
      description: player ? `Votaste por ${player.name}` : 'Tu voto ha sido registrado',
    });
  };

  const resetPollVotes = (pollId: string) => {
    setPolls(currentPolls =>
      currentPolls.map(p =>
        p.id === pollId
          ? {
              ...p,
              totalVotes: 0,
              userHasVoted: false,
              results: undefined,
              options: p.options.map(option => ({
                ...option,
                votes: 0,
                percentage: 0,
              })),
            }
          : p
      )
    );
    toast.success('Votos reiniciados');
  };

  // Query functions
  const getPollsByMatch = (matchId: number): PollInstance[] => {
    return polls.filter(p => p.matchId === matchId);
  };

  const getArchivedPolls = (): PollInstance[] => {
    return polls.filter(p => p.status === 'archived');
  };

  const getAvailableTemplates = (): PollTemplate[] => {
    return templates;
  };

  const getUnassignedPolls = (): PollInstance[] => {
    return polls.filter(p => !p.matchId && p.status === 'upcoming');
  };

  // Live Voting Functions (NEW - Firestore-based)
  const openLiveVoting = async (
    matchId: number,
    title: string,
    description: string,
    playerIds: number[],
    createdBy: string
  ): Promise<void> => {
    try {
      const newPoll = await liveVotingService.createLivePoll({
        matchId,
        title,
        description,
        playerIds,
        createdBy,
      });

      setLivePoll(newPoll);
      toast.success('¡Votación en Vivo Abierta!', {
        description: title,
        duration: 5000,
      });
    } catch (error: any) {
      toast.error('Error al abrir votación', {
        description: error.message || 'Intenta nuevamente',
      });
      throw error;
    }
  };

  const activateLiveVoting = async (pollId: string): Promise<void> => {
    try {
      await liveVotingService.activateLivePoll(pollId);

      toast.success('✅ Votación Activada', {
        description: 'La votación ahora está abierta',
        duration: 3000,
      });

      // The listener will update livePoll automatically
    } catch (error: any) {
      toast.error('Error al activar votación', {
        description: error.message || 'Intenta nuevamente',
      });
      throw error;
    }
  };

  const closeLiveVoting = async (): Promise<void> => {
    if (!livePoll) {
      toast.error('No hay votación activa para cerrar');
      return;
    }

    try {
      await liveVotingService.closeLivePoll(livePoll.id);

      toast.success('✅ Votación Cerrada', {
        description: `${livePoll.totalVotes} votos totales`,
        duration: 3000,
      });

      // The listener will update livePoll automatically
    } catch (error: any) {
      toast.error('Error al cerrar votación', {
        description: error.message || 'Intenta nuevamente',
      });
      throw error;
    }
  };

  const hasUserVoted = async (userId: string, matchId: number): Promise<boolean> => {
    try {
      return await liveVotingService.hasUserVotedInMatch(userId, matchId);
    } catch (error) {
      console.error('Error checking if user voted:', error);
      return false;
    }
  };

  const castVote = async (userId: string, playerId: number): Promise<void> => {
    if (!livePoll) {
      toast.error('No hay votación activa');
      return;
    }

    try {
      await liveVotingService.castVote(livePoll.id, livePoll.matchId, userId, playerId);

      const player = players.find(p => p.id === playerId);
      toast.success('¡Voto Registrado!', {
        description: player ? `Votaste por ${player.name}` : 'Tu voto ha sido registrado',
        duration: 3000,
      });

      // The real-time listener will update livePoll automatically
    } catch (error: any) {
      toast.error('Error al votar', {
        description: error.message || 'Intenta nuevamente',
      });
      throw error;
    }
  };

  return (
    <VotingContext.Provider
      value={{
        // Templates
        templates,
        createTemplate,
        updateTemplate,
        deleteTemplate,

        // Poll Instances (OLD - backwards compatibility)
        polls,
        activePoll,
        createPoll,
        createPollFromTemplate,
        updatePoll,
        deletePoll,
        togglePollStatus,
        archivePoll,

        // Voting
        vote,
        resetPollVotes,

        // Queries
        getPollsByMatch,
        getArchivedPolls,
        getAvailableTemplates,
        getUnassignedPolls,

        // Live Voting (NEW - Firestore-based)
        livePoll,
        openLiveVoting,
        activateLiveVoting,
        closeLiveVoting,
        hasUserVoted,
        castVote,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}

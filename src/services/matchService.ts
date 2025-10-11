import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { teamService } from './teamService';
import { venueService } from './venueService';

export interface MatchStats {
  aces: number;
  blocks: number;
  attacks: number;
  digs: number;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM format
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
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Admin ID who created
  updatedBy?: string; // Admin ID who last updated
}

export interface MatchInput {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'live' | 'upcoming' | 'completed';
  homeScore?: number;
  awayScore?: number;
  description?: string;
  ticketUrl?: string;
  streamUrl?: string;
  votingId?: string;
}

export interface MatchFilter {
  status?: 'live' | 'upcoming' | 'completed';
  venue?: string;
  team?: string; // Filter by either homeTeam or awayTeam
  startDate?: string;
  endDate?: string;
  limit?: number;
}

const COLLECTION_NAME = 'matches';

export const matchService = {
  /**
   * Create a new match
   */
  createMatch: async (matchData: MatchInput, adminId: string): Promise<Match> => {
    try {
      const isHomeTeam = matchData.homeTeam === 'Cangrejeras' || matchData.homeTeam === 'Cangrejeras de Santurce';

      // Auto-crear equipos y estadio si no existen
      await teamService.getOrCreateTeam(matchData.homeTeam);
      await teamService.getOrCreateTeam(matchData.awayTeam);
      await venueService.getOrCreateVenue(matchData.venue);

      // Incrementar contadores de uso
      await teamService.incrementUsageCount(matchData.homeTeam);
      await teamService.incrementUsageCount(matchData.awayTeam);
      await venueService.incrementUsageCount(matchData.venue);

      const matchDoc = {
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        date: matchData.date,
        time: matchData.time,
        venue: matchData.venue,
        status: matchData.status,
        homeScore: matchData.homeScore || 0,
        awayScore: matchData.awayScore || 0,
        description: matchData.description || '',
        ticketUrl: matchData.ticketUrl || '',
        streamUrl: matchData.streamUrl || '',
        isHomeTeam,
        votingId: matchData.votingId || '',
        statistics: {
          home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
          away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: adminId,
        updatedBy: adminId
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), matchDoc);

      return {
        id: docRef.id,
        ...matchData,
        homeScore: matchData.homeScore || 0,
        awayScore: matchData.awayScore || 0,
        isHomeTeam,
        statistics: {
          home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
          away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      };
    } catch (error) {
      console.error('Error creating match:', error);
      throw new Error('Error al crear partido');
    }
  },

  /**
   * Get a single match by ID
   */
  getMatch: async (matchId: string): Promise<Match | null> => {
    try {
      const matchRef = doc(db, COLLECTION_NAME, matchId);
      const matchSnap = await getDoc(matchRef);

      if (!matchSnap.exists()) {
        return null;
      }

      const data = matchSnap.data();
      return {
        id: matchSnap.id,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        date: data.date,
        time: data.time,
        venue: data.venue,
        status: data.status,
        homeScore: data.homeScore || 0,
        awayScore: data.awayScore || 0,
        description: data.description || '',
        ticketUrl: data.ticketUrl || '',
        streamUrl: data.streamUrl || '',
        isHomeTeam: data.isHomeTeam,
        votingId: data.votingId || '',
        statistics: data.statistics || {
          home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
          away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    } catch (error) {
      console.error('Error getting match:', error);
      throw new Error('Error al obtener partido');
    }
  },

  /**
   * Get all matches with optional filters
   */
  getAllMatches: async (filters?: MatchFilter): Promise<Match[]> => {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.venue) {
        constraints.push(where('venue', '==', filters.venue));
      }

      if (filters?.team) {
        // This requires composite index or client-side filtering
        // We'll do client-side filtering for team
      }

      // Order by date and time descending (newest first)
      constraints.push(orderBy('date', 'desc'));

      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let matches = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          date: data.date,
          time: data.time,
          venue: data.venue,
          status: data.status,
          homeScore: data.homeScore || 0,
          awayScore: data.awayScore || 0,
          description: data.description || '',
          ticketUrl: data.ticketUrl || '',
          streamUrl: data.streamUrl || '',
          isHomeTeam: data.isHomeTeam,
          votingId: data.votingId || '',
          statistics: data.statistics || {
            home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
            away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy,
          updatedBy: data.updatedBy
        };
      });

      // Client-side filtering for team
      if (filters?.team) {
        matches = matches.filter(m =>
          m.homeTeam.toLowerCase().includes(filters.team!.toLowerCase()) ||
          m.awayTeam.toLowerCase().includes(filters.team!.toLowerCase())
        );
      }

      // Client-side filtering for date range
      if (filters?.startDate) {
        matches = matches.filter(m => m.date >= filters.startDate!);
      }

      if (filters?.endDate) {
        matches = matches.filter(m => m.date <= filters.endDate!);
      }

      return matches;
    } catch (error) {
      console.error('Error getting matches:', error);
      throw new Error('Error al obtener partidos');
    }
  },

  /**
   * Get upcoming matches
   */
  getUpcomingMatches: async (limitCount?: number): Promise<Match[]> => {
    return matchService.getAllMatches({
      status: 'upcoming',
      limit: limitCount
    });
  },

  /**
   * Get live matches
   */
  getLiveMatches: async (): Promise<Match[]> => {
    return matchService.getAllMatches({ status: 'live' });
  },

  /**
   * Get completed matches
   */
  getCompletedMatches: async (limitCount?: number): Promise<Match[]> => {
    return matchService.getAllMatches({
      status: 'completed',
      limit: limitCount
    });
  },

  /**
   * Get the next match (upcoming with earliest date/time)
   */
  getNextMatch: async (): Promise<Match | null> => {
    try {
      const upcomingMatches = await matchService.getUpcomingMatches();

      if (upcomingMatches.length === 0) return null;

      // Sort by date and time
      const sorted = upcomingMatches.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      return sorted[0];
    } catch (error) {
      console.error('Error getting next match:', error);
      return null;
    }
  },

  /**
   * Get current live match
   */
  getCurrentLiveMatch: async (): Promise<Match | null> => {
    try {
      const liveMatches = await matchService.getLiveMatches();
      return liveMatches[0] || null;
    } catch (error) {
      console.error('Error getting live match:', error);
      return null;
    }
  },

  /**
   * Update a match
   */
  updateMatch: async (
    matchId: string,
    matchData: Partial<MatchInput>,
    adminId: string
  ): Promise<void> => {
    try {
      // Si cambian los equipos o el estadio, actualizar contadores de uso
      if (matchData.homeTeam || matchData.awayTeam || matchData.venue) {
        const oldMatch = await matchService.getMatch(matchId);
        if (oldMatch) {
          // Decrementar contador de equipos antiguos
          if (matchData.homeTeam && matchData.homeTeam !== oldMatch.homeTeam) {
            await teamService.decrementUsageCount(oldMatch.homeTeam);
            await teamService.getOrCreateTeam(matchData.homeTeam);
            await teamService.incrementUsageCount(matchData.homeTeam);
          }
          if (matchData.awayTeam && matchData.awayTeam !== oldMatch.awayTeam) {
            await teamService.decrementUsageCount(oldMatch.awayTeam);
            await teamService.getOrCreateTeam(matchData.awayTeam);
            await teamService.incrementUsageCount(matchData.awayTeam);
          }
          // Decrementar contador del estadio antiguo
          if (matchData.venue && matchData.venue !== oldMatch.venue) {
            await venueService.decrementUsageCount(oldMatch.venue);
            await venueService.getOrCreateVenue(matchData.venue);
            await venueService.incrementUsageCount(matchData.venue);
          }
        }
      }

      const matchRef = doc(db, COLLECTION_NAME, matchId);

      // Limpiar valores undefined (Firestore no los permite)
      const cleanData: any = {};
      Object.keys(matchData).forEach(key => {
        const value = (matchData as any)[key];
        if (value !== undefined) {
          cleanData[key] = value === '' ? '' : value;
        }
      });

      const updateData: any = {
        ...cleanData,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      };

      // Recalculate isHomeTeam if teams changed
      if (matchData.homeTeam) {
        updateData.isHomeTeam = matchData.homeTeam === 'Cangrejeras' || matchData.homeTeam === 'Cangrejeras de Santurce';
      }

      await updateDoc(matchRef, updateData);
    } catch (error) {
      console.error('Error updating match:', error);
      throw new Error('Error al actualizar partido');
    }
  },

  /**
   * Update match status
   */
  updateMatchStatus: async (
    matchId: string,
    status: 'live' | 'upcoming' | 'completed',
    adminId: string
  ): Promise<void> => {
    try {
      const matchRef = doc(db, COLLECTION_NAME, matchId);

      await updateDoc(matchRef, {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      });
    } catch (error) {
      console.error('Error updating match status:', error);
      throw new Error('Error al actualizar estado del partido');
    }
  },

  /**
   * Update match score
   */
  updateMatchScore: async (
    matchId: string,
    homeScore: number,
    awayScore: number,
    adminId: string
  ): Promise<void> => {
    try {
      const matchRef = doc(db, COLLECTION_NAME, matchId);

      await updateDoc(matchRef, {
        homeScore,
        awayScore,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      });
    } catch (error) {
      console.error('Error updating match score:', error);
      throw new Error('Error al actualizar marcador');
    }
  },

  /**
   * Update match statistics
   */
  updateMatchStatistics: async (
    matchId: string,
    statistics: { home: MatchStats; away: MatchStats },
    adminId: string
  ): Promise<void> => {
    try {
      const matchRef = doc(db, COLLECTION_NAME, matchId);

      await updateDoc(matchRef, {
        statistics,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      });
    } catch (error) {
      console.error('Error updating match statistics:', error);
      throw new Error('Error al actualizar estadísticas');
    }
  },

  /**
   * Delete a match
   */
  deleteMatch: async (matchId: string): Promise<void> => {
    try {
      // Obtener el partido antes de eliminarlo para decrementar contadores
      const match = await matchService.getMatch(matchId);
      if (match) {
        await teamService.decrementUsageCount(match.homeTeam);
        await teamService.decrementUsageCount(match.awayTeam);
        await venueService.decrementUsageCount(match.venue);
      }

      const matchRef = doc(db, COLLECTION_NAME, matchId);
      await deleteDoc(matchRef);
    } catch (error) {
      console.error('Error deleting match:', error);
      throw new Error('Error al eliminar partido');
    }
  },

  /**
   * Get matches by date range
   */
  getMatchesByDateRange: async (startDate: string, endDate: string): Promise<Match[]> => {
    return matchService.getAllMatches({
      startDate,
      endDate
    });
  },

  /**
   * Get matches by venue
   */
  getMatchesByVenue: async (venue: string): Promise<Match[]> => {
    return matchService.getAllMatches({ venue });
  },

  /**
   * Get matches by team (home or away)
   */
  getMatchesByTeam: async (team: string): Promise<Match[]> => {
    return matchService.getAllMatches({ team });
  },

  /**
   * Get season statistics
   */
  getSeasonStats: async (): Promise<{
    totalMatches: number;
    wins: number;
    losses: number;
    upcomingMatches: number;
    liveMatches: number;
  }> => {
    try {
      const allMatches = await matchService.getAllMatches();

      const completedMatches = allMatches.filter(m => m.status === 'completed');
      const upcomingMatches = allMatches.filter(m => m.status === 'upcoming');
      const liveMatches = allMatches.filter(m => m.status === 'live');

      const wins = completedMatches.filter(m => {
        if (m.isHomeTeam) {
          return m.homeScore > m.awayScore;
        } else {
          return m.awayScore > m.homeScore;
        }
      }).length;

      const losses = completedMatches.length - wins;

      return {
        totalMatches: allMatches.length,
        wins,
        losses,
        upcomingMatches: upcomingMatches.length,
        liveMatches: liveMatches.length
      };
    } catch (error) {
      console.error('Error getting season stats:', error);
      throw new Error('Error al obtener estadísticas de temporada');
    }
  }
};

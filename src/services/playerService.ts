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

export interface Player {
  id: string;
  name: string;
  lastName: string;
  number: number;
  position: string;
  height: string;
  points: number;
  aces: number;
  blocks: number;
  status: 'active' | 'inactive';
  photo?: string;
  bio?: string;
  gamesPlayed: number;
  gamesWon: number;
  avgPerGame: number;
  attacks: number;
  effectiveness: number;
  team: string;
  league: string;
  season: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Admin ID who created this player
  updatedBy?: string; // Admin ID who last updated this player
}

export interface PlayerInput {
  name: string;
  lastName: string;
  number: number;
  position: string;
  height: string;
  points?: number;
  aces?: number;
  blocks?: number;
  status: 'active' | 'inactive';
  photo?: string;
  bio?: string;
  gamesPlayed?: number;
  gamesWon?: number;
  avgPerGame?: number;
  attacks?: number;
  effectiveness?: number;
  team: string;
  league: string;
  season: string;
}

export interface PlayerFilter {
  status?: 'active' | 'inactive';
  position?: string;
  team?: string;
  season?: string;
  limit?: number;
}

const COLLECTION_NAME = 'players';

export const playerService = {
  /**
   * Create a new player
   */
  createPlayer: async (playerData: PlayerInput, adminId: string): Promise<Player> => {
    try {
      const playerDoc = {
        name: playerData.name,
        lastName: playerData.lastName,
        number: playerData.number,
        position: playerData.position,
        height: playerData.height,
        points: playerData.points || 0,
        aces: playerData.aces || 0,
        blocks: playerData.blocks || 0,
        status: playerData.status,
        photo: playerData.photo || '',
        bio: playerData.bio || '',
        gamesPlayed: playerData.gamesPlayed || 0,
        gamesWon: playerData.gamesWon || 0,
        avgPerGame: playerData.avgPerGame || 0,
        attacks: playerData.attacks || 0,
        effectiveness: playerData.effectiveness || 0,
        team: playerData.team,
        league: playerData.league,
        season: playerData.season,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: adminId,
        updatedBy: adminId
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), playerDoc);

      return {
        id: docRef.id,
        ...playerData,
        points: playerData.points || 0,
        aces: playerData.aces || 0,
        blocks: playerData.blocks || 0,
        gamesPlayed: playerData.gamesPlayed || 0,
        gamesWon: playerData.gamesWon || 0,
        avgPerGame: playerData.avgPerGame || 0,
        attacks: playerData.attacks || 0,
        effectiveness: playerData.effectiveness || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      };
    } catch (error) {
      console.error('Error creating player:', error);
      throw new Error('Error al crear jugadora');
    }
  },

  /**
   * Get a single player by ID
   */
  getPlayer: async (playerId: string): Promise<Player | null> => {
    try {
      const playerRef = doc(db, COLLECTION_NAME, playerId);
      const playerSnap = await getDoc(playerRef);

      if (!playerSnap.exists()) {
        return null;
      }

      const data = playerSnap.data();
      return {
        id: playerSnap.id,
        name: data.name,
        lastName: data.lastName,
        number: data.number,
        position: data.position,
        height: data.height,
        points: data.points,
        aces: data.aces,
        blocks: data.blocks,
        status: data.status,
        photo: data.photo || '',
        bio: data.bio || '',
        gamesPlayed: data.gamesPlayed || 0,
        gamesWon: data.gamesWon || 0,
        avgPerGame: data.avgPerGame || 0,
        attacks: data.attacks || 0,
        effectiveness: data.effectiveness || 0,
        team: data.team,
        league: data.league,
        season: data.season,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
        updatedBy: data.updatedBy
      };
    } catch (error) {
      console.error('Error getting player:', error);
      throw new Error('Error al obtener jugadora');
    }
  },

  /**
   * Get all players with optional filters
   */
  getAllPlayers: async (filters?: PlayerFilter): Promise<Player[]> => {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.position) {
        constraints.push(where('position', '==', filters.position));
      }

      if (filters?.team) {
        constraints.push(where('team', '==', filters.team));
      }

      if (filters?.season) {
        constraints.push(where('season', '==', filters.season));
      }

      // Order by number for roster display
      // Requiere índice compuesto: Collection: players, Fields: status (Ascending), number (Ascending)
      constraints.push(orderBy('number', 'asc'));

      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          lastName: data.lastName,
          number: data.number,
          position: data.position,
          height: data.height,
          points: data.points,
          aces: data.aces,
          blocks: data.blocks,
          status: data.status,
          photo: data.photo || '',
          bio: data.bio || '',
          gamesPlayed: data.gamesPlayed || 0,
          gamesWon: data.gamesWon || 0,
          avgPerGame: data.avgPerGame || 0,
          attacks: data.attacks || 0,
          effectiveness: data.effectiveness || 0,
          team: data.team,
          league: data.league,
          season: data.season,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy,
          updatedBy: data.updatedBy
        };
      });
    } catch (error) {
      console.error('Error getting players:', error);
      throw new Error('Error al obtener jugadoras');
    }
  },

  /**
   * Get active players only
   */
  getActivePlayers: async (): Promise<Player[]> => {
    return playerService.getAllPlayers({ status: 'active' });
  },

  /**
   * Get players by position
   */
  getPlayersByPosition: async (position: string): Promise<Player[]> => {
    return playerService.getAllPlayers({ position });
  },

  /**
   * Get players by season
   */
  getPlayersBySeason: async (season: string): Promise<Player[]> => {
    return playerService.getAllPlayers({ season });
  },

  /**
   * Update a player
   */
  updatePlayer: async (
    playerId: string,
    playerData: Partial<PlayerInput>,
    adminId: string
  ): Promise<void> => {
    try {
      const playerRef = doc(db, COLLECTION_NAME, playerId);

      const updateData: any = {
        ...playerData,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      };

      await updateDoc(playerRef, updateData);
    } catch (error) {
      console.error('Error updating player:', error);
      throw new Error('Error al actualizar jugadora');
    }
  },

  /**
   * Update player statistics
   */
  updatePlayerStats: async (
    playerId: string,
    stats: {
      points?: number;
      aces?: number;
      blocks?: number;
      attacks?: number;
      gamesPlayed?: number;
      gamesWon?: number;
      avgPerGame?: number;
      effectiveness?: number;
    },
    adminId: string
  ): Promise<void> => {
    try {
      const playerRef = doc(db, COLLECTION_NAME, playerId);

      const updateData: any = {
        ...stats,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      };

      await updateDoc(playerRef, updateData);
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw new Error('Error al actualizar estadísticas');
    }
  },

  /**
   * Update player photo
   */
  updatePlayerPhoto: async (
    playerId: string,
    photoURL: string,
    adminId: string
  ): Promise<void> => {
    try {
      const playerRef = doc(db, COLLECTION_NAME, playerId);

      await updateDoc(playerRef, {
        photo: photoURL,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      });
    } catch (error) {
      console.error('Error updating player photo:', error);
      throw new Error('Error al actualizar foto');
    }
  },

  /**
   * Toggle player status (active/inactive)
   */
  togglePlayerStatus: async (playerId: string, adminId: string): Promise<void> => {
    try {
      const player = await playerService.getPlayer(playerId);
      if (!player) {
        throw new Error('Jugadora no encontrada');
      }

      const newStatus = player.status === 'active' ? 'inactive' : 'active';
      const playerRef = doc(db, COLLECTION_NAME, playerId);

      await updateDoc(playerRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: adminId
      });
    } catch (error) {
      console.error('Error toggling player status:', error);
      throw new Error('Error al cambiar estado de jugadora');
    }
  },

  /**
   * Delete a player
   */
  deletePlayer: async (playerId: string): Promise<void> => {
    try {
      const playerRef = doc(db, COLLECTION_NAME, playerId);
      await deleteDoc(playerRef);
    } catch (error) {
      console.error('Error deleting player:', error);
      throw new Error('Error al eliminar jugadora');
    }
  },

  /**
   * Get team statistics
   */
  getTeamStats: async (season?: string): Promise<{
    totalPlayers: number;
    activePlayers: number;
    inactivePlayers: number;
    totalPoints: number;
    totalAces: number;
    totalBlocks: number;
    avgEffectiveness: number;
  }> => {
    try {
      const filters: PlayerFilter = season ? { season } : {};
      const players = await playerService.getAllPlayers(filters);

      const activePlayers = players.filter(p => p.status === 'active');
      const inactivePlayers = players.filter(p => p.status === 'inactive');

      const totalPoints = players.reduce((sum, p) => sum + p.points, 0);
      const totalAces = players.reduce((sum, p) => sum + p.aces, 0);
      const totalBlocks = players.reduce((sum, p) => sum + p.blocks, 0);

      const avgEffectiveness = players.length > 0
        ? players.reduce((sum, p) => sum + p.effectiveness, 0) / players.length
        : 0;

      return {
        totalPlayers: players.length,
        activePlayers: activePlayers.length,
        inactivePlayers: inactivePlayers.length,
        totalPoints,
        totalAces,
        totalBlocks,
        avgEffectiveness: Math.round(avgEffectiveness * 10) / 10
      };
    } catch (error) {
      console.error('Error getting team stats:', error);
      throw new Error('Error al obtener estadísticas del equipo');
    }
  },

  /**
   * Get top performers
   */
  getTopPerformers: async (
    stat: 'points' | 'aces' | 'blocks' | 'effectiveness',
    limitCount: number = 5
  ): Promise<Player[]> => {
    try {
      const players = await playerService.getActivePlayers();

      return players
        .sort((a, b) => b[stat] - a[stat])
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting top performers:', error);
      throw new Error('Error al obtener mejores jugadoras');
    }
  }
};

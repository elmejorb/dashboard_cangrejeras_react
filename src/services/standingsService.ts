import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface StandingsTeam {
  id: string;
  name: string;
  abbr: string;
  points: number;
  played: number;
  won: number;
  lost: number;
  color: string;
  position: number; // Orden en la tabla
  createdAt: Date;
  updatedAt: Date;
}

export interface StandingsTeamInput {
  name: string;
  abbr: string;
  points: number;
  played: number;
  won: number;
  lost: number;
  color: string;
}

const COLLECTION_NAME = 'standings';

/**
 * Standings Service - Gestiona la tabla de posiciones en Firestore
 */
export const standingsService = {
  /**
   * Obtiene todos los equipos de la tabla ordenados por posición
   */
  getAllStandings: async (): Promise<StandingsTeam[]> => {
    try {
      const standingsRef = collection(db, COLLECTION_NAME);
      const q = query(standingsRef, orderBy('position', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        abbr: doc.data().abbr,
        points: doc.data().points || 0,
        played: doc.data().played || 0,
        won: doc.data().won || 0,
        lost: doc.data().lost || 0,
        color: doc.data().color || '#0C2340',
        position: doc.data().position || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching standings:', error);
      throw error;
    }
  },

  /**
   * Obtiene un equipo específico de la tabla
   */
  getStandingsTeam: async (teamId: string): Promise<StandingsTeam | null> => {
    try {
      const teamRef = doc(db, COLLECTION_NAME, teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        return null;
      }

      const data = teamSnap.data();
      return {
        id: teamSnap.id,
        name: data.name,
        abbr: data.abbr,
        points: data.points || 0,
        played: data.played || 0,
        won: data.won || 0,
        lost: data.lost || 0,
        color: data.color || '#0C2340',
        position: data.position || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error getting standings team:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo equipo en la tabla de posiciones
   */
  createStandingsTeam: async (teamData: StandingsTeamInput): Promise<StandingsTeam> => {
    try {
      // Obtener la última posición
      const allTeams = await standingsService.getAllStandings();
      const maxPosition = allTeams.length > 0
        ? Math.max(...allTeams.map(t => t.position))
        : 0;

      const teamDoc = {
        name: teamData.name.trim(),
        abbr: teamData.abbr.trim().toUpperCase(),
        points: teamData.points || 0,
        played: teamData.played || 0,
        won: teamData.won || 0,
        lost: teamData.lost || 0,
        color: teamData.color || '#0C2340',
        position: maxPosition + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), teamDoc);

      return {
        id: docRef.id,
        name: teamDoc.name,
        abbr: teamDoc.abbr,
        points: teamDoc.points,
        played: teamDoc.played,
        won: teamDoc.won,
        lost: teamDoc.lost,
        color: teamDoc.color,
        position: teamDoc.position,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating standings team:', error);
      throw error;
    }
  },

  /**
   * Actualiza un equipo de la tabla
   */
  updateStandingsTeam: async (
    teamId: string,
    teamData: Partial<StandingsTeamInput>
  ): Promise<void> => {
    try {
      const teamRef = doc(db, COLLECTION_NAME, teamId);

      // Limpiar valores undefined
      const cleanData: any = {};
      Object.keys(teamData).forEach(key => {
        const value = (teamData as any)[key];
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });

      const updateData: any = {
        ...cleanData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(teamRef, updateData);
    } catch (error) {
      console.error('Error updating standings team:', error);
      throw error;
    }
  },

  /**
   * Elimina un equipo de la tabla y reordena las posiciones
   */
  deleteStandingsTeam: async (teamId: string): Promise<void> => {
    try {
      const team = await standingsService.getStandingsTeam(teamId);
      if (!team) {
        throw new Error('Equipo no encontrado');
      }

      // Eliminar el equipo
      const teamRef = doc(db, COLLECTION_NAME, teamId);
      await deleteDoc(teamRef);

      // Reordenar posiciones de los equipos que estaban después
      const allTeams = await standingsService.getAllStandings();
      const batch = writeBatch(db);

      allTeams
        .filter(t => t.position > team.position)
        .forEach(t => {
          const ref = doc(db, COLLECTION_NAME, t.id);
          batch.update(ref, {
            position: t.position - 1,
            updatedAt: serverTimestamp()
          });
        });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting standings team:', error);
      throw error;
    }
  },

  /**
   * Reordena las posiciones de los equipos
   */
  reorderStandings: async (teams: StandingsTeam[]): Promise<void> => {
    try {
      const batch = writeBatch(db);

      teams.forEach((team, index) => {
        const teamRef = doc(db, COLLECTION_NAME, team.id);
        batch.update(teamRef, {
          position: index + 1,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering standings:', error);
      throw error;
    }
  },

  /**
   * Mueve un equipo una posición arriba
   */
  moveTeamUp: async (teamId: string): Promise<void> => {
    try {
      const allTeams = await standingsService.getAllStandings();
      const currentIndex = allTeams.findIndex(t => t.id === teamId);

      if (currentIndex <= 0) {
        return; // Ya está en primera posición
      }

      const batch = writeBatch(db);

      // Intercambiar posiciones
      const currentTeam = allTeams[currentIndex];
      const previousTeam = allTeams[currentIndex - 1];

      const currentRef = doc(db, COLLECTION_NAME, currentTeam.id);
      const previousRef = doc(db, COLLECTION_NAME, previousTeam.id);

      batch.update(currentRef, {
        position: previousTeam.position,
        updatedAt: serverTimestamp()
      });
      batch.update(previousRef, {
        position: currentTeam.position,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error moving team up:', error);
      throw error;
    }
  },

  /**
   * Mueve un equipo una posición abajo
   */
  moveTeamDown: async (teamId: string): Promise<void> => {
    try {
      const allTeams = await standingsService.getAllStandings();
      const currentIndex = allTeams.findIndex(t => t.id === teamId);

      if (currentIndex < 0 || currentIndex >= allTeams.length - 1) {
        return; // Ya está en última posición o no existe
      }

      const batch = writeBatch(db);

      // Intercambiar posiciones
      const currentTeam = allTeams[currentIndex];
      const nextTeam = allTeams[currentIndex + 1];

      const currentRef = doc(db, COLLECTION_NAME, currentTeam.id);
      const nextRef = doc(db, COLLECTION_NAME, nextTeam.id);

      batch.update(currentRef, {
        position: nextTeam.position,
        updatedAt: serverTimestamp()
      });
      batch.update(nextRef, {
        position: currentTeam.position,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error moving team down:', error);
      throw error;
    }
  },

  /**
   * Inicializa la tabla con equipos por defecto
   */
  initializeDefaultStandings: async (): Promise<void> => {
    try {
      const existing = await standingsService.getAllStandings();
      console.log('📊 Verificando standings existentes:', existing.length, 'equipos');

      if (existing.length > 0) {
        console.log('✅ Ya hay datos en Firestore, no se inicializarán datos por defecto');
        return; // Ya hay datos
      }

      console.log('🆕 No hay datos, inicializando equipos por defecto...');
      const defaultTeams: StandingsTeamInput[] = [
        {
          name: 'Cangrejeras de Santurce',
          abbr: 'CAN',
          points: 48,
          played: 21,
          won: 16,
          lost: 5,
          color: '#0C2340',
        },
        {
          name: 'Criollas de Caguas',
          abbr: 'CRI',
          points: 45,
          played: 21,
          won: 15,
          lost: 6,
          color: '#E01E37',
        },
        {
          name: 'Gigantes de Carolina',
          abbr: 'GIG',
          points: 42,
          played: 20,
          won: 14,
          lost: 6,
          color: '#10B981',
        },
        {
          name: 'Pinkin de Corozal',
          abbr: 'PIN',
          points: 36,
          played: 21,
          won: 12,
          lost: 9,
          color: '#EC4899',
        },
        {
          name: 'Valkirias de Toa Baja',
          abbr: 'VAL',
          points: 24,
          played: 20,
          won: 8,
          lost: 12,
          color: '#8B5CF6',
        },
        {
          name: 'Changas de Naranjito',
          abbr: 'CHA',
          points: 15,
          played: 21,
          won: 5,
          lost: 16,
          color: '#F97316',
        },
      ];

      for (let i = 0; i < defaultTeams.length; i++) {
        await standingsService.createStandingsTeam(defaultTeams[i]);
      }

      console.log('Default standings initialized');
    } catch (error) {
      console.error('Error initializing default standings:', error);
      throw error;
    }
  },
};

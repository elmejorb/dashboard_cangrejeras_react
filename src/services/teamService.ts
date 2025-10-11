import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Team {
  id: string;
  name: string;
  isPrimary: boolean;
  createdAt: Date;
  usageCount: number;
}

export interface TeamInput {
  name: string;
}

/**
 * Team Service - Gestiona la colección de equipos en Firestore
 */
export const teamService = {
  /**
   * Obtiene todos los equipos ordenados alfabéticamente
   */
  getAllTeams: async (): Promise<Team[]> => {
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        isPrimary: doc.data().isPrimary || false,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        usageCount: doc.data().usageCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  /**
   * Busca un equipo por nombre (case-insensitive)
   */
  getTeamByName: async (name: string): Promise<Team | null> => {
    try {
      const teamsRef = collection(db, 'teams');
      const querySnapshot = await getDocs(teamsRef);

      // Búsqueda case-insensitive en el cliente
      const normalizedName = name.trim().toLowerCase();
      const matchingDoc = querySnapshot.docs.find(
        doc => doc.data().name.toLowerCase() === normalizedName
      );

      if (!matchingDoc) {
        return null;
      }

      return {
        id: matchingDoc.id,
        name: matchingDoc.data().name,
        isPrimary: matchingDoc.data().isPrimary || false,
        createdAt: matchingDoc.data().createdAt?.toDate() || new Date(),
        usageCount: matchingDoc.data().usageCount || 0,
      };
    } catch (error) {
      console.error('Error finding team:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo equipo
   */
  createTeam: async (teamData: TeamInput): Promise<Team> => {
    try {
      // Verificar si ya existe
      const existing = await teamService.getTeamByName(teamData.name);
      if (existing) {
        throw new Error('Ya existe un equipo con este nombre');
      }

      const teamDoc = {
        name: teamData.name.trim(),
        isPrimary: false,
        usageCount: 0,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'teams'), teamDoc);

      return {
        id: docRef.id,
        name: teamDoc.name,
        isPrimary: teamDoc.isPrimary,
        usageCount: teamDoc.usageCount,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  /**
   * Crea un equipo si no existe, o retorna el existente
   */
  getOrCreateTeam: async (teamName: string): Promise<Team> => {
    try {
      const existing = await teamService.getTeamByName(teamName);
      if (existing) {
        return existing;
      }

      return await teamService.createTeam({ name: teamName });
    } catch (error) {
      console.error('Error in getOrCreateTeam:', error);
      throw error;
    }
  },

  /**
   * Elimina un equipo (solo si no es principal y no está en uso)
   */
  deleteTeam: async (teamId: string): Promise<void> => {
    try {
      const teamRef = doc(db, 'teams', teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        throw new Error('El equipo no existe');
      }

      const teamData = teamSnap.data();

      if (teamData.isPrimary) {
        throw new Error('No se puede eliminar el equipo principal');
      }

      if (teamData.usageCount > 0) {
        throw new Error('No se puede eliminar un equipo que está en uso en partidos');
      }

      await deleteDoc(teamRef);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  /**
   * Incrementa el contador de uso de un equipo
   */
  incrementUsageCount: async (teamName: string): Promise<void> => {
    try {
      const team = await teamService.getTeamByName(teamName);
      if (!team) {
        console.warn(`Team "${teamName}" not found for usage increment`);
        return;
      }

      const teamRef = doc(db, 'teams', team.id);
      await updateDoc(teamRef, {
        usageCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      throw error;
    }
  },

  /**
   * Decrementa el contador de uso de un equipo
   */
  decrementUsageCount: async (teamName: string): Promise<void> => {
    try {
      const team = await teamService.getTeamByName(teamName);
      if (!team) {
        console.warn(`Team "${teamName}" not found for usage decrement`);
        return;
      }

      const teamRef = doc(db, 'teams', team.id);
      await updateDoc(teamRef, {
        usageCount: increment(-1)
      });
    } catch (error) {
      console.error('Error decrementing usage count:', error);
      throw error;
    }
  },

  /**
   * Obtiene el equipo principal (Cangrejeras)
   */
  getPrimaryTeam: async (): Promise<Team | null> => {
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where('isPrimary', '==', true));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        name: doc.data().name,
        isPrimary: doc.data().isPrimary,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        usageCount: doc.data().usageCount || 0,
      };
    } catch (error) {
      console.error('Error fetching primary team:', error);
      throw error;
    }
  },

  /**
   * Inicializa el equipo principal si no existe
   */
  initializePrimaryTeam: async (): Promise<void> => {
    try {
      const existing = await teamService.getPrimaryTeam();
      if (existing) {
        return; // Ya existe
      }

      // Crear Cangrejeras como equipo principal
      const teamDoc = {
        name: 'Cangrejeras',
        isPrimary: true,
        usageCount: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'teams'), teamDoc);
      console.log('Primary team "Cangrejeras" initialized');
    } catch (error) {
      console.error('Error initializing primary team:', error);
      throw error;
    }
  },
};

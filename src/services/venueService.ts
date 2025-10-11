import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Venue {
  id: string;
  name: string;
  createdAt: Date;
  usageCount: number;
}

export interface VenueInput {
  name: string;
}

/**
 * Venue Service - Gestiona la colección de estadios en Firestore
 */
export const venueService = {
  /**
   * Obtiene todos los estadios ordenados alfabéticamente
   */
  getAllVenues: async (): Promise<Venue[]> => {
    try {
      const venuesRef = collection(db, 'venues');
      const q = query(venuesRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        usageCount: doc.data().usageCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  },

  /**
   * Busca un estadio por nombre (case-insensitive)
   */
  getVenueByName: async (name: string): Promise<Venue | null> => {
    try {
      const venuesRef = collection(db, 'venues');
      const querySnapshot = await getDocs(venuesRef);

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
        createdAt: matchingDoc.data().createdAt?.toDate() || new Date(),
        usageCount: matchingDoc.data().usageCount || 0,
      };
    } catch (error) {
      console.error('Error finding venue:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo estadio
   */
  createVenue: async (venueData: VenueInput): Promise<Venue> => {
    try {
      // Verificar si ya existe
      const existing = await venueService.getVenueByName(venueData.name);
      if (existing) {
        throw new Error('Ya existe un estadio con este nombre');
      }

      const venueDoc = {
        name: venueData.name.trim(),
        usageCount: 0,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'venues'), venueDoc);

      return {
        id: docRef.id,
        name: venueDoc.name,
        usageCount: venueDoc.usageCount,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    }
  },

  /**
   * Crea un estadio si no existe, o retorna el existente
   */
  getOrCreateVenue: async (venueName: string): Promise<Venue> => {
    try {
      const existing = await venueService.getVenueByName(venueName);
      if (existing) {
        return existing;
      }

      return await venueService.createVenue({ name: venueName });
    } catch (error) {
      console.error('Error in getOrCreateVenue:', error);
      throw error;
    }
  },

  /**
   * Elimina un estadio (solo si no está en uso)
   */
  deleteVenue: async (venueId: string): Promise<void> => {
    try {
      const venueRef = doc(db, 'venues', venueId);
      const venueSnap = await getDoc(venueRef);

      if (!venueSnap.exists()) {
        throw new Error('El estadio no existe');
      }

      const venueData = venueSnap.data();

      if (venueData.usageCount > 0) {
        throw new Error('No se puede eliminar un estadio que está en uso en partidos');
      }

      await deleteDoc(venueRef);
    } catch (error) {
      console.error('Error deleting venue:', error);
      throw error;
    }
  },

  /**
   * Incrementa el contador de uso de un estadio
   */
  incrementUsageCount: async (venueName: string): Promise<void> => {
    try {
      const venue = await venueService.getVenueByName(venueName);
      if (!venue) {
        console.warn(`Venue "${venueName}" not found for usage increment`);
        return;
      }

      const venueRef = doc(db, 'venues', venue.id);
      await updateDoc(venueRef, {
        usageCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      throw error;
    }
  },

  /**
   * Decrementa el contador de uso de un estadio
   */
  decrementUsageCount: async (venueName: string): Promise<void> => {
    try {
      const venue = await venueService.getVenueByName(venueName);
      if (!venue) {
        console.warn(`Venue "${venueName}" not found for usage decrement`);
        return;
      }

      const venueRef = doc(db, 'venues', venue.id);
      await updateDoc(venueRef, {
        usageCount: increment(-1)
      });
    } catch (error) {
      console.error('Error decrementing usage count:', error);
      throw error;
    }
  },

  /**
   * Inicializa los estadios por defecto si no existen
   */
  initializeDefaultVenues: async (): Promise<void> => {
    try {
      const defaultVenues = [
        'Coliseo Roberto Clemente',
        'Coliseo Mario Morales',
        'Coliseo José Miguel Agrelot',
        'Coliseo Raymond Dalmau',
      ];

      for (const venueName of defaultVenues) {
        await venueService.getOrCreateVenue(venueName);
      }

      console.log('Default venues initialized');
    } catch (error) {
      console.error('Error initializing default venues:', error);
      throw error;
    }
  },
};

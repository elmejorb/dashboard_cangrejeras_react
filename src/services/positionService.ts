import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const POSITIONS_DOC_ID = 'team_positions';
const COLLECTION_NAME = 'settings';

export interface PositionsData {
  positions: string[];
  updatedAt: Date;
  updatedBy?: string;
}

const DEFAULT_POSITIONS = [
  'Opuesta',
  'Esquina',
  'Central',
  'Líbero',
  'Levantadora',
];

export const positionService = {
  /**
   * Get all positions
   */
  getPositions: async (): Promise<string[]> => {
    try {
      const positionsRef = doc(db, COLLECTION_NAME, POSITIONS_DOC_ID);
      const positionsSnap = await getDoc(positionsRef);

      if (!positionsSnap.exists()) {
        // If document doesn't exist, create it with default positions
        await setDoc(positionsRef, {
          positions: DEFAULT_POSITIONS,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return DEFAULT_POSITIONS;
      }

      const data = positionsSnap.data();
      return data.positions || DEFAULT_POSITIONS;
    } catch (error) {
      console.error('Error getting positions:', error);
      // Return default positions if there's an error
      return DEFAULT_POSITIONS;
    }
  },

  /**
   * Update positions list
   */
  updatePositions: async (positions: string[], adminId?: string): Promise<void> => {
    try {
      const positionsRef = doc(db, COLLECTION_NAME, POSITIONS_DOC_ID);

      const updateData: any = {
        positions,
        updatedAt: serverTimestamp(),
      };

      if (adminId) {
        updateData.updatedBy = adminId;
      }

      // Check if document exists
      const positionsSnap = await getDoc(positionsRef);

      if (!positionsSnap.exists()) {
        // Create new document
        await setDoc(positionsRef, {
          ...updateData,
          createdAt: serverTimestamp(),
        });
      } else {
        // Update existing document
        await updateDoc(positionsRef, updateData);
      }
    } catch (error: any) {
      console.error('Error updating positions:', error);
      throw error; // Re-throw the original error instead of wrapping it
    }
  },

  /**
   * Add a new position
   */
  addPosition: async (position: string, adminId?: string): Promise<void> => {
    try {
      const currentPositions = await positionService.getPositions();

      // Check if position already exists (case insensitive)
      if (currentPositions.some(p => p.toLowerCase() === position.toLowerCase())) {
        throw new Error('Esta posición ya existe');
      }

      const newPositions = [...currentPositions, position];
      await positionService.updatePositions(newPositions, adminId);
    } catch (error) {
      console.error('Error adding position:', error);
      throw error;
    }
  },

  /**
   * Update a position name
   */
  updatePosition: async (oldPosition: string, newPosition: string, adminId?: string): Promise<void> => {
    try {
      const currentPositions = await positionService.getPositions();

      const index = currentPositions.indexOf(oldPosition);
      if (index === -1) {
        throw new Error('Posición no encontrada');
      }

      // Check if new position name already exists (excluding the current one)
      if (currentPositions.some((p, i) => i !== index && p.toLowerCase() === newPosition.toLowerCase())) {
        throw new Error('Ya existe una posición con ese nombre');
      }

      const newPositions = [...currentPositions];
      newPositions[index] = newPosition;
      await positionService.updatePositions(newPositions, adminId);
    } catch (error) {
      console.error('Error updating position:', error);
      throw error;
    }
  },

  /**
   * Delete a position
   */
  deletePosition: async (position: string, adminId?: string): Promise<void> => {
    try {
      const currentPositions = await positionService.getPositions();
      const newPositions = currentPositions.filter(p => p !== position);

      if (newPositions.length === currentPositions.length) {
        throw new Error('Posición no encontrada');
      }

      await positionService.updatePositions(newPositions, adminId);
    } catch (error) {
      console.error('Error deleting position:', error);
      throw error;
    }
  },
};

// Fan User Service - Manages fan users (app users) in Firestore
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Fan user document structure
export interface FanUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  favoritePlayers: string[];
  favoriteTeam: string;
  preferences: FanUserPreferences;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  lastActivity?: Timestamp | Date;
  isActive: boolean;
  votesCount: number;
}

export interface FanUserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  language: 'es' | 'en';
}

// Default preferences
const DEFAULT_PREFERENCES: FanUserPreferences = {
  notifications: true,
  emailUpdates: false,
  language: 'es'
};

export const fanUserService = {
  /**
   * Get fan user data from Firestore
   */
  getFanUser: async (userId: string): Promise<FanUser | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: userSnap.id,
          ...data
        } as FanUser;
      }

      return null;
    } catch (error) {
      console.error('Error getting fan user:', error);
      return null;
    }
  },

  /**
   * Create a new fan user in Firestore
   */
  createFanUser: async (userId: string, userData: {
    displayName: string;
    email: string;
    photoURL?: string;
  }): Promise<FanUser> => {
    try {
      const userRef = doc(db, 'users', userId);

      const userDoc = {
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL || '',
        favoritePlayers: [],
        favoriteTeam: 'Cangrejeras de Santurce',
        preferences: DEFAULT_PREFERENCES,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true,
        votesCount: 0
      };

      await setDoc(userRef, userDoc);

      return {
        id: userId,
        ...userDoc,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivity: new Date()
      } as FanUser;
    } catch (error) {
      console.error('Error creating fan user:', error);
      throw new Error('Error al crear usuario');
    }
  },

  /**
   * Update fan user data in Firestore
   */
  updateFanUser: async (userId: string, updates: Partial<Omit<FanUser, 'id' | 'email' | 'createdAt' | 'votesCount'>>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating fan user:', error);
      throw new Error('Error al actualizar usuario');
    }
  },

  /**
   * Add a player to favorites
   */
  addFavoritePlayer: async (userId: string, playerId: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        favoritePlayers: arrayUnion(playerId),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding favorite player:', error);
      throw new Error('Error al agregar jugadora favorita');
    }
  },

  /**
   * Remove a player from favorites
   */
  removeFavoritePlayer: async (userId: string, playerId: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        favoritePlayers: arrayRemove(playerId),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing favorite player:', error);
      throw new Error('Error al eliminar jugadora favorita');
    }
  },

  /**
   * Check if a player is in favorites
   */
  isFavoritePlayer: async (userId: string, playerId: string): Promise<boolean> => {
    try {
      const user = await fanUserService.getFanUser(userId);
      if (!user) return false;

      return user.favoritePlayers.includes(playerId);
    } catch (error) {
      console.error('Error checking favorite player:', error);
      return false;
    }
  },

  /**
   * Get all favorite players for a user
   */
  getFavoritePlayers: async (userId: string): Promise<string[]> => {
    try {
      const user = await fanUserService.getFanUser(userId);
      return user?.favoritePlayers || [];
    } catch (error) {
      console.error('Error getting favorite players:', error);
      return [];
    }
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (userId: string, preferences: Partial<FanUserPreferences>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      const user = await fanUserService.getFanUser(userId);

      if (!user) throw new Error('Usuario no encontrado');

      const updatedPreferences = {
        ...user.preferences,
        ...preferences
      };

      await updateDoc(userRef, {
        preferences: updatedPreferences,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Error al actualizar preferencias');
    }
  },

  /**
   * Increment vote count
   */
  incrementVoteCount: async (userId: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        votesCount: increment(1),
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing vote count:', error);
      throw new Error('Error al actualizar conteo de votos');
    }
  },

  /**
   * Update last activity timestamp
   */
  updateLastActivity: async (userId: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  },

  /**
   * Get user by email
   */
  getFanUserByEmail: async (email: string): Promise<FanUser | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as FanUser;
      }

      return null;
    } catch (error) {
      console.error('Error getting fan user by email:', error);
      return null;
    }
  },

  /**
   * Check if user exists in Firestore
   */
  fanUserExists: async (userId: string): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error checking fan user existence:', error);
      return false;
    }
  },

  /**
   * Get users by favorite player (for analytics)
   */
  getUsersByFavoritePlayer: async (playerId: string): Promise<FanUser[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('favoritePlayers', 'array-contains', playerId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FanUser));
    } catch (error) {
      console.error('Error getting users by favorite player:', error);
      return [];
    }
  },

  /**
   * Get active users count (for stats)
   */
  getActiveUsersCount: async (): Promise<number> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);

      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting active users count:', error);
      return 0;
    }
  }
};

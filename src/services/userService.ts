// Firestore User Service
// Manages user data in Firestore database

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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../utils/auth';

// Firestore user document structure
export interface UserDocument {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Moderador';
  avatar?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  lastLogin?: Timestamp | Date;
}

// Convert Firestore document to User object
const firestoreUserToUser = (doc: UserDocument): User => {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    avatar: doc.avatar,
    createdAt: doc.createdAt instanceof Timestamp
      ? doc.createdAt.toDate().toISOString()
      : new Date(doc.createdAt).toISOString()
  };
};

// User Service
export const userService = {
  /**
   * Get user data from Firestore
   */
  getUser: async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserDocument;
        return firestoreUserToUser({ ...data, id: userSnap.id });
      }

      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  /**
   * Create a new user in Firestore
   */
  createUser: async (userId: string, userData: {
    name: string;
    email: string;
    role?: 'Super Admin' | 'Admin' | 'Editor' | 'Moderador';
    avatar?: string;
  }): Promise<User> => {
    try {
      const userRef = doc(db, 'users', userId);

      const userDoc: Omit<UserDocument, 'id'> = {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Admin',
        avatar: userData.avatar || '',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastLogin: serverTimestamp() as Timestamp
      };

      await setDoc(userRef, userDoc);

      return {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Admin',
        avatar: userData.avatar,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error al crear usuario en Firestore');
    }
  },

  /**
   * Update user data in Firestore
   */
  updateUser: async (userId: string, updates: Partial<Omit<UserDocument, 'id' | 'email' | 'createdAt'>>): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Error al actualizar usuario en Firestore');
    }
  },

  /**
   * Update last login timestamp
   */
  updateLastLogin: async (userId: string): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data() as UserDocument;
        return firestoreUserToUser({ ...data, id: doc.id });
      }

      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  /**
   * Check if user exists in Firestore
   */
  userExists: async (userId: string): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }
};

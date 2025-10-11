// Admin Service - Manages admin users in Firestore
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
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../utils/auth';

// Admin-specific document structure
export interface AdminDocument {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor';
  avatar?: string;
  phone?: string;
  permissions?: AdminPermissions;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  lastLogin?: Timestamp | Date;
  status: 'active' | 'inactive';
}

export interface AdminPermissions {
  canEditPlayers: boolean;
  canEditMatches: boolean;
  canEditVoting: boolean;
  canEditNews: boolean;
  canManageUsers: boolean;
  canDeleteContent: boolean;
}

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<string, AdminPermissions> = {
  'Super Admin': {
    canEditPlayers: true,
    canEditMatches: true,
    canEditVoting: true,
    canEditNews: true,
    canManageUsers: true,
    canDeleteContent: true
  },
  'Admin': {
    canEditPlayers: true,
    canEditMatches: true,
    canEditVoting: true,
    canEditNews: true,
    canManageUsers: false,
    canDeleteContent: false
  },
  'Editor': {
    canEditPlayers: false,
    canEditMatches: false,
    canEditVoting: false,
    canEditNews: true,
    canManageUsers: false,
    canDeleteContent: false
  }
};

// Convert Firestore document to User object
const firestoreAdminToUser = (doc: AdminDocument): User => {
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

export const adminService = {
  /**
   * Get admin data from Firestore
   */
  getAdmin: async (adminId: string): Promise<User | null> => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        const data = adminSnap.data() as AdminDocument;
        return firestoreAdminToUser({ ...data, id: adminSnap.id });
      }

      return null;
    } catch (error) {
      console.error('Error getting admin:', error);
      return null;
    }
  },

  /**
   * Create a new admin in Firestore
   */
  createAdmin: async (adminId: string, adminData: {
    name: string;
    email: string;
    role: 'Super Admin' | 'Admin' | 'Editor';
    avatar?: string;
    phone?: string;
  }): Promise<User> => {
    try {
      const adminRef = doc(db, 'admins', adminId);

      const permissions = DEFAULT_PERMISSIONS[adminData.role];

      const adminDoc: Omit<AdminDocument, 'id'> = {
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        avatar: adminData.avatar || '',
        phone: adminData.phone || '',
        permissions,
        status: 'active',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastLogin: serverTimestamp() as Timestamp
      };

      await setDoc(adminRef, adminDoc);

      return {
        id: adminId,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        avatar: adminData.avatar,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error('Error al crear administrador en Firestore');
    }
  },

  /**
   * Update admin data in Firestore
   */
  updateAdmin: async (adminId: string, updates: Partial<Omit<AdminDocument, 'id' | 'email' | 'createdAt'>>): Promise<void> => {
    try {
      const adminRef = doc(db, 'admins', adminId);

      await updateDoc(adminRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new Error('Error al actualizar administrador en Firestore');
    }
  },

  /**
   * Update last login timestamp
   */
  updateLastLogin: async (adminId: string): Promise<void> => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  },

  /**
   * Get admin by email
   */
  getAdminByEmail: async (email: string): Promise<User | null> => {
    try {
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data() as AdminDocument;
        return firestoreAdminToUser({ ...data, id: doc.id });
      }

      return null;
    } catch (error) {
      console.error('Error getting admin by email:', error);
      return null;
    }
  },

  /**
   * Check if admin exists in Firestore
   */
  adminExists: async (adminId: string): Promise<boolean> => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      const adminSnap = await getDoc(adminRef);
      return adminSnap.exists();
    } catch (error) {
      console.error('Error checking admin existence:', error);
      return false;
    }
  },

  /**
   * Get all admins (Super Admin only)
   */
  getAllAdmins: async (): Promise<User[]> => {
    try {
      const adminsRef = collection(db, 'admins');
      const querySnapshot = await getDocs(adminsRef);

      return querySnapshot.docs.map(doc => {
        const data = doc.data() as AdminDocument;
        return firestoreAdminToUser({ ...data, id: doc.id });
      });
    } catch (error) {
      console.error('Error getting all admins:', error);
      return [];
    }
  },

  /**
   * Delete admin (Super Admin only)
   */
  deleteAdmin: async (adminId: string): Promise<void> => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await deleteDoc(adminRef);
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw new Error('Error al eliminar administrador');
    }
  },

  /**
   * Get admin permissions
   */
  getAdminPermissions: async (adminId: string): Promise<AdminPermissions | null> => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        const data = adminSnap.data() as AdminDocument;
        return data.permissions || DEFAULT_PERMISSIONS[data.role];
      }

      return null;
    } catch (error) {
      console.error('Error getting admin permissions:', error);
      return null;
    }
  }
};

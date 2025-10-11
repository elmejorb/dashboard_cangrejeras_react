import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { auth as firebaseAuth } from '../config/firebase';
import { User, NotificationPreferences, ActivityLog } from '../utils/auth';
import { adminService } from '../services/adminService';
import { activityLogService } from '../services/activityLogService';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (user: User) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getNotificationPreferences: () => NotificationPreferences;
  updateNotificationPreferences: (prefs: NotificationPreferences) => void;
  getActivityLogs: () => Promise<ActivityLog[]>;
  logActivity: (action: string, type: ActivityLog['type'], description: string, metadata?: Record<string, any>) => Promise<void>;
  clearActivityLogs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Storage keys
const USER_DATA_KEY = 'cangrejeras_user_data';
const ACTIVITY_STORAGE_KEY = 'cangrejeras_activity_logs';
const NOTIFICATIONS_STORAGE_KEY = 'cangrejeras_notification_prefs';

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  email: {
    enabled: true,
    matches: true,
    voting: true,
    news: true,
    players: false,
    standings: false,
  },
  push: {
    enabled: false,
    matches: false,
    voting: false,
    news: false,
    players: false,
    standings: false,
  },
  inApp: {
    enabled: true,
    matches: true,
    voting: true,
    news: true,
    players: true,
    standings: true,
  },
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Get stored user data (fallback)
  const getStoredUserData = (userId: string): User | null => {
    try {
      const stored = localStorage.getItem(`${USER_DATA_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting stored user data:', error);
    }
    return null;
  };

  // Store user data (cache)
  const storeUserData = (user: User) => {
    try {
      localStorage.setItem(`${USER_DATA_KEY}_${user.id}`, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  // Convert Firebase user to app User with Firestore data
  const mapFirebaseUserToUser = async (fbUser: FirebaseUser): Promise<User> => {
    // Try to get data from Firestore admins collection
    const firestoreAdmin = await adminService.getAdmin(fbUser.uid);

    if (firestoreAdmin) {
      // Update last login in Firestore
      adminService.updateLastLogin(fbUser.uid).catch(console.error);
      return firestoreAdmin;
    }

    // If no Firestore data, check localStorage
    const stored = getStoredUserData(fbUser.uid);

    // Return user with available data
    return {
      id: fbUser.uid,
      name: stored?.name || fbUser.displayName || 'Usuario',
      email: fbUser.email || '',
      role: stored?.role || 'Admin',
      avatar: stored?.avatar || fbUser.photoURL || undefined,
      createdAt: stored?.createdAt || new Date().toISOString(),
      notificationPreferences: stored?.notificationPreferences
    };
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const user = await mapFirebaseUserToUser(fbUser);
        storeUserData(user);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = await mapFirebaseUserToUser(userCredential.user);
      storeUserData(user);

      // Log activity
      logActivity('login', 'auth', 'Inicio de sesión exitoso');

      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      if (currentUser) {
        logActivity('logout', 'auth', 'Cerró sesión');
      }
      await signOut(firebaseAuth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Error al cerrar sesión');
    }
  };

  // Signup (for admin dashboard only)
  const signup = async (email: string, password: string, name: string, role: 'Super Admin' | 'Admin' | 'Editor' = 'Admin'): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Create admin document in Firestore
      await adminService.createAdmin(userCredential.user.uid, {
        name,
        email,
        role
      });

      const user = await mapFirebaseUserToUser(userCredential.user);
      storeUserData(user);

      // Log activity
      logActivity('signup', 'auth', 'Cuenta de administrador creada exitosamente');

      return user;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedUser: User): Promise<void> => {
    try {
      if (!firebaseUser) throw new Error('No user logged in');

      // Update Firebase profile if name or avatar changed
      if (updatedUser.name !== firebaseUser.displayName || updatedUser.avatar !== firebaseUser.photoURL) {
        await updateProfile(firebaseUser, {
          displayName: updatedUser.name,
          photoURL: updatedUser.avatar || null
        });
      }

      // Update Firestore admin document
      await adminService.updateAdmin(firebaseUser.uid, {
        name: updatedUser.name,
        role: updatedUser.role as 'Super Admin' | 'Admin' | 'Editor',
        avatar: updatedUser.avatar
      });

      // Store updated data in cache
      storeUserData(updatedUser);
      setCurrentUser(updatedUser);

      // Log activity
      logActivity('update', 'auth', 'Actualizó información de perfil');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error('Error al actualizar perfil');
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (!firebaseUser || !firebaseUser.email) throw new Error('No user logged in');

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await firebaseUpdatePassword(firebaseUser, newPassword);

      // Log activity
      logActivity('update', 'auth', 'Cambió su contraseña');
    } catch (error: any) {
      console.error('Update password error:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña actual incorrecta');
      }
      throw new Error('Error al actualizar contraseña');
    }
  };

  // Get notification preferences
  const getNotificationPreferences = (): NotificationPreferences => {
    if (!currentUser) return DEFAULT_NOTIFICATION_PREFS;

    const prefsStr = localStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${currentUser.id}`);

    if (prefsStr) {
      try {
        return JSON.parse(prefsStr);
      } catch {
        return DEFAULT_NOTIFICATION_PREFS;
      }
    }

    return DEFAULT_NOTIFICATION_PREFS;
  };

  // Update notification preferences
  const updateNotificationPreferences = (preferences: NotificationPreferences): void => {
    if (!currentUser) return;

    localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${currentUser.id}`, JSON.stringify(preferences));
    logActivity('update', 'settings', 'Actualizó preferencias de notificaciones');
  };

  // Get activity logs from Firestore
  const getActivityLogs = async (): Promise<ActivityLog[]> => {
    if (!currentUser) return [];

    try {
      return await activityLogService.getActivityLogs(currentUser.id);
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  };

  // Log activity to Firestore
  const logActivity = async (action: string, type: ActivityLog['type'], description: string, metadata?: Record<string, any>): Promise<void> => {
    if (!currentUser) return;

    try {
      await activityLogService.logActivity(currentUser.id, action, type, description, metadata);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - logging shouldn't break the app
    }
  };

  // Clear activity logs from Firestore
  const clearActivityLogs = async (): Promise<void> => {
    if (!currentUser) return;

    try {
      await activityLogService.clearAllLogs(currentUser.id);
    } catch (error) {
      console.error('Error clearing activity logs:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    login,
    logout,
    signup,
    resetPassword,
    updateUserProfile,
    updatePassword,
    getNotificationPreferences,
    updateNotificationPreferences,
    getActivityLogs,
    logActivity,
    clearActivityLogs
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Helper function to get user-friendly error messages
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Credenciales incorrectas. Por favor verifica tu email y contraseña.';
    case 'auth/email-already-in-use':
      return 'Este email ya está en uso.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Por favor intenta más tarde.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet.';
    default:
      return 'Error al autenticar. Por favor intenta de nuevo.';
  }
}

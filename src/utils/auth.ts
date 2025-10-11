// Authentication types and utilities
// Now using Firebase Authentication - see contexts/AuthContext.tsx for implementation

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Moderador';
  avatar?: string;
  createdAt?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    matches: boolean;
    voting: boolean;
    news: boolean;
    players: boolean;
    standings: boolean;
  };
  push: {
    enabled: boolean;
    matches: boolean;
    voting: boolean;
    news: boolean;
    players: boolean;
    standings: boolean;
  };
  inApp: {
    enabled: boolean;
    matches: boolean;
    voting: boolean;
    news: boolean;
    players: boolean;
    standings: boolean;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  type: 'match' | 'player' | 'voting' | 'news' | 'standings' | 'media' | 'settings' | 'auth';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Legacy demo auth - DEPRECATED: Use AuthContext instead
// Kept for backward compatibility only
const AUTH_STORAGE_KEY = 'cangrejeras_auth_user';
const ACTIVITY_STORAGE_KEY = 'cangrejeras_activity_logs';
const NOTIFICATIONS_STORAGE_KEY = 'cangrejeras_notification_prefs';

// Demo users for testing - create these users in Firebase for testing
// Email: admin@cangrejeras.com - Password: (set in Firebase)
// Email: maria@cangrejeras.com - Password: (set in Firebase)
// Email: carlos@cangrejeras.com - Password: (set in Firebase)

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

// Demo activity logs
const generateDemoActivityLogs = (userId: string): ActivityLog[] => {
  const now = Date.now();
  return [
    {
      id: '1',
      userId,
      action: 'login',
      type: 'auth',
      description: 'Inicio de sesión exitoso',
      timestamp: new Date(now - 10 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      userId,
      action: 'create',
      type: 'match',
      description: 'Creó partido: Cangrejeras vs Pinkin de Corozal',
      metadata: { matchId: 'm1', opponent: 'Pinkin de Corozal' },
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userId,
      action: 'update',
      type: 'player',
      description: 'Actualizó información de Karina Ocasio',
      metadata: { playerId: 'p1', playerName: 'Karina Ocasio' },
      timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      userId,
      action: 'create',
      type: 'voting',
      description: 'Creó votación: MVP del Partido',
      metadata: { pollId: 'v1', pollName: 'MVP del Partido' },
      timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      userId,
      action: 'publish',
      type: 'news',
      description: 'Publicó noticia: Victoria épica en casa',
      metadata: { newsId: 'n1', title: 'Victoria épica en casa' },
      timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      userId,
      action: 'update',
      type: 'standings',
      description: 'Actualizó tabla de posiciones',
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      userId,
      action: 'upload',
      type: 'media',
      description: 'Subió 5 fotos del entrenamiento',
      metadata: { mediaCount: 5, type: 'photos' },
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      userId,
      action: 'update',
      type: 'settings',
      description: 'Actualizó configuración general del dashboard',
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '9',
      userId,
      action: 'delete',
      type: 'news',
      description: 'Eliminó borrador de noticia',
      metadata: { newsId: 'n2' },
      timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '10',
      userId,
      action: 'activate',
      type: 'voting',
      description: 'Activó votación en vivo',
      metadata: { pollId: 'v2' },
      timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Legacy auth object - DEPRECATED: Use useAuth() hook from AuthContext instead
export const auth = {
  // Get current user from localStorage (legacy support)
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated (legacy support)
  isAuthenticated: (): boolean => {
    return auth.getCurrentUser() !== null;
  },

  // Legacy methods - should not be used, use AuthContext instead
  login: (): User | null => {
    console.warn('auth.login is deprecated. Use useAuth() hook from AuthContext');
    return null;
  },

  logout: (): void => {
    console.warn('auth.logout is deprecated. Use useAuth() hook from AuthContext');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  updateUser: (updatedUser: User): void => {
    console.warn('auth.updateUser is deprecated. Use useAuth() hook from AuthContext');
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  },

  updatePassword: (): boolean => {
    console.warn('auth.updatePassword is deprecated. Use useAuth() hook from AuthContext');
    return false;
  },

  // Activity Log Management
  getActivityLogs: (userId: string): ActivityLog[] => {
    const logsStr = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    let logs: ActivityLog[] = [];
    
    if (logsStr) {
      try {
        logs = JSON.parse(logsStr);
      } catch {
        logs = [];
      }
    }
    
    // If no logs, generate demo logs
    if (logs.length === 0) {
      logs = generateDemoActivityLogs(userId);
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(logs));
    }
    
    // Filter by userId and sort by timestamp (newest first)
    return logs
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  logActivity: (userId: string, action: string, type: ActivityLog['type'], description: string, metadata?: Record<string, any>): void => {
    const logsStr = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    let logs: ActivityLog[] = [];
    
    if (logsStr) {
      try {
        logs = JSON.parse(logsStr);
      } catch {
        logs = [];
      }
    }
    
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      type,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100', // Demo IP
    };
    
    logs.unshift(newLog);
    
    // Keep only last 100 logs per user
    const userLogs = logs.filter(log => log.userId === userId).slice(0, 100);
    const otherLogs = logs.filter(log => log.userId !== userId);
    logs = [...userLogs, ...otherLogs];
    
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(logs));
  },

  clearActivityLogs: (userId: string): void => {
    const logsStr = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    let logs: ActivityLog[] = [];
    
    if (logsStr) {
      try {
        logs = JSON.parse(logsStr);
      } catch {
        logs = [];
      }
    }
    
    // Remove logs for this user
    logs = logs.filter(log => log.userId !== userId);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(logs));
  },

  // Notification Preferences Management
  getNotificationPreferences: (userId: string): NotificationPreferences => {
    const prefsStr = localStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
    
    if (prefsStr) {
      try {
        return JSON.parse(prefsStr);
      } catch {
        return DEFAULT_NOTIFICATION_PREFS;
      }
    }
    
    return DEFAULT_NOTIFICATION_PREFS;
  },

  updateNotificationPreferences: (userId: string, preferences: NotificationPreferences): void => {
    localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(preferences));
    
    // Log activity
    auth.logActivity(userId, 'update', 'settings', 'Actualizó preferencias de notificaciones');
  },
};

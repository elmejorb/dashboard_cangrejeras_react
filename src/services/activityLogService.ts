// Activity Log Service - Manages activity logs in Firestore
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  deleteDoc,
  doc,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ActivityLog } from '../utils/auth';

export interface ActivityLogFilter {
  type?: 'match' | 'player' | 'voting' | 'news' | 'standings' | 'media' | 'settings' | 'auth';
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

// Convert Firestore document to ActivityLog
const firestoreToActivityLog = (docId: string, data: any, userId: string): ActivityLog => {
  return {
    id: docId,
    userId,
    action: data.action,
    type: data.type,
    description: data.description,
    metadata: data.metadata || {},
    timestamp: data.timestamp instanceof Timestamp
      ? data.timestamp.toDate().toISOString()
      : new Date(data.timestamp).toISOString(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  };
};

export const activityLogService = {
  /**
   * Log an activity for an admin user
   */
  logActivity: async (
    userId: string,
    action: string,
    type: ActivityLog['type'],
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      // Reference to admin's activity_logs sub-collection
      const logsRef = collection(db, `admins/${userId}/activity_logs`);

      const logData = {
        action,
        type,
        description,
        metadata: metadata || {},
        timestamp: Timestamp.now(),
        ipAddress: '192.168.1.100', // TODO: Get real IP from backend
        userAgent: navigator.userAgent
      };

      await addDoc(logsRef, logData);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - logging shouldn't break the app
    }
  },

  /**
   * Get activity logs for a user with optional filters
   */
  getActivityLogs: async (
    userId: string,
    filters?: ActivityLogFilter
  ): Promise<ActivityLog[]> => {
    try {
      const logsRef = collection(db, `admins/${userId}/activity_logs`);
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters?.action) {
        constraints.push(where('action', '==', filters.action));
      }

      if (filters?.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }

      if (filters?.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      // Order by timestamp (newest first)
      constraints.push(orderBy('timestamp', 'desc'));

      // Apply limit
      const queryLimit = filters?.limit || 50;
      constraints.push(limit(queryLimit));

      const q = query(logsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const logs: ActivityLog[] = [];
      querySnapshot.forEach((doc) => {
        logs.push(firestoreToActivityLog(doc.id, doc.data(), userId));
      });

      return logs;
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  },

  /**
   * Get recent activity logs (last 10)
   */
  getRecentLogs: async (userId: string, limitCount: number = 10): Promise<ActivityLog[]> => {
    return activityLogService.getActivityLogs(userId, { limit: limitCount });
  },

  /**
   * Get logs by type
   */
  getLogsByType: async (
    userId: string,
    type: ActivityLog['type'],
    limitCount: number = 20
  ): Promise<ActivityLog[]> => {
    return activityLogService.getActivityLogs(userId, { type, limit: limitCount });
  },

  /**
   * Get logs by action
   */
  getLogsByAction: async (
    userId: string,
    action: string,
    limitCount: number = 20
  ): Promise<ActivityLog[]> => {
    return activityLogService.getActivityLogs(userId, { action, limit: limitCount });
  },

  /**
   * Get logs by date range
   */
  getLogsByDateRange: async (
    userId: string,
    startDate: Date,
    endDate: Date,
    limitCount: number = 50
  ): Promise<ActivityLog[]> => {
    return activityLogService.getActivityLogs(userId, {
      startDate,
      endDate,
      limit: limitCount
    });
  },

  /**
   * Clear all activity logs for a user
   */
  clearAllLogs: async (userId: string): Promise<void> => {
    try {
      const logsRef = collection(db, `admins/${userId}/activity_logs`);
      const q = query(logsRef);
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing activity logs:', error);
      throw new Error('Error al limpiar el historial');
    }
  },

  /**
   * Clear old logs (older than specified days)
   */
  clearOldLogs: async (userId: string, daysToKeep: number = 30): Promise<void> => {
    try {
      const logsRef = collection(db, `admins/${userId}/activity_logs`);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const q = query(
        logsRef,
        where('timestamp', '<', Timestamp.fromDate(cutoffDate))
      );

      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing old logs:', error);
      throw new Error('Error al limpiar logs antiguos');
    }
  },

  /**
   * Get activity statistics
   */
  getActivityStats: async (userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byAction: Record<string, number>;
  }> => {
    try {
      const logs = await activityLogService.getActivityLogs(userId, { limit: 1000 });

      const stats = {
        total: logs.length,
        byType: {} as Record<string, number>,
        byAction: {} as Record<string, number>
      };

      logs.forEach((log) => {
        // Count by type
        stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

        // Count by action
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting activity stats:', error);
      return { total: 0, byType: {}, byAction: {} };
    }
  },

  /**
   * Export activity logs to JSON
   */
  exportLogs: async (userId: string): Promise<ActivityLog[]> => {
    return activityLogService.getActivityLogs(userId, { limit: 10000 });
  }
};

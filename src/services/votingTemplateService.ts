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
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface VotingTemplate {
  id: string;
  name: string;
  description: string;
  defaultAutoStart: boolean;
  defaultScheduledStart: boolean;
  defaultPlayerIds: number[]; // IDs de jugadoras por defecto
  createdAt: Date;
  updatedAt: Date;
}

export interface VotingTemplateInput {
  name: string;
  description: string;
  defaultAutoStart: boolean;
  defaultScheduledStart: boolean;
  defaultPlayerIds: number[];
}

const COLLECTION_NAME = 'voting_templates';

/**
 * Voting Template Service - Gestiona plantillas de votación en Firestore
 */
export const votingTemplateService = {
  /**
   * Obtiene todas las plantillas de votación
   */
  getAllTemplates: async (): Promise<VotingTemplate[]> => {
    try {
      const templatesRef = collection(db, COLLECTION_NAME);
      const q = query(templatesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        defaultAutoStart: doc.data().defaultAutoStart || false,
        defaultScheduledStart: doc.data().defaultScheduledStart || false,
        defaultPlayerIds: doc.data().defaultPlayerIds || [],
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching voting templates:', error);
      throw error;
    }
  },

  /**
   * Obtiene una plantilla específica
   */
  getTemplate: async (templateId: string): Promise<VotingTemplate | null> => {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return null;
      }

      const data = templateSnap.data();
      return {
        id: templateSnap.id,
        name: data.name,
        description: data.description,
        defaultAutoStart: data.defaultAutoStart || false,
        defaultScheduledStart: data.defaultScheduledStart || false,
        defaultPlayerIds: data.defaultPlayerIds || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error getting voting template:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva plantilla de votación
   */
  createTemplate: async (templateData: VotingTemplateInput): Promise<VotingTemplate> => {
    try {
      const templateDoc = {
        name: templateData.name.trim(),
        description: templateData.description.trim(),
        defaultAutoStart: templateData.defaultAutoStart,
        defaultScheduledStart: templateData.defaultScheduledStart,
        defaultPlayerIds: templateData.defaultPlayerIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), templateDoc);

      return {
        id: docRef.id,
        name: templateDoc.name,
        description: templateDoc.description,
        defaultAutoStart: templateDoc.defaultAutoStart,
        defaultScheduledStart: templateDoc.defaultScheduledStart,
        defaultPlayerIds: templateDoc.defaultPlayerIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating voting template:', error);
      throw error;
    }
  },

  /**
   * Actualiza una plantilla de votación
   */
  updateTemplate: async (
    templateId: string,
    templateData: Partial<VotingTemplateInput>
  ): Promise<void> => {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);

      // Limpiar valores undefined
      const cleanData: any = {};
      Object.keys(templateData).forEach(key => {
        const value = (templateData as any)[key];
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });

      const updateData: any = {
        ...cleanData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(templateRef, updateData);
    } catch (error) {
      console.error('Error updating voting template:', error);
      throw error;
    }
  },

  /**
   * Elimina una plantilla de votación
   */
  deleteTemplate: async (templateId: string): Promise<void> => {
    try {
      const templateRef = doc(db, COLLECTION_NAME, templateId);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting voting template:', error);
      throw error;
    }
  },

  /**
   * Inicializa plantillas por defecto
   */
  initializeDefaultTemplates: async (activePlayerIds: number[]): Promise<void> => {
    try {
      const existing = await votingTemplateService.getAllTemplates();
      if (existing.length > 0) {
        return; // Ya hay plantillas
      }

      const defaultTemplates: VotingTemplateInput[] = [
        {
          name: 'MVP del Partido',
          description: '¡Vota por la jugadora más valiosa del partido!',
          defaultAutoStart: true,
          defaultScheduledStart: false,
          defaultPlayerIds: activePlayerIds,
        },
        {
          name: 'Mejor Defensiva',
          description: 'Vota por la mejor jugadora defensiva del partido',
          defaultAutoStart: true,
          defaultScheduledStart: false,
          defaultPlayerIds: activePlayerIds,
        },
        {
          name: 'Jugadora Destacada',
          description: 'Vota por la jugadora más destacada',
          defaultAutoStart: false,
          defaultScheduledStart: false,
          defaultPlayerIds: activePlayerIds,
        },
      ];

      for (const template of defaultTemplates) {
        await votingTemplateService.createTemplate(template);
      }

      console.log('Default voting templates initialized');
    } catch (error) {
      console.error('Error initializing default voting templates:', error);
      throw error;
    }
  },
};

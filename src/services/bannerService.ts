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
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Banner promocional de la app
 */
export interface PromoBanner {
  id: string;
  type: 'primary' | 'secondary'; // primary = Banner Alto, secondary = Banner Bajo
  emoji: string;
  title: string;
  description: string;
  image: string; // URL de la imagen
  link: string; // URL de destino
  cta: string; // Call to action (texto del botón)
  bgColor: string; // Color de fondo en formato hexadecimal
  textColor: string; // Color de texto en formato hexadecimal
  isActive: boolean; // Si está visible en la app
  order: number; // Orden de visualización
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enlace rápido de acceso
 */
export interface QuickLink {
  id: string;
  title: string;
  description: string;
  link: string; // URL de destino
  icon: string; // Nombre del icono (ej: 'BarChart3', 'Bell', 'Calendar', etc.)
  iconColor?: string; // Color del icono en formato hexadecimal
  bgColor?: string; // Color de fondo del contenedor (RGBA)
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input para crear/editar banners
 */
export interface BannerInput {
  type: 'primary' | 'secondary';
  emoji: string;
  title: string;
  description: string;
  image: string;
  link: string;
  cta: string;
  bgColor?: string;
  textColor?: string;
  isActive?: boolean;
  order?: number;
}

/**
 * Input para crear/editar enlaces rápidos
 */
export interface QuickLinkInput {
  title: string;
  description: string;
  link: string;
  icon: string;
  iconColor?: string;
  bgColor?: string;
  isActive?: boolean;
  order?: number;
}

const BANNERS_COLLECTION = 'promotional_banners';
const QUICK_LINKS_COLLECTION = 'quick_links';

/**
 * Banner Service - Gestiona banners promocionales y enlaces rápidos
 */
export const bannerService = {
  // ==================== BANNERS PROMOCIONALES ====================

  /**
   * Obtiene todos los banners ordenados por orden
   */
  getAllBanners: async (): Promise<PromoBanner[]> => {
    try {
      const bannersRef = collection(db, BANNERS_COLLECTION);
      const q = query(bannersRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        type: doc.data().type,
        emoji: doc.data().emoji,
        title: doc.data().title,
        description: doc.data().description,
        image: doc.data().image,
        link: doc.data().link,
        cta: doc.data().cta,
        bgColor: doc.data().bgColor || '#0C2340',
        textColor: doc.data().textColor || '#FFFFFF',
        isActive: doc.data().isActive ?? true,
        order: doc.data().order || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  /**
   * Obtiene solo los banners activos ordenados por orden
   */
  getActiveBanners: async (): Promise<PromoBanner[]> => {
    try {
      const bannersRef = collection(db, BANNERS_COLLECTION);
      const q = query(
        bannersRef,
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        type: doc.data().type,
        emoji: doc.data().emoji,
        title: doc.data().title,
        description: doc.data().description,
        image: doc.data().image,
        link: doc.data().link,
        cta: doc.data().cta,
        bgColor: doc.data().bgColor || '#0C2340',
        textColor: doc.data().textColor || '#FFFFFF',
        isActive: doc.data().isActive ?? true,
        order: doc.data().order || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching active banners:', error);
      throw error;
    }
  },

  /**
   * Obtiene banners por tipo (primary o secondary)
   */
  getBannersByType: async (type: 'primary' | 'secondary'): Promise<PromoBanner[]> => {
    try {
      const bannersRef = collection(db, BANNERS_COLLECTION);
      const q = query(
        bannersRef,
        where('type', '==', type),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        type: doc.data().type,
        emoji: doc.data().emoji,
        title: doc.data().title,
        description: doc.data().description,
        image: doc.data().image,
        link: doc.data().link,
        cta: doc.data().cta,
        bgColor: doc.data().bgColor || '#0C2340',
        textColor: doc.data().textColor || '#FFFFFF',
        isActive: doc.data().isActive ?? true,
        order: doc.data().order || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching banners by type:', error);
      throw error;
    }
  },

  /**
   * Obtiene un banner por ID
   */
  getBannerById: async (id: string): Promise<PromoBanner | null> => {
    try {
      const bannerDoc = await getDoc(doc(db, BANNERS_COLLECTION, id));

      if (!bannerDoc.exists()) {
        return null;
      }

      const data = bannerDoc.data();
      return {
        id: bannerDoc.id,
        type: data.type,
        emoji: data.emoji,
        title: data.title,
        description: data.description,
        image: data.image,
        link: data.link,
        cta: data.cta,
        bgColor: data.bgColor || '#0C2340',
        textColor: data.textColor || '#FFFFFF',
        isActive: data.isActive ?? true,
        order: data.order || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo banner
   */
  createBanner: async (bannerData: BannerInput): Promise<PromoBanner> => {
    try {
      // Obtener el siguiente número de orden
      const allBanners = await bannerService.getAllBanners();
      const maxOrder = allBanners.length > 0
        ? Math.max(...allBanners.map(b => b.order))
        : 0;

      const bannerDoc = {
        type: bannerData.type,
        emoji: bannerData.emoji,
        title: bannerData.title.trim(),
        description: bannerData.description.trim(),
        image: bannerData.image.trim(),
        link: bannerData.link.trim(),
        cta: bannerData.cta.trim(),
        bgColor: bannerData.bgColor || '#0C2340',
        textColor: bannerData.textColor || '#FFFFFF',
        isActive: bannerData.isActive ?? true,
        order: bannerData.order ?? maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, BANNERS_COLLECTION), bannerDoc);
      const newDoc = await getDoc(docRef);
      const data = newDoc.data()!;

      return {
        id: docRef.id,
        type: data.type,
        emoji: data.emoji,
        title: data.title,
        description: data.description,
        image: data.image,
        link: data.link,
        cta: data.cta,
        bgColor: data.bgColor,
        textColor: data.textColor,
        isActive: data.isActive,
        order: data.order,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  /**
   * Actualiza un banner existente
   */
  updateBanner: async (id: string, bannerData: Partial<BannerInput>): Promise<void> => {
    try {
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (bannerData.type !== undefined) updateData.type = bannerData.type;
      if (bannerData.emoji !== undefined) updateData.emoji = bannerData.emoji;
      if (bannerData.title !== undefined) updateData.title = bannerData.title.trim();
      if (bannerData.description !== undefined) updateData.description = bannerData.description.trim();
      if (bannerData.image !== undefined) updateData.image = bannerData.image.trim();
      if (bannerData.link !== undefined) updateData.link = bannerData.link.trim();
      if (bannerData.cta !== undefined) updateData.cta = bannerData.cta.trim();
      if (bannerData.bgColor !== undefined) updateData.bgColor = bannerData.bgColor;
      if (bannerData.textColor !== undefined) updateData.textColor = bannerData.textColor;
      if (bannerData.isActive !== undefined) updateData.isActive = bannerData.isActive;
      if (bannerData.order !== undefined) updateData.order = bannerData.order;

      await updateDoc(doc(db, BANNERS_COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  /**
   * Activa/Desactiva un banner
   */
  toggleBannerActive: async (id: string, isActive: boolean): Promise<void> => {
    try {
      await updateDoc(doc(db, BANNERS_COLLECTION, id), {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling banner:', error);
      throw error;
    }
  },

  /**
   * Elimina un banner
   */
  deleteBanner: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, BANNERS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },

  /**
   * Reordena los banners
   */
  reorderBanners: async (bannerIds: string[]): Promise<void> => {
    try {
      const batch = writeBatch(db);

      bannerIds.forEach((id, index) => {
        const bannerRef = doc(db, BANNERS_COLLECTION, id);
        batch.update(bannerRef, {
          order: index,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering banners:', error);
      throw error;
    }
  },

  // ==================== ENLACES RÁPIDOS ====================

  /**
   * Obtiene todos los enlaces rápidos ordenados por orden
   */
  getAllQuickLinks: async (): Promise<QuickLink[]> => {
    try {
      const linksRef = collection(db, QUICK_LINKS_COLLECTION);
      const q = query(linksRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        link: doc.data().link,
        icon: doc.data().icon,
        iconColor: doc.data().iconColor || '#8B5CF6',
        bgColor: doc.data().bgColor || 'rgba(139, 92, 246, 0.1)',
        isActive: doc.data().isActive ?? true,
        order: doc.data().order || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching quick links:', error);
      throw error;
    }
  },

  /**
   * Obtiene solo los enlaces rápidos activos
   */
  getActiveQuickLinks: async (): Promise<QuickLink[]> => {
    try {
      const linksRef = collection(db, QUICK_LINKS_COLLECTION);
      const q = query(
        linksRef,
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        link: doc.data().link,
        icon: doc.data().icon,
        iconColor: doc.data().iconColor || '#8B5CF6',
        bgColor: doc.data().bgColor || 'rgba(139, 92, 246, 0.1)',
        isActive: doc.data().isActive ?? true,
        order: doc.data().order || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching active quick links:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo enlace rápido
   */
  createQuickLink: async (linkData: QuickLinkInput): Promise<QuickLink> => {
    try {
      // Obtener el siguiente número de orden
      const allLinks = await bannerService.getAllQuickLinks();
      const maxOrder = allLinks.length > 0
        ? Math.max(...allLinks.map(l => l.order))
        : 0;

      const linkDoc = {
        title: linkData.title.trim(),
        description: linkData.description.trim(),
        link: linkData.link.trim(),
        icon: linkData.icon,
        iconColor: linkData.iconColor || '#8B5CF6',
        bgColor: linkData.bgColor || 'rgba(139, 92, 246, 0.1)',
        isActive: linkData.isActive ?? true,
        order: linkData.order ?? maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, QUICK_LINKS_COLLECTION), linkDoc);
      const newDoc = await getDoc(docRef);
      const data = newDoc.data()!;

      return {
        id: docRef.id,
        title: data.title,
        description: data.description,
        link: data.link,
        icon: data.icon,
        iconColor: data.iconColor,
        bgColor: data.bgColor,
        isActive: data.isActive,
        order: data.order,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error creating quick link:', error);
      throw error;
    }
  },

  /**
   * Actualiza un enlace rápido existente
   */
  updateQuickLink: async (id: string, linkData: Partial<QuickLinkInput>): Promise<void> => {
    try {
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (linkData.title !== undefined) updateData.title = linkData.title.trim();
      if (linkData.description !== undefined) updateData.description = linkData.description.trim();
      if (linkData.link !== undefined) updateData.link = linkData.link.trim();
      if (linkData.icon !== undefined) updateData.icon = linkData.icon;
      if (linkData.iconColor !== undefined) updateData.iconColor = linkData.iconColor;
      if (linkData.bgColor !== undefined) updateData.bgColor = linkData.bgColor;
      if (linkData.isActive !== undefined) updateData.isActive = linkData.isActive;
      if (linkData.order !== undefined) updateData.order = linkData.order;

      await updateDoc(doc(db, QUICK_LINKS_COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error updating quick link:', error);
      throw error;
    }
  },

  /**
   * Activa/Desactiva un enlace rápido
   */
  toggleQuickLinkActive: async (id: string, isActive: boolean): Promise<void> => {
    try {
      await updateDoc(doc(db, QUICK_LINKS_COLLECTION, id), {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling quick link:', error);
      throw error;
    }
  },

  /**
   * Elimina un enlace rápido
   */
  deleteQuickLink: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, QUICK_LINKS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting quick link:', error);
      throw error;
    }
  },

  /**
   * Reordena los enlaces rápidos
   */
  reorderQuickLinks: async (linkIds: string[]): Promise<void> => {
    try {
      const batch = writeBatch(db);

      linkIds.forEach((id, index) => {
        const linkRef = doc(db, QUICK_LINKS_COLLECTION, id);
        batch.update(linkRef, {
          order: index,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering quick links:', error);
      throw error;
    }
  },
};

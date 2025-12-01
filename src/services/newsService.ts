// News Service - Manages news articles in Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'General' | 'Comunicados' | 'Eventos';
  status: 'published' | 'draft';
  publishDate: Date;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
}

export interface ArticleInput {
  title: string;
  excerpt: string;
  content: string;
  category: 'General' | 'Comunicados' | 'Eventos';
  status: 'published' | 'draft';
  publishDate: string; // YYYY-MM-DD format from form
  imageUrl?: string;
  authorId: string;
  authorName: string;
}

const COLLECTION_NAME = 'news';

export const newsService = {
  /**
   * Get all articles
   */
  getAllArticles: async (): Promise<Article[]> => {
    try {
      const articlesRef = collection(db, COLLECTION_NAME);
      const q = query(articlesRef, orderBy('publishDate', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category || 'General',
          status: data.status,
          publishDate: data.publishDate instanceof Timestamp
            ? data.publishDate.toDate()
            : new Date(data.publishDate),
          imageUrl: data.imageUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
          views: data.views || 0
        };
      });
    } catch (error) {
      console.error('Error getting articles:', error);
      throw new Error('Error al obtener artículos');
    }
  },

  /**
   * Get published articles only (for public app)
   */
  getPublishedArticles: async (): Promise<Article[]> => {
    try {
      const articlesRef = collection(db, COLLECTION_NAME);
      const q = query(
        articlesRef,
        where('status', '==', 'published'),
        orderBy('publishDate', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category || 'General',
          status: data.status,
          publishDate: data.publishDate instanceof Timestamp
            ? data.publishDate.toDate()
            : new Date(data.publishDate),
          imageUrl: data.imageUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
          views: data.views || 0
        };
      });
    } catch (error) {
      console.error('Error getting published articles:', error);
      throw new Error('Error al obtener artículos publicados');
    }
  },

  /**
   * Get a single article by ID
   */
  getArticleById: async (articleId: string): Promise<Article | null> => {
    try {
      const articleRef = doc(db, COLLECTION_NAME, articleId);
      const articleSnap = await getDoc(articleRef);

      if (!articleSnap.exists()) {
        return null;
      }

      const data = articleSnap.data();
      return {
        id: articleSnap.id,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category || 'General',
        status: data.status,
        publishDate: data.publishDate instanceof Timestamp
          ? data.publishDate.toDate()
          : new Date(data.publishDate),
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt),
        views: data.views || 0
      };
    } catch (error) {
      console.error('Error getting article:', error);
      throw new Error('Error al obtener artículo');
    }
  },

  /**
   * Create a new article
   */
  createArticle: async (articleData: ArticleInput): Promise<Article> => {
    try {
      // Parse publish date
      const [year, month, day] = articleData.publishDate.split('-').map(Number);
      const publishDate = new Date(year, month - 1, day, 12, 0, 0);

      const articleDoc = {
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        category: articleData.category,
        status: articleData.status,
        publishDate: Timestamp.fromDate(publishDate),
        imageUrl: articleData.imageUrl || '',
        authorId: articleData.authorId,
        authorName: articleData.authorName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0
      };

      const articlesRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(articlesRef, articleDoc);

      return {
        id: docRef.id,
        title: articleData.title,
        excerpt: articleData.excerpt,
        content: articleData.content,
        category: articleData.category,
        status: articleData.status,
        publishDate: publishDate,
        imageUrl: articleData.imageUrl,
        authorId: articleData.authorId,
        authorName: articleData.authorName,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0
      };
    } catch (error) {
      console.error('Error creating article:', error);
      throw new Error('Error al crear artículo');
    }
  },

  /**
   * Update an existing article
   */
  updateArticle: async (articleId: string, articleData: Partial<ArticleInput>): Promise<void> => {
    try {
      const articleRef = doc(db, COLLECTION_NAME, articleId);

      const updateData: Record<string, any> = {
        ...articleData,
        updatedAt: serverTimestamp()
      };

      // Convert publishDate string to Timestamp if provided
      if (articleData.publishDate) {
        const [year, month, day] = articleData.publishDate.split('-').map(Number);
        const publishDate = new Date(year, month - 1, day, 12, 0, 0);
        updateData.publishDate = Timestamp.fromDate(publishDate);
      }

      await updateDoc(articleRef, updateData);
    } catch (error) {
      console.error('Error updating article:', error);
      throw new Error('Error al actualizar artículo');
    }
  },

  /**
   * Delete an article
   */
  deleteArticle: async (articleId: string): Promise<void> => {
    try {
      const articleRef = doc(db, COLLECTION_NAME, articleId);
      await deleteDoc(articleRef);
    } catch (error) {
      console.error('Error deleting article:', error);
      throw new Error('Error al eliminar artículo');
    }
  },

  /**
   * Publish a draft article
   */
  publishArticle: async (articleId: string): Promise<void> => {
    try {
      const articleRef = doc(db, COLLECTION_NAME, articleId);
      await updateDoc(articleRef, {
        status: 'published',
        publishDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error publishing article:', error);
      throw new Error('Error al publicar artículo');
    }
  },

  /**
   * Unpublish an article (set to draft)
   */
  unpublishArticle: async (articleId: string): Promise<void> => {
    try {
      const articleRef = doc(db, COLLECTION_NAME, articleId);
      await updateDoc(articleRef, {
        status: 'draft',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error unpublishing article:', error);
      throw new Error('Error al despublicar artículo');
    }
  },

  /**
   * Increment view count
   */
  incrementViews: async (articleId: string): Promise<void> => {
    try {
      const articleRef = doc(db, COLLECTION_NAME, articleId);
      const articleSnap = await getDoc(articleRef);

      if (articleSnap.exists()) {
        const currentViews = articleSnap.data().views || 0;
        await updateDoc(articleRef, {
          views: currentViews + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw - this is not critical
    }
  },

  /**
   * Get articles by category
   */
  getArticlesByCategory: async (category: string): Promise<Article[]> => {
    try {
      const articlesRef = collection(db, COLLECTION_NAME);
      const q = query(
        articlesRef,
        where('category', '==', category),
        where('status', '==', 'published'),
        orderBy('publishDate', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category || 'General',
          status: data.status,
          publishDate: data.publishDate instanceof Timestamp
            ? data.publishDate.toDate()
            : new Date(data.publishDate),
          imageUrl: data.imageUrl,
          authorId: data.authorId,
          authorName: data.authorName,
          createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
          views: data.views || 0
        };
      });
    } catch (error) {
      console.error('Error getting articles by category:', error);
      throw new Error('Error al obtener artículos por categoría');
    }
  }
};

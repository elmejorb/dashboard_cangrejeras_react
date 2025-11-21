// Firebase Storage Service
// Manages file uploads to Firebase Storage

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export const storageService = {
  /**
   * Upload admin avatar to Storage
   * Path: /media/{adminId}/avatar.{ext}
   */
  uploadAdminAvatar: async (
    adminId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // Get file extension
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar.${extension}`;

      // Create storage reference
      const storageRef = ref(storage, `media/${adminId}/${fileName}`);

      // Upload with progress tracking
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error('Error al subir la imagen'));
            },
            async () => {
              // Upload completed
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        // Simple upload without progress
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  /**
   * Upload player photo to Storage
   * Path: /players/{playerId}/photo.{ext}
   */
  uploadPlayerPhoto: async (
    playerId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 10MB');
      }

      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `photo.${extension}`;
      const storageRef = ref(storage, `players/${playerId}/${fileName}`);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error('Error al subir la imagen'));
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error: any) {
      console.error('Error uploading player photo:', error);
      throw error;
    }
  },

  /**
   * Upload news cover image to Storage
   * Path: /news/{newsId}/cover.{ext}
   */
  uploadNewsCover: async (
    newsId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 10MB');
      }

      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `cover.${extension}`;
      const storageRef = ref(storage, `news/${newsId}/${fileName}`);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error('Error al subir la imagen'));
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error: any) {
      console.error('Error uploading news cover:', error);
      throw error;
    }
  },

  /**
   * Upload sponsor logo to Storage
   * Path: /sponsors/{sponsorId}/logo.{ext}
   */
  uploadSponsorLogo: async (
    sponsorId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      const extension = file.name.split('.').pop() || 'png';
      const fileName = `logo.${extension}`;
      const storageRef = ref(storage, `sponsors/${sponsorId}/${fileName}`);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error('Error al subir el logo'));
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error: any) {
      console.error('Error uploading sponsor logo:', error);
      throw error;
    }
  },

  /**
   * Upload team logo to Storage
   * Path: /teams/{teamId}/logo.{ext}
   */
  uploadTeamLogo: async (
    teamId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      const extension = file.name.split('.').pop() || 'png';
      const fileName = `logo.${extension}`;
      const storageRef = ref(storage, `teams/${teamId}/${fileName}`);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error('Error al subir el logo'));
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error: any) {
      console.error('Error uploading team logo:', error);
      throw error;
    }
  },

  /**
   * Delete file from Storage
   */
  deleteFile: async (fileURL: string): Promise<void> => {
    try {
      // Extract path from URL
      const url = new URL(fileURL);
      const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);

      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw new Error('Error al eliminar archivo');
    }
  },

  /**
   * Get file URL from path
   */
  getFileURL: async (path: string): Promise<string> => {
    try {
      const fileRef = ref(storage, path);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Error getting file URL:', error);
      throw new Error('Error al obtener URL del archivo');
    }
  },

  /**
   * Upload general media file to Storage
   * Path: /{folder}/{timestamp}_{fileName}
   */
  uploadMediaFile: async (
    file: File,
    folder: 'media' | 'news' | 'players' | 'sponsors' | 'teams',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{url: string; path: string; name: string}> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 10MB');
      }

      // Create unique filename
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${cleanName}`;
      const path = `${folder}/${fileName}`;

      const storageRef = ref(storage, path);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error('Error al subir la imagen'));
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                url: downloadURL,
                path,
                name: fileName
              });
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return {
          url: downloadURL,
          path,
          name: fileName
        };
      }
    } catch (error: any) {
      console.error('Error uploading media file:', error);
      throw error;
    }
  },

  /**
   * List all files in a folder
   */
  listFiles: async (folder: string): Promise<Array<{name: string; url: string; path: string}>> => {
    try {
      const { listAll } = await import('firebase/storage');
      const folderRef = ref(storage, folder);
      const result = await listAll(folderRef);

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url,
            path: itemRef.fullPath
          };
        })
      );

      return files;
    } catch (error: any) {
      console.error('Error listing files:', error);
      return [];
    }
  },

  /**
   * Delete file by path
   */
  deleteFileByPath: async (path: string): Promise<void> => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw new Error('Error al eliminar archivo');
    }
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
};

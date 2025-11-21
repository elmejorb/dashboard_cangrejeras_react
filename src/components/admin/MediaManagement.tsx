import { useState, useEffect, useRef } from "react";
import { Upload, Image as ImageIcon, Trash2, FolderOpen, Copy, Award, Camera, ImagePlus, PartyPopper } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner@2.0.3";
import { storageService, UploadProgress } from "../../services/storageService";
import { useAuth } from "../../contexts/AuthContext";
import { activityLogService } from "../../services/activityLogService";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size?: number;
  folder: string;
  uploadDate?: string;
}

interface MediaManagementProps {
  darkMode: boolean;
}

export function MediaManagement({ darkMode }: MediaManagementProps) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<'all' | 'media' | 'news' | 'players' | 'sponsors' | 'teams'>('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load all media files on mount
  useEffect(() => {
    loadAllMediaFiles();
  }, []);

  const loadAllMediaFiles = async () => {
    setLoading(true);
    try {
      const folders: Array<'media' | 'news' | 'players' | 'sponsors' | 'teams'> = ['media', 'news', 'players', 'sponsors', 'teams'];
      const allFiles: MediaFile[] = [];

      for (const folder of folders) {
        const files = await storageService.listFiles(folder);
        allFiles.push(...files.map(f => ({ ...f, folder })));
      }

      setMediaFiles(allFiles);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast.error('Error al cargar archivos multimedia');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para subir archivos');
      return;
    }

    // Validate folder selection
    if (selectedFolder === 'all') {
      toast.error('Selecciona una carpeta específica para subir el archivo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await storageService.uploadMediaFile(
        file,
        selectedFolder,
        (progress: UploadProgress) => {
          setUploadProgress(progress.progress);
        }
      );

      // Add to list
      setMediaFiles([
        ...mediaFiles,
        {
          name: result.name,
          path: result.path,
          url: result.url,
          folder: selectedFolder
        }
      ]);

      // Log activity
      await activityLogService.logActivity(
        currentUser.id,
        'upload',
        'media',
        `Subió archivo ${file.name} a carpeta ${selectedFolder}`,
        { fileName: file.name, folder: selectedFolder, path: result.path }
      );

      toast.success('Archivo subido exitosamente');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para eliminar archivos');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await storageService.deleteFileByPath(file.path);

      // Remove from list
      setMediaFiles(mediaFiles.filter(f => f.path !== file.path));

      // Log activity
      await activityLogService.logActivity(
        currentUser.id,
        'delete',
        'media',
        `Eliminó archivo ${file.name} de carpeta ${file.folder}`,
        { fileName: file.name, folder: file.folder }
      );

      toast.success('Archivo eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error al eliminar archivo');
    }
  };

  const handleCopyURL = async (url: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`URL de ${fileName} copiada al portapapeles`);
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Error al copiar URL');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const filteredFiles = selectedFolder === 'all'
    ? mediaFiles
    : mediaFiles.filter(f => f.folder === selectedFolder);

  const getFolderColor = (folder: string) => {
    switch (folder) {
      case 'media':
        return { bg: 'bg-[#0C2340]/10', text: 'text-[#0C2340]' };
      case 'news':
        return { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' };
      case 'players':
        return { bg: 'bg-[#C8A963]/10', text: 'text-[#C8A963]' };
      case 'sponsors':
        return { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' };
      case 'teams':
        return { bg: 'bg-[#E01E37]/10', text: 'text-[#E01E37]' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-500' };
    }
  };

  const getFolderLabel = (folder: string) => {
    switch (folder) {
      case 'media':
        return 'Media';
      case 'news':
        return 'Noticias';
      case 'players':
        return 'Jugadoras';
      case 'sponsors':
        return 'Patrocinadores';
      case 'teams':
        return 'Equipos';
      default:
        return folder;
    }
  };

  const getTotalSize = () => {
    const totalBytes = mediaFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    return storageService.formatFileSize(totalBytes);
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Contenido Multimedia
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Administra logos, imágenes y banners
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || selectedFolder === 'all'}
          className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white disabled:opacity-50"
        >
          <Upload size={18} className="mr-2" />
          {uploading ? `Subiendo... ${Math.round(uploadProgress)}%` : 'Subir Archivo'}
        </Button>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          darkMode
            ? 'bg-[#1E293B]/30 border-white/20 hover:bg-[#1E293B]/50'
            : 'bg-gray-50/50 border-gray-300 hover:bg-gray-100/50'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
            <Upload size={32} className={darkMode ? 'text-white/60' : 'text-gray-600'} />
          </div>
          <div>
            <div className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {uploading
                ? `Subiendo... ${Math.round(uploadProgress)}%`
                : 'Arrastra archivos aquí o haz clic para subir'
              }
            </div>
            <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              {selectedFolder === 'all'
                ? 'Selecciona una carpeta específica primero'
                : `PNG, JPG, GIF hasta 10MB → Carpeta: ${getFolderLabel(selectedFolder)}`
              }
            </div>
          </div>
          {uploading && (
            <div className="w-full max-w-xs">
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-[#0C2340] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'media', label: 'Media' },
          { id: 'news', label: 'Noticias' },
          { id: 'players', label: 'Jugadoras' },
          { id: 'sponsors', label: 'Patrocinadores' },
          { id: 'teams', label: 'Equipos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFolder(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedFolder === tab.id
                ? darkMode
                  ? 'bg-[#0C2340] text-white'
                  : 'bg-[#0C2340] text-white'
                : darkMode
                ? 'bg-white/5 text-white/70 hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className="ml-2 opacity-60">
                ({mediaFiles.filter(f => f.folder === tab.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`text-center ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            <Upload size={48} className="mx-auto mb-3 animate-pulse" />
            <p>Cargando archivos...</p>
          </div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className={`text-center ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
            <p>No hay archivos en esta carpeta</p>
            <p className="text-sm mt-2">
              {selectedFolder === 'all'
                ? 'Sube archivos para comenzar'
                : `Sube archivos a la carpeta ${getFolderLabel(selectedFolder)}`
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file, index) => {
            const folderColors = getFolderColor(file.folder);
            return (
              <div
                key={file.path}
                className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  darkMode
                    ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                    : 'bg-white/80 border-gray-200 backdrop-blur-xl'
                }`}
              >
                {/* Image Preview */}
                <div className={`aspect-square flex items-center justify-center overflow-hidden ${
                  darkMode ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* File Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {file.name}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        {file.size ? storageService.formatFileSize(file.size) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className={`text-xs px-2 py-1 rounded inline-block mb-3 ${folderColors.bg} ${folderColors.text}`}>
                    {getFolderLabel(file.folder)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyURL(file.url, file.name)}
                      className={`flex-1 ${darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}`}
                    >
                      <Copy size={14} className="mr-1" />
                      Copiar URL
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      className="text-[#E01E37] hover:text-[#E01E37] hover:bg-[#E01E37]/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          className={`rounded-xl border p-4 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3B82F6]/10">
              <FolderOpen size={20} className="text-[#3B82F6]" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {mediaFiles.length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Total Archivos
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0C2340]/10">
              <ImageIcon size={20} style={{ color: '#0C2340' }} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {mediaFiles.filter(f => f.folder === 'media').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Media
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#10B981]/10">
              <ImageIcon size={20} className="text-[#10B981]" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {mediaFiles.filter(f => f.folder === 'news').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Noticias
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#C8A963]/10">
              <ImageIcon size={20} className="text-[#C8A963]" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {mediaFiles.filter(f => f.folder === 'players').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Jugadoras
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E01E37]/10">
              <ImageIcon size={20} className="text-[#E01E37]" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {getTotalSize()}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Total Storage
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

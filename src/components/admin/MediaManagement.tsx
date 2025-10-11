import { useState } from "react";
import { Upload, Image as ImageIcon, Trash2, FolderOpen, Download, Award, Camera, ImagePlus, PartyPopper } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner@2.0.3";

interface MediaFile {
  id: number;
  name: string;
  type: 'image' | 'logo' | 'banner';
  size: string;
  uploadDate: string;
  url: string;
  usedIn: string[];
}

interface MediaManagementProps {
  darkMode: boolean;
}

export function MediaManagement({ darkMode }: MediaManagementProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: 1,
      name: 'cangrejeras-logo.png',
      type: 'logo',
      size: '245 KB',
      uploadDate: '2025-10-01',
      url: 'logo',
      usedIn: ['Header', 'About Page'],
    },
    {
      id: 2,
      name: 'andrea-rangel-action.jpg',
      type: 'image',
      size: '1.2 MB',
      uploadDate: '2025-10-05',
      url: 'camera',
      usedIn: ['News Article', 'Player Profile'],
    },
    {
      id: 3,
      name: 'match-banner-october.jpg',
      type: 'banner',
      size: '850 KB',
      uploadDate: '2025-10-07',
      url: 'image',
      usedIn: ['Homepage Banner'],
    },
    {
      id: 4,
      name: 'team-celebration.jpg',
      type: 'image',
      size: '2.1 MB',
      uploadDate: '2025-10-06',
      url: 'party',
      usedIn: ['News Article'],
    },
  ]);

  const [selectedType, setSelectedType] = useState<string>('all');

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este archivo?')) {
      setMediaFiles(mediaFiles.filter(f => f.id !== id));
      toast.success('Archivo eliminado exitosamente');
    }
  };

  const handleUpload = () => {
    toast.success('Función de carga en desarrollo');
  };

  const filteredFiles = selectedType === 'all' 
    ? mediaFiles 
    : mediaFiles.filter(f => f.type === selectedType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'logo':
        return { bg: 'bg-[#0C2340]/10', text: 'text-[#0C2340]' };
      case 'banner':
        return { bg: 'bg-[#E01E37]/10', text: 'text-[#E01E37]' };
      case 'image':
        return { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-500' };
    }
  };

  const getMediaIcon = (url: string) => {
    const iconProps = { size: 48, strokeWidth: 1.5 };
    switch (url) {
      case 'logo':
        return <Award {...iconProps} className="text-[#C8A963]" />;
      case 'camera':
        return <Camera {...iconProps} className="text-[#10B981]" />;
      case 'image':
        return <ImagePlus {...iconProps} className="text-[#E01E37]" />;
      case 'party':
        return <PartyPopper {...iconProps} className="text-[#8B5CF6]" />;
      default:
        return <ImageIcon {...iconProps} className="text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'logo':
        return 'Logo';
      case 'banner':
        return 'Banner';
      case 'image':
        return 'Imagen';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
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
          onClick={handleUpload}
          className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
        >
          <Upload size={18} className="mr-2" />
          Subir Archivo
        </Button>
      </div>

      {/* Upload Zone */}
      <div
        onClick={handleUpload}
        className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
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
              Arrastra archivos aquí o haz clic para subir
            </div>
            <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              PNG, JPG, GIF hasta 10MB
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'logo', label: 'Logos' },
          { id: 'banner', label: 'Banners' },
          { id: 'image', label: 'Imágenes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedType === tab.id
                ? darkMode
                  ? 'bg-[#0C2340] text-white'
                  : 'bg-[#0C2340] text-white'
                : darkMode
                ? 'bg-white/5 text-white/70 hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFiles.map((file) => {
          const typeColors = getTypeColor(file.type);
          return (
            <div
              key={file.id}
              className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                darkMode
                  ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
                  : 'bg-white/80 border-gray-200 backdrop-blur-xl'
              }`}
            >
              {/* Image Preview */}
              <div className={`aspect-square flex items-center justify-center ${
                darkMode ? 'bg-white/5' : 'bg-gray-100'
              }`}>
                {getMediaIcon(file.url)}
              </div>

              {/* File Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {file.name}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      {file.size} • {file.uploadDate}
                    </div>
                  </div>
                </div>

                <div className={`text-xs px-2 py-1 rounded inline-block mb-3 ${typeColors.bg} ${typeColors.text}`}>
                  {getTypeLabel(file.type)}
                </div>

                {/* Used In */}
                {file.usedIn.length > 0 && (
                  <div className="mb-3">
                    <div className={`text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      Usado en:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {file.usedIn.map((usage, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-0.5 rounded ${
                            darkMode ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {usage}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}`}
                  >
                    <Download size={14} className="mr-1" />
                    Descargar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                {mediaFiles.filter(f => f.type === 'image').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Imágenes
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
                {mediaFiles.filter(f => f.type === 'banner').length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Banners
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
                4.4 MB
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

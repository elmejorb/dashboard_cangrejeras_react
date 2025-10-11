import { useState, useCallback } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import type { Player } from "./PlayerManagement";

interface PlayerManagementEditProps {
  darkMode: boolean;
  player?: Player;
  onSave: (player: Omit<Player, 'id'>) => void;
  onCancel: () => void;
  availablePositions?: string[];
}

export function PlayerManagementEdit({ darkMode, player, onSave, onCancel, availablePositions }: PlayerManagementEditProps) {
  // Use provided positions or fallback to defaults
  const positions = availablePositions || [
    'Opuesta',
    'Esquina',
    'Central',
    'Líbero',
    'Levantadora',
  ];
  const [formData, setFormData] = useState({
    name: player?.name || '',
    lastName: player?.lastName || '',
    number: player?.number || 0,
    position: player?.position || '',
    height: player?.height || '',
    points: player?.points || 0,
    aces: player?.aces || 0,
    blocks: player?.blocks || 0,
    status: player?.status || 'active' as 'active' | 'inactive',
    photo: player?.photo || '',
    bio: player?.bio || '',
    gamesPlayed: player?.gamesPlayed || 0,
    gamesWon: player?.gamesWon || 0,
    avgPerGame: player?.avgPerGame || 0,
    attacks: player?.attacks || 0,
    effectiveness: player?.effectiveness || 0,
    team: player?.team || 'Cangrejeras de Santurce',
    league: player?.league || 'Liga Superior Femenina',
    season: player?.season || '2025-2026',
  });

  const [photoPreview, setPhotoPreview] = useState(player?.photo || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const processFile = useCallback((file: File) => {
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La foto no puede superar 2MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      handleInputChange('photo', base64String);
      setIsLoading(false);
      toast.success('Foto cargada exitosamente');
    };
    reader.onerror = () => {
      toast.error('Error al cargar la foto');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [handleInputChange]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleRemovePhoto = useCallback(() => {
    setPhotoPreview('');
    handleInputChange('photo', '');
    toast.success('Foto eliminada');
  }, [handleInputChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.lastName) {
      toast.error('El nombre y apellido son requeridos');
      return;
    }

    onSave(formData);
  }, [formData, onSave]);

  const getInitials = (name: string, lastName: string) => {
    const firstInitial = name.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header Sticky */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-[#0F172A]' : 'bg-white'} border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver
              </Button>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {player ? 'Editar Jugadora' : 'Agregar Jugadora'}
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  {player 
                    ? 'Actualiza la información de la jugadora del equipo' 
                    : 'Completa los datos para agregar una nueva jugadora al roster'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className={darkMode ? 'border-white/10 text-white hover:bg-white/5' : ''}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
              >
                {player ? 'Guardar Cambios' : 'Agregar Jugadora'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Foto de Perfil Section */}
          <section className={`p-6 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Foto de Perfil
            </h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Vista Previa */}
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 p-1.5 bg-[#E01E37] text-white rounded-full hover:bg-[#c01a30] transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#0C2340] flex items-center justify-center text-white text-2xl font-bold">
                    {formData.name && formData.lastName ? getInitials(formData.name, formData.lastName) : '?'}
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <div className="space-y-3">
                  <Label className={darkMode ? 'text-white/80' : ''}>
                    Subir Foto
                  </Label>
                  
                  {/* Drag & Drop Zone */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg transition-all duration-300 ${
                      isDragging
                        ? 'border-[#C8A963] bg-[#C8A963]/10 scale-[1.02]'
                        : darkMode
                        ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                        : 'border-gray-300 hover:border-[#0C2340] hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="photo-upload"
                    />
                    
                    <div className="p-6 text-center">
                      <div className={`mx-auto w-12 h-12 mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isDragging
                          ? 'bg-[#C8A963] text-white scale-110'
                          : darkMode
                          ? 'bg-white/10 text-white/70'
                          : 'bg-[#0C2340]/10 text-[#0C2340]'
                      }`}>
                        <Upload 
                          size={24} 
                          className={`transition-transform duration-300 ${
                            isDragging ? 'animate-bounce' : ''
                          }`}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <p className={`transition-colors ${
                          isDragging
                            ? 'text-[#C8A963] font-semibold'
                            : darkMode
                            ? 'text-white/80'
                            : 'text-gray-700'
                        }`}>
                          {isDragging ? '¡Suelta la foto aquí!' : 'Arrastra tu foto aquí'}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                          o{' '}
                          <span className={`font-semibold transition-colors ${
                            darkMode
                              ? 'text-[#C8A963] hover:text-[#b89850]'
                              : 'text-[#0C2340] hover:text-[#1e3a5f]'
                          }`}>
                            haz click para seleccionar
                          </span>
                        </p>
                      </div>
                      
                      {isLoading && (
                        <div className="mt-3">
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#C8A963] rounded-full animate-pulse w-2/3"></div>
                          </div>
                          <p className={`text-xs mt-2 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                            Cargando foto...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                    Recomendado: 600x600px, máximo 2MB (JPG, PNG)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Información Básica */}
          <section className={`p-6 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Andrea"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  required
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Apellido *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Ej: Rangel"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  required
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Número</Label>
                <Input
                  type="number"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', parseInt(e.target.value) || 0)}
                  placeholder="Ej: 15"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Posición</Label>
                <select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={`w-full h-11 px-4 rounded-lg border transition-all duration-300 ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#C8A963]/30 focus:border-[#C8A963] focus:ring-4 focus:ring-[#C8A963]/20' 
                      : 'bg-white/50 border-gray-200/60 hover:border-[#C8A963]/40 hover:bg-white/80 focus:border-[#0C2340] focus:ring-4 focus:ring-[#0C2340]/10'
                  } backdrop-blur-sm focus:bg-white dark:focus:bg-white/10 focus:shadow-lg outline-none`}
                >
                  <option value="">Seleccionar posición</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Altura</Label>
                <Input
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Ej: 1.82m"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Estado</Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full h-11 px-4 rounded-lg border transition-all duration-300 ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#C8A963]/30 focus:border-[#C8A963] focus:ring-4 focus:ring-[#C8A963]/20' 
                      : 'bg-white/50 border-gray-200/60 hover:border-[#C8A963]/40 hover:bg-white/80 focus:border-[#0C2340] focus:ring-4 focus:ring-[#0C2340]/10'
                  } backdrop-blur-sm focus:bg-white dark:focus:bg-white/10 focus:shadow-lg outline-none`}
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>
            </div>
          </section>

          {/* Biografía */}
          <section className={`p-6 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Biografía
            </h3>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Escribe una breve biografía de la jugadora..."
              rows={4}
              className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
            />
          </section>

          {/* Estadísticas de Temporada */}
          <section className={`p-6 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Estadísticas de Temporada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Partidos Jugados</Label>
                <Input
                  type="number"
                  value={formData.gamesPlayed}
                  onChange={(e) => handleInputChange('gamesPlayed', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Partidos Ganados</Label>
                <Input
                  type="number"
                  value={formData.gamesWon}
                  onChange={(e) => handleInputChange('gamesWon', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Promedio por Partido</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.avgPerGame}
                  onChange={(e) => handleInputChange('avgPerGame', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Puntos</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Aces</Label>
                <Input
                  type="number"
                  value={formData.aces}
                  onChange={(e) => handleInputChange('aces', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Bloqueos</Label>
                <Input
                  type="number"
                  value={formData.blocks}
                  onChange={(e) => handleInputChange('blocks', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Ataques</Label>
                <Input
                  type="number"
                  value={formData.attacks}
                  onChange={(e) => handleInputChange('attacks', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Efectividad (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.effectiveness}
                  onChange={(e) => handleInputChange('effectiveness', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
            </div>
          </section>

          {/* Información del Equipo */}
          <section className={`p-6 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Información del Equipo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Equipo</Label>
                <Input
                  value={formData.team}
                  onChange={(e) => handleInputChange('team', e.target.value)}
                  placeholder="Cangrejeras de Santurce"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Liga</Label>
                <Input
                  value={formData.league}
                  onChange={(e) => handleInputChange('league', e.target.value)}
                  placeholder="Liga Superior Femenina"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
              <div>
                <Label className={darkMode ? 'text-white/80' : ''}>Temporada</Label>
                <Input
                  value={formData.season}
                  onChange={(e) => handleInputChange('season', e.target.value)}
                  placeholder="2025-2026"
                  className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                />
              </div>
            </div>
          </section>

          {/* Sticky Footer con botones */}
          <div className={`sticky bottom-0 ${darkMode ? 'bg-[#0F172A]' : 'bg-white'} border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} p-6 -mx-6 -mb-8`}>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className={darkMode ? 'border-white/10 text-white hover:bg-white/5' : ''}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
              >
                {player ? 'Guardar Cambios' : 'Agregar Jugadora'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Edit, Trash2, Plus, Search, Target, Edit2, ListOrdered, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";
import { PlayerManagementEdit } from "./PlayerManagementEdit";
import { EmptyPlayers, EmptySearch } from "./EmptyStates";
import { ConfirmModal } from "./ModalPremium";
import { BadgePremium } from "./BadgePremium";
import { DatabaseMigration } from "./DatabaseMigration";
import { playerService } from "../../services/playerService";
import { storageService } from "../../services/storageService";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export interface Player {
  id: string;
  name: string;
  lastName: string;
  number: number;
  position: string;
  height: string;
  points: number;
  aces: number;
  blocks: number;
  status: 'active' | 'inactive';
  photo?: string;
  bio?: string;
  gamesPlayed?: number;
  gamesWon?: number;
  avgPerGame?: number;
  attacks?: number;
  effectiveness?: number;
  team?: string;
  league?: string;
  season?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

interface PlayerManagementProps {
  darkMode: boolean;
}

// Helper para obtener iniciales
const getInitials = (name: string, lastName: string) => {
  const firstInitial = name.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

// Componente Avatar memoizado
const PlayerAvatar = memo(({ player, size = 'md' }: { player: Player; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  if (player.photo) {
    return (
      <img
        src={player.photo}
        alt={`${player.name} ${player.lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-[#0C2340] flex items-center justify-center text-white font-bold`}
    >
      {getInitials(player.name, player.lastName)}
    </div>
  );
});

export function PlayerManagement({ darkMode }: PlayerManagementProps) {
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditView, setShowEditView] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Positions Management State
  const [positions, setPositions] = useState<string[]>([
    'Opuesta',
    'Esquina',
    'Central',
    'Líbero',
    'Levantadora',
  ]);
  const [showPositionDialog, setShowPositionDialog] = useState(false);
  const [showDeletePositionDialog, setShowDeletePositionDialog] = useState(false);
  const [isEditPositionMode, setIsEditPositionMode] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number>(-1);
  const [newPositionName, setNewPositionName] = useState('');

  // Load players from Firestore on mount
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const data = await playerService.getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Error al cargar jugadoras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((player: Player) => {
    setEditingPlayer(player);
    setShowEditView(true);
  }, []);

  const handleDelete = useCallback((player: Player) => {
    setPlayerToDelete(player);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!playerToDelete) return;

    setIsDeleting(true);

    try {
      await playerService.deletePlayer(playerToDelete.id);
      setPlayers(prev => prev.filter(p => p.id !== playerToDelete.id));
      toast.success(`${playerToDelete.name} ${playerToDelete.lastName} eliminada exitosamente`);
    } catch (error) {
      toast.error('Error al eliminar jugadora');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setPlayerToDelete(null);
    }
  }, [playerToDelete]);

  const handleSavePlayer = useCallback(async (playerData: Omit<Player, 'id'>) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);

    try {
      let photoURL = playerData.photo || '';

      // If there's a new photo (base64), upload it to Firebase Storage
      if (playerData.photo && playerData.photo.startsWith('data:image/')) {
        // Convert base64 to File
        const response = await fetch(playerData.photo);
        const blob = await response.blob();
        const file = new File([blob], 'player-photo.jpg', { type: 'image/jpeg' });

        if (editingPlayer) {
          // Updating existing player - use their ID
          photoURL = await storageService.uploadPlayerPhoto(
            editingPlayer.id,
            file,
            (progress) => setUploadProgress(progress.progress)
          );
        } else {
          // New player - create first to get ID, then upload photo
          const tempPlayerData = {
            ...playerData,
            photo: '', // No photo yet
            points: playerData.points || 0,
            aces: playerData.aces || 0,
            blocks: playerData.blocks || 0,
            gamesPlayed: playerData.gamesPlayed || 0,
            gamesWon: playerData.gamesWon || 0,
            avgPerGame: playerData.avgPerGame || 0,
            attacks: playerData.attacks || 0,
            effectiveness: playerData.effectiveness || 0
          };

          const newPlayer = await playerService.createPlayer(tempPlayerData, currentUser.id);

          // Now upload photo with the new player ID
          photoURL = await storageService.uploadPlayerPhoto(
            newPlayer.id,
            file,
            (progress) => setUploadProgress(progress.progress)
          );

          // Update player with photo URL
          await playerService.updatePlayerPhoto(newPlayer.id, photoURL, currentUser.id);

          // Add to local state
          setPlayers(prev => [...prev, { ...newPlayer, photo: photoURL }]);
          toast.success('Jugadora agregada exitosamente');
          setShowEditView(false);
          setEditingPlayer(null);
          setIsSaving(false);
          return;
        }
      }

      if (editingPlayer) {
        // Update existing player
        await playerService.updatePlayer(editingPlayer.id, {
          ...playerData,
          photo: photoURL
        }, currentUser.id);

        // Update local state
        setPlayers(prev => prev.map(p =>
          p.id === editingPlayer.id
            ? { ...p, ...playerData, photo: photoURL, updatedAt: new Date() }
            : p
        ));
        toast.success('Jugadora actualizada exitosamente');
      } else {
        // Create new player without photo
        const newPlayer = await playerService.createPlayer({
          ...playerData,
          photo: photoURL,
          points: playerData.points || 0,
          aces: playerData.aces || 0,
          blocks: playerData.blocks || 0,
          gamesPlayed: playerData.gamesPlayed || 0,
          gamesWon: playerData.gamesWon || 0,
          avgPerGame: playerData.avgPerGame || 0,
          attacks: playerData.attacks || 0,
          effectiveness: playerData.effectiveness || 0
        }, currentUser.id);

        setPlayers(prev => [...prev, newPlayer]);
        toast.success('Jugadora agregada exitosamente');
      }

      setShowEditView(false);
      setEditingPlayer(null);
    } catch (error) {
      console.error('Error saving player:', error);
      toast.error('Error al guardar jugadora');
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  }, [editingPlayer, currentUser]);

  const handleCancelEdit = useCallback(() => {
    setShowEditView(false);
    setEditingPlayer(null);
  }, []);

  const openNewPlayerForm = useCallback(() => {
    setEditingPlayer(null);
    setShowEditView(true);
  }, []);

  // Position Management Functions
  const handleAddPosition = useCallback(() => {
    setIsEditPositionMode(false);
    setNewPositionName('');
    setShowPositionDialog(true);
  }, []);

  const handleEditPosition = useCallback((position: string, index: number) => {
    setIsEditPositionMode(true);
    setSelectedPosition(position);
    setSelectedPositionIndex(index);
    setNewPositionName(position);
    setShowPositionDialog(true);
  }, []);

  const handleDeletePosition = useCallback((position: string, index: number) => {
    setSelectedPosition(position);
    setSelectedPositionIndex(index);
    setShowDeletePositionDialog(true);
  }, []);

  const confirmDeletePosition = useCallback(() => {
    if (selectedPositionIndex !== -1) {
      const newPositions = positions.filter((_, i) => i !== selectedPositionIndex);
      setPositions(newPositions);
      toast.success(`Posición "${selectedPosition}" eliminada`);
      setShowDeletePositionDialog(false);
      setSelectedPosition(null);
      setSelectedPositionIndex(-1);
    }
  }, [selectedPositionIndex, positions, selectedPosition]);

  const savePosition = useCallback(() => {
    if (!newPositionName.trim()) {
      toast.error('El nombre de la posición no puede estar vacío');
      return;
    }

    if (isEditPositionMode && selectedPositionIndex !== -1) {
      // Edit existing position
      const newPositions = [...positions];
      newPositions[selectedPositionIndex] = newPositionName.trim();
      setPositions(newPositions);
      toast.success('Posición actualizada exitosamente');
    } else {
      // Add new position
      if (positions.includes(newPositionName.trim())) {
        toast.error('Esta posición ya existe');
        return;
      }
      setPositions([...positions, newPositionName.trim()]);
      toast.success('Posición agregada exitosamente');
    }

    setShowPositionDialog(false);
    setSelectedPosition(null);
    setSelectedPositionIndex(-1);
    setNewPositionName('');
  }, [newPositionName, isEditPositionMode, selectedPositionIndex, positions]);

  const filteredPlayers = useMemo(() => 
    players.filter(player =>
      `${player.name} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [players, searchQuery]
  );

  // Show edit view if editing or adding a player
  if (showEditView) {
    return (
      <PlayerManagementEdit
        darkMode={darkMode}
        player={editingPlayer || undefined}
        onSave={handleSavePlayer}
        onCancel={handleCancelEdit}
        availablePositions={positions}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Jugadoras
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Administra el roster del equipo
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <RefreshCw size={48} className={`animate-spin ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
        </div>
      </div>
    );
  }

  // Show empty state if no players at all
  if (players.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Jugadoras
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Administra el roster del equipo
            </p>
          </div>
        </div>

        {/* Database Migration Component */}
        <DatabaseMigration darkMode={darkMode} />

        <EmptyPlayers
          darkMode={darkMode}
          onAction={openNewPlayerForm}
          actionLabel="Agregar Primera Jugadora"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Jugadoras
          </h2>
          <div className="mt-2">
            <BadgePremium variant="default" size="sm">
              {players.length} jugadora{players.length !== 1 ? 's' : ''}
            </BadgePremium>
          </div>
        </div>
        <Button
          onClick={openNewPlayerForm}
          className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
        >
          <Plus size={18} className="mr-2" />
          Agregar Jugadora
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search 
          size={18} 
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            darkMode ? 'text-white/40' : 'text-gray-400'
          }`}
        />
        <Input
          type="text"
          placeholder="Buscar por nombre o posición..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pl-10 ${
            darkMode
              ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
              : 'bg-white border-gray-200'
          }`}
        />
      </div>

      {/* Players Table - Optimized for Mobile */}
      <div className={`rounded-lg border ${darkMode ? 'border-white/10' : 'border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-white/5' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                  Número
                </th>
                <th className={`px-4 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                  Nombre
                </th>
                <th className={`px-4 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                  Posición
                </th>
                <th className={`px-4 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                  Estado
                </th>
                <th className={`px-4 py-3 text-right text-xs uppercase tracking-wider ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-white/10 bg-white/5' : 'divide-gray-200 bg-white'}`}>
              {filteredPlayers.length === 0 && searchQuery ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8">
                    <EmptySearch darkMode={darkMode} searchTerm={searchQuery} />
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className={darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`font-semibold text-lg ${darkMode ? 'text-[#C8A963]' : 'text-[#0C2340]'}`}>
                        #{player.number}
                      </div>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="font-medium">{player.name} {player.lastName}</div>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      <div className="font-medium">{player.position}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs rounded-full font-medium ${
                          player.status === 'active'
                            ? 'bg-[#10B981]/10 text-[#10B981]'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {player.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(player)}
                          className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(player)}
                          className="text-[#E01E37] hover:text-[#E01E37] hover:bg-[#E01E37]/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position Management Section */}
      <div
        className={`rounded-xl border p-6 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#C8A963]/10">
              <Target size={20} style={{ color: '#C8A963' }} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Posiciones del Equipo
              </h3>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                {positions.length} posición{positions.length !== 1 ? 'es' : ''} disponible{positions.length !== 1 ? 's' : ''} para las jugadoras
              </p>
            </div>
          </div>
          <Button onClick={handleAddPosition} className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white">
            <Plus size={18} className="mr-2" />
            Agregar Posición
          </Button>
        </div>

        {/* Positions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {positions.map((position, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                darkMode
                  ? 'bg-white/5 border-white/10 hover:border-[#C8A963]/30 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:border-[#C8A963]/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C8A963]/10 flex items-center justify-center">
                    <ListOrdered size={18} style={{ color: '#C8A963' }} />
                  </div>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {position}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPosition(position, index)}
                    className={darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'hover:bg-gray-100'}
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePosition(position, index)}
                    className="text-[#E01E37] hover:text-[#E01E37] hover:bg-[#E01E37]/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {positions.length === 0 && (
          <div className="text-center py-12">
            <Target size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={`${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
              No hay posiciones configuradas
            </p>
            <Button onClick={handleAddPosition} variant="outline" className={`mt-4 ${darkMode ? 'border-white/10 text-white' : ''}`}>
              <Plus size={18} className="mr-2" />
              Agregar Primera Posición
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Position Dialog */}
      <Dialog open={showPositionDialog} onOpenChange={setShowPositionDialog}>
        <DialogContent className={darkMode ? 'bg-[#1E293B] border-white/10' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>
              {isEditPositionMode ? 'Editar Posición' : 'Agregar Nueva Posición'}
            </DialogTitle>
            <DialogDescription className={darkMode ? 'text-white/60' : ''}>
              {isEditPositionMode 
                ? 'Modifica el nombre de la posición'
                : 'Agrega una nueva posición al equipo (ej: Opuesta, Esquina, Central, etc.)'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="positionName" className={darkMode ? 'text-white/80' : ''}>
                Nombre de la Posición *
              </Label>
              <div className="relative">
                <Target size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                <Input
                  id="positionName"
                  placeholder="Ej: Opuesta, Esquina, Central..."
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  className={`pl-10 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      savePosition();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPositionDialog(false)}
              className={darkMode ? 'border-white/10 text-white/70' : ''}
            >
              Cancelar
            </Button>
            <Button
              onClick={savePosition}
              className="bg-[#0C2340] hover:bg-[#1e3a5f] text-white"
            >
              {isEditPositionMode ? 'Actualizar Posición' : 'Agregar Posición'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Position Confirmation Dialog */}
      <AlertDialog open={showDeletePositionDialog} onOpenChange={setShowDeletePositionDialog}>
        <AlertDialogContent className={darkMode ? 'bg-[#1E293B] border-white/10' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={darkMode ? 'text-white' : ''}>
              ¿Eliminar Posición?
            </AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-white/60' : ''}>
              ¿Estás seguro de que deseas eliminar la posición <strong>{selectedPosition}</strong>? 
              Esta acción no se puede deshacer. Las jugadoras con esta posición no se verán afectadas, 
              pero esta posición ya no estará disponible para nuevas jugadoras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={darkMode ? 'border-white/10 text-white/70' : ''}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePosition}
              className="bg-[#E01E37] hover:bg-[#c01a30] text-white"
            >
              Eliminar Posición
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Player Confirmation Modal - Premium */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPlayerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Jugadora"
        description={
          playerToDelete
            ? `¿Estás seguro de eliminar a ${playerToDelete.name} ${playerToDelete.lastName}? Esta acción no se puede deshacer y se perderán todos sus datos y estadísticas.`
            : ''
        }
        darkMode={darkMode}
        variant="danger"
        confirmText="Eliminar Jugadora"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}

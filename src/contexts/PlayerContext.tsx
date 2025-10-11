import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { playerService, Player as FirestorePlayer } from '../services/playerService';
import { useAuth } from './AuthContext';

// Interfaz simplificada para el contexto (compatibilidad con código existente)
export interface Player {
  id: number;
  name: string;
  jerseyNumber: string;
  position: string;
  photoUrl?: string;
  isActive: boolean;
  height?: string;
  hometown?: string;
  bio?: string;
}

interface PlayerContextType {
  players: Player[];
  activePlayers: Player[];
  loading: boolean;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  updatePlayer: (id: number, player: Partial<Player>) => Promise<void>;
  deletePlayer: (id: number) => Promise<void>;
  togglePlayerStatus: (id: number) => Promise<void>;
  reloadPlayers: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Convertir jugadora de Firestore a formato del contexto
const firestorePlayerToContextPlayer = (fp: FirestorePlayer): Player => {
  return {
    id: parseInt(fp.id) || 0,
    name: `${fp.name} ${fp.lastName}`,
    jerseyNumber: fp.number.toString(),
    position: fp.position,
    photoUrl: fp.photo || undefined,
    isActive: fp.status === 'active',
    height: fp.height,
    hometown: fp.bio?.includes('de ') ? fp.bio.split('de ')[1] : undefined,
    bio: fp.bio
  };
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const activePlayers = players.filter(p => p.isActive);

  // Cargar jugadoras desde Firestore
  const loadPlayers = async () => {
    try {
      setLoading(true);
      console.log('📥 Cargando jugadoras desde Firestore...');

      const firestorePlayers = await playerService.getAllPlayers();
      console.log(`✅ ${firestorePlayers.length} jugadoras cargadas desde Firestore`);

      const contextPlayers = firestorePlayers.map(firestorePlayerToContextPlayer);
      setPlayers(contextPlayers);
    } catch (error) {
      console.error('❌ Error cargando jugadoras:', error);
      toast.error('Error al cargar jugadoras');
    } finally {
      setLoading(false);
    }
  };

  // Cargar jugadoras al montar el componente
  useEffect(() => {
    loadPlayers();
  }, []);

  const addPlayer = async (playerData: Omit<Player, 'id'>) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      // Separar nombre y apellido
      const nameParts = playerData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      await playerService.createPlayer({
        name: firstName,
        lastName: lastName,
        number: parseInt(playerData.jerseyNumber),
        position: playerData.position,
        height: playerData.height || '1.70m',
        status: playerData.isActive ? 'active' : 'inactive',
        photo: playerData.photoUrl || '',
        bio: playerData.bio || '',
        team: 'Cangrejeras de Santurce',
        league: 'Liga de Voleibol Superior Femenino',
        season: '2024-2025'
      }, currentUser.id);

      await loadPlayers(); // Recargar lista
      toast.success('Jugadora agregada exitosamente');
    } catch (error) {
      console.error('Error agregando jugadora:', error);
      toast.error('Error al agregar jugadora');
    }
  };

  const updatePlayer = async (id: number, playerData: Partial<Player>) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      const updateData: any = {};

      if (playerData.name) {
        const nameParts = playerData.name.split(' ');
        updateData.name = nameParts[0];
        updateData.lastName = nameParts.slice(1).join(' ') || nameParts[0];
      }
      if (playerData.jerseyNumber) updateData.number = parseInt(playerData.jerseyNumber);
      if (playerData.position) updateData.position = playerData.position;
      if (playerData.height) updateData.height = playerData.height;
      if (playerData.photoUrl !== undefined) updateData.photo = playerData.photoUrl;
      if (playerData.bio) updateData.bio = playerData.bio;
      if (playerData.isActive !== undefined) {
        updateData.status = playerData.isActive ? 'active' : 'inactive';
      }

      await playerService.updatePlayer(id.toString(), updateData, currentUser.id);
      await loadPlayers(); // Recargar lista
      toast.success('Jugadora actualizada');
    } catch (error) {
      console.error('Error actualizando jugadora:', error);
      toast.error('Error al actualizar jugadora');
    }
  };

  const deletePlayer = async (id: number) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      await playerService.deletePlayer(id.toString());
      await loadPlayers(); // Recargar lista
      toast.success('Jugadora eliminada');
    } catch (error) {
      console.error('Error eliminando jugadora:', error);
      toast.error('Error al eliminar jugadora');
    }
  };

  const togglePlayerStatus = async (id: number) => {
    if (!currentUser) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      await playerService.togglePlayerStatus(id.toString(), currentUser.id);
      await loadPlayers(); // Recargar lista
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast.error('Error al cambiar estado de jugadora');
    }
  };

  const reloadPlayers = async () => {
    await loadPlayers();
  };

  return (
    <PlayerContext.Provider
      value={{
        players,
        activePlayers,
        loading,
        addPlayer,
        updatePlayer,
        deletePlayer,
        togglePlayerStatus,
        reloadPlayers,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayers() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayers must be used within a PlayerProvider');
  }
  return context;
}

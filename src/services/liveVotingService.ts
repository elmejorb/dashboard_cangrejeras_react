import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  runTransaction,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LivePoll {
  id: string;
  matchId: number | string; // Puede ser number (legacy) o string (Firestore ID)
  title: string;
  description: string;
  isActive: boolean;
  startedAt: Date;
  closedAt: Date | null;
  options: PollOption[];
  totalVotes: number;
  createdBy: string; // Admin user ID
}

export interface PollOption {
  playerId: string; // ✅ CAMBIO: Ahora usa document ID (string) en vez de número de camiseta
  votes: number;
}

export interface Vote {
  id: string;
  pollId: string;
  matchId: number | string; // Puede ser number (legacy) o string (Firestore ID)
  userId: string; // Firebase Auth UID
  playerId: string; // ✅ CAMBIO: Ahora usa document ID (string) en vez de número de camiseta
  createdAt: Date;
}

interface LivePollInput {
  matchId: number | string; // Puede ser number (legacy) o string (Firestore ID)
  title: string;
  description: string;
  playerIds: string[]; // ✅ CAMBIO: Ahora usa document IDs (string[]) en vez de números
  createdBy: string;
}

export const liveVotingService = {
  /**
   * Crea una nueva votación en vivo para un partido
   * Solo puede haber UNA votación activa por partido
   * @param startActive - Si es true, la votación comienza activa. Si es false, comienza inactiva.
   */
  createLivePoll: async (pollData: LivePollInput, startActive: boolean = true): Promise<LivePoll> => {
    // Verificar si ya existe una votación activa para este partido
    const existingPoll = await liveVotingService.getActivePollByMatch(pollData.matchId);
    if (existingPoll) {
      throw new Error('Ya existe una votación activa para este partido. Cierra la votación anterior primero.');
    }

    const options: PollOption[] = pollData.playerIds.map(playerId => ({
      playerId,
      votes: 0,
    }));

    const pollDoc = {
      matchId: pollData.matchId,
      title: pollData.title,
      description: pollData.description,
      isActive: startActive,
      startedAt: startActive ? serverTimestamp() : null,
      closedAt: null,
      options,
      totalVotes: 0,
      createdBy: pollData.createdBy,
    };

    const docRef = await addDoc(collection(db, 'live_polls'), pollDoc);

    return {
      id: docRef.id,
      ...pollDoc,
      startedAt: startActive ? new Date() : (null as any),
      closedAt: null,
    } as LivePoll;
  },

  /**
   * Activa una votación inactiva
   */
  activateLivePoll: async (pollId: string): Promise<void> => {
    console.log('🚀 activateLivePoll - Activando votación:', pollId);

    const pollRef = doc(db, 'live_polls', pollId);
    await updateDoc(pollRef, {
      isActive: true,
      startedAt: serverTimestamp(),
    });

    console.log('✅ activateLivePoll - Votación activada exitosamente:', pollId);
  },

  /**
   * Cierra una votación en vivo
   */
  closeLivePoll: async (pollId: string): Promise<void> => {
    const pollRef = doc(db, 'live_polls', pollId);
    await updateDoc(pollRef, {
      isActive: false,
      closedAt: serverTimestamp(),
    });
  },

  /**
   * Elimina una votación en vivo de Firestore
   */
  deleteLivePoll: async (pollId: string): Promise<void> => {
    console.log('🗑️ deleteLivePoll - Eliminando votación:', pollId);

    const pollRef = doc(db, 'live_polls', pollId);
    await deleteDoc(pollRef);

    console.log('✅ deleteLivePoll - Votación eliminada exitosamente:', pollId);
  },

  /**
   * Elimina todos los votos asociados a una votación específica
   */
  deleteVotesByPollId: async (pollId: string): Promise<number> => {
    console.log('🗑️ deleteVotesByPollId - Eliminando votos de votación:', pollId);

    const q = query(
      collection(db, 'votes'),
      where('pollId', '==', pollId)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);

    console.log(`✅ deleteVotesByPollId - ${snapshot.size} votos eliminados de votación ${pollId}`);
    return snapshot.size;
  },

  /**
   * Elimina todos los votos asociados a un partido específico
   */
  deleteVotesByMatchId: async (matchId: number | string): Promise<number> => {
    console.log('🗑️ deleteVotesByMatchId - Eliminando votos de partido:', matchId);

    const q = query(
      collection(db, 'votes'),
      where('matchId', '==', matchId)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);

    console.log(`✅ deleteVotesByMatchId - ${snapshot.size} votos eliminados de partido ${matchId}`);
    return snapshot.size;
  },

  /**
   * Elimina una votación y todos sus votos asociados (eliminación en cascada)
   */
  deleteLivePollWithVotes: async (pollId: string): Promise<void> => {
    console.log('🗑️ deleteLivePollWithVotes - Eliminando votación con votos:', pollId);

    // 1. Eliminar todos los votos primero
    const votesDeleted = await liveVotingService.deleteVotesByPollId(pollId);
    console.log(`✅ Eliminados ${votesDeleted} votos`);

    // 2. Eliminar la votación
    await liveVotingService.deleteLivePoll(pollId);
    console.log('✅ Votación eliminada');

    console.log(`✅ deleteLivePollWithVotes - Eliminación completa: votación ${pollId} y ${votesDeleted} votos`);
  },

  /**
   * Obtiene la votación activa para un partido específico
   */
  getActivePollByMatch: async (matchId: number): Promise<LivePoll | null> => {
    const q = query(
      collection(db, 'live_polls'),
      where('matchId', '==', matchId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const pollDoc = snapshot.docs[0];
    const data = pollDoc.data();

    return {
      id: pollDoc.id,
      matchId: data.matchId,
      title: data.title,
      description: data.description,
      isActive: data.isActive,
      startedAt: data.startedAt?.toDate() || new Date(),
      closedAt: data.closedAt?.toDate() || null,
      options: data.options || [],
      totalVotes: data.totalVotes || 0,
      createdBy: data.createdBy,
    };
  },

  /**
   * Obtiene cualquier votación (activa o inactiva) para un partido específico
   */
  getPollByMatch: async (matchId: number): Promise<LivePoll | null> => {
    console.log('🔍 getPollByMatch - Buscando votación para partido:', matchId);

    const q = query(
      collection(db, 'live_polls'),
      where('matchId', '==', matchId)
    );

    const snapshot = await getDocs(q);
    console.log('📊 getPollByMatch - Resultados encontrados:', snapshot.size);

    if (snapshot.empty) {
      console.log('❌ getPollByMatch - No se encontró votación para partido:', matchId);
      return null;
    }

    // Si hay múltiples, tomar la primera (o la más reciente si ordenamos manualmente)
    const pollDoc = snapshot.docs[0];
    const data = pollDoc.data();

    const poll = {
      id: pollDoc.id,
      matchId: data.matchId,
      title: data.title,
      description: data.description,
      isActive: data.isActive,
      startedAt: data.startedAt?.toDate() || null,
      closedAt: data.closedAt?.toDate() || null,
      options: data.options || [],
      totalVotes: data.totalVotes || 0,
      createdBy: data.createdBy,
    };

    console.log('✅ getPollByMatch - Votación encontrada:', {
      id: poll.id,
      title: poll.title,
      isActive: poll.isActive,
      matchId: poll.matchId
    });

    return poll;
  },

  /**
   * Verifica si un usuario ya votó en un partido específico
   * CLAVE: Previene votos duplicados
   */
  hasUserVotedInMatch: async (userId: string, matchId: number): Promise<boolean> => {
    const q = query(
      collection(db, 'votes'),
      where('userId', '==', userId),
      where('matchId', '==', matchId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  /**
   * Registra un voto (SOLO desde la APP)
   * Usa Firestore Transaction para garantizar atomicidad
   */
  castVote: async (
    pollId: string,
    matchId: number,
    userId: string,
    playerId: string // ✅ CAMBIO: Ahora recibe document ID (string)
  ): Promise<void> => {
    // 1. Verificar que el usuario no haya votado antes
    const hasVoted = await liveVotingService.hasUserVotedInMatch(userId, matchId);
    if (hasVoted) {
      throw new Error('Ya has votado en este partido. Solo puedes votar una vez.');
    }

    // 2. Verificar que la votación esté activa
    const poll = await liveVotingService.getActivePollByMatch(matchId);
    if (!poll) {
      throw new Error('No hay votación activa para este partido.');
    }

    if (poll.id !== pollId) {
      throw new Error('ID de votación no coincide con la votación activa.');
    }

    // 3. Verificar que la jugadora esté en las opciones
    const playerOption = poll.options.find(opt => opt.playerId === playerId);
    if (!playerOption) {
      throw new Error('La jugadora seleccionada no está disponible en esta votación.');
    }

    // 4. Usar Transaction para garantizar atomicidad
    await runTransaction(db, async (transaction) => {
      const pollRef = doc(db, 'live_polls', pollId);
      const pollDoc = await transaction.get(pollRef);

      if (!pollDoc.exists()) {
        throw new Error('Votación no encontrada.');
      }

      const pollData = pollDoc.data();

      // Actualizar el contador de votos de la jugadora
      const updatedOptions = pollData.options.map((opt: PollOption) =>
        opt.playerId === playerId
          ? { ...opt, votes: opt.votes + 1 }
          : opt
      );

      // Actualizar el documento de la votación
      transaction.update(pollRef, {
        options: updatedOptions,
        totalVotes: pollData.totalVotes + 1,
      });

      // Crear el registro del voto
      const voteRef = doc(collection(db, 'votes'));
      transaction.set(voteRef, {
        pollId,
        matchId,
        userId,
        playerId,
        createdAt: serverTimestamp(),
      });
    });
  },

  /**
   * Obtiene todos los votos de un partido
   * (Para auditoría o análisis)
   */
  getVotesByMatch: async (matchId: number): Promise<Vote[]> => {
    const q = query(
      collection(db, 'votes'),
      where('matchId', '==', matchId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        pollId: data.pollId,
        matchId: data.matchId,
        userId: data.userId,
        playerId: data.playerId,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  },

  /**
   * Listener en tiempo real para una votación específica
   * Devuelve una función para cancelar la suscripción
   */
  subscribeToPoll: (
    pollId: string,
    onUpdate: (poll: LivePoll) => void,
    onError?: (error: Error) => void
  ): (() => void) => {
    const pollRef = doc(db, 'live_polls', pollId);

    const unsubscribe = onSnapshot(
      pollRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const poll: LivePoll = {
            id: snapshot.id,
            matchId: data.matchId,
            title: data.title,
            description: data.description,
            isActive: data.isActive,
            startedAt: data.startedAt?.toDate() || new Date(),
            closedAt: data.closedAt?.toDate() || null,
            options: data.options || [],
            totalVotes: data.totalVotes || 0,
            createdBy: data.createdBy,
          };
          onUpdate(poll);
        }
      },
      (error) => {
        console.error('Error listening to poll updates:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  },

  /**
   * Listener en tiempo real para votación activa de un partido
   */
  subscribeToMatchPoll: (
    matchId: number,
    onUpdate: (poll: LivePoll | null) => void,
    onError?: (error: Error) => void
  ): (() => void) => {
    const q = query(
      collection(db, 'live_polls'),
      where('matchId', '==', matchId),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(null);
          return;
        }

        const pollDoc = snapshot.docs[0];
        const data = pollDoc.data();
        const poll: LivePoll = {
          id: pollDoc.id,
          matchId: data.matchId,
          title: data.title,
          description: data.description,
          isActive: data.isActive,
          startedAt: data.startedAt?.toDate() || new Date(),
          closedAt: data.closedAt?.toDate() || null,
          options: data.options || [],
          totalVotes: data.totalVotes || 0,
          createdBy: data.createdBy,
        };
        onUpdate(poll);
      },
      (error) => {
        console.error('Error listening to match poll:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  },

  /**
   * Obtiene el historial de votaciones de un partido
   */
  getPollHistoryByMatch: async (matchId: number): Promise<LivePoll[]> => {
    const q = query(
      collection(db, 'live_polls'),
      where('matchId', '==', matchId),
      orderBy('startedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        matchId: data.matchId,
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        startedAt: data.startedAt?.toDate() || new Date(),
        closedAt: data.closedAt?.toDate() || null,
        options: data.options || [],
        totalVotes: data.totalVotes || 0,
        createdBy: data.createdBy,
      };
    });
  },

  /**
   * Obtiene una votación específica por ID
   */
  getPollById: async (pollId: string): Promise<LivePoll | null> => {
    const pollRef = doc(db, 'live_polls', pollId);
    const pollDoc = await getDoc(pollRef);

    if (!pollDoc.exists()) {
      return null;
    }

    const data = pollDoc.data();
    return {
      id: pollDoc.id,
      matchId: data.matchId,
      title: data.title,
      description: data.description,
      isActive: data.isActive,
      startedAt: data.startedAt?.toDate() || null,
      closedAt: data.closedAt?.toDate() || null,
      options: data.options || [],
      totalVotes: data.totalVotes || 0,
      createdBy: data.createdBy,
    };
  },

  /**
   * Obtiene TODAS las votaciones (activas e inactivas)
   */
  getAllPolls: async (): Promise<LivePoll[]> => {
    const pollsRef = collection(db, 'live_polls');
    const q = query(pollsRef, orderBy('startedAt', 'desc'));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        matchId: data.matchId,
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        startedAt: data.startedAt?.toDate() || null,
        closedAt: data.closedAt?.toDate() || null,
        options: data.options || [],
        totalVotes: data.totalVotes || 0,
        createdBy: data.createdBy,
      };
    });
  },

  /**
   * Obtiene los IDs de las jugadoras asignadas a una votación
   * @returns Array de document IDs de jugadoras ["abc123", "def456", ...]
   */
  getPlayerIdsFromPoll: async (pollId: string): Promise<string[]> => {
    try {
      const poll = await liveVotingService.getPollById(pollId);
      if (!poll) {
        console.error('Votación no encontrada:', pollId);
        return [];
      }

      const playerIds = poll.options.map(option => option.playerId);
      console.log(`📊 Votación "${poll.title}" tiene ${playerIds.length} jugadoras:`, playerIds);
      return playerIds;
    } catch (error) {
      console.error('Error obteniendo IDs de jugadoras:', error);
      return [];
    }
  },

  /**
   * Verifica si una jugadora específica está en una votación
   */
  isPlayerInPoll: async (pollId: string, playerId: string): Promise<boolean> => {
    const playerIds = await liveVotingService.getPlayerIdsFromPoll(pollId);
    return playerIds.includes(playerId);
  },
};

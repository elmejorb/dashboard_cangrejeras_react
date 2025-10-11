# 📱 Documentación para la APP - Cangrejeras de Santurce

## 🔥 Configuración de Firebase

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDEEE9utmsp-dB_ZXe-TtoeUt5-yALiOlM",
  authDomain: "cangrejeras-de-santurce.firebaseapp.com",
  projectId: "cangrejeras-de-santurce",
  storageBucket: "cangrejeras-de-santurce.firebasestorage.app",
  messagingSenderId: "487991855897",
  appId: "1:487991855897:web:805dc5406f53df304e1388",
  measurementId: "G-FGRB7WXCB5"
};
```

---

## 🏐 1. CONSULTAR PARTIDO EN VIVO

### ❓ ¿Qué necesita hacer la APP?

La APP necesita consultar Firestore para obtener el partido que tiene `status: 'live'`.

### 📊 Colección en Firestore

**Colección:** `matches`

**Estructura del documento:**
```javascript
{
  id: "string", // ID autogenerado por Firestore
  homeTeam: "Cangrejeras de Santurce",
  awayTeam: "Pinkin de Corozal",
  date: "2025-01-15", // Formato YYYY-MM-DD
  time: "19:00", // Formato HH:MM (24 horas)
  venue: "Coliseo Roberto Clemente",
  status: "live", // "live" | "upcoming" | "completed"
  homeScore: 2,
  awayScore: 1,
  description: "Partido de eliminatorias",
  ticketUrl: "https://...",
  streamUrl: "https://...",
  isHomeTeam: true, // true si Cangrejeras es el equipo local
  votingId: "", // ID de la votación asociada (si existe)
  statistics: {
    home: {
      aces: 5,
      blocks: 3,
      attacks: 25,
      digs: 15
    },
    away: {
      aces: 3,
      blocks: 4,
      attacks: 20,
      digs: 12
    }
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "admin_uid",
  updatedBy: "admin_uid"
}
```

### 💻 Código para la APP - Obtener Partido en Vivo

```typescript
// matchService.ts - Para la APP

import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MatchStats {
  aces: number;
  blocks: number;
  attacks: number;
  digs: number;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'live' | 'upcoming' | 'completed';
  homeScore: number;
  awayScore: number;
  description?: string;
  ticketUrl?: string;
  streamUrl?: string;
  isHomeTeam: boolean;
  votingId?: string;
  statistics?: {
    home: MatchStats;
    away: MatchStats;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const matchService = {
  /**
   * Obtener el partido que está EN VIVO (una sola vez)
   */
  getLiveMatch: async (): Promise<Match | null> => {
    try {
      console.log('🔍 Buscando partido en vivo...');

      const q = query(
        collection(db, 'matches'),
        where('status', '==', 'live')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('❌ No hay partido en vivo');
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      const match: Match = {
        id: doc.id,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        date: data.date,
        time: data.time,
        venue: data.venue,
        status: data.status,
        homeScore: data.homeScore || 0,
        awayScore: data.awayScore || 0,
        description: data.description || '',
        ticketUrl: data.ticketUrl || '',
        streamUrl: data.streamUrl || '',
        isHomeTeam: data.isHomeTeam,
        votingId: data.votingId || '',
        statistics: data.statistics || {
          home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
          away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };

      console.log('✅ Partido en vivo encontrado:', {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: `${match.homeScore}-${match.awayScore}`
      });

      return match;
    } catch (error) {
      console.error('❌ Error obteniendo partido en vivo:', error);
      return null;
    }
  },

  /**
   * Escuchar cambios en el partido en vivo EN TIEMPO REAL
   * ⭐ RECOMENDADO - Se actualiza automáticamente cuando cambia el marcador
   */
  subscribeLiveMatch: (
    onUpdate: (match: Match | null) => void,
    onError?: (error: Error) => void
  ) => {
    console.log('🔄 Iniciando listener de partido en vivo...');

    const q = query(
      collection(db, 'matches'),
      where('status', '==', 'live')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          console.log('❌ No hay partido en vivo');
          onUpdate(null);
          return;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        const match: Match = {
          id: doc.id,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          date: data.date,
          time: data.time,
          venue: data.venue,
          status: data.status,
          homeScore: data.homeScore || 0,
          awayScore: data.awayScore || 0,
          description: data.description || '',
          ticketUrl: data.ticketUrl || '',
          streamUrl: data.streamUrl || '',
          isHomeTeam: data.isHomeTeam,
          votingId: data.votingId || '',
          statistics: data.statistics || {
            home: { aces: 0, blocks: 0, attacks: 0, digs: 0 },
            away: { aces: 0, blocks: 0, attacks: 0, digs: 0 }
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };

        console.log('📊 Partido actualizado:', {
          score: `${match.homeScore}-${match.awayScore}`,
          updatedAt: match.updatedAt
        });

        onUpdate(match);
      },
      (error) => {
        console.error('❌ Error en listener de partido:', error);
        if (onError) onError(error);
      }
    );

    // Retorna función para cancelar la suscripción
    return unsubscribe;
  },

  /**
   * Obtener próximo partido (upcoming)
   */
  getNextMatch: async (): Promise<Match | null> => {
    try {
      const q = query(
        collection(db, 'matches'),
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        date: data.date,
        time: data.time,
        venue: data.venue,
        status: data.status,
        homeScore: data.homeScore || 0,
        awayScore: data.awayScore || 0,
        description: data.description || '',
        ticketUrl: data.ticketUrl || '',
        streamUrl: data.streamUrl || '',
        isHomeTeam: data.isHomeTeam,
        votingId: data.votingId || '',
        statistics: data.statistics,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error obteniendo próximo partido:', error);
      return null;
    }
  },

  /**
   * Obtener todos los partidos completados
   */
  getCompletedMatches: async (limit: number = 10): Promise<Match[]> => {
    try {
      const q = query(
        collection(db, 'matches'),
        where('status', '==', 'completed'),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          date: data.date,
          time: data.time,
          venue: data.venue,
          status: data.status,
          homeScore: data.homeScore || 0,
          awayScore: data.awayScore || 0,
          description: data.description || '',
          ticketUrl: data.ticketUrl || '',
          streamUrl: data.streamUrl || '',
          isHomeTeam: data.isHomeTeam,
          votingId: data.votingId || '',
          statistics: data.statistics,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Error obteniendo partidos completados:', error);
      return [];
    }
  }
};
```

---

## 📱 Ejemplo de Uso en la APP (React Native)

```typescript
import { useEffect, useState } from 'react';
import { matchService, Match } from './services/matchService';

function LiveMatchScreen() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // OPCIÓN 1: Obtener partido una sola vez
    const loadLiveMatch = async () => {
      const match = await matchService.getLiveMatch();
      setLiveMatch(match);
      setLoading(false);
    };
    loadLiveMatch();

    // OPCIÓN 2 (RECOMENDADA): Escuchar cambios en tiempo real
    const unsubscribe = matchService.subscribeLiveMatch(
      (match) => {
        setLiveMatch(match);
        setLoading(false);
      },
      (error) => {
        console.error('Error:', error);
        setLoading(false);
      }
    );

    // Cleanup: cancelar suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Text>Cargando partido...</Text>;
  }

  if (!liveMatch) {
    return <Text>No hay partido en vivo</Text>;
  }

  return (
    <View>
      <Text style={styles.title}>🔴 PARTIDO EN VIVO</Text>
      <Text style={styles.teams}>
        {liveMatch.homeTeam} vs {liveMatch.awayTeam}
      </Text>
      <Text style={styles.score}>
        {liveMatch.homeScore} - {liveMatch.awayScore}
      </Text>
      <Text style={styles.venue}>{liveMatch.venue}</Text>

      {/* Mostrar estadísticas */}
      {liveMatch.statistics && (
        <View>
          <Text>Aces: {liveMatch.statistics.home.aces}</Text>
          <Text>Blocks: {liveMatch.statistics.home.blocks}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## 🗳️ 2. CONSULTAR VOTACIÓN DEL PARTIDO EN VIVO

Una vez que tienes el partido en vivo, necesitas obtener la votación asociada.

### 📊 Colección en Firestore

**Colección:** `live_polls`

**Query:** `where('matchId', '==', matchId) AND where('isActive', '==', true)`

### 💻 Código para Obtener Votación

```typescript
// liveVotingService.ts - Para la APP

import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PollOption {
  playerId: number;
  votes: number;
  percentage: number;
}

export interface LivePoll {
  id: string;
  matchId: string; // ID del partido
  title: string;
  description: string;
  isActive: boolean;
  startedAt: Date | null;
  closedAt: Date | null;
  options: PollOption[];
  totalVotes: number;
  createdBy: string;
}

export const liveVotingService = {
  /**
   * Obtener votación activa para un partido
   */
  getPollByMatch: async (matchId: string): Promise<LivePoll | null> => {
    try {
      console.log('🔍 Buscando votación para partido:', matchId);

      const q = query(
        collection(db, 'live_polls'),
        where('matchId', '==', matchId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('❌ No hay votación activa para este partido');
        return null;
      }

      const pollDoc = snapshot.docs[0];
      const data = pollDoc.data();

      const poll: LivePoll = {
        id: pollDoc.id,
        matchId: data.matchId,
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        startedAt: data.startedAt?.toDate() || null,
        closedAt: data.closedAt?.toDate() || null,
        options: data.options || [],
        totalVotes: data.totalVotes || 0,
        createdBy: data.createdBy
      };

      console.log('✅ Votación encontrada:', {
        id: poll.id,
        title: poll.title,
        totalVotes: poll.totalVotes
      });

      return poll;
    } catch (error) {
      console.error('❌ Error obteniendo votación:', error);
      return null;
    }
  },

  /**
   * Escuchar cambios en la votación EN TIEMPO REAL
   * ⭐ RECOMENDADO - Se actualiza cuando alguien vota
   */
  subscribeToPoll: (
    pollId: string,
    onUpdate: (poll: LivePoll) => void,
    onError?: (error: Error) => void
  ) => {
    console.log('🔄 Iniciando listener de votación:', pollId);

    const pollRef = doc(db, 'live_polls', pollId);

    const unsubscribe = onSnapshot(
      pollRef,
      (doc) => {
        if (!doc.exists()) {
          console.log('❌ Votación no encontrada');
          return;
        }

        const data = doc.data();

        const poll: LivePoll = {
          id: doc.id,
          matchId: data.matchId,
          title: data.title,
          description: data.description,
          isActive: data.isActive,
          startedAt: data.startedAt?.toDate() || null,
          closedAt: data.closedAt?.toDate() || null,
          options: data.options || [],
          totalVotes: data.totalVotes || 0,
          createdBy: data.createdBy
        };

        console.log('📊 Votación actualizada - Total votos:', poll.totalVotes);
        onUpdate(poll);
      },
      (error) => {
        console.error('❌ Error en listener de votación:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  },

  /**
   * Verificar si el usuario ya votó
   */
  hasUserVoted: async (userId: string, matchId: string): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'votes'),
        where('userId', '==', userId),
        where('matchId', '==', matchId)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error verificando voto:', error);
      return false;
    }
  },

  /**
   * Emitir voto (TRANSACCIÓN ATÓMICA)
   */
  castVote: async (
    pollId: string,
    matchId: string,
    userId: string,
    playerId: number
  ): Promise<void> => {
    try {
      console.log('🗳️ Registrando voto...', { pollId, userId, playerId });

      // Verificar si ya votó
      const hasVoted = await liveVotingService.hasUserVoted(userId, matchId);
      if (hasVoted) {
        throw new Error('Ya has votado en este partido');
      }

      // Usar transacción para garantizar consistencia
      await runTransaction(db, async (transaction) => {
        const pollRef = doc(db, 'live_polls', pollId);
        const pollDoc = await transaction.get(pollRef);

        if (!pollDoc.exists()) {
          throw new Error('Votación no encontrada');
        }

        const pollData = pollDoc.data();

        if (!pollData.isActive) {
          throw new Error('La votación está cerrada');
        }

        // Actualizar votos de la opción
        const options = pollData.options || [];
        const updatedOptions = options.map((option: PollOption) => {
          if (option.playerId === playerId) {
            return {
              ...option,
              votes: option.votes + 1
            };
          }
          return option;
        });

        // Recalcular porcentajes
        const newTotalVotes = pollData.totalVotes + 1;
        const optionsWithPercentage = updatedOptions.map((option: PollOption) => ({
          ...option,
          percentage: (option.votes / newTotalVotes) * 100
        }));

        // Actualizar documento de la votación
        transaction.update(pollRef, {
          options: optionsWithPercentage,
          totalVotes: newTotalVotes
        });

        // Registrar voto individual
        const voteRef = doc(collection(db, 'votes'));
        transaction.set(voteRef, {
          pollId,
          matchId,
          userId,
          playerId,
          votedAt: new Date()
        });
      });

      console.log('✅ Voto registrado exitosamente');
    } catch (error: any) {
      console.error('❌ Error registrando voto:', error);
      throw new Error(error.message || 'Error al votar');
    }
  }
};
```

---

## 📱 Ejemplo de Uso - Pantalla de Votación

```typescript
import { useEffect, useState } from 'react';
import { matchService, liveVotingService } from './services';

function VotingScreen({ userId }: { userId: string }) {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [poll, setPoll] = useState<LivePoll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener partido en vivo
    const unsubscribeMatch = matchService.subscribeLiveMatch(
      async (match) => {
        setLiveMatch(match);

        if (match) {
          // 2. Obtener votación del partido
          const pollData = await liveVotingService.getPollByMatch(match.id);
          setPoll(pollData);

          // 3. Verificar si ya votó
          if (pollData) {
            const voted = await liveVotingService.hasUserVoted(userId, match.id);
            setHasVoted(voted);
          }
        }

        setLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribeMatch();
  }, [userId]);

  // Escuchar cambios en la votación en tiempo real
  useEffect(() => {
    if (!poll) return;

    const unsubscribe = liveVotingService.subscribeToPoll(
      poll.id,
      (updatedPoll) => {
        setPoll(updatedPoll);
      }
    );

    return () => unsubscribe();
  }, [poll?.id]);

  const handleVote = async (playerId: number) => {
    if (!liveMatch || !poll) return;

    try {
      await liveVotingService.castVote(
        poll.id,
        liveMatch.id,
        userId,
        playerId
      );
      setHasVoted(true);
      Alert.alert('¡Voto registrado!', 'Gracias por votar');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <Text>Cargando...</Text>;

  if (!liveMatch) {
    return <Text>No hay partido en vivo</Text>;
  }

  if (!poll) {
    return <Text>No hay votación activa</Text>;
  }

  if (hasVoted) {
    return (
      <View>
        <Text>Ya has votado. Gracias por participar!</Text>
        {/* Mostrar resultados */}
        {poll.options.map(option => (
          <View key={option.playerId}>
            <Text>Jugadora #{option.playerId}</Text>
            <Text>{option.votes} votos ({option.percentage.toFixed(1)}%)</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.title}>{poll.title}</Text>
      <Text>{poll.description}</Text>

      {poll.options.map(option => (
        <TouchableOpacity
          key={option.playerId}
          onPress={() => handleVote(option.playerId)}
        >
          <Text>Votar por Jugadora #{option.playerId}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

---

## 📊 3. OBTENER DATOS DE JUGADORAS

### Colección: `players`

**Query:** `where('status', '==', 'active') AND orderBy('number', 'asc')`

```typescript
// playerService.ts - Para la APP

import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Player {
  id: string;
  name: string;
  lastName: string;
  number: number;
  position: string;
  height: string;
  photo: string;
  bio: string;
  status: 'active' | 'inactive';
  points: number;
  aces: number;
  blocks: number;
  team: string;
  league: string;
  season: string;
}

export const playerService = {
  /**
   * Obtener todas las jugadoras activas
   */
  getActivePlayers: async (): Promise<Player[]> => {
    try {
      const q = query(
        collection(db, 'players'),
        where('status', '==', 'active'),
        orderBy('number', 'asc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          lastName: data.lastName,
          number: data.number,
          position: data.position,
          height: data.height,
          photo: data.photo || '',
          bio: data.bio || '',
          status: data.status,
          points: data.points || 0,
          aces: data.aces || 0,
          blocks: data.blocks || 0,
          team: data.team,
          league: data.league,
          season: data.season
        };
      });
    } catch (error) {
      console.error('Error obteniendo jugadoras:', error);
      return [];
    }
  },

  /**
   * Obtener jugadora por ID
   */
  getPlayer: async (playerId: string): Promise<Player | null> => {
    try {
      const playerRef = doc(db, 'players', playerId);
      const playerSnap = await getDoc(playerRef);

      if (!playerSnap.exists()) {
        return null;
      }

      const data = playerSnap.data();
      return {
        id: playerSnap.id,
        name: data.name,
        lastName: data.lastName,
        number: data.number,
        position: data.position,
        height: data.height,
        photo: data.photo || '',
        bio: data.bio || '',
        status: data.status,
        points: data.points || 0,
        aces: data.aces || 0,
        blocks: data.blocks || 0,
        team: data.team,
        league: data.league,
        season: data.season
      };
    } catch (error) {
      console.error('Error obteniendo jugadora:', error);
      return null;
    }
  }
};
```

---

## 🎯 RESUMEN DEL FLUJO COMPLETO EN LA APP

### 1️⃣ Al abrir la APP:
```typescript
// 1. Consultar partido en vivo
const liveMatch = await matchService.getLiveMatch();

// 2. Si hay partido en vivo, obtener la votación
if (liveMatch) {
  const poll = await liveVotingService.getPollByMatch(liveMatch.id);

  // 3. Verificar si el usuario ya votó
  const hasVoted = await liveVotingService.hasUserVoted(userId, liveMatch.id);

  // 4. Obtener datos de las jugadoras para mostrar en la votación
  const players = await playerService.getActivePlayers();
}
```

### 2️⃣ Escuchar en tiempo real (RECOMENDADO):
```typescript
// Listener del partido (se actualiza cuando cambia el marcador)
const unsubMatch = matchService.subscribeLiveMatch((match) => {
  setLiveMatch(match);
});

// Listener de la votación (se actualiza cuando alguien vota)
const unsubPoll = liveVotingService.subscribeToPoll(pollId, (poll) => {
  setPoll(poll);
});

// Cleanup al desmontar
return () => {
  unsubMatch();
  unsubPoll();
};
```

### 3️⃣ Emitir voto:
```typescript
await liveVotingService.castVote(
  pollId,      // ID de la votación
  matchId,     // ID del partido
  userId,      // ID del usuario (Firebase Auth)
  playerId     // ID de la jugadora (número 1-14)
);
```

---

## ✅ CHECKLIST PARA LA APP

- [ ] Configurar Firebase con las credenciales proporcionadas
- [ ] Crear `matchService.ts` con funciones para consultar partidos
- [ ] Crear `liveVotingService.ts` con funciones para consultar votaciones
- [ ] Crear `playerService.ts` con funciones para consultar jugadoras
- [ ] Crear `userService.ts` para gestionar usuarios (registro, login)
- [ ] Implementar listeners en tiempo real para partido y votación
- [ ] Implementar pantalla de votación con validación de voto único
- [ ] Implementar pantalla de resultados en tiempo real
- [ ] Agregar notificaciones push cuando hay partido en vivo
- [ ] Agregar notificaciones push cuando se abre una votación

---

## 🔒 REGLAS DE SEGURIDAD IMPORTANTES

- ✅ **Lectura:** Todos pueden leer partidos, votaciones y jugadoras
- ✅ **Escritura en votaciones:** Solo usuarios autenticados pueden votar
- ✅ **Un voto por usuario:** Validar en la colección `votes`
- ✅ **Transacciones:** Usar `runTransaction()` para votos (previene duplicados)
- ❌ **Crear/editar partidos:** Solo admins desde el Dashboard

---

## 📞 SOPORTE

Si necesitas más detalles sobre alguna funcionalidad, consulta el código fuente del Dashboard en:
- `src/services/matchService.ts` - Gestión de partidos
- `src/services/liveVotingService.ts` - Sistema de votaciones
- `src/services/playerService.ts` - Gestión de jugadoras
- `src/contexts/MatchContext.tsx` - Lógica de partidos en vivo
- `src/contexts/VotingContext.tsx` - Lógica de votaciones

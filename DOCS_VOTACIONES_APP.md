# 📱 Documentación: Obtener Jugadoras de Votación Activa

## 🎯 Objetivo
Obtener el listado de jugadoras disponibles para votar en una votación activa desde la App móvil.

---

## ✅ CAMBIO IMPORTANTE (2025-01-23)

**`playerId` ahora usa el Document ID (string) en vez del número de camiseta (number)**

### ¿Por qué este cambio?

- **Más robusto**: No depende de que los admins asignen números correctamente
- **Sin conflictos**: Cada jugadora tiene un ID único garantizado por Firestore
- **Más escalable**: No hay riesgo de IDs duplicados o en 0

### Antes vs Después

```typescript
// ❌ ANTES (número de camiseta)
{
  playerId: 5,        // número de camiseta
  votes: 10
}

// ✅ AHORA (document ID)
{
  playerId: "abc123def456",  // ID del documento en Firestore
  votes: 10
}
```

---

## 📊 Estructura de Datos

### Colección: `live_polls`
Cada votación activa se almacena en Firestore con la siguiente estructura:

```typescript
{
  id: string,                    // ID del documento (ej: "abc123xyz")
  matchId: string | number,      // ID del partido asociado
  title: string,                 // "MVP del Partido"
  description: string,           // Descripción de la votación
  isActive: boolean,             // true si está activa, false si cerrada
  startedAt: Timestamp,          // Fecha/hora de inicio
  closedAt: Timestamp | null,    // Fecha/hora de cierre (null si está activa)
  options: [                     // Array de opciones (jugadoras)
    {
      playerId: string,          // ✅ ID del documento de la jugadora en Firestore
      votes: number,             // Cantidad de votos
      percentage: number         // Porcentaje de votos (calculado)
    }
  ],
  totalVotes: number,            // Total de votos registrados
  createdBy: string              // UID del admin que creó la votación
}
```

### Colección: `players`
Información de las jugadoras:

```typescript
{
  id: string,                    // ✅ ID del documento (ESTE es el playerId en votaciones)
  name: string,                  // Nombre
  lastName: string,              // Apellido
  number: number,                // Número de camiseta (solo para mostrar en UI)
  position: string,              // Posición (ej: "Libero", "Opuesto")
  photo: string,                 // URL de la foto
  status: "active" | "inactive", // Estado de la jugadora
  // ... otros campos
}
```

---

## 🔍 Paso a Paso: Obtener Jugadoras de Votación Activa

### **Paso 1: Obtener la votación activa del partido**

```typescript
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase'; // Tu configuración de Firebase

// Obtener votación activa por matchId
const getActivePollByMatch = async (matchId: string | number) => {
  const q = query(
    collection(db, 'live_polls'),
    where('matchId', '==', matchId),
    where('isActive', '==', true)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('No hay votación activa para este partido');
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
    options: data.options || [],
    totalVotes: data.totalVotes || 0,
    startedAt: data.startedAt?.toDate(),
    closedAt: data.closedAt?.toDate() || null
  };
};
```

### **Paso 2: Obtener información de las jugadoras usando los playerIds**

```typescript
// ✅ NUEVO: Obtener jugadora por document ID
const getPlayerById = async (playerId: string) => {
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);

  if (!playerSnap.exists()) {
    console.warn(`⚠️ Jugadora con ID ${playerId} no encontrada`);
    return null;
  }

  const data = playerSnap.data();
  return {
    id: playerSnap.id,
    name: data.name,
    lastName: data.lastName,
    number: data.number,
    position: data.position,
    photo: data.photo || '',
    status: data.status
  };
};
```

### **Paso 3: Combinar votación con información de jugadoras**

```typescript
// ✅ Función completa para obtener jugadoras con sus votos
const getVotingPlayersWithInfo = async (matchId: string | number) => {
  // 1. Obtener la votación activa
  const poll = await getActivePollByMatch(matchId);

  if (!poll) {
    return { poll: null, players: [] };
  }

  // 2. Obtener información de cada jugadora usando su document ID
  const playersWithVotes = await Promise.all(
    poll.options.map(async (option) => {
      const player = await getPlayerById(option.playerId);

      if (!player) {
        console.warn(`⚠️ Jugadora con ID ${option.playerId} no encontrada`);
        return null;
      }

      return {
        playerId: option.playerId,      // Document ID (string)
        name: player.name,
        lastName: player.lastName,
        fullName: `${player.name} ${player.lastName}`,
        number: player.number,          // Número de camiseta (para mostrar)
        position: player.position,
        photo: player.photo,
        votes: option.votes,
        percentage: option.percentage || 0
      };
    })
  );

  // 3. Filtrar jugadoras no encontradas y ordenar por votos
  const validPlayers = playersWithVotes
    .filter(p => p !== null)
    .sort((a, b) => b.votes - a.votes);

  return {
    poll,
    players: validPlayers
  };
};
```

---

## 💡 Ejemplo Completo de Uso en React Native

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';

const VotingScreen = ({ matchId }) => {
  const [votingData, setVotingData] = useState({ poll: null, players: [] });
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadVotingData();
  }, [matchId]);

  const loadVotingData = async () => {
    try {
      setLoading(true);
      const data = await getVotingPlayersWithInfo(matchId);
      setVotingData(data);

      if (!data.poll) {
        console.log('No hay votación activa');
      }
    } catch (error) {
      console.error('Error cargando votación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (playerId: string) => {
    if (hasVoted) {
      alert('Ya has votado en esta votación');
      return;
    }

    try {
      // ✅ playerId ahora es el document ID (string)
      await castVote(
        votingData.poll.id,
        matchId,
        userId,  // Tu userId de Firebase Auth
        playerId  // Document ID de la jugadora
      );

      setHasVoted(true);
      loadVotingData(); // Recargar datos actualizados
      alert('¡Voto registrado exitosamente!');
    } catch (error) {
      console.error('Error votando:', error);
      alert(error.message);
    }
  };

  const renderPlayer = ({ item }) => (
    <TouchableOpacity
      style={styles.playerCard}
      onPress={() => handleVote(item.playerId)}
      disabled={hasVoted}
    >
      <Image source={{ uri: item.photo }} style={styles.playerPhoto} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          #{item.number} {item.fullName}
        </Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
        <Text style={styles.playerVotes}>
          {item.votes} votos ({item.percentage.toFixed(1)}%)
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text>Cargando votación...</Text>;
  }

  if (!votingData.poll) {
    return <Text>No hay votación activa para este partido</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{votingData.poll.title}</Text>
      <Text style={styles.description}>{votingData.poll.description}</Text>
      <Text style={styles.totalVotes}>
        Total de votos: {votingData.poll.totalVotes}
      </Text>

      <FlatList
        data={votingData.players}
        keyExtractor={(item) => item.playerId}  // ✅ Usar playerId como key
        renderItem={renderPlayer}
      />
    </View>
  );
};

export default VotingScreen;
```

---

## 🔥 Función para Votar

```typescript
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

const castVote = async (
  pollId: string,
  matchId: string | number,
  userId: string,
  playerId: string  // ✅ Ahora recibe document ID (string)
) => {
  try {
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

      // Actualizar contador de la jugadora votada
      const updatedOptions = pollData.options.map((opt) =>
        opt.playerId === playerId
          ? { ...opt, votes: opt.votes + 1 }
          : opt
      );

      // Recalcular porcentajes
      const newTotalVotes = pollData.totalVotes + 1;
      const optionsWithPercentage = updatedOptions.map((opt) => ({
        ...opt,
        percentage: (opt.votes / newTotalVotes) * 100
      }));

      // Actualizar votación
      transaction.update(pollRef, {
        options: optionsWithPercentage,
        totalVotes: newTotalVotes
      });

      // Crear registro de voto
      const voteRef = doc(collection(db, 'votes'));
      transaction.set(voteRef, {
        pollId,
        matchId,
        userId,
        playerId,  // ✅ Guardamos el document ID (string)
        createdAt: serverTimestamp()
      });
    });

    console.log('✅ Voto registrado exitosamente');
  } catch (error) {
    console.error('❌ Error al votar:', error);
    throw error;
  }
};
```

---

## 🐛 Debugging: Verificar Estructura

```typescript
// Función de debugging para verificar la estructura
const debugVotingData = async (matchId: string | number) => {
  console.log('🔍 === DEBUGGING VOTACIÓN ===');

  const poll = await getActivePollByMatch(matchId);

  if (!poll) {
    console.log('❌ No hay votación activa');
    return;
  }

  console.log('✅ Votación encontrada:', poll.id);
  console.log('📊 Opciones (playerIds):');

  for (const option of poll.options) {
    console.log(`  - playerId: ${option.playerId} (tipo: ${typeof option.playerId})`);

    // Verificar si es string (correcto) o number (antiguo)
    if (typeof option.playerId === 'string') {
      console.log('    ✅ Formato correcto (document ID)');

      // Intentar obtener la jugadora
      const player = await getPlayerById(option.playerId);
      if (player) {
        console.log(`    ✅ Jugadora encontrada: #${player.number} ${player.name} ${player.lastName}`);
      } else {
        console.log(`    ❌ Jugadora NO encontrada con ID: ${option.playerId}`);
      }
    } else if (typeof option.playerId === 'number') {
      console.log('    ⚠️ Formato antiguo (número de camiseta)');
      console.log('    ⚠️ Esta votación fue creada antes del cambio. Debe recrearse.');
    }
  }
};

// Usar en desarrollo:
await debugVotingData(matchId);
```

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: "Jugadora no encontrada"
**Causa**: Intentas obtener una jugadora con un playerId que no existe.
**Solución**: Verifica que el playerId en `live_polls` sea un document ID válido de la colección `players`.

```typescript
// ✅ Correcto
const player = await getPlayerById("abc123def456");

// ❌ Incorrecto (antiguo sistema con números)
const player = await getPlayerById(5);
```

### Error 2: "TypeError: playerId.toString is not a function"
**Causa**: Estás asumiendo que playerId es un número.
**Solución**: playerId ahora es string, úsalo directamente.

```typescript
// ✅ Correcto
<FlatList
  data={players}
  keyExtractor={(item) => item.playerId}  // Ya es string
/>

// ❌ Incorrecto
<FlatList
  data={players}
  keyExtractor={(item) => item.playerId.toString()}  // No necesario
/>
```

### Error 3: Votaciones viejas con playerId numérico
**Causa**: La votación fue creada antes del cambio a document IDs.
**Solución**: Elimina la votación vieja y crea una nueva desde el Dashboard.

---

## ✅ Checklist de Implementación

- [ ] Actualizar función `getActivePollByMatch` para manejar `playerId` como string
- [ ] Crear función `getPlayerById(playerId: string)` usando `doc(db, 'players', playerId)`
- [ ] Actualizar función `castVote` para recibir `playerId: string`
- [ ] Eliminar cualquier lógica que asuma `playerId` es un número
- [ ] Verificar que los keys de FlatList usen el document ID directamente
- [ ] Probar con votación nueva creada después del cambio
- [ ] Manejar votaciones antiguas (mostrar mensaje de que deben recrearse)

---

## 📌 Resumen de Cambios

| Aspecto | Antes (número) | Ahora (document ID) |
|---------|----------------|---------------------|
| **Tipo** | `number` | `string` |
| **Ejemplo** | `5` | `"abc123def456"` |
| **Obtener jugadora** | Buscar por `number` | Buscar por document ID |
| **Ventaja** | Muestra número de camiseta | ID único garantizado, más robusto |
| **Desventaja** | Puede ser 0 si no está configurado | IDs largos (pero automáticos) |

---

## 🚀 ¿Necesitas Ayuda?

Si tienes problemas implementando esta lógica en tu App, revisa los logs de debugging y verifica:

1. ¿El `playerId` en `live_polls` es un string?
2. ¿Ese string existe como document ID en la colección `players`?
3. ¿La votación fue creada después del 23 de enero de 2025?

---

**Última actualización**: 23 de enero de 2025
**Dashboard CMS Cangrejeras - Sistema de Votaciones en Vivo**

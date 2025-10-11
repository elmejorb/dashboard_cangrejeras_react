# 🌟 Guía de Jugadoras Favoritas - Sistema de Múltiples Favoritas

Esta guía explica cómo funciona el sistema de jugadoras favoritas para los usuarios de la app.

---

## 📊 Estructura Actualizada

### Colección `users/` (Fans de la App)

```typescript
users/{userId}
  ├── displayName: string             // "Juan Pérez"
  ├── email: string                   // "juan@example.com"
  ├── photoURL: string                // URL del avatar
  ├── favoritePlayers: string[]       // ["player_001", "player_003", "player_005"]
  ├── favoriteTeam: string            // "Cangrejeras de Santurce"
  ├── preferences: {
  │     notifications: boolean        // Recibir notificaciones
  │     emailUpdates: boolean         // Recibir emails
  │     language: string              // "es" | "en"
  │   }
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  ├── lastActivity: timestamp
  ├── isActive: boolean
  └── votesCount: number
```

---

## ✅ Cambios Principales

### ❌ Antes (Una sola favorita):
```typescript
favoritePlayer: "player_001"  // Solo 1 jugadora
```

### ✅ Ahora (Múltiples favoritas):
```typescript
favoritePlayers: ["player_001", "player_003", "player_005"]  // Sin límite
```

---

## 🎯 Funcionalidades del Sistema

### 1. Agregar Jugadora Favorita

```typescript
import { fanUserService } from './services/fanUserService';

// Agregar una jugadora a favoritas
await fanUserService.addFavoritePlayer(userId, playerId);
```

**Características:**
- ✅ Sin límite de jugadoras favoritas
- ✅ No permite duplicados (Firestore `arrayUnion` lo maneja)
- ✅ Actualiza automáticamente `updatedAt` y `lastActivity`

---

### 2. Eliminar Jugadora Favorita

```typescript
// Eliminar una jugadora de favoritas
await fanUserService.removeFavoritePlayer(userId, playerId);
```

---

### 3. Verificar si es Favorita

```typescript
// Verificar si una jugadora está en favoritas
const isFavorite = await fanUserService.isFavoritePlayer(userId, playerId);

if (isFavorite) {
  // Mostrar corazón relleno ❤️
} else {
  // Mostrar corazón vacío 🤍
}
```

---

### 4. Obtener Todas las Favoritas

```typescript
// Obtener array de IDs de jugadoras favoritas
const favoritePlayers = await fanUserService.getFavoritePlayers(userId);
// Resultado: ["player_001", "player_003", "player_005"]
```

---

## 💡 Casos de Uso

### 1. **Pantalla de Perfil**
Mostrar todas las jugadoras favoritas del usuario:

```typescript
const user = await fanUserService.getFanUser(userId);
const favoritePlayerIds = user.favoritePlayers;

// Obtener información completa de cada jugadora
const favoritePlayers = await Promise.all(
  favoritePlayerIds.map(playerId => playerService.getPlayer(playerId))
);

// Mostrar grid de jugadoras favoritas
```

---

### 2. **Tarjeta de Jugadora (Toggle Favorita)**

```typescript
const handleToggleFavorite = async (playerId: string) => {
  const isFavorite = await fanUserService.isFavoritePlayer(userId, playerId);

  if (isFavorite) {
    // Eliminar de favoritas
    await fanUserService.removeFavoritePlayer(userId, playerId);
    toast.success('Eliminada de favoritas');
  } else {
    // Agregar a favoritas
    await fanUserService.addFavoritePlayer(userId, playerId);
    toast.success('Agregada a favoritas ❤️');
  }
};
```

**UI:**
```tsx
<button onClick={() => handleToggleFavorite(player.id)}>
  {isFavorite ? '❤️' : '🤍'}
</button>
```

---

### 3. **Feed Personalizado**
Mostrar contenido relacionado con las jugadoras favoritas:

```typescript
const user = await fanUserService.getFanUser(userId);

// Obtener noticias de jugadoras favoritas
const personalizedNews = await newsService.getNewsByPlayers(
  user.favoritePlayers
);

// Obtener estadísticas de jugadoras favoritas
const favoritePlayersStats = await Promise.all(
  user.favoritePlayers.map(playerId =>
    playerService.getPlayerStats(playerId)
  )
);
```

---

### 4. **Notificaciones Push**
Enviar notificaciones cuando una jugadora favorita destaca:

```typescript
// En el dashboard, cuando se actualiza MVP
const mvpPlayer = await playerService.getPlayer(mvpPlayerId);

// Obtener usuarios que tienen a esta jugadora como favorita
const fans = await fanUserService.getUsersByFavoritePlayer(mvpPlayerId);

// Enviar notificación solo a esos fans
fans.forEach(fan => {
  if (fan.preferences.notifications) {
    sendPushNotification(fan.id, {
      title: `¡${mvpPlayer.name} es MVP!`,
      body: 'Tu jugadora favorita fue elegida MVP del partido',
      icon: mvpPlayer.photoURL
    });
  }
});
```

---

### 5. **Estadísticas para el Dashboard**

```typescript
// Jugadora más popular
const mostPopularPlayer = await analytics.getMostFavoritedPlayer();

// Cuántos fans tiene cada jugadora
const playerFansCount = await Promise.all(
  allPlayers.map(async (player) => ({
    playerId: player.id,
    name: player.name,
    fansCount: (await fanUserService.getUsersByFavoritePlayer(player.id)).length
  }))
);
```

---

## 🎨 Ejemplo de UI - Selector de Favoritas

```tsx
import { useState, useEffect } from 'react';
import { fanUserService } from '@/services/fanUserService';
import { playerService } from '@/services/playerService';

function FavoritePlayersScreen({ userId }) {
  const [players, setPlayers] = useState([]);
  const [favoritePlayers, setFavoritePlayers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar todas las jugadoras
    const allPlayers = await playerService.getAllPlayers();
    setPlayers(allPlayers);

    // Cargar favoritas del usuario
    const favorites = await fanUserService.getFavoritePlayers(userId);
    setFavoritePlayers(favorites);
  };

  const toggleFavorite = async (playerId) => {
    const isFavorite = favoritePlayers.includes(playerId);

    if (isFavorite) {
      await fanUserService.removeFavoritePlayer(userId, playerId);
      setFavoritePlayers(prev => prev.filter(id => id !== playerId));
    } else {
      await fanUserService.addFavoritePlayer(userId, playerId);
      setFavoritePlayers(prev => [...prev, playerId]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {players.map(player => {
        const isFavorite = favoritePlayers.includes(player.id);

        return (
          <div key={player.id} className="relative">
            <img src={player.photoURL} alt={player.name} />
            <h3>{player.name}</h3>
            <p>{player.position}</p>

            <button
              onClick={() => toggleFavorite(player.id)}
              className={`absolute top-2 right-2 ${
                isFavorite ? 'text-red-500' : 'text-gray-300'
              }`}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 📱 Ejemplo en React Native (App Móvil)

```tsx
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { fanUserService } from './services/fanUserService';

function PlayerCard({ player, userId }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, []);

  const checkFavorite = async () => {
    const favorite = await fanUserService.isFavoritePlayer(userId, player.id);
    setIsFavorite(favorite);
  };

  const handleToggle = async () => {
    if (isFavorite) {
      await fanUserService.removeFavoritePlayer(userId, player.id);
    } else {
      await fanUserService.addFavoritePlayer(userId, player.id);
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: player.photoURL }} style={styles.photo} />
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.position}>{player.position}</Text>

      <TouchableOpacity onPress={handleToggle} style={styles.favoriteBtn}>
        <Text style={styles.heart}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 🔥 Ventajas del Sistema de Múltiples Favoritas

1. ✅ **Mejor Experiencia de Usuario**
   - Los fans pueden seguir a todas sus jugadoras favoritas
   - No hay limitación arbitraria

2. ✅ **Feed Personalizado**
   - Mostrar contenido relevante según favoritas
   - Noticias, estadísticas, highlights

3. ✅ **Notificaciones Inteligentes**
   - Solo notificar sobre jugadoras favoritas
   - Reduce el spam de notificaciones

4. ✅ **Analytics Mejorados**
   - Saber qué jugadoras son más populares
   - Entender preferencias de los fans

5. ✅ **Engagement**
   - Los fans se sienten más conectados
   - Mayor interacción con la app

---

## 📊 Queries Útiles para Analytics

### Jugadora más popular:
```typescript
const players = await playerService.getAllPlayers();

const popularityData = await Promise.all(
  players.map(async (player) => {
    const fans = await fanUserService.getUsersByFavoritePlayer(player.id);
    return {
      player: player.name,
      fansCount: fans.length
    };
  })
);

// Ordenar por popularidad
popularityData.sort((a, b) => b.fansCount - a.fansCount);
```

### Promedio de favoritas por usuario:
```typescript
const allUsers = await fanUserService.getAllActiveUsers();
const totalFavorites = allUsers.reduce((sum, user) =>
  sum + user.favoritePlayers.length, 0
);
const average = totalFavorites / allUsers.length;
```

---

## 🚀 Próximos Pasos

1. ✅ Implementar UI para agregar/eliminar favoritas
2. ✅ Crear pantalla de "Mis Favoritas"
3. 🔜 Implementar feed personalizado
4. 🔜 Configurar notificaciones push
5. 🔜 Analytics de jugadoras más populares

---

**Archivos Relacionados:**
- [fanUserService.ts](src/services/fanUserService.ts) - Servicio completo con todas las funciones
- [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md) - Estructura completa de Firestore
- [firestore.rules](firestore.rules) - Reglas de seguridad

¿Necesitas ayuda implementando alguna de estas funcionalidades? 🚀

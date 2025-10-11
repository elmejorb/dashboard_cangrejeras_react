# Guía de Firestore para Jugadoras (Players Collection)

## Estructura de la Colección

### Colección Principal: `players/`

```
players/
  {playerId}/
    - name: string                  // Nombre de la jugadora
    - lastName: string              // Apellido de la jugadora
    - number: number                // Número de camiseta
    - position: string              // Posición (Opuesta, Esquina, Central, Líbero, Levantadora)
    - height: string                // Altura (ej: "1.82m")
    - points: number                // Total de puntos
    - aces: number                  // Total de aces
    - blocks: number                // Total de bloqueos
    - status: string                // Estado: 'active' | 'inactive'
    - photo: string                 // URL de la foto (Firebase Storage)
    - bio: string                   // Biografía de la jugadora
    - gamesPlayed: number           // Partidos jugados
    - gamesWon: number              // Partidos ganados
    - avgPerGame: number            // Promedio por partido
    - attacks: number               // Total de ataques
    - effectiveness: number         // Efectividad (%)
    - team: string                  // Equipo (ej: "Cangrejeras de Santurce")
    - league: string                // Liga (ej: "Liga Superior Femenina")
    - season: string                // Temporada (ej: "2025-2026")
    - createdAt: Timestamp          // Fecha de creación
    - updatedAt: Timestamp          // Fecha de última actualización
    - createdBy: string             // ID del admin que creó el registro
    - updatedBy: string             // ID del admin que hizo la última actualización
```

## Documento de Ejemplo

```json
{
  "name": "Andrea",
  "lastName": "Rangel",
  "number": 15,
  "position": "Opuesta",
  "height": "1.82m",
  "points": 245,
  "aces": 32,
  "blocks": 18,
  "status": "active",
  "photo": "https://firebasestorage.googleapis.com/v0/b/cangrejeras-de-santurce.appspot.com/o/players%2F123456%2Fprofile.jpg?alt=media",
  "bio": "Jugadora destacada con amplia experiencia en la Liga Superior Femenina.",
  "gamesPlayed": 24,
  "gamesWon": 18,
  "avgPerGame": 10.2,
  "attacks": 450,
  "effectiveness": 54.5,
  "team": "Cangrejeras de Santurce",
  "league": "Liga Superior Femenina",
  "season": "2025-2026",
  "createdAt": "2025-10-09T10:30:00Z",
  "updatedAt": "2025-10-09T15:45:00Z",
  "createdBy": "HKUxahGBO2ZvW5iSesDdj9ArB2a2",
  "updatedBy": "HKUxahGBO2ZvW5iSesDdj9ArB2a2"
}
```

## Métodos del Servicio (playerService)

### Crear Jugadora
```typescript
import { playerService } from '../services/playerService';
import { useAuth } from '../contexts/AuthContext';

const { currentUser } = useAuth();

const newPlayer = await playerService.createPlayer({
  name: 'Andrea',
  lastName: 'Rangel',
  number: 15,
  position: 'Opuesta',
  height: '1.82m',
  status: 'active',
  team: 'Cangrejeras de Santurce',
  league: 'Liga Superior Femenina',
  season: '2025-2026',
  points: 0,
  aces: 0,
  blocks: 0
}, currentUser.id);
```

### Obtener Todas las Jugadoras
```typescript
// Sin filtros
const allPlayers = await playerService.getAllPlayers();

// Con filtros
const activePlayers = await playerService.getAllPlayers({
  status: 'active',
  season: '2025-2026'
});

// Por posición
const opposites = await playerService.getPlayersByPosition('Opuesta');

// Solo activas
const active = await playerService.getActivePlayers();
```

### Obtener Una Jugadora
```typescript
const player = await playerService.getPlayer('playerId123');
```

### Actualizar Jugadora
```typescript
await playerService.updatePlayer('playerId123', {
  name: 'Andrea',
  lastName: 'Rangel Martinez',
  bio: 'Nueva biografía actualizada'
}, currentUser.id);
```

### Actualizar Estadísticas
```typescript
await playerService.updatePlayerStats('playerId123', {
  points: 250,
  aces: 35,
  blocks: 20,
  gamesPlayed: 25,
  effectiveness: 55.2
}, currentUser.id);
```

### Actualizar Foto
```typescript
// Primero subir la foto a Storage
import { storageService } from '../services/storageService';

const photoURL = await storageService.uploadPlayerPhoto(
  'playerId123',
  photoFile,
  (progress) => console.log(`${progress.progress}%`)
);

// Luego actualizar el documento
await playerService.updatePlayerPhoto('playerId123', photoURL, currentUser.id);
```

### Cambiar Estado (Activa/Inactiva)
```typescript
await playerService.togglePlayerStatus('playerId123', currentUser.id);
```

### Eliminar Jugadora
```typescript
await playerService.deletePlayer('playerId123');
```

### Estadísticas del Equipo
```typescript
const teamStats = await playerService.getTeamStats('2025-2026');
console.log(teamStats);
// {
//   totalPlayers: 15,
//   activePlayers: 13,
//   inactivePlayers: 2,
//   totalPoints: 3450,
//   totalAces: 425,
//   totalBlocks: 310,
//   avgEffectiveness: 52.3
// }
```

### Top Performers
```typescript
// Top 5 en puntos
const topScorers = await playerService.getTopPerformers('points', 5);

// Top 5 en aces
const topServers = await playerService.getTopPerformers('aces', 5);

// Top 5 en bloqueos
const topBlockers = await playerService.getTopPerformers('blocks', 5);

// Top 5 en efectividad
const mostEffective = await playerService.getTopPerformers('effectiveness', 5);
```

## Integración con PlayerManagement

### Cargar Jugadoras al Montar el Componente
```typescript
import { useState, useEffect } from 'react';
import { playerService } from '../../services/playerService';
import { useAuth } from '../../contexts/AuthContext';

const [players, setPlayers] = useState<Player[]>([]);
const [isLoading, setIsLoading] = useState(true);
const { currentUser } = useAuth();

useEffect(() => {
  loadPlayers();
}, []);

const loadPlayers = async () => {
  setIsLoading(true);
  try {
    const data = await playerService.getAllPlayers();
    setPlayers(data);
  } catch (error) {
    toast.error('Error al cargar jugadoras');
  } finally {
    setIsLoading(false);
  }
};
```

### Crear Jugadora con Foto
```typescript
const handleSavePlayer = async (playerData: Omit<Player, 'id'>) => {
  try {
    let photoURL = playerData.photo || '';

    // Si hay una foto nueva (base64), subirla primero
    if (playerData.photo && playerData.photo.startsWith('data:image/')) {
      // Convertir base64 a File
      const response = await fetch(playerData.photo);
      const blob = await response.blob();
      const file = new File([blob], 'player-photo.jpg', { type: 'image/jpeg' });

      // Primero crear el jugador para obtener el ID
      const newPlayer = await playerService.createPlayer({
        ...playerData,
        photo: '' // Sin foto por ahora
      }, currentUser.id);

      // Subir la foto con el ID del jugador
      photoURL = await storageService.uploadPlayerPhoto(
        newPlayer.id,
        file,
        (progress) => setUploadProgress(progress.progress)
      );

      // Actualizar con la URL de la foto
      await playerService.updatePlayerPhoto(newPlayer.id, photoURL, currentUser.id);

      setPlayers([...players, { ...newPlayer, photo: photoURL }]);
    } else {
      // Sin foto nueva, crear directamente
      const newPlayer = await playerService.createPlayer(playerData, currentUser.id);
      setPlayers([...players, newPlayer]);
    }

    toast.success('Jugadora agregada exitosamente');
    setIsEditing(false);
  } catch (error) {
    toast.error('Error al guardar jugadora');
  }
};
```

### Actualizar Jugadora
```typescript
const handleUpdatePlayer = async (playerId: string, playerData: Partial<Player>) => {
  try {
    await playerService.updatePlayer(playerId, playerData, currentUser.id);

    // Actualizar estado local
    setPlayers(players.map(p =>
      p.id === playerId ? { ...p, ...playerData, updatedAt: new Date() } : p
    ));

    toast.success('Jugadora actualizada exitosamente');
  } catch (error) {
    toast.error('Error al actualizar jugadora');
  }
};
```

### Eliminar Jugadora
```typescript
const handleDeletePlayer = async (playerId: string) => {
  if (!confirm('¿Estás seguro de eliminar esta jugadora?')) return;

  try {
    await playerService.deletePlayer(playerId);
    setPlayers(players.filter(p => p.id !== playerId));
    toast.success('Jugadora eliminada exitosamente');
  } catch (error) {
    toast.error('Error al eliminar jugadora');
  }
};
```

## Storage para Fotos de Jugadoras

Las fotos se guardan en: `/players/{playerId}/profile.jpg`

### Subir Foto
```typescript
import { storageService } from '../services/storageService';

const photoURL = await storageService.uploadPlayerPhoto(
  playerId,
  photoFile,
  (progress) => {
    console.log(`Progreso: ${progress.progress}%`);
    console.log(`${progress.bytesTransferred} / ${progress.totalBytes} bytes`);
  }
);
```

## Reglas de Seguridad Firestore

```javascript
// firestore.rules
match /players/{playerId} {
  // Cualquiera puede leer (para la app de fans)
  allow read: if true;

  // Solo admins autenticados pueden escribir
  allow create, update, delete: if request.auth != null &&
    exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

## Reglas de Seguridad Storage

```javascript
// storage.rules
match /players/{playerId}/{allPaths=**} {
  // Cualquiera puede leer las fotos
  allow read: if true;

  // Solo admins pueden subir/actualizar fotos
  allow write: if request.auth != null;
}
```

## Posiciones Disponibles

```typescript
const positions = [
  'Opuesta',
  'Esquina',
  'Central',
  'Líbero',
  'Levantadora'
];
```

## Campos Requeridos vs Opcionales

### Requeridos:
- `name` - Nombre
- `lastName` - Apellido
- `number` - Número de camiseta
- `position` - Posición
- `height` - Altura
- `status` - Estado (active/inactive)
- `team` - Equipo
- `league` - Liga
- `season` - Temporada

### Opcionales (con defaults en 0):
- `points` - Puntos (default: 0)
- `aces` - Aces (default: 0)
- `blocks` - Bloqueos (default: 0)
- `gamesPlayed` - Partidos jugados (default: 0)
- `gamesWon` - Partidos ganados (default: 0)
- `avgPerGame` - Promedio por partido (default: 0)
- `attacks` - Ataques (default: 0)
- `effectiveness` - Efectividad (default: 0)
- `photo` - URL de foto (default: '')
- `bio` - Biografía (default: '')

## Queries Útiles

### Filtrar por temporada actual
```typescript
const currentSeasonPlayers = await playerService.getPlayersBySeason('2025-2026');
```

### Filtrar por múltiples criterios
```typescript
const players = await playerService.getAllPlayers({
  status: 'active',
  position: 'Opuesta',
  season: '2025-2026',
  limit: 10
});
```

### Buscar por nombre (en el cliente)
```typescript
const players = await playerService.getAllPlayers();
const filtered = players.filter(p =>
  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
);
```

## Mejores Prácticas

1. **Siempre pasar adminId** al crear/actualizar para tracking
2. **Usar storageService** para fotos antes de crear/actualizar el documento
3. **Validar datos** antes de enviar a Firestore
4. **Manejar errores** con try/catch y mostrar mensajes al usuario
5. **Actualizar estado local** después de operaciones exitosas
6. **Confirmar eliminaciones** con un diálogo de confirmación
7. **Mostrar loading states** durante operaciones asíncronas

## Ejemplo Completo: Componente PlayerManagement

```typescript
import { useState, useEffect } from 'react';
import { playerService, Player } from '../../services/playerService';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export function PlayerManagement({ darkMode }: { darkMode: boolean }) {
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const data = await playerService.getAllPlayers();
      setPlayers(data);
    } catch (error) {
      toast.error('Error al cargar jugadoras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlayer = async (playerData: Omit<Player, 'id'>) => {
    try {
      if (editingPlayer) {
        // Actualizar
        await playerService.updatePlayer(editingPlayer.id, playerData, currentUser.id);
        await loadPlayers(); // Recargar desde Firestore
        toast.success('Jugadora actualizada');
      } else {
        // Crear nueva
        await playerService.createPlayer(playerData, currentUser.id);
        await loadPlayers(); // Recargar desde Firestore
        toast.success('Jugadora agregada');
      }
      setIsEditing(false);
      setEditingPlayer(null);
    } catch (error) {
      toast.error('Error al guardar jugadora');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('¿Eliminar jugadora?')) return;

    try {
      await playerService.deletePlayer(playerId);
      setPlayers(players.filter(p => p.id !== playerId));
      toast.success('Jugadora eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // ... resto del componente
}
```

## Estado de Implementación

- ✅ Servicio `playerService.ts` creado
- ✅ Estructura de datos definida
- ✅ Métodos CRUD completos
- ✅ Filtros y queries
- ✅ Estadísticas y top performers
- ⏳ Integración con PlayerManagement component (pendiente)
- ⏳ Integración con StorageService para fotos (pendiente)
- ⏳ Reglas de seguridad en Firebase Console (pendiente)

## Próximos Pasos

1. Actualizar `PlayerManagement.tsx` para usar `playerService`
2. Integrar upload de fotos con `storageService`
3. Aplicar reglas de seguridad en Firebase Console
4. Probar creación, edición y eliminación de jugadoras
5. Verificar que las fotos se suben correctamente a Storage

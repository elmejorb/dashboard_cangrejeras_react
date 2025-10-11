# 🗂️ Estructura de Firestore - Cangrejeras de Santurce

Esta guía explica la estructura completa de Firestore para el proyecto que incluye:
- 🎛️ **Dashboard CMS** (Administradores)
- 🏀 **App de Fans** (Usuarios finales)

---

## 📊 Colecciones en Firestore

### 1. `admins/` - Usuarios del Dashboard

Usuarios que tienen acceso al panel administrativo del CMS.

```typescript
admins/{adminId}  // adminId = UID de Firebase Authentication
  ├── name: string                    // "Laura Rodríguez"
  ├── email: string                   // "admin@cangrejeras.com"
  ├── role: string                    // "Super Admin" | "Admin" | "Editor"
  ├── avatar: string                  // URL de la imagen
  ├── phone: string                   // "+1 787-555-0123"
  ├── permissions: {
  │     canEditPlayers: boolean      // Puede gestionar jugadoras
  │     canEditMatches: boolean      // Puede gestionar partidos
  │     canEditVoting: boolean       // Puede gestionar votaciones
  │     canEditNews: boolean         // Puede gestionar noticias
  │     canManageUsers: boolean      // Puede gestionar otros admins (solo Super Admin)
  │     canDeleteContent: boolean    // Puede eliminar contenido (solo Super Admin)
  │   }
  ├── status: string                  // "active" | "inactive"
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── lastLogin: timestamp
```

**Ejemplo:**
```json
{
  "name": "Laura Rodríguez",
  "email": "laura@cangrejeras.com",
  "role": "Super Admin",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "+1 787-555-0123",
  "permissions": {
    "canEditPlayers": true,
    "canEditMatches": true,
    "canEditVoting": true,
    "canEditNews": true,
    "canManageUsers": true,
    "canDeleteContent": true
  },
  "status": "active",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "lastLogin": "2025-01-15T14:30:00Z"
}
```

---

### 2. `users/` - Usuarios de la App (Fans)

Usuarios finales que usan la app móvil para votar y seguir al equipo.

```typescript
users/{userId}  // userId = UID de Firebase Authentication
  ├── displayName: string             // "Juan Pérez"
  ├── email: string                   // "juan@example.com"
  ├── photoURL: string                // URL del avatar
  ├── favoritePlayers: string[]       // Array de IDs ["player_001", "player_002", ...]
  ├── favoriteTeam: string            // "Cangrejeras de Santurce" (por defecto)
  ├── preferences: {
  │     notifications: boolean        // Recibir notificaciones
  │     emailUpdates: boolean         // Recibir emails
  │     language: string              // "es" | "en"
  │   }
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  ├── lastActivity: timestamp         // Última interacción con la app
  ├── isActive: boolean               // true si el usuario está activo
  └── votesCount: number              // Total de votos emitidos
```

**Ejemplo:**
```json
{
  "displayName": "Juan Pérez",
  "email": "juan@example.com",
  "photoURL": "https://example.com/user-avatar.jpg",
  "favoritePlayers": ["player_001", "player_003", "player_005"],
  "favoriteTeam": "Cangrejeras de Santurce",
  "preferences": {
    "notifications": true,
    "emailUpdates": false,
    "language": "es"
  },
  "createdAt": "2025-01-10T12:00:00Z",
  "updatedAt": "2025-01-15T18:30:00Z",
  "lastActivity": "2025-01-15T18:30:00Z",
  "isActive": true,
  "votesCount": 15
}
```

**Notas:**
- Los usuarios pueden marcar **múltiples jugadoras favoritas** (sin límite)
- `favoritePlayers` es un array de IDs que referencia a `players/{playerId}`
- Se puede mostrar un feed personalizado con contenido de sus jugadoras favoritas

---

### 3. `players/` - Jugadoras del Equipo

Información de las jugadoras de voleibol.

```typescript
players/{playerId}
  ├── name: string                    // "Andrea Rangel"
  ├── number: number                  // 10
  ├── position: string                // "Opuesta" | "Esquina" | "Central" | "Libero" | "Levantadora"
  ├── photoURL: string                // URL de la foto
  ├── height: string                  // "1.85m"
  ├── nationality: string             // "Puerto Rico"
  ├── stats: {
  │     points: number               // Puntos totales
  │     blocks: number               // Bloqueos
  │     aces: number                 // Aces
  │     digs: number                 // Defensas
  │   }
  ├── bio: string                     // Biografía corta
  ├── votesTotal: number              // Total de votos MVP recibidos
  ├── isActive: boolean               // true si está en el roster activo
  └── createdAt: timestamp
```

**Ejemplo:**
```json
{
  "name": "Andrea Rangel",
  "number": 10,
  "position": "Opuesta",
  "photoURL": "https://example.com/andrea.jpg",
  "height": "1.85m",
  "nationality": "Puerto Rico",
  "stats": {
    "points": 245,
    "blocks": 32,
    "aces": 18,
    "digs": 67
  },
  "bio": "Jugadora destacada con 5 años de experiencia profesional",
  "votesTotal": 185,
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### 4. `matches/` - Partidos

Información de los partidos (pasados, presentes y futuros).

```typescript
matches/{matchId}
  ├── opponent: string                // "Criollas de Caguas"
  ├── opponentLogo: string            // URL del logo del oponente
  ├── date: timestamp                 // Fecha y hora del partido
  ├── location: string                // "Coliseo José Miguel Agrelot"
  ├── status: string                  // "upcoming" | "live" | "finished"
  ├── score: {
  │     cangrejeras: number          // Sets ganados
  │     opponent: number
  │     sets: [                       // Puntajes por set
  │       { cangrejeras: 25, opponent: 23 },
  │       { cangrejeras: 23, opponent: 25 },
  │       ...
  │     ]
  │   }
  ├── isLive: boolean                 // true si está en vivo
  ├── votingEnabled: boolean          // true si la votación MVP está activa
  ├── season: string                  // "2024-2025"
  ├── createdBy: string               // Referencia a admins/{adminId}
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

**Ejemplo:**
```json
{
  "opponent": "Criollas de Caguas",
  "opponentLogo": "https://example.com/criollas-logo.png",
  "date": "2025-01-26T20:00:00Z",
  "location": "Coliseo José Miguel Agrelot",
  "status": "upcoming",
  "score": {
    "cangrejeras": 0,
    "opponent": 0,
    "sets": []
  },
  "isLive": false,
  "votingEnabled": false,
  "season": "2024-2025",
  "createdBy": "admin_uid_001",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

### 5. `votings/` - Votaciones MVP

Votaciones para elegir MVP del partido.

```typescript
votings/{votingId}
  ├── matchId: string                 // Referencia a matches/{matchId}
  ├── title: string                   // "MVP del Partido"
  ├── description: string             // "Vota por la mejor jugadora"
  ├── status: string                  // "active" | "closed"
  ├── startDate: timestamp
  ├── endDate: timestamp
  ├── candidates: [playerId1, ...]    // Array de IDs de jugadoras
  ├── totalVotes: number              // Total de votos emitidos
  ├── results: {                      // Resultados de la votación
  │     [playerId]: {
  │       votes: number
  │       percentage: number
  │     }
  │   }
  ├── createdBy: string               // Referencia a admins/{adminId}
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

**Sub-colección: `votings/{votingId}/votes/`**

```typescript
votes/{voteId}  // voteId = userId (1 voto por usuario)
  ├── userId: string                  // Referencia a users/{userId}
  ├── playerId: string                // ID de la jugadora votada
  ├── timestamp: timestamp
  └── matchId: string                 // Referencia al partido
```

**Ejemplo de Voting:**
```json
{
  "matchId": "match_001",
  "title": "MVP del Partido",
  "description": "Vota por la mejor jugadora del partido vs Criollas",
  "status": "active",
  "startDate": "2025-01-26T20:00:00Z",
  "endDate": "2025-01-26T23:00:00Z",
  "candidates": ["player_001", "player_002", "player_003"],
  "totalVotes": 475,
  "results": {
    "player_001": { "votes": 185, "percentage": 38.9 },
    "player_002": { "votes": 152, "percentage": 32.0 },
    "player_003": { "votes": 138, "percentage": 29.1 }
  },
  "createdBy": "admin_uid_001",
  "createdAt": "2025-01-26T19:00:00Z",
  "updatedAt": "2025-01-26T22:30:00Z"
}
```

---

### 6. `news/` - Noticias

Noticias y artículos del equipo.

```typescript
news/{newsId}
  ├── title: string                   // "Victoria épica en casa"
  ├── content: string                 // Contenido HTML/Markdown
  ├── excerpt: string                 // Resumen corto
  ├── coverImage: string              // URL de la imagen principal
  ├── author: string                  // Referencia a admins/{adminId}
  ├── authorName: string              // Nombre del autor
  ├── publishedAt: timestamp
  ├── status: string                  // "draft" | "published" | "archived"
  ├── category: string                // "partido" | "jugadora" | "general"
  ├── tags: string[]                  // ["victoria", "playoffs"]
  ├── viewsCount: number              // Número de vistas
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

---

### 7. `stats/` - Estadísticas Generales

Estadísticas globales para el dashboard.

```typescript
stats/general
  ├── totalUsers: number              // Total de usuarios registrados
  ├── activeUsers: number             // Usuarios activos este mes
  ├── totalVotes: number              // Total de votos históricos
  ├── totalMatches: number            // Total de partidos
  ├── activeMatches: number           // Partidos en vivo
  ├── upcomingMatches: number         // Próximos partidos
  ├── lastUpdated: timestamp
  └── season: string                  // "2024-2025"
```

---

## 🔐 Reglas de Seguridad

### Permisos por Colección:

| Colección | Lectura | Escritura | Notas |
|-----------|---------|-----------|-------|
| `admins/` | Admins + owner | Super Admin | Solo Super Admin puede crear/eliminar |
| `users/` | Authenticated | Owner + Admins | Los fans pueden editar su perfil |
| `players/` | Todos (público) | Admins | Visible sin autenticación |
| `matches/` | Todos (público) | Admins | Visible sin autenticación |
| `votings/` | Todos (público) | Admins | Los votos requieren autenticación |
| `votings/{id}/votes/` | Authenticated | Owner (1 vez) | 1 voto por usuario |
| `news/` | Todos (público) | Admins | Solo publicadas son visibles |
| `stats/` | Todos (público) | Admins | Solo lectura para usuarios |

---

## 🎯 Roles y Permisos

### Super Admin
- ✅ Acceso total al dashboard
- ✅ Gestionar todos los administradores
- ✅ Crear/Editar/Eliminar todo el contenido
- ✅ Acceso a configuración avanzada

### Admin
- ✅ Gestionar jugadoras, partidos, votaciones
- ✅ Publicar noticias
- ✅ Ver estadísticas
- ❌ NO puede gestionar otros administradores

### Editor
- ✅ Crear y editar noticias
- ✅ Ver contenido
- ❌ NO puede gestionar jugadoras, partidos o votaciones
- ❌ NO puede eliminar contenido

---

## 📝 Pasos para Configurar

### 1. Habilitar Firestore
- Firebase Console → Firestore Database → Create database

### 2. Aplicar Reglas de Seguridad
- Copia las reglas del archivo `FIREBASE_SETUP.md`

### 3. Crear el Primer Admin
```javascript
// En Authentication
Email: admin@cangrejeras.com
Password: (tu contraseña segura)
UID: (copia el UID generado)

// En Firestore → admins collection
Document ID: [pega el UID]
Datos: {
  name: "Admin Principal",
  email: "admin@cangrejeras.com",
  role: "Super Admin",
  avatar: "",
  phone: "",
  permissions: {
    canEditPlayers: true,
    canEditMatches: true,
    canEditVoting: true,
    canEditNews: true,
    canManageUsers: true,
    canDeleteContent: true
  },
  status: "active",
  createdAt: [timestamp actual],
  updatedAt: [timestamp actual],
  lastLogin: [timestamp actual]
}
```

### 4. Crear Colecciones Iniciales

Puedes crear las colecciones manualmente o dejar que se creen automáticamente cuando uses el dashboard.

---

## 🔄 Flujo de Datos

### Dashboard CMS:
1. Admin se autentica → Firebase Auth
2. Se buscan datos en `admins/{uid}` → Firestore
3. Permisos determinan qué puede hacer
4. Crea/edita contenido en `players/`, `matches/`, `votings/`, `news/`

### App de Fans:
1. Usuario se autentica → Firebase Auth (opcional)
2. Ve contenido público: `players/`, `matches/`, `news/`
3. Si autenticado, puede votar en `votings/{id}/votes/`
4. Puede marcar jugadora favorita en su perfil `users/{uid}`

---

## 📚 Archivos Relacionados

- [firebase.ts](src/config/firebase.ts) - Configuración de Firebase
- [adminService.ts](src/services/adminService.ts) - Servicio para admins
- [userService.ts](src/services/userService.ts) - Servicio para usuarios fans
- [AuthContext.tsx](src/contexts/AuthContext.tsx) - Context de autenticación
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Guía de setup básico

---

## 🚀 Próximos Pasos

1. ✅ Crea tu primer Super Admin
2. ✅ Configura las reglas de seguridad
3. 🔜 Crea servicios para players, matches, votings
4. 🔜 Implementa la UI del dashboard para gestionar contenido
5. 🔜 Conecta la app de fans con Firestore

---

**¿Necesitas ayuda?** Revisa la consola de Firebase para errores y verifica que las reglas de seguridad estén aplicadas correctamente.

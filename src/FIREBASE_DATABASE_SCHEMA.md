# 🔥 Esquema de Firebase - Cangrejeras Dashboard

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura Firebase](#arquitectura-firebase)
3. [Diagrama de Colecciones](#diagrama-de-colecciones)
4. [Colecciones Principales](#colecciones-principales)
5. [Security Rules](#security-rules)
6. [Índices Compuestos](#índices-compuestos)
7. [Queries Firestore](#queries-firestore)
8. [Cloud Functions](#cloud-functions)
9. [Firebase Storage](#firebase-storage)
10. [Migración desde localStorage](#migración-desde-localstorage)

---

## 🎯 Resumen Ejecutivo

### **Stack Tecnológico: Firebase**

- **Firestore Database** - Base de datos NoSQL en tiempo real
- **Firebase Authentication** - Sistema de autenticación
- **Firebase Storage** - Almacenamiento de archivos (imágenes/videos)
- **Cloud Functions** - Lógica del servidor (Node.js)
- **Firebase Hosting** - Hosting de la aplicación (opcional)

**Colecciones Totales:** 12 colecciones principales + 4 subcollections  
**Storage Buckets:** 3 carpetas organizadas (players, media, news)  
**Usuarios Esperados:** 5-10 administradores + público ilimitado (lectura)  
**Volumen de Datos:** ~1000 documentos/mes

### **Características Clave:**
- ✅ Realtime listeners para votaciones en vivo
- ✅ Security Rules para acceso granular
- ✅ Índices compuestos para queries complejas
- ✅ Cloud Functions para triggers y lógica del servidor
- ✅ Offline persistence nativo
- ✅ Escalamiento automático

---

## 🏗️ Arquitectura Firebase

### **Modelo de Datos: Colecciones y Documentos**

A diferencia de SQL, Firestore organiza datos en **colecciones** (grupos de documentos) y **documentos** (objetos JSON).

```
firestore/
├── users/                    (Colección)
│   ├── {userId}/            (Documento)
│   │   ├── email: string
│   │   ├── name: string
│   │   └── notifications/   (Subcolección)
│   │       └── {notifId}/
│
├── players/
│   ├── {playerId}/
│   │   ├── name: string
│   │   ├── stats/          (Subcolección)
│   │   │   └── {season}/
│   │   └── ...
│
├── matches/
│   ├── {matchId}/
│   │   ├── opponent: string
│   │   ├── events/         (Subcolección)
│   │   │   └── {eventId}/
│   │   └── ...
│
└── voting_sessions/
    ├── {sessionId}/
    │   ├── title: string
    │   ├── options/        (Subcolección)
    │   │   └── {optionId}/
    │   └── votes/          (Subcolección)
    │       └── {voteId}/
```

---

## 📊 Diagrama de Colecciones

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │────────▶│notification_ │         │  activity_   │
│              │         │ preferences  │         │    logs      │
└──────────────┘         └──────────────┘         └──────────────┘
       │
       │ createdBy (reference)
       ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   players    │         │player_stats  │         │   matches    │
│              │         │ (subcollect) │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                                                   │
       │                                                   │
       │                                                   ▼
       │                                           ┌──────────────┐
       │                                           │match_events  │
       │                                           │ (subcollect) │
       │                                           └──────────────┘
       ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│voting_       │────────▶│vote_options  │────────▶│    votes     │
│sessions      │         │ (subcollect) │         │ (subcollect) │
└──────────────┘         └──────────────┘         └──────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     news     │         │  standings   │         │   sponsors   │
└──────────────┘         └──────────────┘         └──────────────┘
       │
       ▼
┌──────────────┐
│    media     │
└──────────────┘
```

**Nota sobre Relaciones:**
- ❌ No hay JOINs en Firestore
- ✅ Usar **referencias** (DocumentReference)
- ✅ Usar **subcollections** para relaciones 1:N
- ✅ **Desnormalizar** datos cuando sea necesario para performance

---

## 📚 Colecciones Principales

### **1. users (Administradores)**

Ruta: `/users/{userId}`

```typescript
interface User {
  id: string;                    // Auto-generado por Firestore
  email: string;                 // Debe coincidir con Firebase Auth
  name: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Moderador';
  avatarUrl?: string;            // URL de Storage
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
  
  // Metadata de Firebase Auth (opcional)
  uid?: string;                  // Firebase Auth UID
}
```

**Ejemplo de Documento:**
```json
{
  "id": "user123",
  "email": "admin@cangrejeras.com",
  "name": "Ana María Torres",
  "role": "Super Admin",
  "avatarUrl": "https://storage.googleapis.com/.../avatar.jpg",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-10-08T14:20:00Z",
  "lastLoginAt": "2024-10-08T14:20:00Z",
  "isActive": true,
  "uid": "firebase-auth-uid-123"
}
```

**Índices Necesarios:**
```javascript
// Composite index
users: [
  { fields: ['role', 'isActive'] }
]
```

---

### **2. players (Jugadoras del Roster)**

Ruta: `/players/{playerId}`

```typescript
interface Player {
  id: string;
  name: string;
  number: number;
  position: 'Líbero' | 'Central' | 'Esquina' | 'Opuesta' | 'Armadora';
  heightCm?: number;
  photoUrl?: string;             // Storage URL
  hometown?: string;
  college?: string;
  birthDate?: Timestamp;
  bio?: string;
  
  // Social media (sin @)
  socialInstagram?: string;
  socialTwitter?: string;
  socialTiktok?: string;
  
  // Estado
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;          // Para ordenar manualmente
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: DocumentReference; // Referencia a users/{userId}
}
```

**Subcollection: stats** (por temporada)

Ruta: `/players/{playerId}/stats/{season}`

```typescript
interface PlayerStats {
  season: string;                // "2024-2025"
  
  // Stats generales
  matchesPlayed: number;
  setsPlayed: number;
  minutesPlayed: number;
  
  // Stats ofensivas
  pointsTotal: number;
  attacksTotal: number;
  attacksSuccessful: number;
  attacksBlocked: number;
  attacksError: number;
  attackPercentage: number;      // Calculado automáticamente
  
  // Stats defensivas
  blocksTotal: number;
  blocksSolo: number;
  blocksAssisted: number;
  digsTotal: number;
  
  // Stats de servicio
  servesTotal: number;
  acesTotal: number;
  serveErrors: number;
  
  // Stats de recepción
  receptionsTotal: number;
  receptionsPerfect: number;
  receptionErrors: number;
  
  // Stats de armado
  assistsTotal: number;
  
  // Metadata
  updatedAt: Timestamp;
}
```

**Ejemplo de Documento:**
```json
{
  "id": "player-pilar-victoria",
  "name": "Pilar Victoria Marie",
  "number": 7,
  "position": "Armadora",
  "heightCm": 173,
  "photoUrl": "https://storage.googleapis.com/.../pilar.jpg",
  "hometown": "San Juan, PR",
  "college": "UPR Río Piedras",
  "birthDate": "2000-03-15T00:00:00Z",
  "bio": "Capitana del equipo. Líder en asistencias.",
  "socialInstagram": "pilarvictoria7",
  "isActive": true,
  "isFeatured": true,
  "displayOrder": 1,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-10-08T10:00:00Z",
  "createdBy": "/users/user123"
}
```

**Índices Necesarios:**
```javascript
players: [
  { fields: ['isActive', 'displayOrder'] },
  { fields: ['position', 'isActive'] },
  { fields: ['number', 'isActive'] }
]
```

---

### **3. matches (Partidos)**

Ruta: `/matches/{matchId}`

```typescript
interface Match {
  id: string;
  opponent: string;
  opponentLogoUrl?: string;
  matchDate: Timestamp;
  venue: string;
  venueAddress?: string;
  matchType: 'Regular' | 'Playoffs' | 'Final' | 'Amistoso';
  competition?: string;
  
  // Scores
  scoreHome?: number;            // Sets ganados local
  scoreAway?: number;            // Sets ganados visitante
  isHome: boolean;
  
  // Sets detallados
  sets: {
    set1?: { home: number; away: number };
    set2?: { home: number; away: number };
    set3?: { home: number; away: number };
    set4?: { home: number; away: number };
    set5?: { home: number; away: number };
  };
  
  // Estado
  status: 'scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed';
  isLive: boolean;
  currentSet?: number;
  
  // Información adicional
  ticketUrl?: string;
  streamUrl?: string;
  matchNotes?: string;
  
  // Jugadoras participantes (array de referencias)
  players?: {
    playerId: DocumentReference;
    started: boolean;
    minutesPlayed: number;
    points: number;
    attacks: number;
    blocks: number;
    digs: number;
    aces: number;
    assists: number;
  }[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: DocumentReference;
}
```

**Subcollection: events** (Eventos en vivo)

Ruta: `/matches/{matchId}/events/{eventId}`

```typescript
interface MatchEvent {
  id: string;
  playerId?: DocumentReference;  // Referencia a players/{playerId}
  
  eventType: 'point' | 'ace' | 'block' | 'attack' | 'dig' | 
             'error' | 'substitution' | 'timeout' | 'set_start' | 'set_end';
  eventDescription: string;
  setNumber: number;             // 1-5
  scoreHome?: number;
  scoreAway?: number;
  
  timestamp: Timestamp;
  createdBy?: DocumentReference;
}
```

**Ejemplo de Documento:**
```json
{
  "id": "match-001",
  "opponent": "Criollas de Caguas",
  "opponentLogoUrl": "https://storage.googleapis.com/.../criollas.png",
  "matchDate": "2024-10-12T19:00:00Z",
  "venue": "Coliseo Roberto Clemente",
  "venueAddress": "San Juan, PR",
  "matchType": "Regular",
  "competition": "LVSF 2024-2025",
  "scoreHome": 3,
  "scoreAway": 1,
  "isHome": true,
  "sets": {
    "set1": { "home": 25, "away": 22 },
    "set2": { "home": 23, "away": 25 },
    "set3": { "home": 25, "away": 20 },
    "set4": { "home": 25, "away": 18 }
  },
  "status": "finished",
  "isLive": false,
  "ticketUrl": "https://ticketpop.com/cangrejeras",
  "streamUrl": "https://youtube.com/live/xyz",
  "createdAt": "2024-09-20T10:00:00Z",
  "updatedAt": "2024-10-12T21:30:00Z",
  "createdBy": "/users/user123"
}
```

**Índices Necesarios:**
```javascript
matches: [
  { fields: ['status', 'matchDate'] },
  { fields: ['isLive', 'matchDate'] },
  { fields: ['matchType', 'status', 'matchDate'] }
]
```

---

### **4. voting_sessions (Sesiones de Votación)**

Ruta: `/voting_sessions/{sessionId}`

```typescript
interface VotingSession {
  id: string;
  matchId?: DocumentReference;   // Referencia a matches/{matchId}
  
  // Configuración
  title: string;
  description?: string;
  question: string;
  votingType: 'mvp' | 'poll' | 'best_play' | 'custom';
  
  // Estado
  status: 'draft' | 'active' | 'finished' | 'cancelled';
  isActive: boolean;
  
  // Fechas
  startsAt?: Timestamp;
  endsAt?: Timestamp;
  
  // Configuración de votación
  allowMultipleVotes: boolean;
  requireAuthentication: boolean;
  maxVotesPerUser: number;
  
  // Contadores
  totalVotes: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: DocumentReference;
}
```

**Subcollection: options** (Opciones de Votación)

Ruta: `/voting_sessions/{sessionId}/options/{optionId}`

```typescript
interface VoteOption {
  id: string;
  playerId?: DocumentReference;  // Referencia a players/{playerId}
  
  // Para opciones personalizadas (no jugadoras)
  customOption?: string;
  customOptionImage?: string;
  
  // Contadores
  voteCount: number;
  votePercentage: number;        // Calculado automáticamente
  
  displayOrder: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollection: votes** (Votos Individuales)

Ruta: `/voting_sessions/{sessionId}/votes/{voteId}`

```typescript
interface Vote {
  id: string;
  optionId: string;              // ID de la opción votada
  
  // Identificación del votante
  userId?: string;               // Si está autenticado
  voterFingerprint?: string;     // Hash SHA256 (IP + UserAgent) para anónimos
  
  // Metadata
  votedAt: Timestamp;
  ipAddress?: string;            // Para análisis de fraude
  userAgent?: string;
}
```

**Ejemplo de Documento:**
```json
{
  "id": "voting-mvp-match-001",
  "matchId": "/matches/match-001",
  "title": "MVP del Partido",
  "description": "¡Vota por la jugadora más valiosa!",
  "question": "¿Quién fue la MVP del partido?",
  "votingType": "mvp",
  "status": "active",
  "isActive": true,
  "startsAt": "2024-10-12T21:00:00Z",
  "endsAt": "2024-10-13T00:00:00Z",
  "allowMultipleVotes": false,
  "requireAuthentication": false,
  "maxVotesPerUser": 1,
  "totalVotes": 1247,
  "createdAt": "2024-10-12T20:50:00Z",
  "updatedAt": "2024-10-12T23:15:00Z",
  "createdBy": "/users/user123"
}
```

**Índices Necesarios:**
```javascript
voting_sessions: [
  { fields: ['status', 'isActive', 'startsAt'] },
  { fields: ['matchId', 'status'] }
],
'voting_sessions/{sessionId}/options': [
  { fields: ['voteCount'], order: 'desc' }
],
'voting_sessions/{sessionId}/votes': [
  { fields: ['votedAt'], order: 'desc' },
  { fields: ['voterFingerprint', 'votedAt'] }
]
```

---

### **5. news (Noticias)**

Ruta: `/news/{newsId}`

```typescript
interface News {
  id: string;
  
  // Contenido
  title: string;
  slug: string;                  // URL-friendly (auto-generado)
  excerpt?: string;
  content: string;               // HTML o Markdown
  coverImageUrl?: string;
  
  // Categorización
  category: 'Partido' | 'Jugadora' | 'Equipo' | 'Logro' | 
            'Comunidad' | 'Anuncio' | 'Entrevista';
  tags?: string[];
  isFeatured: boolean;
  isBreaking: boolean;
  
  // Estado
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  
  // Fechas
  publishedAt?: Timestamp;
  scheduledFor?: Timestamp;
  
  // Engagement
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Relaciones (referencias)
  authorId: DocumentReference;
  relatedMatchId?: DocumentReference;
  relatedPlayerId?: DocumentReference;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Ejemplo de Documento:**
```json
{
  "id": "news-victoria-historica",
  "title": "¡Victoria Histórica! Cangrejeras Vencen a las Criollas 3-1",
  "slug": "victoria-historica-cangrejeras-vencen-criollas-3-1",
  "excerpt": "En un partido emocionante, nuestras Cangrejeras...",
  "content": "<p>En un partido que quedará...</p>",
  "coverImageUrl": "https://storage.googleapis.com/.../cover.jpg",
  "category": "Partido",
  "tags": ["victoria", "criollas", "playoffs"],
  "isFeatured": true,
  "isBreaking": false,
  "status": "published",
  "publishedAt": "2024-10-12T22:00:00Z",
  "viewsCount": 3542,
  "likesCount": 287,
  "sharesCount": 94,
  "metaTitle": "Victoria Histórica - Cangrejeras de Santurce",
  "authorId": "/users/user123",
  "relatedMatchId": "/matches/match-001",
  "createdAt": "2024-10-12T21:45:00Z",
  "updatedAt": "2024-10-13T10:00:00Z"
}
```

**Índices Necesarios:**
```javascript
news: [
  { fields: ['status', 'publishedAt'], order: 'desc' },
  { fields: ['category', 'status', 'publishedAt'] },
  { fields: ['isFeatured', 'status', 'publishedAt'] },
  { fields: ['authorId', 'status', 'publishedAt'] }
]
```

---

### **6. standings (Tabla de Posiciones)**

Ruta: `/standings/{standingId}`

```typescript
interface Standing {
  id: string;
  
  // Temporada
  season: string;                // "2024-2025"
  competition: string;           // "LVSF"
  
  // Equipo
  teamName: string;
  teamLogoUrl?: string;
  isOwnTeam: boolean;            // true para Cangrejeras
  
  // Posición
  position: number;
  
  // Estadísticas
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  
  setsWon: number;
  setsLost: number;
  
  pointsFor: number;
  pointsAgainst: number;
  
  // Puntos de liga
  leaguePoints: number;
  
  // Racha (últimos 5 partidos)
  form?: string;                 // "WWLDL" (W=Win, L=Loss, D=Draw)
  
  // Metadata
  lastMatchDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Ejemplo de Documento:**
```json
{
  "id": "standing-cangrejeras-2024",
  "season": "2024-2025",
  "competition": "LVSF",
  "teamName": "Cangrejeras de Santurce",
  "teamLogoUrl": "https://storage.googleapis.com/.../logo.png",
  "isOwnTeam": true,
  "position": 2,
  "matchesPlayed": 12,
  "matchesWon": 9,
  "matchesLost": 3,
  "matchesDrawn": 0,
  "setsWon": 31,
  "setsLost": 15,
  "pointsFor": 2847,
  "pointsAgainst": 2513,
  "leaguePoints": 27,
  "form": "WWLWW",
  "lastMatchDate": "2024-10-12T21:30:00Z",
  "createdAt": "2024-08-01T10:00:00Z",
  "updatedAt": "2024-10-12T22:00:00Z"
}
```

**Índices Necesarios:**
```javascript
standings: [
  { fields: ['season', 'competition', 'position'] },
  { fields: ['season', 'competition', 'leaguePoints'], order: 'desc' }
]
```

---

### **7. media (Galería Multimedia)**

Ruta: `/media/{mediaId}`

```typescript
interface Media {
  id: string;
  
  // Archivo
  fileName: string;
  fileUrl: string;               // Storage URL
  fileType: 'image' | 'video' | 'document';
  fileSize?: number;             // bytes
  mimeType?: string;
  
  // Metadata del archivo
  width?: number;
  height?: number;
  duration?: number;             // segundos (para videos)
  
  // Organización
  title?: string;
  description?: string;
  altText?: string;              // Accesibilidad
  category: 'Partido' | 'Entrenamiento' | 'Evento' | 
            'Jugadora' | 'Promocional' | 'Otro';
  tags?: string[];
  
  // Relaciones
  relatedMatchId?: DocumentReference;
  relatedPlayerId?: DocumentReference;
  relatedNewsId?: DocumentReference;
  
  // Estado
  isFeatured: boolean;
  isPublic: boolean;
  
  // Metadata
  uploadedAt: Timestamp;
  uploadedBy: DocumentReference;
}
```

**Índices Necesarios:**
```javascript
media: [
  { fields: ['fileType', 'isPublic', 'uploadedAt'] },
  { fields: ['category', 'isFeatured', 'uploadedAt'] },
  { fields: ['relatedMatchId', 'uploadedAt'] }
]
```

---

### **8. sponsors (Patrocinadores)**

Ruta: `/sponsors/{sponsorId}`

```typescript
interface Sponsor {
  id: string;
  
  // Información básica
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  
  // Clasificación
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Partner';
  category?: string;
  
  // Visibilidad
  isActive: boolean;
  displayOrder: number;
  showInApp: boolean;
  
  // Fechas de contrato
  contractStartDate?: Timestamp;
  contractEndDate?: Timestamp;
  
  // Contacto
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Índices Necesarios:**
```javascript
sponsors: [
  { fields: ['isActive', 'tier', 'displayOrder'] },
  { fields: ['showInApp', 'displayOrder'] }
]
```

---

### **9. activity_logs (Historial de Actividad)**

Ruta: `/activity_logs/{logId}`

```typescript
interface ActivityLog {
  id: string;
  
  // Usuario
  userId: DocumentReference;
  userEmail: string;             // Cache para búsquedas
  userName: string;              // Cache para display
  
  // Acción
  action: 'create' | 'update' | 'delete' | 'publish' | 
          'upload' | 'activate' | 'deactivate' | 'login' | 'logout';
  actionType: 'match' | 'player' | 'voting' | 'news' | 
              'standings' | 'media' | 'settings' | 'auth';
  description: string;
  
  // Metadata de la acción
  metadata?: {
    [key: string]: any;
  };
  
  // Recurso afectado
  resourceCollection?: string;   // "matches", "players", etc.
  resourceId?: string;
  
  // Información de sesión
  ipAddress?: string;
  userAgent?: string;
  
  // Timestamp
  createdAt: Timestamp;
}
```

**Índices Necesarios:**
```javascript
activity_logs: [
  { fields: ['userId', 'createdAt'], order: 'desc' },
  { fields: ['action', 'createdAt'], order: 'desc' },
  { fields: ['actionType', 'createdAt'], order: 'desc' },
  { fields: ['resourceCollection', 'resourceId', 'createdAt'] }
]
```

---

### **10. notification_preferences (Preferencias de Notificación)**

Ruta: `/users/{userId}/notification_preferences/settings`

```typescript
interface NotificationPreferences {
  userId: string;
  
  // Email
  emailEnabled: boolean;
  emailMatches: boolean;
  emailVoting: boolean;
  emailNews: boolean;
  emailPlayers: boolean;
  emailStandings: boolean;
  
  // Push (futuro)
  pushEnabled: boolean;
  pushMatches: boolean;
  pushVoting: boolean;
  pushNews: boolean;
  pushPlayers: boolean;
  pushStandings: boolean;
  
  // In-App
  inappEnabled: boolean;
  inappMatches: boolean;
  inappVoting: boolean;
  inappNews: boolean;
  inappPlayers: boolean;
  inappStandings: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Nota:** Se usa como subcollection de users para mejor organización.

---

### **11. notifications (Cola de Notificaciones)**

Ruta: `/users/{userId}/notifications/{notificationId}`

```typescript
interface Notification {
  id: string;
  
  // Contenido
  title: string;
  message: string;
  notificationType: 'match' | 'voting' | 'news' | 'player' | 'standings' | 'system';
  
  // Acción
  actionUrl?: string;
  actionLabel?: string;
  
  // Estado
  isRead: boolean;
  readAt?: Timestamp;
  
  // Canal
  channel: 'email' | 'push' | 'inapp';
  sent: boolean;
  sentAt?: Timestamp;
  
  // Metadata
  metadata?: {
    [key: string]: any;
  };
  
  createdAt: Timestamp;
}
```

**Índices Necesarios:**
```javascript
'users/{userId}/notifications': [
  { fields: ['isRead', 'createdAt'], order: 'desc' },
  { fields: ['notificationType', 'createdAt'], order: 'desc' }
]
```

---

## 🔐 Security Rules

### **Configuración de Firebase Security Rules**

Archivo: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // FUNCIONES HELPER
    // ========================================
    
    // Verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verificar si el usuario es administrador
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['Super Admin', 'Admin', 'Editor'] &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // Verificar si el usuario es Super Admin
    function isSuperAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Super Admin' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // Verificar si es el mismo usuario
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ========================================
    // REGLAS DE ACCESO PÚBLICO (FAN APP)
    // ========================================
    
    // Jugadoras activas - lectura pública
    match /players/{playerId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
      
      // Stats de jugadoras - lectura pública
      match /stats/{season} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }
    
    // Partidos - lectura pública
    match /matches/{matchId} {
      allow read: if true;
      allow write: if isAdmin();
      
      // Eventos de partidos - lectura pública
      match /events/{eventId} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }
    
    // Votaciones - lectura pública para activas/finalizadas
    match /voting_sessions/{sessionId} {
      allow read: if resource.data.status in ['active', 'finished'];
      allow write: if isAdmin();
      
      // Opciones de voto - lectura pública
      match /options/{optionId} {
        allow read: if true;
        allow write: if isAdmin();
      }
      
      // Votos - cualquiera puede votar (INSERT)
      match /votes/{voteId} {
        allow read: if isAdmin() || isOwner(resource.data.userId);
        allow create: if true; // Cualquiera puede votar
        allow update, delete: if false; // No se pueden modificar votos
      }
    }
    
    // Noticias publicadas - lectura pública
    match /news/{newsId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    
    // Tabla de posiciones - lectura pública
    match /standings/{standingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Media pública - lectura pública
    match /media/{mediaId} {
      allow read: if resource.data.isPublic == true;
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
    }
    
    // Patrocinadores activos - lectura pública
    match /sponsors/{sponsorId} {
      allow read: if resource.data.isActive == true && resource.data.showInApp == true;
      allow write: if isAdmin();
    }
    
    // ========================================
    // REGLAS DE ADMINISTRADORES
    // ========================================
    
    // Usuarios - solo administradores
    match /users/{userId} {
      allow read: if isAdmin();
      allow create: if isSuperAdmin();
      allow update: if isAdmin() && (isOwner(userId) || isSuperAdmin());
      allow delete: if isSuperAdmin();
      
      // Preferencias de notificaciones - solo el dueño o admins
      match /notification_preferences/{prefsId} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
      
      // Notificaciones - solo el dueño o admins
      match /notifications/{notifId} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
    }
    
    // Logs de actividad - solo lectura para admins
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update, delete: if false; // Los logs no se modifican
    }
    
    // ========================================
    // REGLAS DE DENEGACIÓN POR DEFECTO
    // ========================================
    
    // Denegar todo lo demás por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### **Storage Rules**

Archivo: `storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Función helper para verificar si es admin
    function isAdmin() {
      return request.auth != null && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['Super Admin', 'Admin', 'Editor'] &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // Players - públicas para lectura, admin para escritura
    match /players/{playerId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Media - públicas para lectura, admin para escritura
    match /media/{category}/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // News - públicas para lectura, admin para escritura
    match /news/{newsId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Sponsors - públicas para lectura, admin para escritura
    match /sponsors/{sponsorId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User avatars - solo el dueño o admin
    match /users/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Denegar todo lo demás
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📊 Índices Compuestos

### **Archivo de Configuración: firestore.indexes.json**

```json
{
  "indexes": [
    {
      "collectionGroup": "players",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "displayOrder", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "players",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "position", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "matchDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isLive", "order": "ASCENDING" },
        { "fieldPath": "matchDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "voting_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "startsAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "options",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "voteCount", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "news",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "news",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "news",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isFeatured", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "standings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "season", "order": "ASCENDING" },
        { "fieldPath": "competition", "order": "ASCENDING" },
        { "fieldPath": "leaguePoints", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activity_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activity_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "actionType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "media",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "fileType", "order": "ASCENDING" },
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "uploadedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Deploy de índices:**
```bash
firebase deploy --only firestore:indexes
```

---

## 🔍 Queries Firestore

### **Ejemplos de Queries Comunes**

#### **1. Obtener Partido en Vivo con Detalles**

```typescript
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

async function getLiveMatch() {
  // Buscar partido en vivo
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef, 
    where('isLive', '==', true),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const matchDoc = querySnapshot.docs[0];
  const matchData = { id: matchDoc.id, ...matchDoc.data() };
  
  // Obtener eventos recientes del partido
  const eventsRef = collection(db, `matches/${matchDoc.id}/events`);
  const eventsQuery = query(
    eventsRef,
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  
  const eventsSnapshot = await getDocs(eventsQuery);
  const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return {
    ...matchData,
    events
  };
}
```

#### **2. Obtener Votación Activa con Resultados en Tiempo Real**

```typescript
import { doc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

function subscribeToActiveVoting(callback: (voting: any) => void) {
  // Buscar votación activa
  const votingRef = collection(db, 'voting_sessions');
  const q = query(
    votingRef,
    where('isActive', '==', true),
    limit(1)
  );
  
  // Listener en tiempo real
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }
    
    const votingDoc = snapshot.docs[0];
    const votingData = { id: votingDoc.id, ...votingDoc.data() };
    
    // Obtener opciones con contadores en tiempo real
    const optionsRef = collection(db, `voting_sessions/${votingDoc.id}/options`);
    const optionsQuery = query(optionsRef, orderBy('voteCount', 'desc'));
    
    onSnapshot(optionsQuery, async (optionsSnapshot) => {
      const options = [];
      
      for (const optionDoc of optionsSnapshot.docs) {
        const optionData = { id: optionDoc.id, ...optionDoc.data() };
        
        // Si tiene playerId, obtener datos de la jugadora
        if (optionData.playerId) {
          const playerDoc = await getDoc(optionData.playerId);
          optionData.player = playerDoc.exists() ? playerDoc.data() : null;
        }
        
        options.push(optionData);
      }
      
      callback({
        ...votingData,
        options
      });
    });
  });
  
  return unsubscribe;
}
```

#### **3. Obtener Noticias Recientes con Paginación**

```typescript
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

async function getRecentNews(pageSize = 20, lastDoc = null) {
  const newsRef = collection(db, 'news');
  
  let q = query(
    newsRef,
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(pageSize)
  );
  
  // Paginación
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  
  const news = [];
  for (const newsDoc of snapshot.docs) {
    const newsData = { id: newsDoc.id, ...newsDoc.data() };
    
    // Obtener datos del autor
    if (newsData.authorId) {
      const authorDoc = await getDoc(newsData.authorId);
      newsData.author = authorDoc.exists() ? authorDoc.data() : null;
    }
    
    news.push(newsData);
  }
  
  return {
    news,
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
}
```

#### **4. Obtener Top Jugadoras por Stats**

```typescript
import { collection, getDocs, query, where } from 'firebase/firestore';

async function getTopPlayersByPoints(season = '2024-2025', limit = 10) {
  const playersRef = collection(db, 'players');
  const playersQuery = query(
    playersRef,
    where('isActive', '==', true)
  );
  
  const playersSnapshot = await getDocs(playersQuery);
  
  const playersWithStats = [];
  
  for (const playerDoc of playersSnapshot.docs) {
    const playerData = { id: playerDoc.id, ...playerDoc.data() };
    
    // Obtener stats de la temporada
    const statsDoc = await getDoc(
      doc(db, `players/${playerDoc.id}/stats/${season}`)
    );
    
    if (statsDoc.exists()) {
      playersWithStats.push({
        ...playerData,
        stats: statsDoc.data()
      });
    }
  }
  
  // Ordenar por puntos
  playersWithStats.sort((a, b) => 
    (b.stats?.pointsTotal || 0) - (a.stats?.pointsTotal || 0)
  );
  
  return playersWithStats.slice(0, limit);
}
```

#### **5. Obtener Historial de Actividad de Usuario**

```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

async function getUserActivityHistory(userId: string, limitCount = 100) {
  const logsRef = collection(db, 'activity_logs');
  const q = query(
    logsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## ☁️ Cloud Functions

### **Triggers Automáticos con Cloud Functions**

Archivo: `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ========================================
// TRIGGER 1: Actualizar updated_at automáticamente
// ========================================

export const onPlayerUpdate = functions.firestore
  .document('players/{playerId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    
    // Solo actualizar si no se actualizó en los últimos 5 segundos
    // (evitar loops infinitos)
    const now = admin.firestore.Timestamp.now();
    const lastUpdate = newData.updatedAt;
    
    if (!lastUpdate || (now.seconds - lastUpdate.seconds) > 5) {
      return change.after.ref.update({
        updatedAt: now
      });
    }
    
    return null;
  });

// ========================================
// TRIGGER 2: Incrementar contadores de votos
// ========================================

export const onVoteCreated = functions.firestore
  .document('voting_sessions/{sessionId}/votes/{voteId}')
  .onCreate(async (snapshot, context) => {
    const { sessionId } = context.params;
    const voteData = snapshot.data();
    
    const batch = db.batch();
    
    // Incrementar contador de la opción
    const optionRef = db.doc(
      `voting_sessions/${sessionId}/options/${voteData.optionId}`
    );
    batch.update(optionRef, {
      voteCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    // Incrementar contador total de la sesión
    const sessionRef = db.doc(`voting_sessions/${sessionId}`);
    batch.update(sessionRef, {
      totalVotes: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    await batch.commit();
    
    // Recalcular porcentajes
    return recalculateVotePercentages(sessionId);
  });

// Función helper para recalcular porcentajes
async function recalculateVotePercentages(sessionId: string) {
  const sessionDoc = await db.doc(`voting_sessions/${sessionId}`).get();
  const totalVotes = sessionDoc.data()?.totalVotes || 0;
  
  if (totalVotes === 0) return;
  
  const optionsSnapshot = await db
    .collection(`voting_sessions/${sessionId}/options`)
    .get();
  
  const batch = db.batch();
  
  optionsSnapshot.docs.forEach((doc) => {
    const voteCount = doc.data().voteCount || 0;
    const percentage = (voteCount / totalVotes) * 100;
    
    batch.update(doc.ref, {
      votePercentage: parseFloat(percentage.toFixed(2)),
      updatedAt: admin.firestore.Timestamp.now()
    });
  });
  
  return batch.commit();
}

// ========================================
// TRIGGER 3: Logging automático de cambios
// ========================================

export const onPlayerChange = functions.firestore
  .document('players/{playerId}')
  .onWrite(async (change, context) => {
    const { playerId } = context.params;
    
    let action = 'update';
    let description = '';
    
    if (!change.before.exists) {
      action = 'create';
      description = `Creó jugadora: ${change.after.data()?.name}`;
    } else if (!change.after.exists) {
      action = 'delete';
      description = `Eliminó jugadora: ${change.before.data()?.name}`;
    } else {
      description = `Actualizó jugadora: ${change.after.data()?.name}`;
    }
    
    // Obtener userId del contexto (debe ser pasado desde el cliente)
    const userId = change.after.data()?.updatedBy || 
                   change.after.data()?.createdBy;
    
    if (!userId) return null;
    
    // Crear log
    return db.collection('activity_logs').add({
      userId: userId,
      userEmail: '', // Obtener del usuario
      userName: '',  // Obtener del usuario
      action,
      actionType: 'player',
      description,
      resourceCollection: 'players',
      resourceId: playerId,
      metadata: {
        before: change.before.data() || null,
        after: change.after.data() || null
      },
      createdAt: admin.firestore.Timestamp.now()
    });
  });

// ========================================
// TRIGGER 4: Actualizar stats de jugadora cuando hay evento de partido
// ========================================

export const onMatchEventCreated = functions.firestore
  .document('matches/{matchId}/events/{eventId}')
  .onCreate(async (snapshot, context) => {
    const { matchId } = context.params;
    const eventData = snapshot.data();
    
    if (!eventData.playerId) return null;
    
    const playerId = eventData.playerId.id;
    const season = '2024-2025'; // TODO: Obtener dinámicamente
    
    const statsRef = db.doc(`players/${playerId}/stats/${season}`);
    const statsDoc = await statsRef.get();
    
    const updates: any = {
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    // Actualizar stats según el tipo de evento
    switch (eventData.eventType) {
      case 'point':
        updates.pointsTotal = admin.firestore.FieldValue.increment(1);
        break;
      case 'ace':
        updates.acesTotal = admin.firestore.FieldValue.increment(1);
        updates.pointsTotal = admin.firestore.FieldValue.increment(1);
        break;
      case 'block':
        updates.blocksTotal = admin.firestore.FieldValue.increment(1);
        updates.pointsTotal = admin.firestore.FieldValue.increment(1);
        break;
      case 'attack':
        updates.attacksSuccessful = admin.firestore.FieldValue.increment(1);
        updates.attacksTotal = admin.firestore.FieldValue.increment(1);
        updates.pointsTotal = admin.firestore.FieldValue.increment(1);
        break;
      case 'dig':
        updates.digsTotal = admin.firestore.FieldValue.increment(1);
        break;
    }
    
    // Crear documento si no existe
    if (!statsDoc.exists()) {
      updates.season = season;
      updates.matchesPlayed = 0;
      updates.setsPlayed = 0;
      // ... inicializar todos los contadores en 0
    }
    
    return statsRef.set(updates, { merge: true });
  });

// ========================================
// FUNCIÓN HTTP: Generar slug para noticias
// ========================================

export const generateSlug = functions.https.onCall((data, context) => {
  const { title } = data;
  
  if (!title) {
    throw new functions.https.HttpsError('invalid-argument', 'Title is required');
  }
  
  // Convertir a slug
  const slug = title
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  
  return { slug };
});

// ========================================
// FUNCIÓN HTTP: Limpiar votaciones antiguas
// ========================================

export const cleanupOldVotingSessions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const oldSessions = await db
      .collection('voting_sessions')
      .where('status', '==', 'finished')
      .where('endsAt', '<', thirtyDaysAgo)
      .get();
    
    const batch = db.batch();
    
    oldSessions.docs.forEach((doc) => {
      batch.update(doc.ref, { status: 'archived' });
    });
    
    await batch.commit();
    
    console.log(`Archived ${oldSessions.size} old voting sessions`);
    return null;
  });
```

**Deploy de Cloud Functions:**
```bash
firebase deploy --only functions
```

---

## 📦 Firebase Storage

### **Estructura de Carpetas**

```
gs://{your-project-id}.appspot.com/
├── players/
│   ├── {playerId}/
│   │   ├── profile.jpg
│   │   └── action-shots/
│   │       ├── shot1.jpg
│   │       └── shot2.jpg
│
├── media/
│   ├── matches/
│   │   └── {matchId}/
│   │       ├── photo1.jpg
│   │       └── video1.mp4
│   ├── training/
│   │   └── training1.jpg
│   └── events/
│       └── event1.jpg
│
├── news/
│   └── {newsId}/
│       ├── cover.jpg
│       └── gallery/
│           ├── img1.jpg
│           └── img2.jpg
│
├── sponsors/
│   └── {sponsorId}/
│       └── logo.png
│
└── users/
    └── {userId}/
        └── avatar.jpg
```

### **Código para Subir Archivos**

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadPlayerPhoto(playerId: string, file: File) {
  const storage = getStorage();
  const storageRef = ref(storage, `players/${playerId}/profile.jpg`);
  
  // Subir archivo
  const snapshot = await uploadBytes(storageRef, file);
  
  // Obtener URL pública
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  // Actualizar documento de jugadora
  await updateDoc(doc(db, 'players', playerId), {
    photoUrl: downloadURL,
    updatedAt: serverTimestamp()
  });
  
  return downloadURL;
}
```

### **Código para Eliminar Archivos**

```typescript
import { getStorage, ref, deleteObject } from 'firebase/storage';

async function deletePlayerPhoto(playerId: string) {
  const storage = getStorage();
  const storageRef = ref(storage, `players/${playerId}/profile.jpg`);
  
  try {
    await deleteObject(storageRef);
    
    // Actualizar documento
    await updateDoc(doc(db, 'players', playerId), {
      photoUrl: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
  }
}
```

---

## 🔄 Migración desde localStorage

### **Script de Migración Completo**

```typescript
// /utils/migrateToFirebase.ts

import { collection, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; // Tu configuración de Firebase

export async function migrateLocalStorageToFirebase() {
  try {
    console.log('🚀 Iniciando migración a Firebase...');
    
    // 1. Migrar Jugadoras
    const playersData = localStorage.getItem('cangrejeras_players');
    if (playersData) {
      const players = JSON.parse(playersData);
      const batch = writeBatch(db);
      
      players.forEach((player: any) => {
        const playerRef = doc(db, 'players', player.id);
        batch.set(playerRef, {
          ...player,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Jugadoras migradas');
    }
    
    // 2. Migrar Partidos
    const matchesData = localStorage.getItem('cangrejeras_matches');
    if (matchesData) {
      const matches = JSON.parse(matchesData);
      const batch = writeBatch(db);
      
      matches.forEach((match: any) => {
        const matchRef = doc(db, 'matches', match.id);
        batch.set(matchRef, {
          ...match,
          matchDate: new Date(match.matchDate),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Partidos migrados');
    }
    
    // 3. Migrar Noticias
    const newsData = localStorage.getItem('cangrejeras_news');
    if (newsData) {
      const news = JSON.parse(newsData);
      const batch = writeBatch(db);
      
      news.forEach((article: any) => {
        const newsRef = doc(db, 'news', article.id);
        batch.set(newsRef, {
          ...article,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Noticias migradas');
    }
    
    // 4. Migrar Votaciones
    const votingData = localStorage.getItem('cangrejeras_voting_sessions');
    if (votingData) {
      const votingSessions = JSON.parse(votingData);
      
      for (const session of votingSessions) {
        // Crear sesión
        const sessionRef = doc(db, 'voting_sessions', session.id);
        await setDoc(sessionRef, {
          ...session,
          startsAt: session.startsAt ? new Date(session.startsAt) : null,
          endsAt: session.endsAt ? new Date(session.endsAt) : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Migrar opciones si existen
        if (session.options) {
          const batch = writeBatch(db);
          
          session.options.forEach((option: any) => {
            const optionRef = doc(
              db, 
              `voting_sessions/${session.id}/options`, 
              option.id
            );
            batch.set(optionRef, {
              ...option,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          });
          
          await batch.commit();
        }
      }
      
      console.log('✅ Votaciones migradas');
    }
    
    // 5. Migrar Tabla de Posiciones
    const standingsData = localStorage.getItem('cangrejeras_standings');
    if (standingsData) {
      const standings = JSON.parse(standingsData);
      const batch = writeBatch(db);
      
      standings.forEach((standing: any) => {
        const standingRef = doc(db, 'standings', standing.id);
        batch.set(standingRef, {
          ...standing,
          lastMatchDate: standing.lastMatchDate ? new Date(standing.lastMatchDate) : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Tabla de posiciones migrada');
    }
    
    // 6. Migrar Patrocinadores
    const sponsorsData = localStorage.getItem('cangrejeras_sponsors');
    if (sponsorsData) {
      const sponsors = JSON.parse(sponsorsData);
      const batch = writeBatch(db);
      
      sponsors.forEach((sponsor: any) => {
        const sponsorRef = doc(db, 'sponsors', sponsor.id);
        batch.set(sponsorRef, {
          ...sponsor,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('✅ Patrocinadores migrados');
    }
    
    console.log('🎉 Migración completada exitosamente!');
    
    // Opcional: Limpiar localStorage
    // localStorage.clear();
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return { success: false, error };
  }
}
```

---

## 📝 Configuración de Firebase

### **1. Instalar Firebase SDK**

```bash
npm install firebase
```

### **2. Inicializar Firebase**

```typescript
// /utils/firebase.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### **3. Habilitar Servicios en Firebase Console**

1. **Firestore Database**
   - Cloud Firestore → Crear base de datos
   - Modo: Producción
   - Ubicación: us-east1 (o la más cercana)

2. **Authentication**
   - Authentication → Comenzar
   - Habilitar Email/Password

3. **Storage**
   - Storage → Comenzar
   - Modo: Producción

4. **Cloud Functions** (opcional)
   - Functions → Comenzar
   - Plan Blaze (pago por uso)

---

## 🚀 Resumen de Pasos para Implementar

### **Checklist de Implementación**

- [ ] **1. Configurar proyecto Firebase**
  - [ ] Crear proyecto en Firebase Console
  - [ ] Habilitar Firestore, Auth, Storage
  - [ ] Copiar configuración a `/utils/firebase.ts`

- [ ] **2. Deploy Security Rules**
  - [ ] Crear `firestore.rules`
  - [ ] Crear `storage.rules`
  - [ ] Deploy: `firebase deploy --only firestore:rules,storage`

- [ ] **3. Deploy Índices**
  - [ ] Crear `firestore.indexes.json`
  - [ ] Deploy: `firebase deploy --only firestore:indexes`

- [ ] **4. Configurar Cloud Functions (opcional)**
  - [ ] Inicializar Functions: `firebase init functions`
  - [ ] Implementar triggers en `/functions/src/index.ts`
  - [ ] Deploy: `firebase deploy --only functions`

- [ ] **5. Migrar datos demo**
  - [ ] Ejecutar script de migración
  - [ ] Verificar datos en Firebase Console

- [ ] **6. Actualizar frontend**
  - [ ] Reemplazar localStorage con Firestore queries
  - [ ] Implementar listeners en tiempo real
  - [ ] Configurar Auth con Firebase Auth

- [ ] **7. Testing**
  - [ ] Probar votaciones en vivo
  - [ ] Probar CRUD de administradores
  - [ ] Verificar Security Rules

---

🦀 **¡Base de datos Firebase lista para producción!** 🏐

**Próximos pasos sugeridos:**
1. Integrar Firebase Auth con tu sistema actual
2. Reemplazar Context Providers con Firestore listeners
3. Implementar offline persistence
4. Configurar Analytics y Performance Monitoring

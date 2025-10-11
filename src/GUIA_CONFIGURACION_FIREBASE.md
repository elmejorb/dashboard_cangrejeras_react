# 🔥 Guía de Configuración Firebase/Firestore - Cangrejeras Dashboard

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Configuración Inicial](#configuración-inicial)
3. [Estructura de Colecciones](#estructura-de-colecciones)
4. [Configuración Detallada por Colección](#configuración-detallada-por-colección)
5. [Índices Compuestos](#índices-compuestos)
6. [Reglas de Seguridad](#reglas-de-seguridad)
7. [Firebase Storage](#firebase-storage)
8. [Migration Plan](#migration-plan)

---

## 🎯 Resumen Ejecutivo

### **¿Qué necesitas?**

- **Cuenta de Google** (para acceder a Firebase Console)
- **Firebase Project** (gratis para empezar)
- **Firestore Database** en modo production
- **Firebase Authentication** para admins
- **Firebase Storage** para imágenes/videos

### **Recursos Necesarios:**

```
📦 Firebase Plan: Spark (Gratis) - Suficiente para empezar
   ├─ Firestore: 1GB storage / 50,000 reads por día
   ├─ Storage: 5GB / 20,000 descargas por día
   └─ Authentication: Ilimitado

📈 Plan Blaze (Pay as you go) - Recomendado para producción
   ├─ Mismo límite gratuito + cobro por excedente
   ├─ ~$25-50/mes estimado para tu uso
   └─ Cloud Functions disponibles
```

### **Colecciones Totales:**

```
12 Colecciones Principales
├─ users (Administradores)
├─ players (Jugadoras del Roster)
├─ teams (Equipos del Torneo)
├─ venues (Estadios)
├─ matches (Partidos)
├─ voting_sessions (Sesiones de Votación)
├─ vote_options (Opciones de Voto - Subcollection)
├─ votes (Votos Individuales - Subcollection)
├─ news (Noticias)
├─ standings (Tabla de Posiciones)
├─ media (Galería Multimedia)
└─ sponsors (Patrocinadores)
```

---

## 🚀 Configuración Inicial

### **PASO 1: Crear Proyecto en Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre del proyecto: **"Cangrejeras Dashboard"**
4. Habilitar Google Analytics: **Sí** (recomendado)
5. Seleccionar cuenta de Analytics

### **PASO 2: Crear Firestore Database**

1. En el menú lateral: **Firestore Database**
2. Click: **"Crear base de datos"**
3. Modo: **Producción** (con reglas de seguridad)
4. Ubicación: **us-east1** (más cercano a Puerto Rico)
5. Click: **"Habilitar"**

### **PASO 3: Habilitar Authentication**

1. En el menú lateral: **Authentication**
2. Click: **"Comenzar"**
3. Habilitar método: **Correo/Contraseña**
4. Crear primer usuario administrador:
   ```
   Email: admin@cangrejeras.com
   Contraseña: [Contraseña Segura]
   ```

### **PASO 4: Crear Storage Buckets**

1. En el menú lateral: **Storage**
2. Click: **"Comenzar"**
3. Modo: **Producción**
4. Ubicación: **us-east1**
5. Crear carpetas:
   ```
   /players/      (Fotos de jugadoras)
   /media/        (Galería multimedia)
   /news/         (Imágenes de noticias)
   /sponsors/     (Logos de patrocinadores)
   /teams/        (Logos de equipos)
   ```

---

## 📊 Estructura de Colecciones

### **Diagrama Visual:**

```
firestore/
├── users/                          (Administradores)
│   └── {userId}/
│       ├── email: string
│       ├── name: string
│       ├── role: string
│       └── ...
│
├── players/                        (Jugadoras del Roster)
│   └── {playerId}/
│       ├── name: string
│       ├── number: number
│       ├── position: string
│       ├── photoUrl: string
│       └── ...
│
├── teams/                          (Equipos del Torneo)
│   └── {teamId}/
│       ├── name: string
│       ├── logoUrl: string
│       └── ...
│
├── venues/                         (Estadios)
│   └── {venueId}/
│       ├── name: string
│       ├── address: string
│       └── ...
│
├── matches/                        (Partidos)
│   └── {matchId}/
│       ├── homeTeam: string
│       ├── awayTeam: string
│       ├── venue: string
│       ├── status: string
│       └── ...
│
├── voting_sessions/                (Sesiones de Votación)
│   └── {sessionId}/
│       ├── title: string
│       ├── matchId: reference
│       ├── status: string
│       ├── options/                (Subcollection)
│       │   └── {optionId}/
│       │       ├── playerId: number
│       │       ├── votes: number
│       │       └── percentage: number
│       └── votes/                  (Subcollection)
│           └── {voteId}/
│               ├── optionId: string
│               ├── votedAt: timestamp
│               └── ...
│
├── news/                           (Noticias)
│   └── {newsId}/
│       ├── title: string
│       ├── content: string
│       ├── status: string
│       └── ...
│
├── standings/                      (Tabla de Posiciones)
│   └── {standingId}/
│       ├── teamName: string
│       ├── position: number
│       └── ...
│
├── media/                          (Galería Multimedia)
│   └── {mediaId}/
│       ├── fileUrl: string
│       ├── fileType: string
│       └── ...
│
└── sponsors/                       (Patrocinadores)
    └── {sponsorId}/
        ├── name: string
        ├── logoUrl: string
        └── ...
```

---

## 🗂️ Configuración Detallada por Colección

### **1. Colección: `users` (Administradores)**

**Propósito:** Gestionar usuarios administrativos del dashboard.

**Estructura del Documento:**

```javascript
{
  // ID auto-generado por Firestore
  id: "auto-generated-id",
  
  // Información básica
  email: "admin@cangrejeras.com",           // String (único)
  name: "Ana María Torres",                 // String
  role: "Super Admin",                       // String: "Super Admin" | "Admin" | "Editor" | "Moderador"
  avatarUrl: "https://storage...",           // String (Storage URL)
  
  // Estado
  isActive: true,                            // Boolean
  
  // Timestamps (auto-generados)
  createdAt: Timestamp,                      // Firebase Timestamp
  updatedAt: Timestamp,                      // Firebase Timestamp
  lastLoginAt: Timestamp,                    // Firebase Timestamp
  
  // Firebase Auth UID (importante para security rules)
  uid: "firebase-auth-uid-123"               // String (de Firebase Auth)
}
```

**Campos Requeridos:**
- ✅ `email` - Único, formato email válido
- ✅ `name` - No vacío
- ✅ `role` - Solo valores permitidos: "Super Admin", "Admin", "Editor", "Moderador"

**Índices Necesarios:**
```
1. Campo único: email (ascendente)
2. Campo único: uid (ascendente)
3. Compuesto: role (asc) + isActive (asc)
```

---

### **2. Colección: `players` (Jugadoras del Roster)**

**Propósito:** Información completa de las jugadoras del equipo.

**Estructura del Documento:**

```javascript
{
  // ID auto-generado
  id: "player-natalia-valentin",
  
  // Información básica
  name: "Natalia Valentín",                  // String
  number: 8,                                  // Number (1-99)
  position: "Opuesta",                        // String: "Líbero" | "Central" | "Esquina" | "Opuesta" | "Armadora"
  heightCm: 183,                              // Number
  photoUrl: "https://storage.../natalia.jpg", // String (Storage URL)
  
  // Información adicional
  hometown: "San Juan, PR",                   // String
  college: "UPR Río Piedras",                 // String
  birthDate: Timestamp,                       // Firebase Timestamp
  bio: "Capitana del equipo...",              // String (texto largo)
  
  // Redes sociales (sin @)
  socialInstagram: "nataliavalentin8",        // String
  socialTwitter: "nvalentin8",                // String
  socialTiktok: "nataliaval8",                // String
  
  // Estado y visualización
  isActive: true,                             // Boolean
  isFeatured: true,                           // Boolean
  displayOrder: 1,                            // Number (para ordenar manualmente)
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "reference-to-users/user123"     // Document Reference
}
```

**Campos Requeridos:**
- ✅ `name` - No vacío
- ✅ `number` - Número único entre jugadoras activas (1-99)
- ✅ `position` - Solo valores permitidos

**Validaciones Importantes:**
- `number` debe ser único entre jugadoras donde `isActive = true`
- `position` debe ser uno de: "Líbero", "Central", "Esquina", "Opuesta", "Armadora"

**Índices Necesarios:**
```
1. Campo único (condicional): number (donde isActive = true)
2. Compuesto: isActive (asc) + displayOrder (asc)
3. Compuesto: position (asc) + isActive (asc)
4. Simple: isFeatured (asc)
```

---

### **3. Colección: `teams` (Equipos del Torneo)**

**Propósito:** Lista de equipos participantes en el torneo.

**Estructura del Documento:**

```javascript
{
  id: "team-cangrejeras",
  
  // Información básica
  name: "Cangrejeras",                        // String (único)
  fullName: "Cangrejeras de Santurce",        // String
  logoUrl: "https://storage.../logo.png",     // String (Storage URL)
  
  // Identificación especial
  isOwnTeam: true,                            // Boolean (true solo para Cangrejeras)
  
  // Colores del equipo (hex)
  primaryColor: "#0C2340",                    // String
  secondaryColor: "#C8A963",                  // String
  
  // Estado
  isActive: true,                             // Boolean
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Campos Requeridos:**
- ✅ `name` - Único, no vacío
- ✅ `isOwnTeam` - Solo un equipo puede tener `true`

**Validación Especial:**
- ⚠️ **Cangrejeras NO puede ser eliminado** (protegido en código)

**Índices Necesarios:**
```
1. Campo único: name (ascendente)
2. Simple: isActive (asc)
3. Simple: isOwnTeam (asc)
```

---

### **4. Colección: `venues` (Estadios)**

**Propósito:** Lista de estadios donde se juegan los partidos.

**Estructura del Documento:**

```javascript
{
  id: "venue-coliseo-roberto-clemente",
  
  // Información básica
  name: "Coliseo Roberto Clemente",           // String (único)
  address: "San Juan, Puerto Rico",           // String
  city: "San Juan",                           // String
  
  // Capacidad e información
  capacity: 8500,                             // Number
  imageUrl: "https://storage.../coliseo.jpg", // String (Storage URL)
  
  // Ubicación
  latitude: 18.4344,                          // Number
  longitude: -66.0605,                        // Number
  
  // Estado
  isActive: true,                             // Boolean
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Campos Requeridos:**
- ✅ `name` - Único, no vacío
- ✅ `city` - No vacío

**Índices Necesarios:**
```
1. Campo único: name (ascendente)
2. Simple: isActive (asc)
3. Simple: city (asc)
```

---

### **5. Colección: `matches` (Partidos)**

**Propósito:** Información de todos los partidos (pasados, presentes y futuros).

**Estructura del Documento:**

```javascript
{
  id: "match-20251012-cangrejeras-vs-criollas",
  
  // Equipos
  homeTeam: "Cangrejeras",                    // String (referencia a teams)
  awayTeam: "Criollas",                       // String (referencia a teams)
  isHomeTeam: true,                           // Boolean (true si Cangrejeras es local)
  
  // Fecha y lugar
  date: "2025-10-12",                         // String (YYYY-MM-DD)
  time: "19:00",                              // String (HH:MM formato 24h)
  venue: "Coliseo Roberto Clemente",          // String (referencia a venues)
  
  // Scores
  homeScore: 3,                               // Number (sets ganados local)
  awayScore: 1,                               // Number (sets ganados visitante)
  
  // Estado
  status: "live",                             // String: "upcoming" | "live" | "completed"
  
  // Información adicional
  description: "Partido crucial...",          // String
  ticketUrl: "https://tickets.com/...",       // String
  streamUrl: "https://youtube.com/...",       // String
  
  // Estadísticas del partido
  statistics: {
    home: {
      aces: 8,                                // Number
      blocks: 12,                             // Number
      attacks: 45,                            // Number
      digs: 38                                // Number
    },
    away: {
      aces: 5,
      blocks: 9,
      attacks: 42,
      digs: 35
    }
  },
  
  // Relación con votación
  votingId: "voting-session-id",              // String (ID de voting_session)
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "reference-to-users/user123"
}
```

**Campos Requeridos:**
- ✅ `homeTeam` - No vacío
- ✅ `awayTeam` - No vacío
- ✅ `date` - Formato YYYY-MM-DD
- ✅ `time` - Formato HH:MM (24 horas)
- ✅ `venue` - No vacío
- ✅ `status` - Solo valores permitidos

**Validaciones:**
- `homeTeam` ≠ `awayTeam`
- `status` debe ser: "upcoming", "live", "completed"
- Si `status = "completed"`, debe tener `homeScore` y `awayScore`

**Índices Necesarios:**
```
1. Compuesto: status (asc) + date (desc) + time (desc)
2. Simple: votingId (asc)
3. Compuesto: date (desc) + status (asc)
```

---

### **6. Colección: `voting_sessions` (Sesiones de Votación)**

**Propósito:** Configuración de votaciones activas o pasadas.

**Estructura del Documento:**

```javascript
{
  id: "voting-mvp-match-001",
  
  // Configuración básica
  title: "MVP del Partido",                   // String
  description: "¡Vota por la mejor jugadora!", // String
  type: "mvp",                                // String: "mvp" | "best_player" | "custom"
  
  // Relación con partido (opcional)
  matchId: "match-20251012-...",              // String (ID de match)
  
  // Estado
  status: "active",                           // String: "draft" | "active" | "closed"
  isActive: true,                             // Boolean
  
  // Configuración de votación
  allowMultipleVotes: false,                  // Boolean
  showResults: true,                          // Boolean
  autoStart: true,                            // Boolean
  autoClose: false,                           // Boolean
  
  // Fechas
  startsAt: Timestamp,                        // Firebase Timestamp
  endsAt: Timestamp,                          // Firebase Timestamp
  
  // Contadores
  totalVotes: 1247,                           // Number
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "reference-to-users/user123"
}
```

**Subcollection: `voting_sessions/{sessionId}/options`**

```javascript
{
  id: "option-player-1",
  
  // Referencia a jugadora
  playerId: 1,                                // Number (ID de player)
  
  // Contadores (actualizados en tiempo real)
  votes: 245,                                 // Number
  percentage: 42.3,                           // Number (calculado)
  
  // Orden de visualización
  displayOrder: 1,                            // Number
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Subcollection: `voting_sessions/{sessionId}/votes`**

```javascript
{
  id: "vote-abc123",
  
  // Opción votada
  optionId: "option-player-1",                // String
  
  // Identificación del votante
  voterFingerprint: "sha256-hash...",         // String (hash de IP+UserAgent)
  ipAddress: "192.168.1.1",                   // String
  userAgent: "Mozilla/5.0...",                // String
  
  // Metadata
  votedAt: Timestamp
}
```

**Campos Requeridos:**
- ✅ `title` - No vacío
- ✅ `type` - Solo valores permitidos
- ✅ `status` - Solo valores permitidos

**Validaciones:**
- Un `voterFingerprint` solo puede votar una vez por sesión
- `startsAt` debe ser menor que `endsAt`
- `percentage` en options debe sumar 100%

**Índices Necesarios:**
```
voting_sessions:
1. Compuesto: status (asc) + isActive (asc)
2. Simple: matchId (asc)
3. Compuesto: startsAt (desc) + status (asc)

voting_sessions/{sessionId}/options:
1. Simple: votes (desc)
2. Simple: displayOrder (asc)

voting_sessions/{sessionId}/votes:
1. Campo único: voterFingerprint (para prevenir votos duplicados)
2. Simple: votedAt (desc)
```

---

### **7. Colección: `news` (Noticias)**

**Propósito:** Sistema de gestión de noticias del equipo.

**Estructura del Documento:**

```javascript
{
  id: "news-victoria-historica-2025",
  
  // Contenido
  title: "¡Victoria Histórica!",              // String
  slug: "victoria-historica-2025",            // String (auto-generado, único)
  content: "<p>En un partido...</p>",         // String (HTML o Markdown)
  excerpt: "Resumen breve...",                // String
  coverImage: "https://storage.../cover.jpg", // String (Storage URL)
  
  // Categorización
  category: "Partido",                        // String: "Partido" | "Jugadora" | "Equipo" | "Anuncio"
  tags: ["victoria", "playoffs"],             // Array de Strings
  
  // Estado
  status: "published",                        // String: "draft" | "scheduled" | "published" | "archived"
  isFeatured: true,                           // Boolean
  
  // Fechas
  publishedAt: Timestamp,
  scheduledFor: Timestamp,                    // Para publicación programada
  
  // Engagement
  views: 3542,                                // Number
  likes: 287,                                 // Number
  
  // Relaciones opcionales
  relatedMatchId: "match-id",                 // String
  relatedPlayerId: "player-id",               // String
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "reference-to-users/user123"
}
```

**Campos Requeridos:**
- ✅ `title` - No vacío
- ✅ `slug` - Único, auto-generado si no se provee
- ✅ `content` - No vacío
- ✅ `status` - Solo valores permitidos
- ✅ `category` - Solo valores permitidos

**Índices Necesarios:**
```
1. Campo único: slug (ascendente)
2. Compuesto: status (asc) + publishedAt (desc)
3. Compuesto: category (asc) + status (asc) + publishedAt (desc)
4. Compuesto: isFeatured (asc) + status (asc) + publishedAt (desc)
5. Simple: views (desc)
```

---

### **8. Colección: `standings` (Tabla de Posiciones)**

**Propósito:** Tabla de posiciones de la liga/torneo.

**Estructura del Documento:**

```javascript
{
  id: "standing-cangrejeras-2025",
  
  // Temporada
  season: "2024-2025",                        // String
  competition: "LVSF",                        // String
  
  // Equipo
  teamName: "Cangrejeras de Santurce",        // String
  teamLogoUrl: "https://storage.../logo.png", // String
  isOwnTeam: true,                            // Boolean
  
  // Posición
  position: 2,                                // Number (1-N)
  
  // Estadísticas
  matchesPlayed: 12,                          // Number
  matchesWon: 9,                              // Number
  matchesLost: 3,                             // Number
  
  setsWon: 31,                                // Number
  setsLost: 15,                               // Number
  
  pointsFor: 2847,                            // Number
  pointsAgainst: 2513,                        // Number
  
  // Puntos de liga
  points: 27,                                 // Number
  
  // Racha (últimos 5 partidos)
  form: "WWLWW",                              // String (W=Win, L=Loss)
  
  // Metadata
  lastMatchDate: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Campos Requeridos:**
- ✅ `season` - No vacío
- ✅ `teamName` - No vacío
- ✅ `position` - Mayor que 0

**Validaciones:**
- Solo un equipo puede tener `isOwnTeam = true` por temporada
- `position` debe ser único por season + competition

**Índices Necesarios:**
```
1. Compuesto: season (asc) + competition (asc) + position (asc)
2. Compuesto: season (asc) + competition (asc) + points (desc)
3. Simple: isOwnTeam (asc)
```

---

### **9. Colección: `media` (Galería Multimedia)**

**Propósito:** Biblioteca de fotos, videos y recursos multimedia.

**Estructura del Documento:**

```javascript
{
  id: "media-partido-2025-10-12",
  
  // Archivo
  fileName: "partido-cangrejeras-criollas.jpg", // String
  fileUrl: "https://storage.../file.jpg",      // String (Storage URL)
  fileType: "image",                           // String: "image" | "video"
  fileSize: 2458624,                           // Number (bytes)
  mimeType: "image/jpeg",                      // String
  
  // Metadata del archivo
  width: 1920,                                 // Number (para imágenes)
  height: 1080,                                // Number (para imágenes)
  duration: 0,                                 // Number (para videos, en segundos)
  
  // Organización
  title: "Victoria contra las Criollas",       // String
  description: "Celebración del equipo...",    // String
  altText: "Jugadoras celebrando victoria",    // String (accesibilidad)
  category: "Partido",                         // String: "Partido" | "Entrenamiento" | "Evento"
  tags: ["partido", "victoria"],               // Array de Strings
  
  // Relaciones opcionales
  relatedMatchId: "match-id",                  // String
  relatedPlayerId: "player-id",                // String
  relatedNewsId: "news-id",                    // String
  
  // Estado
  isFeatured: false,                           // Boolean
  isPublic: true,                              // Boolean
  
  // Metadata
  uploadedAt: Timestamp,
  uploadedBy: "reference-to-users/user123"
}
```

**Campos Requeridos:**
- ✅ `fileName` - No vacío
- ✅ `fileUrl` - No vacío
- ✅ `fileType` - Solo valores permitidos

**Índices Necesarios:**
```
1. Compuesto: fileType (asc) + isPublic (asc) + uploadedAt (desc)
2. Compuesto: category (asc) + isFeatured (asc) + uploadedAt (desc)
3. Simple: relatedMatchId (asc)
4. Simple: relatedPlayerId (asc)
```

---

### **10. Colección: `sponsors` (Patrocinadores)**

**Propósito:** Gestión de patrocinadores y partners.

**Estructura del Documento:**

```javascript
{
  id: "sponsor-coca-cola",
  
  // Información básica
  name: "Coca-Cola",                          // String
  logoUrl: "https://storage.../logo.png",     // String (Storage URL)
  websiteUrl: "https://coca-cola.com",        // String
  
  // Clasificación
  tier: "Gold",                               // String: "Platinum" | "Gold" | "Silver" | "Bronze"
  
  // Visibilidad
  isActive: true,                             // Boolean
  displayOrder: 2,                            // Number (para ordenar)
  showInApp: true,                            // Boolean
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Campos Requeridos:**
- ✅ `name` - No vacío
- ✅ `logoUrl` - No vacío
- ✅ `tier` - Solo valores permitidos

**Índices Necesarios:**
```
1. Compuesto: isActive (asc) + tier (asc) + displayOrder (asc)
2. Simple: showInApp (asc)
```

---

## 🔍 Índices Compuestos

### **¿Por qué son importantes?**

Los índices permiten queries rápidas. Sin ellos, Firestore escanea toda la colección (lento y costoso).

### **Cómo crear índices:**

1. **Opción A: Desde Firebase Console**
   - Ve a Firestore Database → Indexes
   - Click "Create Index"
   - Selecciona colección y campos

2. **Opción B: Automático (Recomendado)**
   - Cuando hagas una query que necesite un índice, Firestore te dará un link
   - Click en el link para crear el índice automáticamente

### **Lista de Índices Prioritarios:**

```javascript
// IMPORTANTE: Crear ESTOS índices primero

1. matches:
   - status (Ascending) + date (Descending)
   - date (Descending) + status (Ascending)

2. voting_sessions:
   - status (Ascending) + isActive (Ascending)
   - matchId (Ascending) + status (Ascending)

3. voting_sessions/{sessionId}/options:
   - votes (Descending)

4. players:
   - isActive (Ascending) + displayOrder (Ascending)
   - position (Ascending) + isActive (Ascending)

5. news:
   - status (Ascending) + publishedAt (Descending)
   - category (Ascending) + status (Ascending) + publishedAt (Descending)

6. standings:
   - season (Ascending) + competition (Ascending) + position (Ascending)
```

---

## 🔐 Reglas de Seguridad

### **Archivo: `firestore.rules`**

Copia y pega estas reglas en Firebase Console → Firestore → Rules:

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
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // ========================================
    // REGLAS DE ACCESO PÚBLICO (FAN APP)
    // ========================================
    
    // Jugadoras activas - lectura pública
    match /players/{playerId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
    }
    
    // Equipos activos - lectura pública
    match /teams/{teamId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
    }
    
    // Estadios activos - lectura pública
    match /venues/{venueId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
    }
    
    // Partidos - lectura pública
    match /matches/{matchId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Votaciones activas - lectura pública
    match /voting_sessions/{sessionId} {
      allow read: if resource.data.status in ['active', 'closed'];
      allow write: if isAdmin();
      
      // Opciones de voto - lectura pública
      match /options/{optionId} {
        allow read: if true;
        allow update: if true; // Actualizar contadores
        allow create, delete: if isAdmin();
      }
      
      // Votos - cualquiera puede votar
      match /votes/{voteId} {
        allow read: if isAdmin();
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
      allow write: if isAdmin();
    }
    
    // Patrocinadores activos - lectura pública
    match /sponsors/{sponsorId} {
      allow read: if resource.data.isActive == true && resource.data.showInApp == true;
      allow write: if isAdmin();
    }
    
    // ========================================
    // REGLAS SOLO PARA ADMINS
    // ========================================
    
    // Usuarios - solo admins
    match /users/{userId} {
      allow read, write: if isAdmin();
    }
  }
}
```

### **Reglas de Storage:**

Archivo: `storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Carpeta de jugadoras
    match /players/{fileName} {
      allow read: if true; // Lectura pública
      allow write: if request.auth != null; // Solo usuarios autenticados pueden subir
    }
    
    // Carpeta de media
    match /media/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Carpeta de noticias
    match /news/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Carpeta de patrocinadores
    match /sponsors/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Carpeta de equipos
    match /teams/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📦 Firebase Storage

### **Estructura de Carpetas:**

```
gs://cangrejeras-dashboard.appspot.com/
├── players/
│   ├── natalia-valentin-8.jpg          (640x640, max 500KB)
│   ├── stephanie-enright-10.jpg
│   └── ...
│
├── media/
│   ├── partidos/
│   │   ├── 2025-10-12-partido-1.jpg
│   │   └── 2025-10-12-partido-2.mp4
│   ├── entrenamientos/
│   └── eventos/
│
├── news/
│   ├── covers/
│   │   └── victoria-historica-cover.jpg
│   └── content/
│       └── victoria-historica-img1.jpg
│
├── sponsors/
│   ├── coca-cola-logo.png              (transparent PNG, 400x200)
│   ├── banco-popular-logo.png
│   └── ...
│
└── teams/
    ├── cangrejeras-logo.png
    ├── criollas-logo.png
    └── ...
```

### **Guía de Nombres de Archivos:**

```javascript
// Formato recomendado:

Players:
{nombre-completo}-{numero}.{ext}
Ejemplo: natalia-valentin-8.jpg

Teams:
{nombre-equipo}-logo.{ext}
Ejemplo: cangrejeras-logo.png

Sponsors:
{nombre-sponsor}-logo.{ext}
Ejemplo: coca-cola-logo.png

Media:
{fecha}-{descripcion}.{ext}
Ejemplo: 2025-10-12-celebracion-victoria.jpg

News:
{slug}-{tipo}.{ext}
Ejemplo: victoria-historica-cover.jpg
```

### **Especificaciones de Imágenes:**

```
Fotos de Jugadoras:
├─ Formato: JPG o PNG
├─ Tamaño: 640x640px (cuadrado)
├─ Peso máximo: 500KB
└─ Fondo: Transparente o sólido

Logos de Equipos:
├─ Formato: PNG (con transparencia)
├─ Tamaño: 400x400px
├─ Peso máximo: 200KB
└─ Fondo: Transparente

Logos de Sponsors:
├─ Formato: PNG (con transparencia)
├─ Tamaño: 400x200px (landscape)
├─ Peso máximo: 150KB
└─ Fondo: Transparente

Covers de Noticias:
├─ Formato: JPG
├─ Tamaño: 1200x630px (Open Graph)
├─ Peso máximo: 1MB
└─ Calidad: 80-85%

Media General:
├─ Imágenes: JPG/PNG, max 2MB
└─ Videos: MP4, max 50MB, max 2 minutos
```

---

## 🔄 Migration Plan

### **Estrategia de Migración desde localStorage**

#### **Fase 1: Preparación (Semana 1)**

1. **Crear estructura en Firebase**
   - ✅ Crear todas las colecciones
   - ✅ Configurar índices prioritarios
   - ✅ Implementar reglas de seguridad

2. **Crear usuarios administradores**
   ```javascript
   // Usuarios iniciales:
   1. Super Admin: admin@cangrejeras.com
   2. Admin: editor@cangrejeras.com
   3. Editor: social@cangrejeras.com
   ```

3. **Subir assets a Storage**
   - Fotos de jugadoras
   - Logos de equipos
   - Logos de patrocinadores

#### **Fase 2: Migración de Datos (Semana 2)**

**Orden de migración:**

```
1. users           (Primero - necesario para referencias)
2. teams           (Base para matches)
3. venues          (Base para matches)
4. players         (Base para votaciones)
5. sponsors        (Independiente)
6. matches         (Depende de teams/venues)
7. voting_sessions (Depende de matches/players)
8. news            (Puede tener referencias a matches/players)
9. standings       (Independiente)
10. media          (Últimas - referencias opcionales)
```

**Script de Migración (Ejemplo para players):**

```javascript
// Script de migración: migratePlayersToFirestore.js

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config';

// Datos actuales de localStorage
const currentPlayers = [
  {
    id: 1,
    name: "Natalia Valentín",
    number: 8,
    position: "Opuesta",
    heightCm: 183,
    photoUrl: "https://storage.googleapis.com/.../natalia-valentin-8.jpg",
    hometown: "San Juan, PR",
    college: "UPR Río Piedras",
    bio: "Capitana del equipo...",
    socialInstagram: "nataliavalentin8",
    isActive: true,
    isFeatured: true,
    displayOrder: 1
  },
  // ... más jugadoras
];

async function migratePlayers() {
  const playersRef = collection(db, 'players');
  
  for (const player of currentPlayers) {
    try {
      await addDoc(playersRef, {
        ...player,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // Nota: createdBy se puede agregar después si es necesario
      });
      console.log(`✅ Migrated: ${player.name}`);
    } catch (error) {
      console.error(`❌ Error migrating ${player.name}:`, error);
    }
  }
  
  console.log('🎉 Migration complete!');
}

migratePlayers();
```

#### **Fase 3: Actualización del Código (Semana 3)**

1. **Instalar Firebase SDK**
   ```bash
   npm install firebase
   ```

2. **Configurar Firebase en el proyecto**
   ```javascript
   // firebase-config.js
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "cangrejeras-dashboard.firebaseapp.com",
     projectId: "cangrejeras-dashboard",
     storageBucket: "cangrejeras-dashboard.appspot.com",
     messagingSenderId: "123456789",
     appId: "TU_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   export const auth = getAuth(app);
   export const storage = getStorage(app);
   ```

3. **Actualizar Contexts para usar Firestore**
   - PlayerContext → Firestore players
   - MatchContext → Firestore matches
   - VotingContext → Firestore voting_sessions

#### **Fase 4: Testing (Semana 4)**

1. **Testing en desarrollo**
   - CRUD completo de cada colección
   - Votaciones en tiempo real
   - Upload de imágenes

2. **Testing de performance**
   - Queries con índices
   - Carga de datos paginada
   - Realtime listeners

3. **Testing de seguridad**
   - Security rules funcionando
   - Acceso público vs admin
   - Prevención de votos duplicados

#### **Fase 5: Despliegue (Semana 5)**

1. **Backup de datos actuales**
2. **Deploy a producción**
3. **Monitoreo post-deploy**
4. **Remover localStorage (gradualmente)**

---

## 📝 Checklist de Configuración

### **Antes de Empezar:**

```
□ Cuenta de Google creada
□ Acceso a Firebase Console
□ Tarjeta de crédito lista (para Plan Blaze si es necesario)
□ Dominio personalizado (opcional)
```

### **Configuración Inicial:**

```
□ Proyecto Firebase creado
□ Firestore Database habilitado (modo producción)
□ Firebase Authentication habilitado (Email/Password)
□ Firebase Storage habilitado
□ Primer usuario admin creado en Authentication
□ Reglas de seguridad copiadas y publicadas
```

### **Estructura de Datos:**

```
□ Colección 'users' creada
□ Colección 'players' creada
□ Colección 'teams' creada
□ Colección 'venues' creada
□ Colección 'matches' creada
□ Colección 'voting_sessions' creada (con subcollections)
□ Colección 'news' creada
□ Colección 'standings' creada
□ Colección 'media' creada
□ Colección 'sponsors' creada
```

### **Índices Compuestos:**

```
□ Índices de matches creados
□ Índices de voting_sessions creados
□ Índices de players creados
□ Índices de news creados
□ Índices de standings creados
```

### **Storage:**

```
□ Carpeta /players/ creada
□ Carpeta /teams/ creada
□ Carpeta /media/ creada
□ Carpeta /news/ creada
□ Carpeta /sponsors/ creada
□ Storage rules copiadas y publicadas
```

### **Testing:**

```
□ Crear documento de prueba en cada colección
□ Probar lectura pública (sin autenticación)
□ Probar escritura como admin
□ Probar votación anónima
□ Probar upload de imagen a Storage
□ Probar query con índice compuesto
```

---

## 🚨 Errores Comunes y Soluciones

### **Error 1: "Missing or insufficient permissions"**

**Causa:** Security rules muy restrictivas o usuario no autenticado.

**Solución:**
```javascript
// Verificar que el usuario esté autenticado
console.log('User:', auth.currentUser);

// Verificar reglas en Firebase Console → Firestore → Rules
// Asegurar que las reglas permitan lectura pública para colecciones necesarias
```

### **Error 2: "The query requires an index"**

**Causa:** Query compuesta sin índice creado.

**Solución:**
```javascript
// Firebase te dará un link en el error
// Click en el link para crear el índice automáticamente
// O créalo manualmente en Firebase Console → Firestore → Indexes
```

### **Error 3: "Quota exceeded"**

**Causa:** Límite del plan gratuito alcanzado.

**Solución:**
```javascript
// Opción 1: Esperar a que se resetee el límite diario
// Opción 2: Upgrade a Plan Blaze (pay as you go)
// Opción 3: Optimizar queries (usar limit, paginación)
```

### **Error 4: "Document already exists"**

**Causa:** Intentar crear documento con ID que ya existe.

**Solución:**
```javascript
// Usar addDoc() en vez de setDoc() para auto-generar ID
// O verificar si existe antes de crear:
const docRef = doc(db, 'players', playerId);
const docSnap = await getDoc(docRef);
if (!docSnap.exists()) {
  await setDoc(docRef, data);
}
```

---

## 📚 Recursos Adicionales

### **Documentación Oficial:**

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Pricing Calculator](https://firebase.google.com/pricing)

### **Videos Tutorial (Español):**

- Firestore para Principiantes
- Security Rules Explicadas
- Firebase Storage: Upload de Imágenes

### **Herramientas Útiles:**

- [Firestore Emulator](https://firebase.google.com/docs/emulator-suite) - Testing local
- [Firebase Extensions](https://firebase.google.com/products/extensions) - Funcionalidades pre-built
- [Firebase Analytics](https://firebase.google.com/docs/analytics) - Métricas de uso

---

## 💰 Estimación de Costos

### **Plan Spark (Gratis):**

```
✅ Suficiente para:
   - Testing y desarrollo
   - ~1,000 usuarios activos/día
   - ~50,000 lecturas/día
   - 1GB storage
   - 10GB bandwidth/mes

❌ Limitaciones:
   - No Cloud Functions
   - Límites estrictos
```

### **Plan Blaze (Recomendado para Producción):**

```javascript
// Estimación mensual:

Firestore:
├─ 1,000,000 lecturas = $0.60
├─ 100,000 escrituras = $0.18
└─ 1GB storage = $0.18

Storage:
├─ 5GB almacenado = $0.13
└─ 50GB bandwidth = $0.12

Authentication:
└─ Gratis (ilimitado)

TOTAL ESTIMADO: ~$25-50/mes
(basado en ~10,000 fans activos)
```

---

## ✅ Próximos Pasos

1. **Crear Proyecto Firebase** (30 minutos)
2. **Configurar Colecciones Básicas** (2 horas)
3. **Subir Datos Iniciales** (1 día)
4. **Implementar en Código** (1 semana)
5. **Testing Completo** (1 semana)
6. **Deploy a Producción** (1 día)

---

## 🎉 ¡Listo para Empezar!

Con esta guía tienes todo lo necesario para configurar Firebase/Firestore para el dashboard de las Cangrejeras.

**Cualquier duda, consulta esta documentación o los archivos:**
- `/FIREBASE_DATABASE_SCHEMA.md` - Esquema detallado
- `/VOTING_ARCHITECTURE.md` - Sistema de votaciones
- `/SINGLE_SOURCE_OF_TRUTH.md` - Arquitectura de datos

**¡Wepa! 🦀🏐**
# 🚀 Resumen Rápido: Configuración Firebase - Cangrejeras Dashboard

## ⚡ Para comenzar AHORA mismo (15 minutos)

### **PASO 1: Crear Proyecto (5 min)**

1. Ve a: https://console.firebase.google.com/
2. Click: **"Agregar proyecto"**
3. Nombre: **"Cangrejeras Dashboard"**
4. Habilitar Google Analytics: **Sí**
5. Click: **"Crear proyecto"**

---

### **PASO 2: Configurar Firestore (3 min)**

1. Menú lateral → **"Firestore Database"**
2. Click: **"Crear base de datos"**
3. Modo: **Producción** ✅
4. Ubicación: **us-east1** (más cercano a PR)
5. Click: **"Habilitar"**

---

### **PASO 3: Configurar Authentication (3 min)**

1. Menú lateral → **"Authentication"**
2. Click: **"Comenzar"**
3. Habilitar: **"Correo electrónico/Contraseña"** ✅
4. Click en pestaña: **"Users"**
5. Click: **"Agregar usuario"**
6. Crear primer admin:
   ```
   Email: admin@cangrejeras.com
   Contraseña: [TuContraseñaSegura123!]
   ```

---

### **PASO 4: Configurar Storage (2 min)**

1. Menú lateral → **"Storage"**
2. Click: **"Comenzar"**
3. Modo: **Producción** ✅
4. Ubicación: **us-east1**
5. Click: **"Listo"**

---

### **PASO 5: Copiar Configuración (2 min)**

1. Click en el ⚙️ (settings) arriba a la izquierda
2. **"Configuración del proyecto"**
3. Scroll down a: **"Tus apps"**
4. Click: **"</>" (Web)**
5. Nombre de app: **"Cangrejeras Dashboard Web"**
6. **NO** marcar Firebase Hosting
7. Click: **"Registrar app"**
8. **COPIAR** todo el objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // ← COPIAR ESTOS VALORES
  authDomain: "cangrejeras-dashboard.firebaseapp.com",
  projectId: "cangrejeras-dashboard",
  storageBucket: "cangrejeras-dashboard.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

9. **GUARDAR** estos valores - los necesitarás para el código

---

## 📝 Siguiente: Crear Colecciones

### **Ir a Firestore Database → "Iniciar colección"**

Crear estas colecciones (una por una):

```
1. ✅ users
   - ID del documento: auto
   - Campo de ejemplo: email (string): "admin@cangrejeras.com"

2. ✅ players
   - ID del documento: auto
   - Campo de ejemplo: name (string): "Natalia Valentín"

3. ✅ teams
   - ID del documento: auto
   - Campo de ejemplo: name (string): "Cangrejeras"

4. ✅ venues
   - ID del documento: auto
   - Campo de ejemplo: name (string): "Coliseo Roberto Clemente"

5. ✅ matches
   - ID del documento: auto
   - Campo de ejemplo: homeTeam (string): "Cangrejeras"

6. ✅ voting_sessions
   - ID del documento: auto
   - Campo de ejemplo: title (string): "MVP del Partido"

7. ✅ news
   - ID del documento: auto
   - Campo de ejemplo: title (string): "¡Victoria Histórica!"

8. ✅ standings
   - ID del documento: auto
   - Campo de ejemplo: teamName (string): "Cangrejeras"

9. ✅ media
   - ID del documento: auto
   - Campo de ejemplo: fileName (string): "foto-partido.jpg"

10. ✅ sponsors
    - ID del documento: auto
    - Campo de ejemplo: name (string): "Coca-Cola"
```

**Nota:** Solo crea las colecciones, los campos de ejemplo son opcionales (puedes borrarlos después).

---

## 🔐 Reglas de Seguridad

### **Firestore Rules:**

1. Ve a: **Firestore Database → Rules**
2. **REEMPLAZA TODO** con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Usuario autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Usuario es admin
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // Lectura pública, escritura solo admins
    match /players/{playerId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
    }
    
    match /teams/{teamId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
    }
    
    match /venues/{venueId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
    }
    
    match /matches/{matchId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /voting_sessions/{sessionId} {
      allow read: if resource.data.status in ['active', 'closed'];
      allow write: if isAdmin();
      
      match /options/{optionId} {
        allow read: if true;
        allow update: if true; // Actualizar contadores de votos
        allow create, delete: if isAdmin();
      }
      
      match /votes/{voteId} {
        allow read: if isAdmin();
        allow create: if true; // Cualquiera puede votar
        allow update, delete: if false;
      }
    }
    
    match /news/{newsId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    
    match /standings/{standingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /media/{mediaId} {
      allow read: if resource.data.isPublic == true;
      allow write: if isAdmin();
    }
    
    match /sponsors/{sponsorId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin();
    }
    
    match /users/{userId} {
      allow read, write: if isAdmin();
    }
  }
}
```

3. Click: **"Publicar"** ✅

---

### **Storage Rules:**

1. Ve a: **Storage → Rules**
2. **REEMPLAZA TODO** con esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Todas las carpetas: lectura pública, escritura autenticada
    match /{folder}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click: **"Publicar"** ✅

---

## 📁 Crear Carpetas en Storage

1. Ve a: **Storage → Files**
2. Click: **"Crear carpeta"**
3. Crear estas carpetas:

```
✅ players/
✅ teams/
✅ media/
✅ news/
✅ sponsors/
```

---

## ✅ Checklist Final

Verifica que tienes:

```
□ Proyecto Firebase creado
□ Firestore Database habilitado (modo producción)
□ 10 colecciones creadas (users, players, teams, venues, matches, voting_sessions, news, standings, media, sponsors)
□ Authentication habilitado (Email/Password)
□ Usuario admin creado
□ Storage habilitado
□ 5 carpetas en Storage creadas
□ Firestore Rules publicadas
□ Storage Rules publicadas
□ firebaseConfig copiado y guardado
```

---

## 🎯 Datos que necesitas entregar al equipo de desarrollo:

```javascript
// Firebase Config (del Paso 5)
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "cangrejeras-dashboard.firebaseapp.com",
  projectId: "cangrejeras-dashboard",
  storageBucket: "cangrejeras-dashboard.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// Admin Credentials
Email: admin@cangrejeras.com
Password: [La contraseña que creaste]
```

---

## 📚 Próximos Pasos (Después de la configuración inicial)

1. **Leer documentación completa:** `/GUIA_CONFIGURACION_FIREBASE.md`
2. **Crear índices compuestos** (cuando el sistema te lo pida al hacer queries)
3. **Migrar datos** desde localStorage a Firestore
4. **Subir fotos** de jugadoras a Storage
5. **Configurar plan Blaze** si necesitas Cloud Functions (opcional al inicio)

---

## 💰 Costos Estimados

### **Plan Spark (Gratis) - Suficiente para empezar:**
```
✅ 1GB storage
✅ 50,000 lecturas/día
✅ 20,000 escrituras/día
✅ 10,000 deletes/día
```

### **Plan Blaze (Recomendado para producción):**
```
💵 ~$25-50/mes (para ~10,000 fans activos)
✅ Mismo límite gratis + cobro por excedente
✅ Cloud Functions disponibles
```

---

## 🆘 Si algo sale mal

### **Error: "Missing or insufficient permissions"**
- Verificar que las **Rules están publicadas**
- Verificar que el **usuario admin existe en Authentication**

### **Error: "The query requires an index"**
- Firebase te dará un **link en el error**
- Click en el link para crear el índice automáticamente

### **No puedo crear colecciones**
- Verificar que estás en **modo Producción** (no Test mode)
- Verificar que las **Rules permiten escribir**

---

## 📞 Contacto y Ayuda

- **Documentación completa:** Ver archivo `/GUIA_CONFIGURACION_FIREBASE.md`
- **Esquema detallado:** Ver archivo `/FIREBASE_DATABASE_SCHEMA.md`
- **Soporte Firebase:** https://firebase.google.com/support
- **Console Firebase:** https://console.firebase.google.com/

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, el sistema Firebase estará configurado y listo para que el equipo de desarrollo lo integre en la aplicación.

**Tiempo total estimado:** 15-20 minutos

**¡Wepa! 🦀🏐**

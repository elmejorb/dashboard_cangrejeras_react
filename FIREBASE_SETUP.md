# 🔥 Guía de Configuración de Firebase

Esta guía te explica cómo configurar Firebase para guardar datos adicionales de usuarios (nombre, rol, avatar, etc.) usando Firestore Database.

---

## 📋 Pasos en Firebase Console

### 1️⃣ Habilitar Firestore Database

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **cangrejeras-de-santurce**
3. En el menú lateral, click en **"Firestore Database"**
4. Click en **"Create database"**
5. Selecciona el modo:
   - ✅ **Production mode** (recomendado) - con reglas de seguridad
   - 🧪 Test mode - solo para desarrollo (no recomendado para producción)
6. Selecciona la ubicación más cercana (ej: `us-east1`, `southamerica-east1`)
7. Click en **"Enable"**

### 2️⃣ Configurar Reglas de Seguridad

1. En Firestore, ve a la pestaña **"Rules"**
2. Copia y pega estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Colección de usuarios
    match /users/{userId} {
      // Los usuarios pueden leer sus propios datos
      allow read: if request.auth != null && request.auth.uid == userId;

      // Los usuarios pueden actualizar sus propios datos (excepto el rol)
      allow update: if request.auth != null &&
                      request.auth.uid == userId &&
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'email']);

      // Solo usuarios autenticados pueden crear su perfil
      allow create: if request.auth != null && request.auth.uid == userId;

      // No se permite eliminar usuarios
      allow delete: if false;
    }

    // Super admins pueden leer y modificar todos los usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Super Admin';
    }
  }
}
```

3. Click en **"Publish"**

### 3️⃣ Crear la Colección de Usuarios

#### Opción A: Manualmente en Firebase Console

1. Ve a la pestaña **"Data"** en Firestore
2. Click en **"Start collection"**
3. Collection ID: `users`
4. Click en **"Next"**
5. Document ID: **Usar el UID del usuario de Authentication** (copia el UID de Authentication)
6. Agregar estos campos:

| Campo | Tipo | Valor |
|-------|------|-------|
| `name` | string | "Admin Principal" |
| `email` | string | "admin@cangrejeras.com" |
| `role` | string | "Super Admin" |
| `avatar` | string | "" (vacío) |
| `createdAt` | timestamp | [Click en "Current timestamp"] |
| `updatedAt` | timestamp | [Click en "Current timestamp"] |
| `lastLogin` | timestamp | [Click en "Current timestamp"] |

7. Click en **"Save"**

#### Opción B: Crear usuarios desde el código

El código ya está preparado para crear usuarios automáticamente. Cuando un usuario se registre, se creará automáticamente su documento en Firestore.

---

## 🔐 Crear Usuarios de Prueba

### 1. Crear usuario en Authentication

1. Ve a **Authentication** → **Users**
2. Click en **"Add user"**
3. Ingresa:
   - Email: `admin@cangrejeras.com`
   - Password: `admin123` (o la que prefieras)
4. Click en **"Add user"**
5. **Copia el UID del usuario** (lo necesitarás)

### 2. Crear el documento del usuario en Firestore

**Opción 1: Manualmente (recomendado para el primer usuario)**

1. Ve a **Firestore Database** → **Data**
2. En la colección `users`, click en **"Add document"**
3. Document ID: **Pega el UID que copiaste**
4. Agrega los campos como se indica arriba

**Opción 2: Automáticamente desde el login**

El sistema creará automáticamente el documento con datos básicos la primera vez que el usuario inicie sesión. Sin embargo, el rol será "Admin" por defecto. Deberás cambiarlo manualmente en Firestore si quieres que sea "Super Admin".

---

## 📊 Estructura de Datos en Firestore

### Colección: `users`

```typescript
{
  // Document ID: [UID del usuario]
  name: string,              // "María González"
  email: string,             // "maria@cangrejeras.com"
  role: string,              // "Super Admin" | "Admin" | "Editor" | "Moderador"
  avatar: string,            // URL de la imagen o vacío
  createdAt: Timestamp,      // Fecha de creación
  updatedAt: Timestamp,      // Última actualización
  lastLogin: Timestamp       // Último inicio de sesión
}
```

### Ejemplo de documento:

```json
{
  "name": "Laura Rodríguez",
  "email": "laura@cangrejeras.com",
  "role": "Super Admin",
  "avatar": "https://example.com/avatar.jpg",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "lastLogin": "2025-01-15T14:25:00.000Z"
}
```

---

## 🎯 Roles Disponibles

El sistema soporta 4 roles:

1. **Super Admin** - Acceso total, puede gestionar otros usuarios
2. **Admin** - Acceso administrativo general
3. **Editor** - Puede editar contenido
4. **Moderador** - Permisos limitados

---

## 💻 Cómo Funciona en el Código

### 1. Al iniciar sesión:

```typescript
const { login } = useAuth();

// Firebase autentica al usuario
// Luego busca sus datos en Firestore
// Si no existen, los crea con datos básicos
await login('admin@cangrejeras.com', 'admin123');
```

### 2. Al registrar un nuevo usuario:

```typescript
const { signup } = useAuth();

// Crea el usuario en Authentication
// Crea automáticamente su documento en Firestore
await signup('nuevo@cangrejeras.com', 'password', 'Nombre Usuario', 'Admin');
```

### 3. Al actualizar el perfil:

```typescript
const { updateUserProfile } = useAuth();

// Actualiza tanto en Authentication como en Firestore
await updateUserProfile({
  id: currentUser.id,
  name: 'Nuevo Nombre',
  email: currentUser.email,
  role: currentUser.role,
  avatar: 'https://nueva-imagen.jpg'
});
```

---

## 🔍 Verificar la Integración

### 1. Verifica que Firestore esté habilitado:
- Firebase Console → Firestore Database
- Deberías ver la interfaz de Firestore

### 2. Verifica las reglas de seguridad:
- Firestore → Rules
- Deberías ver las reglas que pegaste

### 3. Prueba el login:
```bash
npm run dev
```
- Inicia sesión con un usuario
- Ve a Firebase Console → Firestore → Data → users
- Deberías ver el documento del usuario con todos sus datos

---

## ⚠️ Notas Importantes

1. **UID de Authentication = Document ID en Firestore**
   - El ID del documento en Firestore DEBE ser el mismo UID del usuario en Authentication

2. **Primer Super Admin**
   - Crea el primer Super Admin manualmente en Firestore
   - Los Super Admins pueden gestionar otros usuarios

3. **No cambies el email directamente en Firestore**
   - El email debe coincidir con Authentication
   - Si necesitas cambiarlo, hazlo desde Authentication primero

4. **Roles**
   - El rol se define en Firestore, no en Authentication
   - Cambia el rol editando el documento en Firestore

5. **Avatar**
   - Puedes usar Firebase Storage para subir imágenes
   - O usar URLs externas

---

## 🚀 Próximos Pasos

Una vez configurado Firestore:

1. ✅ Crea tu primer usuario Super Admin
2. ✅ Inicia sesión en el dashboard
3. ✅ Verifica que se muestren tus datos correctamente
4. ✅ Prueba actualizar tu perfil
5. ✅ Crea más usuarios desde el dashboard

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que Firestore esté habilitado
2. Verifica las reglas de seguridad
3. Verifica que el UID en Authentication coincida con el Document ID en Firestore
4. Revisa la consola del navegador para errores
5. Revisa los logs de Firebase Console

---

## 📚 Recursos

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

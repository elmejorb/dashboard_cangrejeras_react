# 📸 Guía de Firebase Storage - Subida de Imágenes

## ✅ Implementación Completada

La funcionalidad de subida de imágenes a Firebase Storage está **completamente integrada** en el dashboard.

---

## 📁 Estructura de Storage

```
📦 Firebase Storage
├── 📁 media/              ← Avatares de administradores
│   └── {adminId}/
│       └── avatar.jpg
│
├── 📁 players/            ← Fotos de jugadoras
│   └── {playerId}/
│       └── photo.jpg
│
├── 📁 news/               ← Imágenes de noticias
│   └── {newsId}/
│       └── cover.jpg
│
├── 📁 sponsors/           ← Logos de patrocinadores
│   └── {sponsorId}/
│       └── logo.png
│
└── 📁 teams/              ← Logos de equipos
    └── {teamId}/
        └── logo.png
```

---

## 🎯 Cómo Funciona

### Flujo Completo:

1. **Usuario selecciona imagen** → Preview local
2. **Click en "Guardar"** → Sube a Storage
3. **Storage devuelve URL** → Se guarda en Firestore
4. **Imagen visible** → Desde la URL de Storage

---

## 🚀 Uso en el Dashboard

### 1. **Cambiar Avatar de Administrador**

#### Paso a Paso:
1. Inicia sesión en el dashboard
2. Click en tu avatar (esquina superior derecha)
3. Ve a "Profile" o "Mi Perfil"
4. Click en tu avatar actual o en el botón de cámara
5. Selecciona una imagen (JPG, PNG, WebP)
6. Verás un preview inmediatamente
7. Click en "Guardar Cambios"
8. Verás el progreso: "Subiendo 45%..."
9. ¡Listo! Tu avatar se guardó en Firebase Storage

#### Lo que sucede internamente:
```typescript
// 1. Selección de archivo
handleFileChange(event) → setSelectedFile(file)

// 2. Al guardar
storageService.uploadAdminAvatar(adminId, file)
  ↓
// 3. Sube a: /media/{adminId}/avatar.jpg
  ↓
// 4. Devuelve URL: https://firebasestorage.googleapis.com/.../avatar.jpg
  ↓
// 5. Guarda URL en Firestore: admins/{adminId}.avatar
```

---

## 💻 Servicio de Storage

### Archivo: [storageService.ts](src/services/storageService.ts)

### Funciones Disponibles:

#### 1. **Subir Avatar de Admin**
```typescript
import { storageService } from '@/services/storageService';

const avatarURL = await storageService.uploadAdminAvatar(
  adminId,      // UID del admin
  file,         // Archivo File de input
  (progress) => {
    console.log(`Progreso: ${progress.progress}%`);
  }
);

// Devuelve: "https://firebasestorage.googleapis.com/.../avatar.jpg"
```

#### 2. **Subir Foto de Jugadora**
```typescript
const photoURL = await storageService.uploadPlayerPhoto(
  playerId,     // ID de la jugadora
  file,
  (progress) => {
    console.log(`Progreso: ${progress.progress}%`);
  }
);
```

#### 3. **Subir Portada de Noticia**
```typescript
const coverURL = await storageService.uploadNewsCover(
  newsId,       // ID de la noticia
  file,
  (progress) => {
    console.log(`Progreso: ${progress.progress}%`);
  }
);
```

#### 4. **Subir Logo de Patrocinador**
```typescript
const logoURL = await storageService.uploadSponsorLogo(
  sponsorId,
  file,
  (progress) => {
    console.log(`Progreso: ${progress.progress}%`);
  }
);
```

#### 5. **Subir Logo de Equipo**
```typescript
const logoURL = await storageService.uploadTeamLogo(
  teamId,
  file,
  (progress) => {
    console.log(`Progreso: ${progress.progress}%`);
  }
);
```

#### 6. **Eliminar Archivo**
```typescript
await storageService.deleteFile(fileURL);
```

#### 7. **Obtener URL de Archivo**
```typescript
const url = await storageService.getFileURL('media/admin123/avatar.jpg');
```

---

## 🎨 Ejemplo de Implementación

### Componente con Subida de Imagen

```tsx
import { useState } from 'react';
import { storageService } from '@/services/storageService';
import { toast } from 'sonner';

function ImageUploader({ playerId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      toast.error('Solo imágenes permitidas');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Máximo 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Storage
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      const photoURL = await storageService.uploadPlayerPhoto(
        playerId,
        file,
        (prog) => {
          setProgress(prog.progress);
        }
      );

      toast.success('¡Imagen subida exitosamente!');
      onUploadComplete(photoURL);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {preview && (
        <img src={preview} alt="Preview" className="w-32 h-32 object-cover" />
      )}

      {uploading && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>Subiendo {Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔒 Reglas de Seguridad

Las reglas están configuradas en Storage → Rules:

```javascript
// Avatares de admins
match /media/{adminId}/{allPaths=**} {
  allow read: if true;  // Público
  allow write: if isAuthenticated() && request.auth.uid == adminId;
}

// Fotos de jugadoras
match /players/{allPaths=**} {
  allow read: if true;  // Público
  allow write: if isAdmin();  // Solo admins
}
```

**Resumen:**
- ✅ **Lectura:** Todos pueden ver las imágenes (públicas)
- ✅ **Escritura Avatares:** Solo el propio admin puede cambiar su avatar
- ✅ **Escritura Otros:** Solo admins pueden subir fotos de jugadoras, logos, etc.

---

## ✅ Validaciones Implementadas

### En el Código:

1. **Tipo de archivo:** Solo imágenes (image/*)
2. **Tamaño:**
   - Avatares/Logos: Máximo 5MB
   - Fotos de jugadoras/noticias: Máximo 10MB
3. **Preview:** Se muestra antes de subir
4. **Progreso:** Barra de progreso durante subida
5. **Errores:** Manejo de errores con mensajes claros

---

## 🎯 Ventajas de Firebase Storage

1. ✅ **CDN Global** - Imágenes rápidas en todo el mundo
2. ✅ **URLs Permanentes** - No se pierden las imágenes
3. ✅ **Escalable** - Sin límites prácticos
4. ✅ **Seguro** - Reglas de seguridad configurables
5. ✅ **Integrado** - Funciona perfectamente con Firestore

---

## 📊 Monitoreo

### Ver archivos subidos:
1. Firebase Console → Storage
2. Navega por las carpetas: `media/`, `players/`, etc.
3. Click en cualquier archivo para ver detalles
4. Puedes descargar, eliminar o copiar la URL

### Estadísticas:
- Firebase Console → Storage → Usage
- Verás: Total de archivos, espacio usado, transferencia

---

## 🚨 Troubleshooting

### Error: "Permission denied"
**Solución:** Verifica que las reglas de Storage estén publicadas

### Error: "File too large"
**Solución:** La imagen excede el límite (5MB o 10MB según el tipo)

### La imagen no se ve
**Solución:** Verifica que la URL se guardó correctamente en Firestore

### Upload se queda en 0%
**Solución:**
- Verifica tu conexión a internet
- Revisa la consola del navegador para errores
- Verifica que Storage esté habilitado en Firebase

---

## 📋 Checklist de Implementación

Para agregar subida de imágenes a otros componentes:

- [ ] Import `storageService`
- [ ] Estado para `uploading` y `progress`
- [ ] Input type="file" con validaciones
- [ ] Preview de imagen antes de subir
- [ ] Llamar a función de storageService apropiada
- [ ] Mostrar progreso durante subida
- [ ] Guardar URL en Firestore
- [ ] Manejo de errores con toast

---

## 🎉 Estado Actual

✅ **Avatares de Admin** - Funcionando al 100%
✅ **Servicio de Storage** - Completo con todas las funciones
✅ **Reglas de Seguridad** - Configuradas
✅ **Validaciones** - Implementadas
✅ **Progreso Visual** - Integrado

### Próximos Pasos:
1. 🔜 Implementar en gestión de jugadoras
2. 🔜 Implementar en gestión de noticias
3. 🔜 Implementar subida de logos

---

## 📚 Recursos

- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [storageService.ts](src/services/storageService.ts) - Código fuente
- [UserProfile.tsx](src/components/admin/UserProfile.tsx) - Ejemplo de uso

---

**¿Necesitas agregar subida de imágenes a otro componente?** Usa el ejemplo de arriba y adapta a tu caso! 🚀

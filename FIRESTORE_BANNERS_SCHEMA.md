# Esquema de Firestore - Banners de Promoción

Este documento describe la estructura de las colecciones de Firestore para los banners promocionales y enlaces rápidos.

## Colección: `promotional_banners`

Almacena los banners promocionales que se muestran en la página principal de la app de fans.

### Campos:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `type` | string | Sí | Tipo de banner: `"primary"` (Banner Alto) o `"secondary"` (Banner Bajo) |
| `emoji` | string | No | Emoji que acompaña al título (ej: "🎟️") |
| `title` | string | Sí | Título del banner |
| `description` | string | Sí | Descripción o subtítulo del banner |
| `image` | string | Sí | URL de la imagen del banner (recomendado: 800x400px) |
| `link` | string | No | URL de destino al hacer clic en el banner |
| `cta` | string | No | Texto del botón de llamada a la acción (ej: "Comprar Boletos") |
| `bgColor` | string | No | Color de fondo en formato hexadecimal (por defecto: "#0C2340") |
| `textColor` | string | No | Color de texto en formato hexadecimal (por defecto: "#FFFFFF") |
| `isActive` | boolean | Sí | Si el banner está activo y visible en la app |
| `order` | number | Sí | Orden de visualización (menor número = aparece primero) |
| `createdAt` | timestamp | Sí | Fecha y hora de creación |
| `updatedAt` | timestamp | Sí | Fecha y hora de última actualización |

### Ejemplo de documento:

```json
{
  "type": "primary",
  "emoji": "🎟️",
  "title": "¡Boletos Disponibles!",
  "description": "Consigue tus boletos para el próximo partido en casa",
  "image": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=400&fit=crop",
  "link": "https://example.com/tickets",
  "cta": "Comprar Boletos",
  "bgColor": "#0C2340",
  "textColor": "#FFFFFF",
  "isActive": true,
  "order": 0,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Tipos de Banner:

#### Banner Alto (Primary)
- Tipo: `"primary"`
- Uso: Destacado principal en la página
- Dimensiones recomendadas: 800x400px
- Badge de color: Dorado (#C8A963)

#### Banner Bajo (Secondary)
- Tipo: `"secondary"`
- Uso: Banners secundarios compactos
- Dimensiones recomendadas: 600x300px
- Badge de color: Azul oscuro (#0C2340)

---

## Colección: `quick_links`

Almacena los enlaces rápidos de acceso que se muestran en la página principal.

### Campos:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `title` | string | Sí | Título del enlace rápido |
| `description` | string | Sí | Descripción breve del enlace |
| `link` | string | Sí | URL de destino |
| `icon` | string | Sí | Nombre del icono (ej: "stats", "news", "tickets", "shop") |
| `isActive` | boolean | Sí | Si el enlace está activo y visible en la app |
| `order` | number | Sí | Orden de visualización (menor número = aparece primero) |
| `createdAt` | timestamp | Sí | Fecha y hora de creación |
| `updatedAt` | timestamp | Sí | Fecha y hora de última actualización |

### Ejemplo de documento:

```json
{
  "title": "Estadísticas",
  "description": "Ver todas",
  "link": "https://example.com/stats",
  "icon": "stats",
  "isActive": true,
  "order": 0,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Iconos disponibles:

- `stats` - Estadísticas (BarChart3)
- `news` - Noticias (Newspaper)
- `tickets` - Boletos (Ticket)
- `shop` - Tienda (ShoppingBag)

---

## Índices requeridos

### Para `promotional_banners`:

1. **Índice compuesto**: `isActive` (Ascending) + `order` (Ascending)
   - **Uso**: Consultar banners activos ordenados
   - **Query**: `where('isActive', '==', true).orderBy('order', 'asc')`

2. **Índice compuesto**: `type` (Ascending) + `order` (Ascending)
   - **Uso**: Consultar banners por tipo ordenados
   - **Query**: `where('type', '==', 'primary').orderBy('order', 'asc')`

### Para `quick_links`:

1. **Índice compuesto**: `isActive` (Ascending) + `order` (Ascending)
   - **Uso**: Consultar enlaces activos ordenados
   - **Query**: `where('isActive', '==', true).orderBy('order', 'asc')`

---

## Reglas de seguridad de Firestore

```javascript
// Banners promocionales
match /promotional_banners/{bannerId} {
  // Permitir lectura a todos (para la app de fans)
  allow read: if true;

  // Solo administradores pueden crear, actualizar y eliminar
  allow create, update, delete: if isAdmin();
}

// Enlaces rápidos
match /quick_links/{linkId} {
  // Permitir lectura a todos (para la app de fans)
  allow read: if true;

  // Solo administradores pueden crear, actualizar y eliminar
  allow create, update, delete: if isAdmin();
}

// Función auxiliar para verificar si es administrador
function isAdmin() {
  return request.auth != null &&
         get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
}
```

---

## Uso desde el servicio

### Importar el servicio:

```typescript
import { bannerService } from '../services/bannerService';
```

### Operaciones disponibles:

#### Banners Promocionales:

```typescript
// Obtener todos los banners
const banners = await bannerService.getAllBanners();

// Obtener solo banners activos
const activeBanners = await bannerService.getActiveBanners();

// Obtener banners por tipo
const primaryBanners = await bannerService.getBannersByType('primary');

// Crear banner
const newBanner = await bannerService.createBanner({
  type: 'primary',
  emoji: '🎟️',
  title: '¡Boletos Disponibles!',
  description: 'Consigue tus boletos',
  image: 'https://...',
  link: 'https://...',
  cta: 'Comprar Boletos'
});

// Actualizar banner
await bannerService.updateBanner(bannerId, {
  title: 'Nuevo título',
  isActive: false
});

// Activar/Desactivar banner
await bannerService.toggleBannerActive(bannerId, false);

// Eliminar banner
await bannerService.deleteBanner(bannerId);

// Reordenar banners
await bannerService.reorderBanners(['id1', 'id2', 'id3']);
```

#### Enlaces Rápidos:

```typescript
// Obtener todos los enlaces
const links = await bannerService.getAllQuickLinks();

// Obtener solo enlaces activos
const activeLinks = await bannerService.getActiveQuickLinks();

// Crear enlace
const newLink = await bannerService.createQuickLink({
  title: 'Estadísticas',
  description: 'Ver todas',
  link: 'https://...',
  icon: 'stats'
});

// Actualizar enlace
await bannerService.updateQuickLink(linkId, {
  title: 'Nuevo título'
});

// Activar/Desactivar enlace
await bannerService.toggleQuickLinkActive(linkId, false);

// Eliminar enlace
await bannerService.deleteQuickLink(linkId);

// Reordenar enlaces
await bannerService.reorderQuickLinks(['id1', 'id2', 'id3']);
```

---

## Notas importantes:

1. **Orden automático**: Al crear un nuevo banner o enlace, se asigna automáticamente el siguiente número de orden disponible.

2. **Timestamps**: Los campos `createdAt` y `updatedAt` se gestionan automáticamente con `serverTimestamp()`.

3. **Validación**: El servicio no valida URLs ni imágenes. Es responsabilidad del frontend validar que las URLs sean válidas.

4. **Imágenes**: Se recomienda usar URLs de servicios de CDN o almacenamiento en la nube (Firebase Storage, Cloudinary, etc.).

5. **Colores**: Los colores deben estar en formato hexadecimal (ej: "#0C2340"). Si no se proporcionan, se usan los valores por defecto.

6. **Emojis**: Los emojis son opcionales pero recomendados para mejorar la experiencia visual.

---

## Migración de datos

Si necesitas migrar datos existentes o crear datos iniciales, puedes usar el siguiente script:

```typescript
import { bannerService } from './services/bannerService';

async function seedBanners() {
  // Banner Alto
  await bannerService.createBanner({
    type: 'primary',
    emoji: '🎟️',
    title: '¡Boletos Disponibles!',
    description: 'Consigue tus boletos para el próximo partido en casa',
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=400&fit=crop',
    link: 'https://example.com/tickets',
    cta: 'Comprar Boletos',
    bgColor: '#0C2340',
    textColor: '#FFFFFF'
  });

  // Banner Bajo
  await bannerService.createBanner({
    type: 'secondary',
    emoji: '👕',
    title: 'Nueva Mercancía',
    description: 'Visita nuestra tienda oficial',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=300&fit=crop',
    link: 'https://example.com/shop',
    cta: 'Ver Tienda',
    bgColor: '#0C2340',
    textColor: '#FFFFFF'
  });

  console.log('Banners creados exitosamente');
}

// Ejecutar: seedBanners();
```

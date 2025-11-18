# 📺 Guía de Uso: Overlay de Votación en Vivo

## 🎯 ¿Qué es esto?

Un componente especial diseñado para mostrar el **TOP 3** de votación en tiempo real durante transmisiones en vivo. Se puede usar como overlay en OBS, Wirecast, vMix, o cualquier software de streaming.

---

## 🌐 URL de Acceso

```
http://localhost:5173/voting-overlay
```

**En producción:**
```
https://tu-dominio.com/voting-overlay
```

---

## 🎨 Modos de Visualización

### 1. **Modo Compacto** (Recomendado para Overlays Laterales)

Ideal para colocar en esquinas o laterales de la transmisión.

```
http://localhost:5173/voting-overlay
```

**o explícitamente:**
```
http://localhost:5173/voting-overlay?mode=compact
```

**Características:**
- Diseño vertical compacto
- Tamaño optimizado para overlays
- 3 candidatos con fotos, nombres, posiciones y porcentajes
- Ancho máximo: 400px

---

### 2. **Modo Estándar** (Para Pantalla Completa en TV)

Ideal para mostrar en pantallas grandes o como gráfico principal.

```
http://localhost:5173/voting-overlay?mode=standard
```

**Características:**
- Diseño más grande y espacioso
- Textos más legibles a distancia
- Perfecto para pantallas de estadio o transmisión principal
- Ancho máximo: 768px

---

## 🎨 Opciones de Fondo (Para Chroma Key)

### Fondo Transparente (Default)

```
http://localhost:5173/voting-overlay
```

**O explícitamente:**
```
http://localhost:5173/voting-overlay?bg=transparent&show=false
```

---

### Fondo Verde (Chroma Key)

```
http://localhost:5173/voting-overlay?bg=green&show=true
```

**Configuración en OBS/Wirecast:**
1. Agrega la URL como fuente de navegador
2. Aplica filtro "Chroma Key" o "Color Key"
3. Selecciona el color verde (#00FF00)
4. Ajusta tolerancia según sea necesario

---

### Fondo Azul

```
http://localhost:5173/voting-overlay?bg=blue&show=true
```

---

### Fondo Personalizado (Hex Color)

```
http://localhost:5173/voting-overlay?bg=%23FF0000&show=true
```

**Nota:** Usa `%23` en lugar de `#` para colores hex en URLs.

Ejemplos:
- Rojo: `%23FF0000`
- Negro: `%23000000`
- Morado: `%23800080`

---

## 🎬 Configuración en OBS Studio

### Paso 1: Agregar Fuente

1. En OBS, haz clic en el **+** en "Fuentes"
2. Selecciona **"Navegador"**
3. Dale un nombre: "Voting Overlay - TOP 3"

### Paso 2: Configurar la Fuente

**Para Overlay Lateral:**
```
URL: http://localhost:5173/voting-overlay?mode=compact&bg=transparent
Ancho: 450
Alto: 600
```

**Para Pantalla Completa:**
```
URL: http://localhost:5173/voting-overlay?mode=standard&bg=transparent
Ancho: 800
Alto: 700
```

### Paso 3: Posicionar

- Arrastra el overlay a la esquina deseada
- Ajusta el tamaño manteniendo las proporciones
- El fondo transparente se integrará automáticamente

### Paso 4: (Opcional) Aplicar Chroma Key

Si usas fondo verde:

1. Haz clic derecho en la fuente → **Filtros**
2. Agrega **"Chroma Key"**
3. Selecciona el color verde
4. Ajusta **Similitud** y **Suavizado**

---

## 🎬 Configuración en Wirecast

### Paso 1: Agregar Fuente Web

1. Ve a **"Shot Layers"**
2. Haz clic en **"+"** → **"Web Page"**
3. Pega la URL: `http://localhost:5173/voting-overlay?mode=compact`

### Paso 2: Configurar Transparencia

1. Selecciona la capa del overlay
2. En **"Layer Properties"**, activa **"Transparent Background"**
3. Si usas chroma key, ajusta **"Chroma Key"** al color que elegiste

### Paso 3: Posicionar

- Redimensiona y posiciona según tu diseño
- El componente es responsive y se adapta

---

## 🎬 Configuración en vMix

### Paso 1: Agregar Input Web Browser

1. Haz clic en **"Add Input"**
2. Selecciona **"Web Browser"**
3. Pega la URL en "URL"

### Paso 2: Configurar

```
URL: http://localhost:5173/voting-overlay?mode=compact
Width: 450
Height: 600
```

Marca:
- ✅ **"Enable Transparency"**
- ✅ **"Enable Audio"** (si es necesario)

### Paso 3: Overlay

- Arrastra el input a un overlay
- Posiciona donde necesites

---

## 📊 Ejemplos de URLs Completas

### Overlay Compacto con Fondo Transparente
```
http://localhost:5173/voting-overlay
```

### Overlay Grande con Fondo Verde
```
http://localhost:5173/voting-overlay?mode=standard&bg=green&show=true
```

### Overlay Lateral con Fondo Azul
```
http://localhost:5173/voting-overlay?mode=compact&bg=blue&show=true
```

### Overlay con Fondo Negro Personalizado
```
http://localhost:5173/voting-overlay?mode=compact&bg=%23000000&show=true
```

---

## 🎨 Personalización de Colores

El overlay usa los colores oficiales de Cangrejeras:

- **1er Lugar:** Dorado `#C8A963`
- **2do Lugar:** Rojo `#E84C4C`
- **3er Lugar:** Verde `#10B981`

Los colores cambian automáticamente según la posición.

---

## 🔄 Actualización en Tiempo Real

El overlay se conecta directamente a Firebase y se actualiza automáticamente cuando:

- Los usuarios votan en la app
- Los porcentajes cambian
- El orden del TOP 3 se modifica

**No necesitas refrescar la página** - todo es en tiempo real.

---

## 📱 Responsive Design

El componente se adapta automáticamente a diferentes tamaños de pantalla:

- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

---

## 🐛 Solución de Problemas

### Problema: El overlay no se ve

**Solución:**
1. Verifica que el servidor esté corriendo: `npm run dev`
2. Comprueba la URL en tu navegador primero
3. Asegúrate de tener una votación activa

### Problema: El fondo no es transparente en OBS

**Solución:**
1. Asegúrate de usar `bg=transparent` en la URL
2. En OBS, verifica que la fuente de navegador tenga activado "Usar transparencia"
3. Si usas chroma key, verifica el filtro de color

### Problema: Los datos no se actualizan

**Solución:**
1. Verifica la conexión a Firebase
2. Comprueba la consola del navegador (F12) para errores
3. Refresca la fuente en OBS/Wirecast

---

## 🚀 Deploy en Producción

Una vez en producción, cambia la URL a tu dominio:

```
https://dashboard.cangrejeras.com/voting-overlay
```

Asegúrate de que:
- ✅ Firebase esté configurado para producción
- ✅ CORS permita el dominio
- ✅ SSL esté activo (HTTPS)

---

## 📞 Soporte

Si tienes problemas, verifica:

1. La consola del navegador (F12)
2. Los logs de Firebase
3. La conexión a internet del streaming PC

---

## 🎉 ¡Listo!

Ahora tienes un overlay profesional de votación en vivo que se actualiza automáticamente y se integra perfectamente con tu transmisión.

**¡A transmitir!** 🏐📺

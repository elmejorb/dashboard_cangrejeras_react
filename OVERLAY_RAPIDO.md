# ⚡ Guía Rápida: Overlay de Votación

## 🎯 ¿Qué hace?

Muestra el **TOP 3** de votación en tiempo real para usar en transmisiones en vivo (OBS, Wirecast, etc.)

---

## 🌐 URL Simple

```
http://localhost:5173/voting-overlay
```

---

## 📺 Configuración Rápida en OBS

1. **Agregar Fuente**
   - Clic en **+** → **"Navegador"**

2. **Configurar**
   ```
   URL: http://localhost:5173/voting-overlay
   Ancho: 450
   Alto: 600
   ✅ Marcar "Usar fondo transparente"
   ```

3. **Posicionar**
   - Arrastra a la esquina que quieras
   - Redimensiona según necesites

---

## 🎨 Opciones

### Vista Compacta (Default)
```
http://localhost:5173/voting-overlay
```
👉 Para esquinas/laterales

### Vista Grande (Para TV)
```
http://localhost:5173/voting-overlay?mode=standard
```
👉 Para pantalla completa

### Con Fondo Verde (Chroma Key)
```
http://localhost:5173/voting-overlay?bg=green&show=true
```
👉 Luego aplica Chroma Key en OBS

---

## ✅ Listo

El overlay se actualiza automáticamente cuando los usuarios votan.

**No necesitas hacer nada más** - solo agrégalo a OBS y olvídate.

---

## 🆘 Ayuda Rápida

**No se ve el overlay?**
- Verifica que `npm run dev` esté corriendo
- Prueba la URL en Chrome primero
- Asegúrate de tener una votación activa

**No es transparente?**
- Marca "Usar fondo transparente" en OBS
- O usa `?bg=green&show=true` y aplica Chroma Key

---

📄 **Guía completa:** Ver `VOTING_OVERLAY_GUIDE.md`

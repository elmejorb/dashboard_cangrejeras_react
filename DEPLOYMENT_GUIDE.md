# 🚀 Guía de Despliegue - Cloud Functions para Notificaciones Push

Esta guía te llevará paso a paso para desplegar las Cloud Functions que envían notificaciones push automáticas.

## ✅ Pre-requisitos

Antes de comenzar, asegúrate de tener:

1. **Node.js instalado** (versión 18 o superior)
   ```bash
   node --version  # Debe mostrar v18.x.x o superior
   ```

2. **Firebase CLI instalado**
   ```bash
   npm install -g firebase-tools
   ```

3. **Acceso al proyecto de Firebase**
   - Debes ser propietario o tener rol de editor en el proyecto

## 📝 Paso 1: Instalar Dependencias

```bash
# Navegar a la carpeta de functions
cd functions

# Instalar dependencias de Node.js
npm install
```

**Resultado esperado:** Se creará la carpeta `node_modules` con todas las dependencias.

## 🔐 Paso 2: Autenticarse en Firebase

```bash
# Login en Firebase CLI
firebase login
```

Esto abrirá tu navegador para que inicies sesión con tu cuenta de Google que tiene acceso al proyecto Firebase.

**Resultado esperado:** Mensaje "✔ Success! Logged in as [tu-email]"

## 🎯 Paso 3: Seleccionar el Proyecto

```bash
# Ver proyectos disponibles
firebase projects:list

# Seleccionar tu proyecto
firebase use --add
```

Cuando te pregunte, selecciona tu proyecto de Firebase (probablemente `cangrejeras-app` o similar).

Asigna un alias, por ejemplo: `default`

**Resultado esperado:** Mensaje "✔ Created alias default for [tu-proyecto-id]"

## 🧪 Paso 4: Probar Localmente (Opcional pero Recomendado)

```bash
# Iniciar emuladores locales
npm run serve
```

Esto iniciará las funciones en modo local. Podrás probarlas sin desplegarlas a producción.

**Presiona Ctrl+C para detener los emuladores cuando termines**

## 🚀 Paso 5: Desplegar a Producción

### Opción A: Desplegar todas las funciones
```bash
# Desde la carpeta functions/
npm run deploy
```

### Opción B: Desplegar funciones individuales
```bash
# Desplegar solo la función de partidos en vivo
firebase deploy --only functions:onMatchGoesLive

# Desplegar solo la función de votaciones
firebase deploy --only functions:onVotingSessionActivated

# Desplegar múltiples funciones específicas
firebase deploy --only functions:onMatchGoesLive,functions:onVotingSessionActivated
```

**Tiempo de despliegue:** 2-5 minutos aproximadamente

**Resultado esperado:**
```
✔ functions[onMatchGoesLive(us-central1)] Successful create operation.
✔ functions[onMatchFinished(us-central1)] Successful create operation.
✔ functions[onVotingSessionActivated(us-central1)] Successful create operation.
✔ functions[onVotingSessionFinished(us-central1)] Successful create operation.
✔ functions[testNotification(us-central1)] Successful create operation.

✔ Deploy complete!
```

## 🧪 Paso 6: Probar las Notificaciones

### Probar con la función HTTP de prueba
```bash
# Reemplaza [region] y [project-id] con los valores de tu proyecto
curl https://us-central1-[project-id].cloudfunctions.net/testNotification
```

**Resultado esperado:** Todos los usuarios con pushToken registrado deberían recibir una notificación de prueba.

### Probar activando un partido
1. Ve al Dashboard CMS
2. Ve a la sección "Gestión de Partidos"
3. Activa un partido (botón "Activar en vivo")
4. **Todos los usuarios deberían recibir la notificación de partido en vivo**

### Probar activando una votación
1. Ve al Dashboard CMS
2. Ve a la sección "Sistema de Votaciones"
3. Activa una votación (botón "Activar")
4. **Todos los usuarios deberían recibir la notificación de nueva votación**

## 📊 Paso 7: Monitorear

### Ver logs en tiempo real
```bash
firebase functions:log --only onMatchGoesLive
```

### Ver todas las funciones desplegadas
```bash
firebase functions:list
```

### Ver logs en la consola web
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Functions** → **Logs**

## ⚠️ Solución de Problemas

### Error: "Failed to create function"
**Causa:** Permisos insuficientes o billing no habilitado

**Solución:**
1. Verificar que tienes permisos de Editor en el proyecto
2. Habilitar billing en Firebase Console (plan Blaze requerido para Cloud Functions)

### Error: "Node version not supported"
**Causa:** Versión de Node.js incorrecta

**Solución:**
```bash
# Instalar Node.js 18
nvm install 18
nvm use 18
```

### Las notificaciones no llegan
**Posibles causas:**
1. Los usuarios no tienen `pushToken` registrado
2. Los tokens son inválidos o expirados
3. La función no se está disparando

**Verificación:**
```bash
# Ver logs de la función
firebase functions:log --only onMatchGoesLive

# Probar la función HTTP directamente
curl https://us-central1-[project-id].cloudfunctions.net/testNotification
```

### Error: "Missing or insufficient permissions"
**Causa:** Las reglas de Firestore no permiten leer la colección `users`

**Solución:** Actualizar `firestore.rules` para permitir que Cloud Functions lean usuarios:
```javascript
// Las Cloud Functions corren con privilegios de admin,
// pero verifica que no haya restricciones especiales
```

## 🔄 Actualizar Funciones

Cuando hagas cambios en `functions/index.js`:

```bash
# 1. Navegar a functions/
cd functions

# 2. Probar localmente (opcional)
npm run serve

# 3. Desplegar cambios
npm run deploy
```

## 🗑️ Eliminar Funciones

Si necesitas eliminar alguna función:

```bash
firebase functions:delete nombreDeLaFuncion
```

**Ejemplo:**
```bash
firebase functions:delete testNotification
```

## 💰 Costos Estimados

Con el plan Blaze de Firebase:
- **Primeras 2M invocaciones/mes:** GRATIS
- **Primeros 400,000 GB-seg/mes:** GRATIS
- **Primeros 5GB de salida/mes:** GRATIS

**Para ~1000 usuarios activos:**
- Costo estimado: **$0 - $5/mes**
- La mayoría de aplicaciones se mantienen en el tier gratuito

## ✅ Checklist de Despliegue

- [ ] Node.js 18+ instalado
- [ ] Firebase CLI instalado y autenticado
- [ ] Dependencias instaladas (`npm install` en functions/)
- [ ] Proyecto seleccionado (`firebase use --add`)
- [ ] Funciones desplegadas (`npm run deploy`)
- [ ] Notificación de prueba enviada exitosamente
- [ ] Logs verificados en Firebase Console
- [ ] Usuarios tienen pushToken en Firestore

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `firebase functions:log`
2. Verifica la consola de Firebase
3. Consulta la documentación: [Firebase Functions Docs](https://firebase.google.com/docs/functions)

---

**¡Listo! Tus Cloud Functions están desplegadas y enviando notificaciones automáticamente** 🎉

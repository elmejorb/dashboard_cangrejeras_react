# 📱 Sistema de Notificaciones Push - Cangrejeras de Santurce

## ✅ ¿Qué se implementó?

Se creó un sistema completo de notificaciones push automáticas usando Firebase Cloud Functions que se disparan cuando:

### 1. 🏀 Un partido se activa en vivo
Cuando activas un partido desde el Dashboard, **todos los usuarios** reciben:
```
🏀 ¡Partido en vivo!
Cangrejeras vs [Equipo Rival] - ¡Ya comenzó!
```

### 2. 🏆 Un partido finaliza
Cuando finalizas un partido, **todos los usuarios** reciben el resultado:
```
🏆 Partido finalizado
Cangrejeras 85 - 72 Vaqueros
```

### 3. 🗳️ Una votación se activa
Cuando activas una votación, **todos los usuarios** reciben:
```
🗳️ Nueva votación disponible
[Título de la votación]
```

### 4. 📊 Una votación finaliza
Cuando finaliza una votación, **todos los usuarios** reciben:
```
📊 Votación finalizada
Los resultados de "[Título]" ya están disponibles
```

## 📁 Archivos Creados

```
functions/
├── index.js              # Cloud Functions principales
├── package.json          # Dependencias
├── .eslintrc.js         # Configuración de linting
├── .gitignore           # Archivos a ignorar
└── README.md            # Documentación técnica

DEPLOYMENT_GUIDE.md       # Guía de despliegue paso a paso
deploy-functions.bat      # Script de despliegue rápido (Windows)
firebase.json            # Configuración de Firebase
```

## 🚀 Cómo Desplegar

### Opción 1: Script Automático (Windows)
```bash
# Ejecutar el script de despliegue
deploy-functions.bat
```

### Opción 2: Manual
```bash
# 1. Instalar dependencias
cd functions
npm install

# 2. Autenticarse en Firebase
firebase login

# 3. Seleccionar proyecto
firebase use --add

# 4. Desplegar
npm run deploy
```

## ⚙️ Cómo Funciona

### Arquitectura
```
Dashboard CMS → Actualiza Firestore → Cloud Function se dispara → Expo Push API → Usuarios reciben notificación
```

### Ejemplo: Partido en vivo
1. Admin activa partido en el Dashboard (`isLive: true`)
2. Firestore actualiza el documento en `matches/{matchId}`
3. Cloud Function `onMatchGoesLive` detecta el cambio
4. Lee todos los usuarios con `pushToken` de Firestore
5. Envía notificación a cada usuario vía Expo Push API
6. Los usuarios reciben la notificación en su app móvil

## 📊 Datos Requeridos

### En los usuarios (colección `users`)
```javascript
{
  pushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  // ... otros campos del usuario
}
```

### En los partidos (colección `matches`)
```javascript
{
  homeTeam: "Cangrejeras de Santurce",
  awayTeam: "Vaqueros de Bayamón",
  isLive: true,         // Activa la notificación
  homeScore: 85,
  awayScore: 72,
  // ... otros campos
}
```

### En las votaciones (colección `votingSessions`)
```javascript
{
  title: "Jugadora del Mes",
  isActive: true,       // Activa la notificación
  status: "active",     // "pending", "active", "finished"
  // ... otros campos
}
```

## 🧪 Cómo Probar

### 1. Probar con función HTTP
```bash
curl https://us-central1-[tu-proyecto].cloudfunctions.net/testNotification
```

### 2. Probar desde el Dashboard
1. **Partido en vivo:**
   - Ve a "Gestión de Partidos"
   - Crea o selecciona un partido
   - Click en "Activar en vivo"
   - ✅ Todos los usuarios deberían recibir notificación

2. **Votación:**
   - Ve a "Sistema de Votaciones"
   - Crea o selecciona una votación
   - Click en "Activar"
   - ✅ Todos los usuarios deberían recibir notificación

### 3. Ver logs
```bash
# Ver logs en tiempo real
firebase functions:log

# Ver logs de una función específica
firebase functions:log --only onMatchGoesLive
```

## 📱 Canales de Notificación

Las notificaciones se envían a diferentes canales según el tipo:

| Tipo | Canal | Prioridad | Sonido |
|------|-------|-----------|--------|
| Partido en vivo | `live-matches` | High | Default |
| Partido finalizado | `news` | Default | Default |
| Votación activa | `voting` | Default | Default |
| Votación finalizada | `voting` | Default | Default |

## 💰 Costos

Firebase Cloud Functions - Plan Blaze (pago por uso):

**Nivel Gratuito:**
- 2,000,000 invocaciones/mes
- 400,000 GB-seg de tiempo de cómputo/mes
- 5 GB de red saliente/mes

**Estimación para tu app:**
- ~1000 usuarios activos
- ~10 partidos/mes
- ~5 votaciones/mes
- **Costo estimado: $0 - $2/mes** (probablemente $0)

## ⚠️ Consideraciones Importantes

### 1. Billing en Firebase
Para usar Cloud Functions necesitas tener el **plan Blaze** habilitado en Firebase Console:
- Ve a Firebase Console → Settings → Usage and billing
- Upgrade a plan Blaze (gratis mientras estés bajo los límites)

### 2. Tokens válidos
Los usuarios deben tener tokens de Expo Push válidos:
- Formato: `ExponentPushToken[...]` o `ExpoPushToken[...]`
- Registrados en campo `pushToken` en Firestore

### 3. Límites de Expo
- Máximo 100 notificaciones por request
- Las Cloud Functions automáticamente dividen en lotes

## 🔧 Mantenimiento

### Actualizar funciones
```bash
cd functions
npm run deploy
```

### Ver funciones desplegadas
```bash
firebase functions:list
```

### Eliminar una función
```bash
firebase functions:delete nombreDeLaFuncion
```

## 📞 Troubleshooting

### "Las notificaciones no llegan"
1. ✅ Verificar que usuarios tienen `pushToken` en Firestore
2. ✅ Verificar formato del token (debe empezar con `ExponentPushToken[`)
3. ✅ Ver logs: `firebase functions:log`
4. ✅ Probar función HTTP: `/testNotification`

### "Error: Billing not enabled"
1. Ve a Firebase Console
2. Settings → Usage and billing
3. Upgrade a plan Blaze

### "Error: Missing permissions"
1. Verificar reglas de Firestore
2. Cloud Functions deben poder leer colección `users`

## 📚 Documentación Adicional

- **Guía de Despliegue:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Documentación Técnica:** [functions/README.md](functions/README.md)
- **Firebase Functions:** https://firebase.google.com/docs/functions
- **Expo Push Notifications:** https://docs.expo.dev/push-notifications/overview/

---

## 🎯 Próximos Pasos

1. **Desplegar las funciones:**
   ```bash
   deploy-functions.bat
   ```

2. **Probar con un partido en vivo:**
   - Activa un partido desde el Dashboard
   - Verifica que llegue la notificación

3. **Monitorear logs:**
   ```bash
   firebase functions:log
   ```

4. **Configurar alertas** (opcional):
   - Firebase Console → Functions → Alerting
   - Configura alertas por email si hay errores

---

**¡Sistema de notificaciones listo para usar!** 🎉

Si tienes preguntas o problemas, revisa los logs o la documentación detallada.

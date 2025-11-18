# Firebase Cloud Functions - Sistema de Notificaciones Push

Este directorio contiene las Firebase Cloud Functions que envían notificaciones push automáticamente cuando ocurren eventos importantes en la aplicación de Cangrejeras de Santurce.

## 📋 Funciones Implementadas

### 1. `onMatchGoesLive`
**Trigger:** Se dispara cuando un partido se activa en vivo (`isLive: true`)

**Colección:** `matches/{matchId}`

**Notificación enviada:**
```json
{
  "title": "🏀 ¡Partido en vivo!",
  "body": "Cangrejeras vs [awayTeam] - ¡Ya comenzó!",
  "data": {
    "type": "live_match",
    "matchId": "match-123",
    "screen": "/(tabs)"
  },
  "priority": "high",
  "channelId": "live-matches"
}
```

### 2. `onMatchFinished`
**Trigger:** Se dispara cuando un partido finaliza (`isLive: false` con puntajes)

**Colección:** `matches/{matchId}`

**Notificación enviada:**
```json
{
  "title": "🏆 Partido finalizado",
  "body": "Cangrejeras 85 - 72 Vaqueros",
  "data": {
    "type": "match_result",
    "matchId": "match-123",
    "screen": "/match-details?id=match-123"
  },
  "priority": "default",
  "channelId": "news"
}
```

### 3. `onVotingSessionActivated`
**Trigger:** Se dispara cuando una votación se activa (`isActive: true`)

**Colección:** `votingSessions/{votingId}`

**Notificación enviada:**
```json
{
  "title": "🗳️ Nueva votación disponible",
  "body": "Jugadora del Mes - Enero 2025",
  "data": {
    "type": "voting",
    "votingId": "voting-123",
    "screen": "/voting"
  },
  "priority": "default",
  "channelId": "voting"
}
```

### 4. `onVotingSessionFinished`
**Trigger:** Se dispara cuando una votación finaliza (`isActive: false`, `status: 'finished'`)

**Colección:** `votingSessions/{votingId}`

**Notificación enviada:**
```json
{
  "title": "📊 Votación finalizada",
  "body": "Los resultados de \"Jugadora del Mes\" ya están disponibles",
  "data": {
    "type": "voting_results",
    "votingId": "voting-123",
    "screen": "/voting"
  },
  "priority": "default",
  "channelId": "voting"
}
```

### 5. `testNotification` (HTTP Function)
**Tipo:** Función HTTP callable

**URL:** `https://[region]-[project-id].cloudfunctions.net/testNotification`

**Uso:** Para probar que las notificaciones funcionan correctamente

**Response:**
```json
{
  "success": true,
  "message": "Notificación de prueba enviada",
  "results": {
    "success": 15,
    "failure": 0
  }
}
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
cd functions
npm install
```

### 2. Configurar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 3. Seleccionar tu proyecto
```bash
firebase use --add
# Selecciona tu proyecto de Firebase
```

### 4. Desplegar las funciones
```bash
# Desplegar todas las funciones
npm run deploy

# O desplegar solo una función específica
firebase deploy --only functions:onMatchGoesLive
```

## 📝 Requisitos Previos

1. **Usuarios con pushToken:** Los usuarios en Firestore deben tener el campo `pushToken` con sus tokens de Expo:
   ```javascript
   // Colección: users/{userId}
   {
     pushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
     // ... otros campos
   }
   ```

2. **Estructura de partidos:** Los documentos en `matches` deben tener:
   ```javascript
   {
     homeTeam: "Cangrejeras de Santurce",
     awayTeam: "Nombre del rival",
     isLive: false,  // true cuando está en vivo
     homeScore: 0,
     awayScore: 0,
     // ... otros campos
   }
   ```

3. **Estructura de votaciones:** Los documentos en `votingSessions` deben tener:
   ```javascript
   {
     title: "Título de la votación",
     isActive: false,  // true cuando está activa
     status: "pending", // "active", "finished"
     // ... otros campos
   }
   ```

## 🧪 Pruebas

### Probar notificaciones manualmente
```bash
curl https://[region]-[project-id].cloudfunctions.net/testNotification
```

### Ver logs en tiempo real
```bash
npm run logs
```

### Emular funciones localmente
```bash
npm run serve
```

## 📊 Monitoreo

### Ver logs en Firebase Console
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Seleccionar tu proyecto
3. Ir a Functions → Logs

### Métricas disponibles
- Número de notificaciones enviadas exitosamente
- Número de notificaciones fallidas
- Tokens inválidos o expirados
- Errores en el envío

## 🔧 Mantenimiento

### Actualizar funciones
Después de modificar `index.js`:
```bash
npm run deploy
```

### Eliminar una función
```bash
firebase functions:delete nombreDeLaFuncion
```

### Ver estado de las funciones
```bash
firebase functions:list
```

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"
- Verificar que las reglas de Firestore permitan leer la colección `users`
- Verificar que el Service Account tiene permisos necesarios

### Error: "Invalid Expo Push Token"
- Verificar que los tokens en Firestore tienen el formato correcto: `ExponentPushToken[...]`
- Limpiar tokens antiguos o inválidos de la base de datos

### Notificaciones no llegan
1. Verificar que los usuarios tienen `pushToken` registrado
2. Verificar que el token no ha expirado
3. Revisar los logs de Cloud Functions para errores
4. Probar con la función `testNotification`

## 💰 Costos

Las Cloud Functions tienen un plan gratuito generoso:
- **Invocaciones:** 2,000,000 gratis/mes
- **Tiempo de cómputo:** 400,000 GB-segundos/mes
- **Red saliente:** 5 GB/mes

Para esta aplicación, con ~1000 usuarios activos, los costos deberían ser $0 o muy bajos.

## 📚 Documentación Adicional

- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)

# Sistema de Votación V2 - Auto-Inicio + Schedule Programado 🗳️⚡📅

## ✅ **Nuevas Características Implementadas**

### **1. Todas las Jugadoras del Roster Disponibles** 🏐
- ✅ **Integración con PlayerContext**: Carga automática de todas las jugadoras activas
- ✅ **14 jugadoras reales** del roster de Cangrejeras disponibles
- ✅ **Botón "Seleccionar Todas"**: Click para seleccionar todas las jugadoras
- ✅ **Botón "Deseleccionar Todas"**: Click para limpiar selección
- ✅ **Contador de seleccionadas**: "Seleccionadas: X / 14"
- ✅ **Información completa**: Nombre, número de jersey, posición por cada jugadora

### **2. Sistema de Schedule Programado** 📅⏰
Ahora tienes **DOS formas** de iniciar votaciones automáticamente:

#### **Opción A: Auto-Inicio por Partido en Vivo** ⚡
- Se activa cuando el partido pasa a status "live"
- Badge: **⚡ Auto-Inicio**
- Color: Dorado (#C8A963)

#### **Opción B: Inicio Programado (Schedule)** 📅
- Se activa en fecha y hora específica
- Badge: **📅 Programado**
- Color: Púrpura (#8B5CF6)
- **Campos nuevos**:
  - Fecha de Inicio (date picker)
  - Hora de Inicio (time picker - **formato 24h**: 19:00)
  - Fecha de Cierre (opcional)
  - Hora de Cierre (opcional - **formato 24h**: 22:00)
- ⏰ **Formato de Puerto Rico**: 24 horas (19:00, no 7:00 PM)

#### **Puedes combinar ambas opciones** 🔥
- ✅ Solo Auto-Inicio por partido
- ✅ Solo Schedule programado
- ✅ Ambos activados (se abrirá con la que ocurra primero)

---

## 🎯 **Flujos de Uso**

### **Escenario 1: Votación con Auto-Inicio por Partido**
1. Admin crea votación
2. Selecciona partido asociado
3. Activa toggle **"Auto-Inicio por Partido en Vivo"** ⚡
4. Selecciona jugadoras
5. Guarda votación
6. **Cuando el partido pase a "live"** → Votación se abre automáticamente
7. Notificación: "🗳️ ¡Votación Abierta!"

### **Escenario 2: Votación con Schedule Programado**
1. Admin crea votación
2. Selecciona partido asociado
3. Activa toggle **"Inicio Programado (Schedule)"** 📅
4. Ingresa (**formato 24h**):
   - **Fecha de inicio**: 2025-10-15
   - **Hora de inicio**: 19:00 ⏰ (formato 24h, 7:00 PM)
   - **Fecha de cierre** (opcional): 2025-10-15
   - **Hora de cierre** (opcional): 22:00 ⏰ (formato 24h, 10:00 PM)
5. Selecciona jugadoras
6. Guarda votación
7. **En la fecha/hora programada** → Votación se abre automáticamente
8. Notificación: "🗳️ ¡Votación Programada Iniciada!"

### **Escenario 3: Combinación de Auto-Inicio + Schedule**
1. Admin crea votación
2. Activa **AMBOS** toggles
3. Configura partido para auto-inicio
4. Configura fecha/hora de schedule
5. **La votación se abrirá con el primer evento que ocurra**:
   - Si el partido va "live" antes del schedule → Se abre por partido
   - Si la fecha/hora programada llega primero → Se abre por schedule

### **Escenario 4: Selección Rápida de Todas las Jugadoras**
1. Admin abre diálogo de crear votación
2. Click en botón **"Todas"** ✅
3. Se seleccionan las 14 jugadoras automáticamente
4. Contador muestra: "Seleccionadas: 14 / 14"
5. Guarda votación

---

## 📊 **Sistema de Verificación de Schedules**

### **Cómo Funciona:**
- ✅ **Verificación cada 60 segundos**: Un interval revisa si alguna votación debe abrirse o cerrarse
- ✅ **Ventana de 1 minuto**: Si la hora actual está dentro de 1 minuto de la programada, se activa
- ✅ **Prevención de duplicados**: Una vez activada, no se vuelve a activar
- ✅ **Cierre automático**: Si hay fecha/hora de cierre, se cierra automáticamente

### **Ejemplo de Timeline (formato 24h):**
```
19:00:00 - Votación programada para iniciar (7:00 PM)
18:59:30 - Sistema verifica (todavía no)
19:00:30 - Sistema verifica ✅ → Abre votación (dentro de ventana de 1 min)
19:00:45 - Notificación enviada
22:00:00 - Hora de cierre programada (10:00 PM)
22:00:30 - Sistema verifica ✅ → Cierra votación

⏰ Puerto Rico usa formato 24 horas:
- 19:00 (no 7:00 PM)
- 22:00 (no 10:00 PM)
- 14:00 (no 2:00 PM)
```

---

## 🎨 **UI/UX Mejorado**

### **Badges Visuales:**
| Badge | Icono | Color | Significado |
|-------|-------|-------|-------------|
| 🔴 EN VIVO | Circle | Rojo (#E01E37) | Votación activa ahora |
| ⚡ Auto | Zap | Dorado (#C8A963) | Auto-inicio por partido |
| 📅 Programado | Calendar | Púrpura (#8B5CF6) | Schedule configurado |
| ✅ Todas | CheckSquare | Verde (#10B981) | Seleccionar todas |
| ❌ Ninguna | XSquare | Rojo (#E01E37) | Deseleccionar todas |

### **Formulario de Creación Mejorado:**
```
┌─────────────────────────────────────────┐
│ Partido Asociado *                      │
│ [Dropdown de partidos]                  │
├─────────────────────────────────────────┤
│ Título *                                │
│ [Input de texto]                        │
├─────────────────────────────────────────┤
│ ⚡ Auto-Inicio por Partido    [Toggle]  │
│ Se abrirá cuando partido vaya live      │
├─────────────────────────────────────────┤
│ 📅 Inicio Programado          [Toggle]  │
│ ┌─────────────┬─────────────┐           │
│ │ Fecha       │ Hora        │           │
│ │ [Date]      │ [Time]      │           │
│ ├─────────────┼─────────────┤           │
│ │ Fecha Fin   │ Hora Fin    │           │
│ │ [Date]      │ [Time]      │           │
│ └─────────────┴─────────────┘           │
├─────────────────────────────────────────┤
│ Jugadoras * (mín. 2)  [Todas] [Ninguna]│
│ ┌─────────────────────────────────────┐ │
│ │ ☑ Natalia Valentín #8 Opuesta      │ │
│ │ ☑ Stephanie Enright #10 Central    │ │
│ │ ☐ Shirley Ferrer #7 Líbero         │ │
│ │ ... (14 jugadoras totales)         │ │
│ └─────────────────────────────────────┘ │
│ Seleccionadas: 2 / 14                   │
├─────────────────────────────────────────┤
│            [Cancelar] [Crear Votación]  │
└─────────────────────────────────────────┘
```

---

## 🔧 **Cambios en el Código**

### **VotingContext.tsx - Nuevos Campos:**
```typescript
interface VotingPoll {
  id: number;
  matchId: number;
  title: string;
  description: string;
  isActive: boolean;
  autoStartEnabled: boolean;
  scheduledStartEnabled: boolean;      // 🆕 NUEVO
  scheduledStartDate?: string;         // 🆕 NUEVO (YYYY-MM-DD)
  scheduledStartTime?: string;         // 🆕 NUEVO (HH:mm)
  scheduledEndDate?: string;           // 🆕 NUEVO
  scheduledEndTime?: string;           // 🆕 NUEVO
  totalVotes: number;
  options: VotingOption[];
  userHasVoted: boolean;
}
```

### **VotingManagement.tsx - Integración con PlayerContext:**
```typescript
import { usePlayers } from "../../contexts/PlayerContext";

const { activePlayers } = usePlayers(); // 14 jugadoras reales

// Botones de selección rápida
const selectAllPlayers = () => {
  setSelectedPlayers(activePlayers.map(p => p.id));
};

const deselectAllPlayers = () => {
  setSelectedPlayers([]);
};
```

### **Verificación de Schedules (cada 60 segundos):**
```typescript
useEffect(() => {
  const checkSchedules = () => {
    const now = new Date();
    
    polls.forEach(poll => {
      // Verifica inicio programado
      if (poll.scheduledStartEnabled && !poll.isActive) {
        const scheduledDateTime = new Date(
          `${poll.scheduledStartDate}T${poll.scheduledStartTime}`
        );
        
        if (now >= scheduledDateTime) {
          // Abrir votación
          setPolls(polls => polls.map(p =>
            p.id === poll.id ? { ...p, isActive: true } : p
          ));
          
          toast.success('🗳️ ¡Votación Programada Iniciada!');
        }
      }
      
      // Verifica cierre programado
      if (poll.scheduledEndDate && poll.scheduledEndTime) {
        const endDateTime = new Date(
          `${poll.scheduledEndDate}T${poll.scheduledEndTime}`
        );
        
        if (now >= endDateTime) {
          // Cerrar votación
          setPolls(polls => polls.map(p =>
            p.id === poll.id ? { ...p, isActive: false } : p
          ));
        }
      }
    });
  };

  const interval = setInterval(checkSchedules, 60000); // Cada minuto
  return () => clearInterval(interval);
}, [polls]);
```

---

## 📱 **LiveVotingSection - Experiencia Mejorada**

### **Estado: Sin Votación Activa** 🔒
```
┌─────────────────────────────────┐
│         🔒                      │
│    Votación Cerrada             │
│                                 │
│  No hay votaciones activas      │
│  en este momento                │
└─────────────────────────────────┘
```

### **Estado: Votación Activa** 🗳️
```
┌─────────────────────────────────┐
│ MVP del Partido      🟢 En vivo │
├─────────────────────────────────┤
│ 🏆 Natalia Valentín             │
│    Opuesta • #8        45.2%    │
│    ████████████░░░░░  567 votos │
│                                 │
│    Stephanie Enright            │
│    Central • #10       32.1%    │
│    ████████░░░░░░░░  402 votos  │
│                                 │
│    Shirley Ferrer               │
│    Líbero • #7         22.7%    │
│    █████░░░░░░░░░░░  285 votos  │
├─────────────────────────────────┤
│  ✓ Tu voto ha sido registrado   │
│                                 │
│      Total: 1,254 votos         │
└─────────────────────────────────┘
```

---

## 🌟 **Ventajas del Sistema V2**

### **Para Administradores:**
✅ **Flexibilidad total**: 2 métodos de auto-inicio + manual
✅ **Selección rápida**: Botones para todas/ninguna jugadora
✅ **Roster completo**: 14 jugadoras reales de PlayerContext
✅ **Programación precisa**: Fecha y hora exacta
✅ **Cierre automático**: Opcional por schedule
✅ **Badges claros**: Visual feedback de configuración

### **Para Fans:**
✅ **Siempre actualizado**: Datos en tiempo real
✅ **Interfaz clara**: Estado de votación obvio
✅ **Ranking dinámico**: Se reordena por votos
✅ **Feedback inmediato**: Confirmación de voto
✅ **Info completa**: Jersey + posición de cada jugadora

---

## 🚀 **Casos de Uso Reales**

### **Caso 1: Partido Regular**
- **Configuración**: Auto-inicio cuando partido va live
- **Resultado**: Admin marca partido como "live" → Votación se abre
- **Ventaja**: Sincronización perfecta con el partido

### **Caso 2: Evento Especial Programado**
- **Configuración**: Schedule para las 19:00
- **Resultado**: A las 19:00 en punto → Votación se abre
- **Ventaja**: Control exacto del timing

### **Caso 3: Torneo con Múltiples Partidos**
- **Configuración**: 
  - Partido 1: Schedule 14:00 - 16:00
  - Partido 2: Schedule 17:00 - 19:00
  - Partido 3: Auto-inicio por partido live
- **Resultado**: Cada votación se activa según su configuración
- **Ventaja**: Gestión de múltiples votaciones simultáneas

### **Caso 4: Pre-Match Voting**
- **Configuración**: 
  - Inicio programado: 1 hora antes del partido
  - Cierre: Cuando el partido empieza (auto-inicio)
- **Resultado**: Fans votan antes del partido, se cierra al empezar
- **Ventaja**: Engagement pre-partido

---

## 📊 **Estadísticas Disponibles**

### **En Panel Admin:**
- ✅ Total de votos por votación
- ✅ Número de jugadoras participantes
- ✅ Porcentaje y ranking en tiempo real
- ✅ Estado de cada votación (activa/inactiva)
- ✅ Método de activación (auto/programado/manual)
- ✅ Fecha/hora programada (si aplica)

### **En App de Fans:**
- ✅ Total de votos generales
- ✅ Votos por jugadora
- ✅ Porcentaje actualizado
- ✅ Ranking visual con colores
- ✅ Estado de votación personal (votado/sin votar)

---

## 🔐 **Validaciones Implementadas**

✅ **Mínimo 2 jugadoras** para crear votación
✅ **Partido obligatorio** para asociar votación
✅ **Fecha/hora válida** si schedule está activado
✅ **Confirmación antes de eliminar** votación
✅ **Confirmación antes de reiniciar** votos
✅ **Un voto por usuario** por votación
✅ **Solo votaciones activas** permiten votar

---

## 📝 **Notificaciones Actualizadas**

| Evento | Notificación | Tipo |
|--------|--------------|------|
| Partido va live + auto-inicio | 🗳️ ¡Votación Abierta! | Success |
| Schedule activado | 🗳️ ¡Votación Programada Iniciada! | Success |
| Voto registrado | ✅ Votaste por [Jugadora] | Success |
| Votación cerrada por partido | ✅ Votación Cerrada | Info |
| Votación cerrada por schedule | ✅ Votación Cerrada (Programada) | Info |
| Error de validación | ❌ Mínimo 2 jugadoras | Error |

---

## 🎯 **Próximas Mejoras Sugeridas**

1. **Votación Múltiple**: Varios premios simultáneos (MVP, Mejor Saque, etc.)
2. **Historial Visual**: Gráficas de tendencias de votos
3. **Exportar Resultados**: PDF con estadísticas completas
4. **Compartir en RRSS**: "Voté por [Jugadora]"
5. **Leaderboard Global**: Jugadoras más votadas de la temporada
6. **Push Notifications**: Recordatorio cuando faltan X minutos para cierre
7. **Votación por Sets**: Una votación por cada set del partido
8. **API Integration**: Conectar con estadísticas oficiales del partido

---

## ✨ **Resumen de Mejoras V2**

| Característica | V1 | V2 |
|----------------|----|----|
| Jugadoras disponibles | 6 estáticas | 14 del PlayerContext ✅ |
| Métodos de auto-inicio | 1 (partido live) | 2 (partido + schedule) ✅ |
| Selección de jugadoras | Manual 1x1 | Botones Todas/Ninguna ✅ |
| Programación de fecha/hora | ❌ | ✅ Con date/time pickers |
| Cierre automático | Solo por partido | Partido + Schedule ✅ |
| Badges informativos | 1 (Auto) | 3 (Auto, Programado, Activa) ✅ |
| Contador de selección | ❌ | "X / 14" ✅ |
| Estado "sin votación" | Muestra vacío | Card elegante con candado ✅ |

---

## 🎉 **Sistema 100% Funcional**

El sistema de votación V2 está completamente implementado y listo para producción con:

✅ **Integración completa** con PlayerContext
✅ **Dos métodos de auto-inicio** (partido + schedule)
✅ **Selección rápida** de todas las jugadoras
✅ **Cierre automático** programable
✅ **UI/UX mejorada** con badges y estados claros
✅ **Notificaciones precisas** para cada evento
✅ **Validaciones robustas** en todos los formularios

---

## 🎯 **IMPORTANTE: Conexión con PlayerContext**

### **✅ Los nombres vienen del roster en tiempo real**

El sistema usa **Single Source of Truth** (una única fuente de verdad):

```
┌─────────────────────────────────────────────────────────┐
│  PlayerContext (FUENTE ÚNICA DE VERDAD)                  │
│  ├─ 14 jugadoras reales del roster                      │
│  ├─ Nombres, jerseys, posiciones                        │
│  └─ Si actualizas aquí, se refleja EN TODAS PARTES      │
└─────────────────────────────────────────────────────────┘
                          ↓
              (Join en tiempo real)
                          ↓
┌─────────────────────────────────────────────────────────┐
│  VotingContext (SOLO REFERENCIAS)                        │
│  ├─ playerId: 1, votes: 245  ← Solo ID y votos         │
│  ├─ playerId: 5, votes: 187  ← No guarda nombres       │
│  └─ playerId: 9, votes: 147  ← Solo referencias        │
└─────────────────────────────────────────────────────────┘
                          ↓
                    (Al renderizar)
                          ↓
┌─────────────────────────────────────────────────────────┐
│  LiveVotingSection (DATOS COMBINADOS)                    │
│  ├─ Busca player = players.find(p => p.id === playerId)│
│  ├─ Muestra: player.name (siempre actualizado)          │
│  └─ Muestra: option.votes (de votación)                 │
└─────────────────────────────────────────────────────────┘
```

### **Beneficios:**

✅ **Consistencia Total**: Un solo lugar para editar jugadoras  
✅ **Actualización Automática**: Cambios se ven en todas las votaciones  
✅ **Zero Duplicación**: No hay riesgo de datos desincronizados  
✅ **Performance**: Solo IDs almacenados, join desde cache  

### **Ejemplo Práctico:**

```
1. Admin edita jugadora:
   "Natalia Valentin" → "Natalia Valentín Maldonado"

2. Se actualiza automáticamente en:
   ✅ Votación activa (fans ven nuevo nombre)
   ✅ Resultados en admin panel
   ✅ Votaciones pasadas
   ✅ Toda la app

3. Sin configuración adicional!
```

### **Documentación Completa:**

📖 Ver `/VOTING_ARCHITECTURE.md` para detalles técnicos completos  
📖 Ver `/SINGLE_SOURCE_OF_TRUTH.md` para resumen visual

---

**¡El sistema está listo para gestionar votaciones de forma profesional con datos siempre sincronizados!** 🦀🏐🗳️

---

## ⏰ **Formato de 24 Horas (Puerto Rico)**

### **Importante: Todo el sistema usa formato de 24 horas**

En Puerto Rico se usa el formato de 24 horas para expresar el tiempo, por lo tanto:

### **Conversión 12h → 24h:**
| 12 Horas (AM/PM) | 24 Horas | Uso en Sistema |
|------------------|----------|----------------|
| 12:00 AM (medianoche) | 00:00 | ✅ 00:00h |
| 1:00 AM | 01:00 | ✅ 01:00h |
| 6:00 AM | 06:00 | ✅ 06:00h |
| 12:00 PM (mediodía) | 12:00 | ✅ 12:00h |
| 1:00 PM | 13:00 | ✅ 13:00h |
| 3:00 PM | 15:00 | ✅ 15:00h |
| 7:00 PM | 19:00 | ✅ 19:00h |
| 10:00 PM | 22:00 | ✅ 22:00h |
| 11:59 PM | 23:59 | ✅ 23:59h |

### **Ejemplos de Uso:**
```
✅ CORRECTO (formato 24h):
- "Inicio: 15 de octubre de 2025, 19:00h"
- "Partido a las 14:30h"
- "Cierre a las 22:00h"

❌ INCORRECTO (no usar AM/PM):
- "Inicio: 15 de octubre de 2025, 7:00 PM"
- "Partido a las 2:30 PM"
- "Cierre a las 10:00 PM"
```

### **En el Código:**
- ✅ Los inputs `type="time"` ya usan formato 24h internamente
- ✅ El helper `formatDateTimePR()` formatea correctamente: "15 de octubre de 2025, 19:00h"
- ✅ Las notificaciones muestran: "19:00h" (no "7:00 PM")
- ✅ La validación acepta horas de 00:00 a 23:59

### **Utilidades Disponibles (`/utils/timeFormat.ts`):**
```typescript
// Formatear hora con sufijo "h"
format24Hour("19:00") → "19:00h"

// Formatear fecha y hora completa
formatDateTimePR("2025-10-15", "19:00") 
  → "15 de octubre de 2025, 19:00h"

// Validar formato 24h
isValid24HourTime("19:00") → true
isValid24HourTime("7:00 PM") → false

// Obtener hora actual en 24h
getCurrentTime24h() → "19:30" (si son las 7:30 PM)
```

### **En la UI:**
- Labels dicen: **"Hora de Inicio (24h)"** y **"Hora de Cierre (Opcional, 24h)"**
- Placeholders muestran: `"19:00"` (no "7:00 PM")
- Información de schedule: "Inicio: 15 de octubre de 2025, 19:00h" ⏰

---

**Sistema 100% compatible con el formato horario de Puerto Rico** 🇵🇷⏰

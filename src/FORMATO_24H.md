# ⏰ Formato de 24 Horas - Sistema Cangrejeras 🇵🇷

## **Puerto Rico usa formato de 24 horas**

Todo el sistema de votación programada usa **formato de 24 horas** (HH:mm) como es estándar en Puerto Rico.

---

## 📋 **Tabla de Conversión Rápida**

| 🕐 12 Horas | ⏰ 24 Horas | 📱 En la App |
|------------|------------|--------------|
| 12:00 AM | **00:00** | 00:00h |
| 1:00 AM | **01:00** | 01:00h |
| 2:00 AM | **02:00** | 02:00h |
| 6:00 AM | **06:00** | 06:00h |
| 9:00 AM | **09:00** | 09:00h |
| 12:00 PM | **12:00** | 12:00h |
| 1:00 PM | **13:00** | 13:00h ⭐ |
| 2:00 PM | **14:00** | 14:00h ⭐ |
| 3:00 PM | **15:00** | 15:00h ⭐ |
| 5:00 PM | **17:00** | 17:00h ⭐ |
| 7:00 PM | **19:00** | 19:00h ⭐ (Partido típico) |
| 10:00 PM | **22:00** | 22:00h ⭐ |
| 11:59 PM | **23:59** | 23:59h |

**⭐ Horas PM comunes = Hora + 12**
- 1:00 PM → 13:00
- 7:00 PM → 19:00
- 10:00 PM → 22:00

---

## 🎯 **Ejemplos de Uso en el Sistema**

### **Caso 1: Partido en la Tarde** 🏐
```
Configuración Admin:
├─ Fecha: 2025-10-15
├─ Hora inicio: 14:00 ← (2:00 PM)
└─ Hora cierre: 16:00 ← (4:00 PM)

Visualización en App:
"Inicio: 15 de octubre de 2025, 14:00h"
```

### **Caso 2: Partido en la Noche** 🌙
```
Configuración Admin:
├─ Fecha: 2025-10-20
├─ Hora inicio: 19:00 ← (7:00 PM)
└─ Hora cierre: 22:00 ← (10:00 PM)

Visualización en App:
"Inicio: 20 de octubre de 2025, 19:00h"
```

### **Caso 3: Votación Pre-Partido** ⏳
```
Configuración Admin:
├─ Fecha inicio: 2025-10-18
├─ Hora inicio: 18:00 ← (6:00 PM - 1h antes del partido)
├─ Fecha cierre: 2025-10-18
└─ Hora cierre: 19:00 ← (7:00 PM - cuando empieza el partido)

Visualización en App:
"Inicio: 18 de octubre de 2025, 18:00h"
"Cierre: 18 de octubre de 2025, 19:00h"
```

---

## 🖥️ **En la Interfaz de Admin**

### **Formulario de Creación:**
```
┌─────────────────────────────────────┐
│ 📅 Inicio Programado     [Toggle ✓] │
│                                     │
│ ┌────────────────┬────────────────┐ │
│ │ Fecha de Inicio│ Hora (24h)     │ │
│ │ [2025-10-15]   │ [19:00] ⏰     │ │
│ ├────────────────┼────────────────┤ │
│ │ Fecha Cierre   │ Hora (24h)     │ │
│ │ [2025-10-15]   │ [22:00] ⏰     │ │
│ └────────────────┴────────────────┘ │
│                                     │
│ 💡 Usa formato 24h: 19:00 no 7:00 PM│
└─────────────────────────────────────┘
```

### **Vista en Lista de Votaciones:**
```
┌─────────────────────────────────────┐
│ 🏆 MVP del Partido                  │
│ 📅 Programado                       │
│                                     │
│ 🕐 Inicio: 15 de octubre, 19:00h   │
│ 🏐 Cangrejeras vs Leonas            │
│ 👥 1,234 votos                      │
└─────────────────────────────────────┘
```

---

## 💻 **Código - Validación y Formato**

### **Helpers Disponibles (`/utils/timeFormat.ts`):**

```typescript
import { 
  format24Hour,
  formatDateTimePR,
  isValid24HourTime,
  getCurrentTime24h 
} from '../utils/timeFormat';

// 1️⃣ Formatear hora simple
format24Hour("19:00");
// Resultado: "19:00h"

// 2️⃣ Formatear fecha y hora completa
formatDateTimePR("2025-10-15", "19:00");
// Resultado: "15 de octubre de 2025, 19:00h"

// 3️⃣ Validar formato 24h
isValid24HourTime("19:00");  // ✅ true
isValid24HourTime("25:00");  // ❌ false (no existe hora 25)
isValid24HourTime("7:00 PM"); // ❌ false (no acepta AM/PM)

// 4️⃣ Obtener hora actual en 24h
getCurrentTime24h();
// Resultado: "19:30" (si son las 7:30 PM)
```

### **Validación de Rango:**
```typescript
// Las horas válidas son de 00:00 a 23:59
✅ Válido: 00:00, 01:30, 12:00, 19:00, 23:59
❌ Inválido: 24:00, 25:30, -01:00
```

---

## 🎨 **Visualización para Usuarios**

### **En App de Fans:**
```
╔═══════════════════════════════════╗
║ 🗳️ Votación Activa               ║
╠═══════════════════════════════════╣
║ Jugadora Destacada del Partido    ║
║                                   ║
║ 🟢 Abierta desde las 19:00h       ║
║ ⏰ Cierra a las 22:00h            ║
║                                   ║
║ ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛ 45.2%           ║
║ 🏆 Natalia Valentín - 567 votos   ║
║                                   ║
║ Total: 1,254 votos                ║
╚═══════════════════════════════════╝
```

### **Notificaciones Push:**
```
🗳️ ¡Votación Programada Iniciada!

Jugadora Destacada del Partido

Horario: 19:00h - 22:00h
Vota ahora por tu favorita! 🦀
```

---

## ⚙️ **Configuración Técnica**

### **Input Type="time":**
```tsx
<Input
  type="time"
  value="19:00"
  placeholder="19:00"
  className="..."
/>

// HTML5 time input usa formato 24h internamente (HH:mm)
// No necesita conversión adicional
```

### **Almacenamiento:**
```typescript
interface VotingPoll {
  scheduledStartTime: string; // "19:00" (formato 24h)
  scheduledEndTime: string;   // "22:00" (formato 24h)
}

// ✅ Se guarda directamente en formato 24h
// ❌ NO se convierte a AM/PM
```

---

## 📊 **Ejemplos de Schedules Comunes**

### **🌅 Partido Matutino:**
```
Inicio: 10:00h (10:00 AM)
Cierre: 12:00h (12:00 PM)
```

### **🌤️ Partido de Tarde:**
```
Inicio: 14:00h (2:00 PM)
Cierre: 16:30h (4:30 PM)
```

### **🌙 Partido de Noche (Más común):**
```
Inicio: 19:00h (7:00 PM)
Cierre: 22:00h (10:00 PM)
```

### **⏰ Pre-Match Voting (Abre 1h antes):**
```
Partido: 19:00h
Votación:
  Inicio: 18:00h (1h antes)
  Cierre: 19:00h (al empezar partido)
```

### **📊 Post-Match Voting (Después del partido):**
```
Partido termina: ~21:30h
Votación:
  Inicio: 21:30h (al terminar)
  Cierre: 23:00h (1.5h después)
```

---

## ✅ **Checklist de Implementación**

- [x] Inputs de tiempo usan `type="time"` (formato 24h nativo)
- [x] Labels especifican **(24h)** en la UI
- [x] Placeholders muestran ejemplos: `"19:00"`
- [x] Validación con `isValid24HourTime()`
- [x] Formato de visualización con sufijo `"h"`: `"19:00h"`
- [x] Helper `formatDateTimePR()` para formato completo
- [x] Documentación clara sobre formato 24h
- [x] No se usa AM/PM en ninguna parte del sistema

---

## 🌍 **Contexto: Puerto Rico y Formato 24h**

En Puerto Rico, aunque el inglés y español coexisten, el **formato de 24 horas es ampliamente usado** especialmente en:

- ✅ Horarios de transportación
- ✅ Eventos deportivos
- ✅ Programación de TV/Radio
- ✅ Aplicaciones y sistemas digitales
- ✅ Comunicación oficial

Por lo tanto, el sistema está **optimizado para la audiencia local** usando el estándar de 24 horas.

---

## 🎓 **Tips para Usuarios**

### **Conversión Rápida (PM):**
Para horas de la tarde/noche (PM), **suma 12 a la hora**:
- 1:00 PM → 1 + 12 = **13:00**
- 7:00 PM → 7 + 12 = **19:00**
- 10:00 PM → 10 + 12 = **22:00**

### **Excepciones:**
- **12:00 PM (mediodía)** → **12:00** (no sumes 12)
- **12:00 AM (medianoche)** → **00:00** (usa 00)

### **Horarios de Partidos Típicos:**
```
Día de semana:  19:00h - 21:30h (7:00 PM - 9:30 PM)
Fin de semana:  14:00h - 16:30h (2:00 PM - 4:30 PM)
                19:00h - 21:30h (7:00 PM - 9:30 PM)
```

---

## 📱 **Resumen**

| Elemento | Formato | Ejemplo |
|----------|---------|---------|
| Input de hora | HH:mm | `19:00` |
| Display en app | HH:mmh | `19:00h` |
| Fecha completa | DD de MMM YYYY, HH:mmh | `15 de octubre de 2025, 19:00h` |
| Rango válido | 00:00 - 23:59 | Todas las horas del día |
| NO usar | AM/PM | ❌ `7:00 PM` |

---

**✨ Sistema 100% compatible con el formato horario de Puerto Rico** 🇵🇷⏰🦀

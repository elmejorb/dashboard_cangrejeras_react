# Guía de DateTimePicker Premium

## Componentes Disponibles

### DatePicker
Selector de fecha personalizado con diseño glass morphism premium.

#### Props
- `value: string` - Fecha en formato 'YYYY-MM-DD'
- `onChange: (value: string) => void` - Callback cuando cambia la fecha
- `darkMode: boolean` - Activa el modo oscuro
- `label?: string` - Etiqueta opcional para el campo
- `required?: boolean` - Indica si el campo es requerido

#### Ejemplo de Uso
```tsx
<DatePicker
  value={formData.date || ''}
  onChange={(value) => setFormData({ ...formData, date: value })}
  darkMode={darkMode}
  label="Fecha"
  required
/>
```

### TimePicker
Selector de hora personalizado con diseño glass morphism premium y formato de 12 horas (AM/PM).

#### Props
- `value: string` - Hora en formato 24 horas 'HH:MM' (ej: '15:30')
- `onChange: (value: string) => void` - Callback cuando cambia la hora (devuelve formato 24h)
- `darkMode: boolean` - Activa el modo oscuro
- `label?: string` - Etiqueta opcional para el campo
- `required?: boolean` - Indica si el campo es requerido

#### Ejemplo de Uso
```tsx
<TimePicker
  value={formData.time || ''}
  onChange={(value) => setFormData({ ...formData, time: value })}
  darkMode={darkMode}
  label="Hora"
  required
/>
```

## Características

### Diseño Premium
- **Glass Morphism**: Fondos semi-transparentes con blur effect
- **Gradientes Dorados**: Utiliza el color de marca #C8A963
- **Animaciones Suaves**: Transiciones fluidas y efectos hover
- **Efectos de Glow**: Borde brillante animado cuando está activo
- **Modo Oscuro Completo**: Soporte total para tema oscuro

### DatePicker
- Calendario visual interactivo
- Navegación entre meses con flechas
- Indicador visual del día actual
- Botones rápidos: "Hoy" y "Limpiar"
- Nombres de meses y días en español
- Animación de selección con escala
- Efectos hover con gradientes

### TimePicker
- Formato de 12 horas con AM/PM
- Selectores visuales para hora y minuto
- Toggle AM/PM con un clic
- Botones de acceso rápido (12:00 PM, 3:00 PM, 7:00 PM)
- Display grande y legible
- Scrolling suave con scrollbar personalizado
- Convierte automáticamente entre formato 12h y 24h

## Integración

### Importación
```tsx
import { DatePicker, TimePicker } from './components/admin/DateTimePicker';
```

### En un Formulario
```tsx
<form onSubmit={handleSubmit}>
  <div className="grid grid-cols-2 gap-4">
    <DatePicker
      value={formData.date || ''}
      onChange={(value) => setFormData({ ...formData, date: value })}
      darkMode={darkMode}
      label="Fecha"
      required
    />

    <TimePicker
      value={formData.time || ''}
      onChange={(value) => setFormData({ ...formData, time: value })}
      darkMode={darkMode}
      label="Hora"
      required
    />
  </div>
</form>
```

## Colores de Marca

Los componentes utilizan los colores oficiales de las Cangrejeras:
- **Team Gold (#C8A963)**: Elementos seleccionados, acentos, borders activos
- **Team Navy (#0C2340)**: Texto en elementos seleccionados (modo claro)
- **Live Red (#E01E37)**: Botón de limpiar
- **Fondos Glass**: Semi-transparentes con blur para efecto vidrio

## Animaciones

### Keyframes Utilizados
- `fade-in`: Aparición suave del dropdown
- `slide-in-from-top`: Entrada deslizante desde arriba
- `picker-glow`: Efecto de brillo pulsante (obsoleto para estos componentes)

### Transiciones
- Hover: 300ms con ease
- Focus: Glow animado con pulse
- Selección: Scale transform con spring easing
- Cierre: Fade out suave

## Accesibilidad

- Click fuera del componente cierra el picker
- Navegación con teclado en los campos
- Labels descriptivos
- Indicadores visuales claros
- Contraste adecuado en modo claro y oscuro

## Notas Técnicas

1. **Formato de Hora**: El TimePicker muestra formato de 12 horas pero guarda/recibe en formato 24 horas para compatibilidad con bases de datos.

2. **Actualización Reactiva**: Los componentes se actualizan automáticamente cuando cambia el prop `value` desde el componente padre.

3. **Cierre Automático**: Al seleccionar una fecha u hora, el picker se cierra automáticamente.

4. **Validación**: Los componentes no incluyen validación interna, debe manejarse en el formulario padre.

5. **Scrollbar Custom**: Los selectores de hora/minuto usan scrollbars personalizados que coinciden con el tema.

# 🔧 Instalar Firebase CLI

Firebase CLI no está instalado en tu sistema. Sigue estos pasos para instalarlo:

## ✅ Opción 1: Instalación Global (Recomendado)

### Paso 1: Abrir terminal como Administrador
1. Presiona `Win + X`
2. Selecciona "Terminal (Admin)" o "PowerShell (Admin)"

### Paso 2: Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

**Tiempo de instalación:** 2-3 minutos

### Paso 3: Verificar instalación
```bash
firebase --version
```

Deberías ver algo como: `13.0.0` o superior

### Paso 4: Autenticarse
```bash
firebase login
```

Esto abrirá tu navegador para que inicies sesión con Google.

---

## ⚡ Opción 2: Usar npx (Sin instalar globalmente)

Si no puedes instalar globalmente, usa `npx` antes de cada comando:

```bash
# En lugar de:
firebase login

# Usa:
npx firebase login

# En lugar de:
firebase deploy

# Usa:
npx firebase deploy
```

---

## 🐛 Solución de Problemas

### Error: "npm: command not found"
**Causa:** Node.js no está instalado

**Solución:**
1. Descarga Node.js desde: https://nodejs.org/
2. Instala la versión LTS (Long Term Support)
3. Reinicia tu terminal
4. Verifica: `node --version` y `npm --version`

### Error: "Permission denied" o "EACCES"
**Causa:** Permisos insuficientes

**Solución Windows:**
1. Abre PowerShell como Administrador
2. Ejecuta: `npm install -g firebase-tools`

**Solución alternativa:**
Usa `npx firebase` en lugar de instalar globalmente

### Firebase CLI se instala pero no se reconoce
**Causa:** PATH no actualizado

**Solución:**
1. Cierra todas las terminales abiertas
2. Abre una nueva terminal
3. Verifica: `firebase --version`

Si aún no funciona:
1. Busca "Variables de entorno" en Windows
2. Agrega la ruta de npm global al PATH:
   - Generalmente: `C:\Users\TuUsuario\AppData\Roaming\npm`

---

## ✅ Después de Instalar

Una vez instalado Firebase CLI:

### 1. Autenticarse
```bash
firebase login
```

### 2. Ver proyectos disponibles
```bash
firebase projects:list
```

### 3. Seleccionar tu proyecto
```bash
firebase use --add
```

### 4. Desplegar las Cloud Functions
```bash
# Opción A: Usar el script
deploy-functions.bat

# Opción B: Manual
cd functions
npm install
npm run deploy
```

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. **Verifica Node.js:**
   ```bash
   node --version
   npm --version
   ```
   Deberías ver versiones 18 o superior

2. **Reinicia tu terminal** después de instalar

3. **Usa npx como alternativa:**
   ```bash
   npx firebase --version
   ```

---

## 🎯 Resumen de Comandos

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Verificar instalación
firebase --version

# 3. Login
firebase login

# 4. Ver proyectos
firebase projects:list

# 5. Seleccionar proyecto
firebase use --add

# 6. Desplegar
cd functions
npm install
npm run deploy
```

---

**Una vez completados estos pasos, vuelve a ejecutar `deploy-functions.bat`** ✅

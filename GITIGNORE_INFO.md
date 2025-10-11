# 📝 Información sobre .gitignore

## ¿Qué es .gitignore?

El archivo `.gitignore` le dice a Git qué archivos y carpetas **NO** debe incluir en el repositorio. Esto es importante para:

1. ✅ No subir archivos sensibles (claves, contraseñas)
2. ✅ No subir archivos generados automáticamente
3. ✅ Mantener el repositorio limpio y ligero
4. ✅ Evitar conflictos entre diferentes sistemas operativos

---

## 📂 Archivos y Carpetas Ignoradas

### 🔒 **Archivos Sensibles (MUY IMPORTANTE)**
```
.env
.env.local
.env.production.local
```
**Por qué:** Contienen claves API, contraseñas de Firebase, etc.

### 📦 **Dependencias**
```
node_modules/
```
**Por qué:** Pesa cientos de MB. Se reinstala con `npm install`.

### 🏗️ **Archivos de Compilación**
```
dist/
build/
.cache/
```
**Por qué:** Se generan automáticamente con `npm run build`.

### 🔥 **Archivos de Firebase**
```
.firebase/
firebase-debug.log
firestore-debug.log
```
**Por qué:** Archivos locales de Firebase CLI.

### 💻 **Configuración de Editores**
```
.vscode/
.idea/
*.sublime-workspace
```
**Por qué:** Configuración personal de cada desarrollador.

### 🍎 **Archivos del Sistema Operativo**
```
.DS_Store          (macOS)
Thumbs.db          (Windows)
Desktop.ini        (Windows)
*~                 (Linux)
```
**Por qué:** Archivos generados automáticamente por el OS.

### 📄 **Documentación de Desarrollo**
```
versiones/
ACTIVITY_LOG_MIGRATION.md
DOCS_PARA_APP.md
FIREBASE_SETUP.md
FIRESTORE_STRUCTURE.md
...
```
**Por qué:** Documentación interna que no es parte del código.

**Excepción:** `README.md` SÍ se incluye (es la documentación principal).

---

## ✅ Archivos que SÍ se Suben a Git

- ✅ `package.json` - Lista de dependencias
- ✅ `src/` - Todo el código fuente
- ✅ `public/` - Archivos públicos (imágenes, etc.)
- ✅ `index.html` - Archivo HTML principal
- ✅ `vite.config.ts` - Configuración de Vite
- ✅ `tsconfig.json` - Configuración de TypeScript
- ✅ `README.md` - Documentación del proyecto
- ✅ `.gitignore` - Este archivo

---

## 🚀 Comandos Útiles de Git

### Ver archivos ignorados:
```bash
git status --ignored
```

### Ver qué archivos Git está rastreando:
```bash
git ls-files
```

### Ver archivos sin rastrear:
```bash
git status
```

### Si ya subiste archivos que deberían estar en .gitignore:
```bash
# Eliminar del repositorio pero mantener localmente
git rm --cached nombre_archivo

# O para una carpeta completa
git rm -r --cached nombre_carpeta/

# Luego hacer commit
git commit -m "Remove ignored files"
```

---

## ⚠️ IMPORTANTE - Archivos Sensibles

### ❌ NUNCA subir a Git:
- Claves API de Firebase
- Contraseñas
- Tokens de autenticación
- Archivos `.env`
- Certificados privados

### ✅ Cómo manejar configuración:
1. Crear archivo `.env.example` con variables sin valores:
```
VITE_FIREBASE_API_KEY=tu_clave_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio_aqui
```

2. Cada desarrollador copia `.env.example` a `.env` y agrega sus valores reales.

3. `.env` está en `.gitignore`, así que nunca se sube.

---

## 📊 Tamaño del Repositorio

### Sin .gitignore:
```
node_modules/     ~300 MB
build/            ~10 MB
.DS_Store         ~6 KB
logs/             ~1 MB
TOTAL:            ~311 MB
```

### Con .gitignore:
```
src/              ~2 MB
public/           ~500 KB
config files      ~100 KB
TOTAL:            ~2.6 MB
```

**Ahorro: 99% menos peso** 🎉

---

## 🔧 Personalización

Si necesitas ignorar archivos adicionales específicos de tu proyecto, agrega las líneas al final del `.gitignore`:

```bash
# Mis archivos personales
mis_notas.txt
backup_*.sql
pruebas_locales/
```

---

## 📚 Recursos

- [Documentación oficial de .gitignore](https://git-scm.com/docs/gitignore)
- [Colección de .gitignore para diferentes proyectos](https://github.com/github/gitignore)
- [Generador de .gitignore](https://www.toptal.com/developers/gitignore)

---

## ✅ Verificación

Para verificar que tu `.gitignore` está funcionando:

```bash
# Ver archivos que Git está rastreando
git ls-files

# Debería mostrar solo:
# - Archivos de código fuente
# - Archivos de configuración
# - README.md
# NO debería mostrar:
# - node_modules/
# - .DS_Store
# - archivos .log
# - build/ o dist/
```

---

**Última actualización:** Octubre 2025

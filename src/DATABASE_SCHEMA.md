# 🗄️ Esquema de Base de Datos - Cangrejeras Dashboard

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Diagrama de Relaciones (ERD)](#diagrama-de-relaciones-erd)
3. [Tablas Principales](#tablas-principales)
4. [Políticas de Seguridad (RLS)](#políticas-de-seguridad-rls)
5. [Índices para Rendimiento](#índices-para-rendimiento)
6. [Queries Comunes](#queries-comunes)
7. [Migración desde localStorage](#migración-desde-localstorage)
8. [Storage (Archivos)](#storage-archivos)

---

## 🎯 Resumen Ejecutivo

### **Base de Datos Recomendada: Supabase (PostgreSQL)**

**Tablas Totales:** 12 tablas principales + 3 tablas de unión  
**Storage Buckets:** 3 buckets (players, media, news)  
**Usuarios Esperados:** 5-10 administradores + público ilimitado (lectura)  
**Volumen de Datos:** ~1000 registros/mes (partidos, votaciones, noticias)

### **Características Clave:**
- ✅ Row Level Security (RLS) para seguridad granular
- ✅ Realtime subscriptions para votaciones en vivo
- ✅ Storage integrado para imágenes/videos
- ✅ Auth nativo para administradores
- ✅ API REST automática
- ✅ Triggers para logs automáticos

---

## 🔄 Diagrama de Relaciones (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                      SISTEMA COMPLETO                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │────────▶│  activity_   │         │notification_ │
│  (admins)    │         │    logs      │         │ preferences  │
└──────────────┘         └──────────────┘         └──────────────┘
       │                                                   │
       │ created_by                                        │
       ▼                                                   ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   players    │◀───────▶│player_stats  │         │notifications │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   matches    │◀───────▶│match_players │         │   voting_    │
│              │         │   (pivot)    │         │  sessions    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                                                   │
       │                                                   │
       ▼                                                   ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│match_events  │         │   votes      │         │vote_options  │
└──────────────┘         └──────────────┘         └──────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     news     │         │  standings   │         │    media     │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│news_tags     │         │  sponsors    │         │media_tags    │
│  (pivot)     │         │              │         │  (pivot)     │
└──────────────┘         └──────────────┘         └──────────────┘
```

---

## 📊 Tablas Principales

### **1. users (Administradores del Sistema)**

Gestiona los usuarios administrativos que pueden acceder al dashboard.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Editor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('Super Admin', 'Admin', 'Editor', 'Moderador')),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**Campos:**
- `id` - UUID único del usuario
- `email` - Correo electrónico (debe coincidir con Supabase Auth)
- `name` - Nombre completo del administrador
- `role` - Rol: Super Admin, Admin, Editor, Moderador
- `avatar_url` - URL de la foto de perfil (Storage)
- `created_at` - Fecha de creación
- `updated_at` - Última actualización
- `last_login_at` - Último inicio de sesión
- `is_active` - Estado activo/inactivo

**Relaciones:**
- 1:N con `players` (created_by)
- 1:N con `matches` (created_by)
- 1:N with `news` (author_id)
- 1:N con `activity_logs`
- 1:1 con `notification_preferences`

---

### **2. players (Jugadoras del Roster)**

Información completa de las jugadoras del equipo.

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  number INTEGER NOT NULL,
  position VARCHAR(50) NOT NULL,
  height_cm INTEGER,
  photo_url TEXT,
  hometown VARCHAR(255),
  college VARCHAR(255),
  birth_date DATE,
  bio TEXT,
  social_instagram VARCHAR(255),
  social_twitter VARCHAR(255),
  social_tiktok VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_position CHECK (position IN ('Líbero', 'Central', 'Esquina', 'Opuesta', 'Armadora')),
  CONSTRAINT unique_number_active CHECK (
    (is_active = false) OR 
    (number NOT IN (SELECT number FROM players WHERE is_active = true AND id != players.id))
  )
);

-- Indices
CREATE INDEX idx_players_number ON players(number);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_is_active ON players(is_active);
CREATE INDEX idx_players_is_featured ON players(is_featured);
CREATE INDEX idx_players_display_order ON players(display_order);
CREATE INDEX idx_players_created_by ON players(created_by);

-- Trigger para updated_at
CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**Campos Clave:**
- `number` - Número de camiseta (único entre jugadoras activas)
- `position` - Posición en la cancha
- `height_cm` - Estatura en centímetros
- `photo_url` - Foto de perfil (Storage: players bucket)
- `social_*` - Handles de redes sociales (sin @)
- `is_featured` - Si aparece en destacadas
- `display_order` - Orden de visualización (menor = primero)

---

### **3. player_stats (Estadísticas por Jugadora)**

Estadísticas acumuladas de cada jugadora en la temporada.

```sql
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL DEFAULT '2024-2025',
  
  -- Stats generales
  matches_played INTEGER DEFAULT 0,
  sets_played INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  
  -- Stats ofensivas
  points_total INTEGER DEFAULT 0,
  attacks_total INTEGER DEFAULT 0,
  attacks_successful INTEGER DEFAULT 0,
  attacks_blocked INTEGER DEFAULT 0,
  attacks_error INTEGER DEFAULT 0,
  attack_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Stats defensivas
  blocks_total INTEGER DEFAULT 0,
  blocks_solo INTEGER DEFAULT 0,
  blocks_assisted INTEGER DEFAULT 0,
  digs_total INTEGER DEFAULT 0,
  
  -- Stats de servicio
  serves_total INTEGER DEFAULT 0,
  aces_total INTEGER DEFAULT 0,
  serve_errors INTEGER DEFAULT 0,
  
  -- Stats de recepción
  receptions_total INTEGER DEFAULT 0,
  receptions_perfect INTEGER DEFAULT 0,
  reception_errors INTEGER DEFAULT 0,
  
  -- Stats de armado
  assists_total INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_player_season UNIQUE(player_id, season)
);

-- Indices
CREATE INDEX idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX idx_player_stats_season ON player_stats(season);
CREATE INDEX idx_player_stats_points ON player_stats(points_total DESC);
CREATE INDEX idx_player_stats_attacks ON player_stats(attacks_successful DESC);

-- Trigger para updated_at
CREATE TRIGGER update_player_stats_updated_at 
  BEFORE UPDATE ON player_stats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**Uso:**
- Se actualizan automáticamente con triggers cuando se registran eventos de partido
- Permiten rankings y comparaciones
- Base para la votación MVP

---

### **4. matches (Partidos del Equipo)**

Información de todos los partidos (pasados y futuros).

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opponent VARCHAR(255) NOT NULL,
  opponent_logo_url TEXT,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue VARCHAR(255) NOT NULL,
  venue_address TEXT,
  match_type VARCHAR(50) NOT NULL DEFAULT 'Regular',
  competition VARCHAR(100),
  
  -- Scores
  score_home INTEGER,
  score_away INTEGER,
  is_home BOOLEAN DEFAULT true,
  
  -- Sets detallados
  set_1_home INTEGER,
  set_1_away INTEGER,
  set_2_home INTEGER,
  set_2_away INTEGER,
  set_3_home INTEGER,
  set_3_away INTEGER,
  set_4_home INTEGER,
  set_4_away INTEGER,
  set_5_home INTEGER,
  set_5_away INTEGER,
  
  -- Estado
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  is_live BOOLEAN DEFAULT false,
  current_set INTEGER,
  
  -- Información adicional
  ticket_url TEXT,
  stream_url TEXT,
  match_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled', 'postponed')),
  CONSTRAINT valid_match_type CHECK (match_type IN ('Regular', 'Playoffs', 'Final', 'Amistoso')),
  CONSTRAINT valid_scores CHECK (
    (status != 'finished') OR 
    (score_home IS NOT NULL AND score_away IS NOT NULL)
  )
);

-- Indices
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_is_live ON matches(is_live);
CREATE INDEX idx_matches_opponent ON matches(opponent);
CREATE INDEX idx_matches_created_by ON matches(created_by);

-- Índice compuesto para próximos partidos
CREATE INDEX idx_matches_upcoming ON matches(match_date ASC) 
  WHERE status = 'scheduled';

-- Trigger para updated_at
CREATE TRIGGER update_matches_updated_at 
  BEFORE UPDATE ON matches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**Estados del Partido:**
- `scheduled` - Programado (futuro)
- `live` - En vivo ahora
- `finished` - Finalizado
- `cancelled` - Cancelado
- `postponed` - Pospuesto

---

### **5. match_players (Relación Partido-Jugadoras)**

Tabla pivot que conecta partidos con jugadoras que participaron.

```sql
CREATE TABLE match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  
  -- Participación
  started BOOLEAN DEFAULT false,
  minutes_played INTEGER DEFAULT 0,
  
  -- Stats en este partido específico
  points INTEGER DEFAULT 0,
  attacks INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  digs INTEGER DEFAULT 0,
  aces INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_match_player UNIQUE(match_id, player_id)
);

-- Indices
CREATE INDEX idx_match_players_match_id ON match_players(match_id);
CREATE INDEX idx_match_players_player_id ON match_players(player_id);
CREATE INDEX idx_match_players_points ON match_players(points DESC);
```

---

### **6. match_events (Eventos en Vivo del Partido)**

Registro cronológico de eventos durante un partido en vivo.

```sql
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  
  -- Evento
  event_type VARCHAR(50) NOT NULL,
  event_description TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  score_home INTEGER,
  score_away INTEGER,
  
  -- Metadata
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'point', 'ace', 'block', 'attack', 'dig', 'error', 
    'substitution', 'timeout', 'set_start', 'set_end'
  )),
  CONSTRAINT valid_set_number CHECK (set_number BETWEEN 1 AND 5)
);

-- Indices
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_match_events_player_id ON match_events(player_id);
CREATE INDEX idx_match_events_timestamp ON match_events(timestamp DESC);
CREATE INDEX idx_match_events_type ON match_events(event_type);
```

**Tipos de Eventos:**
- `point` - Punto anotado
- `ace` - Ace de servicio
- `block` - Bloqueo exitoso
- `attack` - Ataque exitoso
- `dig` - Defensa
- `error` - Error
- `substitution` - Cambio de jugadora
- `timeout` - Tiempo fuera
- `set_start` / `set_end` - Control de sets

---

### **7. voting_sessions (Sesiones de Votación)**

Configuración de votaciones activas o pasadas.

```sql
CREATE TABLE voting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  
  -- Configuración
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question TEXT NOT NULL,
  voting_type VARCHAR(50) NOT NULL DEFAULT 'mvp',
  
  -- Estado
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  is_active BOOLEAN DEFAULT false,
  
  -- Fechas
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Opciones (puede ser jugadoras u otras opciones)
  allow_multiple_votes BOOLEAN DEFAULT false,
  require_authentication BOOLEAN DEFAULT false,
  max_votes_per_user INTEGER DEFAULT 1,
  
  -- Resultados
  total_votes INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'finished', 'cancelled')),
  CONSTRAINT valid_voting_type CHECK (voting_type IN ('mvp', 'poll', 'best_play', 'custom')),
  CONSTRAINT valid_dates CHECK (ends_at > starts_at)
);

-- Indices
CREATE INDEX idx_voting_sessions_match_id ON voting_sessions(match_id);
CREATE INDEX idx_voting_sessions_status ON voting_sessions(status);
CREATE INDEX idx_voting_sessions_is_active ON voting_sessions(is_active);
CREATE INDEX idx_voting_sessions_starts_at ON voting_sessions(starts_at DESC);
CREATE INDEX idx_voting_sessions_created_by ON voting_sessions(created_by);

-- Trigger para updated_at
CREATE TRIGGER update_voting_sessions_updated_at 
  BEFORE UPDATE ON voting_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**Estados:**
- `draft` - Borrador (no visible)
- `active` - Activa (votaciones abiertas)
- `finished` - Finalizada (resultados visibles)
- `cancelled` - Cancelada

---

### **8. vote_options (Opciones de Votación)**

Opciones disponibles en cada sesión de votación.

```sql
CREATE TABLE vote_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voting_session_id UUID REFERENCES voting_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  
  -- Opcional para votaciones no de jugadoras
  custom_option TEXT,
  custom_option_image TEXT,
  
  -- Contadores
  vote_count INTEGER DEFAULT 0,
  vote_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Orden de visualización
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT has_player_or_custom CHECK (
    (player_id IS NOT NULL) OR (custom_option IS NOT NULL)
  )
);

-- Indices
CREATE INDEX idx_vote_options_session_id ON vote_options(voting_session_id);
CREATE INDEX idx_vote_options_player_id ON vote_options(player_id);
CREATE INDEX idx_vote_options_vote_count ON vote_options(vote_count DESC);
CREATE INDEX idx_vote_options_display_order ON vote_options(display_order);

-- Trigger para updated_at
CREATE TRIGGER update_vote_options_updated_at 
  BEFORE UPDATE ON vote_options 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

### **9. votes (Votos Individuales)**

Registro de cada voto emitido (para análisis y prevención de fraude).

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voting_session_id UUID REFERENCES voting_sessions(id) ON DELETE CASCADE,
  vote_option_id UUID REFERENCES vote_options(id) ON DELETE CASCADE,
  
  -- Identificación del votante (anónimo o autenticado)
  user_id UUID REFERENCES users(id),
  voter_fingerprint VARCHAR(255), -- Hash de IP + User Agent para votantes anónimos
  
  -- Metadata
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Constraints
  CONSTRAINT unique_vote_per_session CHECK (
    -- Un usuario autenticado solo puede votar una vez
    (user_id IS NULL) OR 
    (user_id NOT IN (
      SELECT user_id FROM votes 
      WHERE voting_session_id = votes.voting_session_id 
      AND user_id IS NOT NULL
    ))
  )
);

-- Indices
CREATE INDEX idx_votes_session_id ON votes(voting_session_id);
CREATE INDEX idx_votes_option_id ON votes(vote_option_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_fingerprint ON votes(voter_fingerprint);
CREATE INDEX idx_votes_voted_at ON votes(voted_at DESC);
CREATE INDEX idx_votes_ip_address ON votes(ip_address);
```

**Prevención de Fraude:**
- `voter_fingerprint` - Hash SHA256 de IP + User Agent + Session ID
- `ip_address` - Para detectar múltiples votos desde misma IP
- Constraint de unique vote per session

---

### **10. news (Noticias y Artículos)**

Sistema de gestión de noticias del equipo.

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contenido
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  
  -- Categorización
  category VARCHAR(100),
  is_featured BOOLEAN DEFAULT false,
  is_breaking BOOLEAN DEFAULT false,
  
  -- Estado
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  
  -- Fechas
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Relaciones
  author_id UUID REFERENCES users(id),
  related_match_id UUID REFERENCES matches(id),
  related_player_id UUID REFERENCES players(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  CONSTRAINT valid_category CHECK (category IN (
    'Partido', 'Jugadora', 'Equipo', 'Logro', 'Comunidad', 'Anuncio', 'Entrevista'
  ))
);

-- Indices
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_is_featured ON news(is_featured);
CREATE INDEX idx_news_is_breaking ON news(is_breaking);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_author_id ON news(author_id);
CREATE INDEX idx_news_views_count ON news(views_count DESC);

-- Índice de texto completo para búsqueda
CREATE INDEX idx_news_search ON news USING gin(
  to_tsvector('spanish', title || ' ' || excerpt || ' ' || content)
);

-- Trigger para updated_at
CREATE TRIGGER update_news_updated_at 
  BEFORE UPDATE ON news 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auto-generar slug
CREATE OR REPLACE FUNCTION generate_news_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := regexp_replace(
      lower(unaccent(NEW.title)), 
      '[^a-z0-9]+', 
      '-', 
      'g'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_news_slug 
  BEFORE INSERT OR UPDATE ON news 
  FOR EACH ROW 
  EXECUTE FUNCTION generate_news_slug();
```

**Categorías:**
- Partido, Jugadora, Equipo, Logro, Comunidad, Anuncio, Entrevista

---

### **11. standings (Tabla de Posiciones)**

Posiciones del equipo en la liga/torneo.

```sql
CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Temporada
  season VARCHAR(20) NOT NULL DEFAULT '2024-2025',
  competition VARCHAR(100) NOT NULL,
  
  -- Equipo
  team_name VARCHAR(255) NOT NULL,
  team_logo_url TEXT,
  is_own_team BOOLEAN DEFAULT false,
  
  -- Posición
  position INTEGER NOT NULL,
  
  -- Estadísticas
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  matches_lost INTEGER DEFAULT 0,
  matches_drawn INTEGER DEFAULT 0,
  
  sets_won INTEGER DEFAULT 0,
  sets_lost INTEGER DEFAULT 0,
  
  points_for INTEGER DEFAULT 0,
  points_against INTEGER DEFAULT 0,
  
  -- Puntos de liga
  league_points INTEGER DEFAULT 0,
  
  -- Racha
  form VARCHAR(10), -- Últimos 5: WWLDL (W=Win, L=Loss, D=Draw)
  
  -- Metadata
  last_match_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_team_season_competition UNIQUE(team_name, season, competition),
  CONSTRAINT valid_position CHECK (position > 0)
);

-- Indices
CREATE INDEX idx_standings_season ON standings(season);
CREATE INDEX idx_standings_competition ON standings(competition);
CREATE INDEX idx_standings_position ON standings(position);
CREATE INDEX idx_standings_is_own_team ON standings(is_own_team);
CREATE INDEX idx_standings_league_points ON standings(league_points DESC);

-- Trigger para updated_at
CREATE TRIGGER update_standings_updated_at 
  BEFORE UPDATE ON standings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

### **12. media (Galería Multimedia)**

Biblioteca de fotos, videos y recursos multimedia.

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Archivo
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER, -- en bytes
  mime_type VARCHAR(100),
  
  -- Metadata del archivo
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- para videos, en segundos
  
  -- Organización
  title VARCHAR(500),
  description TEXT,
  alt_text TEXT, -- para accesibilidad
  category VARCHAR(100),
  
  -- Relaciones
  related_match_id UUID REFERENCES matches(id),
  related_player_id UUID REFERENCES players(id),
  related_news_id UUID REFERENCES news(id),
  
  -- Estado
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  
  -- Metadata
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_file_type CHECK (file_type IN ('image', 'video', 'document')),
  CONSTRAINT valid_category CHECK (category IN (
    'Partido', 'Entrenamiento', 'Evento', 'Jugadora', 'Promocional', 'Otro'
  ))
);

-- Indices
CREATE INDEX idx_media_file_type ON media(file_type);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_is_featured ON media(is_featured);
CREATE INDEX idx_media_is_public ON media(is_public);
CREATE INDEX idx_media_uploaded_at ON media(uploaded_at DESC);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_related_match ON media(related_match_id);
CREATE INDEX idx_media_related_player ON media(related_player_id);
CREATE INDEX idx_media_related_news ON media(related_news_id);

-- Índice de texto completo para búsqueda
CREATE INDEX idx_media_search ON media USING gin(
  to_tsvector('spanish', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(alt_text, ''))
);
```

---

### **13. sponsors (Patrocinadores)**

Gestión de patrocinadores y partners.

```sql
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  
  -- Clasificación
  tier VARCHAR(50) NOT NULL DEFAULT 'Bronze',
  category VARCHAR(100),
  
  -- Visibilidad
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  show_in_app BOOLEAN DEFAULT true,
  
  -- Fechas de contrato
  contract_start_date DATE,
  contract_end_date DATE,
  
  -- Contacto
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_tier CHECK (tier IN ('Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'))
);

-- Indices
CREATE INDEX idx_sponsors_tier ON sponsors(tier);
CREATE INDEX idx_sponsors_is_active ON sponsors(is_active);
CREATE INDEX idx_sponsors_display_order ON sponsors(display_order);
CREATE INDEX idx_sponsors_show_in_app ON sponsors(show_in_app);

-- Trigger para updated_at
CREATE TRIGGER update_sponsors_updated_at 
  BEFORE UPDATE ON sponsors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

### **14. activity_logs (Historial de Actividad)**

Registro automático de todas las acciones de administradores.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuario
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255), -- Por si el usuario se elimina
  
  -- Acción
  action VARCHAR(50) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  
  -- Metadata de la acción
  metadata JSONB,
  
  -- Tabla/Recurso afectado
  table_name VARCHAR(100),
  record_id UUID,
  
  -- Información de la sesión
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action CHECK (action IN (
    'create', 'update', 'delete', 'publish', 'upload', 
    'activate', 'deactivate', 'login', 'logout'
  )),
  CONSTRAINT valid_action_type CHECK (action_type IN (
    'match', 'player', 'voting', 'news', 'standings', 
    'media', 'settings', 'auth'
  ))
);

-- Indices
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_table_name ON activity_logs(table_name);
CREATE INDEX idx_activity_logs_record_id ON activity_logs(record_id);

-- Índice en metadata JSONB
CREATE INDEX idx_activity_logs_metadata ON activity_logs USING gin(metadata);

-- Particionamiento por fecha (opcional, para grandes volúmenes)
-- CREATE TABLE activity_logs_2024 PARTITION OF activity_logs
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**Auto-logging con Triggers:**

```sql
-- Función genérica para logging
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_action VARCHAR(50);
  v_description TEXT;
BEGIN
  -- Obtener el user_id del contexto actual
  v_user_id := current_setting('app.current_user_id', TRUE)::UUID;
  
  -- Determinar la acción
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_description := 'Creó ' || TG_TABLE_NAME || ': ' || COALESCE(NEW.name, NEW.title, NEW.id::TEXT);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_description := 'Actualizó ' || TG_TABLE_NAME || ': ' || COALESCE(NEW.name, NEW.title, NEW.id::TEXT);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_description := 'Eliminó ' || TG_TABLE_NAME || ': ' || COALESCE(OLD.name, OLD.title, OLD.id::TEXT);
  END IF;
  
  -- Insertar log
  INSERT INTO activity_logs (
    user_id,
    action,
    action_type,
    description,
    table_name,
    record_id
  ) VALUES (
    v_user_id,
    v_action,
    TG_TABLE_NAME,
    v_description,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas principales
CREATE TRIGGER log_players_changes 
  AFTER INSERT OR UPDATE OR DELETE ON players 
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER log_matches_changes 
  AFTER INSERT OR UPDATE OR DELETE ON matches 
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER log_news_changes 
  AFTER INSERT OR UPDATE OR DELETE ON news 
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();
```

---

### **15. notification_preferences (Preferencias de Notificación)**

Preferencias individuales de notificaciones por usuario.

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email
  email_enabled BOOLEAN DEFAULT true,
  email_matches BOOLEAN DEFAULT true,
  email_voting BOOLEAN DEFAULT true,
  email_news BOOLEAN DEFAULT true,
  email_players BOOLEAN DEFAULT false,
  email_standings BOOLEAN DEFAULT false,
  
  -- Push (futuro)
  push_enabled BOOLEAN DEFAULT false,
  push_matches BOOLEAN DEFAULT false,
  push_voting BOOLEAN DEFAULT false,
  push_news BOOLEAN DEFAULT false,
  push_players BOOLEAN DEFAULT false,
  push_standings BOOLEAN DEFAULT false,
  
  -- In-App
  inapp_enabled BOOLEAN DEFAULT true,
  inapp_matches BOOLEAN DEFAULT true,
  inapp_voting BOOLEAN DEFAULT true,
  inapp_news BOOLEAN DEFAULT true,
  inapp_players BOOLEAN DEFAULT true,
  inapp_standings BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);

-- Trigger para updated_at
CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

### **16. notifications (Cola de Notificaciones)**

Notificaciones enviadas y pendientes.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Destinatario
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Contenido
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  
  -- Acción
  action_url TEXT,
  action_label VARCHAR(100),
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Canal
  channel VARCHAR(50) NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_notification_type CHECK (notification_type IN (
    'match', 'voting', 'news', 'player', 'standings', 'system'
  )),
  CONSTRAINT valid_channel CHECK (channel IN ('email', 'push', 'inapp'))
);

-- Indices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_channel ON notifications(channel);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_sent ON notifications(sent);
```

---

## 🔐 Políticas de Seguridad (RLS)

### **Habilitación de Row Level Security**

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### **Políticas de Lectura Pública (Fan App)**

```sql
-- Cualquiera puede leer jugadoras activas
CREATE POLICY "Public players are viewable by everyone"
  ON players FOR SELECT
  USING (is_active = true);

-- Cualquiera puede leer partidos
CREATE POLICY "Public matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

-- Cualquiera puede leer stats de jugadoras
CREATE POLICY "Public player stats are viewable by everyone"
  ON player_stats FOR SELECT
  USING (true);

-- Cualquiera puede leer eventos de partidos
CREATE POLICY "Public match events are viewable by everyone"
  ON match_events FOR SELECT
  USING (true);

-- Cualquiera puede leer votaciones activas
CREATE POLICY "Public voting sessions are viewable by everyone"
  ON voting_sessions FOR SELECT
  USING (status = 'active' OR status = 'finished');

-- Cualquiera puede leer opciones de voto
CREATE POLICY "Public vote options are viewable by everyone"
  ON vote_options FOR SELECT
  USING (true);

-- Cualquiera puede leer noticias publicadas
CREATE POLICY "Published news are viewable by everyone"
  ON news FOR SELECT
  USING (status = 'published');

-- Cualquiera puede leer tabla de posiciones
CREATE POLICY "Public standings are viewable by everyone"
  ON standings FOR SELECT
  USING (true);

-- Cualquiera puede leer media pública
CREATE POLICY "Public media are viewable by everyone"
  ON media FOR SELECT
  USING (is_public = true);

-- Cualquiera puede leer patrocinadores activos
CREATE POLICY "Active sponsors are viewable by everyone"
  ON sponsors FOR SELECT
  USING (is_active = true AND show_in_app = true);
```

### **Políticas de Escritura (Solo Administradores)**

```sql
-- Función helper para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('Super Admin', 'Admin', 'Editor')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Solo admins pueden modificar jugadoras
CREATE POLICY "Admins can modify players"
  ON players FOR ALL
  USING (is_admin());

-- Solo admins pueden modificar partidos
CREATE POLICY "Admins can modify matches"
  ON matches FOR ALL
  USING (is_admin());

-- Solo admins pueden crear/modificar noticias
CREATE POLICY "Admins can modify news"
  ON news FOR ALL
  USING (is_admin());

-- Solo admins pueden modificar standings
CREATE POLICY "Admins can modify standings"
  ON standings FOR ALL
  USING (is_admin());

-- Solo admins pueden subir media
CREATE POLICY "Admins can upload media"
  ON media FOR INSERT
  WITH CHECK (is_admin());

-- Solo admins pueden ver logs de actividad
CREATE POLICY "Admins can view activity logs"
  ON activity_logs FOR SELECT
  USING (is_admin());
```

### **Políticas Especiales para Votaciones**

```sql
-- Cualquiera puede votar (INSERT)
CREATE POLICY "Anyone can vote"
  ON votes FOR INSERT
  WITH CHECK (true);

-- Solo el dueño puede ver sus propios votos
CREATE POLICY "Users can view their own votes"
  ON votes FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

-- Admins pueden ver todos los votos
CREATE POLICY "Admins can view all votes"
  ON votes FOR SELECT
  USING (is_admin());

-- Actualizar contadores automáticamente con triggers
CREATE OR REPLACE FUNCTION update_vote_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contador de opción
  UPDATE vote_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.vote_option_id;
  
  -- Actualizar total de votación
  UPDATE voting_sessions
  SET total_votes = total_votes + 1
  WHERE id = NEW.voting_session_id;
  
  -- Recalcular porcentajes
  UPDATE vote_options vo
  SET vote_percentage = (
    vo.vote_count::DECIMAL / NULLIF(vs.total_votes, 0) * 100
  )
  FROM voting_sessions vs
  WHERE vo.voting_session_id = vs.id
  AND vs.id = NEW.voting_session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_vote_counters
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counters();
```

---

## ⚡ Índices para Rendimiento

### **Índices Compuestos Estratégicos**

```sql
-- Búsqueda de próximos partidos
CREATE INDEX idx_matches_upcoming_composite ON matches(status, match_date)
  WHERE status = 'scheduled';

-- Búsqueda de noticias publicadas recientes
CREATE INDEX idx_news_published_composite ON news(status, published_at DESC)
  WHERE status = 'published';

-- Ranking de jugadoras activas
CREATE INDEX idx_players_active_ranking ON players(is_active, display_order)
  WHERE is_active = true;

-- Votaciones activas
CREATE INDEX idx_voting_active_composite ON voting_sessions(status, is_active, starts_at)
  WHERE status = 'active';

-- Media pública reciente
CREATE INDEX idx_media_public_recent ON media(is_public, uploaded_at DESC)
  WHERE is_public = true;
```

### **Índices de Texto Completo**

```sql
-- Búsqueda en noticias (español)
CREATE INDEX idx_news_fulltext ON news 
  USING gin(to_tsvector('spanish', title || ' ' || excerpt || ' ' || content));

-- Búsqueda en jugadoras
CREATE INDEX idx_players_fulltext ON players 
  USING gin(to_tsvector('spanish', name || ' ' || COALESCE(position, '') || ' ' || COALESCE(hometown, '')));

-- Búsqueda en media
CREATE INDEX idx_media_fulltext ON media 
  USING gin(to_tsvector('spanish', COALESCE(title, '') || ' ' || COALESCE(description, '')));
```

---

## 📝 Queries Comunes

### **1. Obtener Partido en Vivo con Detalles**

```sql
SELECT 
  m.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'number', p.number,
    'position', p.position,
    'photo_url', p.photo_url,
    'stats', jsonb_build_object(
      'points', mp.points,
      'attacks', mp.attacks,
      'blocks', mp.blocks
    )
  )) as players,
  (
    SELECT json_agg(me ORDER BY me.timestamp DESC)
    FROM match_events me
    WHERE me.match_id = m.id
    LIMIT 50
  ) as recent_events
FROM matches m
LEFT JOIN match_players mp ON mp.match_id = m.id
LEFT JOIN players p ON p.id = mp.player_id
WHERE m.is_live = true
GROUP BY m.id;
```

### **2. Obtener Votación Activa con Resultados**

```sql
SELECT 
  vs.*,
  json_agg(
    jsonb_build_object(
      'id', vo.id,
      'player', jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'number', p.number,
        'photo_url', p.photo_url
      ),
      'votes', vo.vote_count,
      'percentage', vo.vote_percentage
    ) ORDER BY vo.vote_count DESC
  ) as options
FROM voting_sessions vs
LEFT JOIN vote_options vo ON vo.voting_session_id = vs.id
LEFT JOIN players p ON p.id = vo.player_id
WHERE vs.is_active = true
GROUP BY vs.id;
```

### **3. Obtener Noticias Recientes con Autor**

```sql
SELECT 
  n.*,
  jsonb_build_object(
    'id', u.id,
    'name', u.name,
    'avatar_url', u.avatar_url
  ) as author,
  CASE 
    WHEN n.related_match_id IS NOT NULL THEN
      (SELECT jsonb_build_object('id', id, 'opponent', opponent) 
       FROM matches WHERE id = n.related_match_id)
    ELSE NULL
  END as related_match,
  CASE 
    WHEN n.related_player_id IS NOT NULL THEN
      (SELECT jsonb_build_object('id', id, 'name', name, 'photo_url', photo_url) 
       FROM players WHERE id = n.related_player_id)
    ELSE NULL
  END as related_player
FROM news n
LEFT JOIN users u ON u.id = n.author_id
WHERE n.status = 'published'
ORDER BY n.published_at DESC
LIMIT 20;
```

### **4. Obtener Top Jugadoras por Stats**

```sql
SELECT 
  p.*,
  ps.*,
  ROW_NUMBER() OVER (ORDER BY ps.points_total DESC) as rank_points,
  ROW_NUMBER() OVER (ORDER BY ps.attacks_successful DESC) as rank_attacks,
  ROW_NUMBER() OVER (ORDER BY ps.blocks_total DESC) as rank_blocks
FROM players p
INNER JOIN player_stats ps ON ps.player_id = p.id
WHERE p.is_active = true 
AND ps.season = '2024-2025'
ORDER BY ps.points_total DESC;
```

### **5. Obtener Historial de Actividad de Usuario**

```sql
SELECT 
  al.*,
  u.name as user_name,
  u.avatar_url as user_avatar
FROM activity_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id = $1
ORDER BY al.created_at DESC
LIMIT 100;
```

---

## 🔄 Migración desde localStorage

### **Script de Migración (Ejecutar en Frontend)**

```typescript
// /utils/migrateToSupabase.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function migrateLocalStorageToSupabase() {
  try {
    // 1. Migrar Jugadoras
    const playersData = localStorage.getItem('cangrejeras_players');
    if (playersData) {
      const players = JSON.parse(playersData);
      const { error } = await supabase
        .from('players')
        .upsert(players, { onConflict: 'id' });
      
      if (error) throw error;
      console.log('✅ Jugadoras migradas');
    }

    // 2. Migrar Partidos
    const matchesData = localStorage.getItem('cangrejeras_matches');
    if (matchesData) {
      const matches = JSON.parse(matchesData);
      const { error } = await supabase
        .from('matches')
        .upsert(matches, { onConflict: 'id' });
      
      if (error) throw error;
      console.log('✅ Partidos migrados');
    }

    // 3. Migrar Noticias
    const newsData = localStorage.getItem('cangrejeras_news');
    if (newsData) {
      const news = JSON.parse(newsData);
      const { error } = await supabase
        .from('news')
        .upsert(news, { onConflict: 'id' });
      
      if (error) throw error;
      console.log('✅ Noticias migradas');
    }

    // 4. Migrar Votaciones
    const votingData = localStorage.getItem('cangrejeras_voting_sessions');
    if (votingData) {
      const votingSessions = JSON.parse(votingData);
      const { error } = await supabase
        .from('voting_sessions')
        .upsert(votingSessions, { onConflict: 'id' });
      
      if (error) throw error;
      console.log('✅ Votaciones migradas');
    }

    // 5. Migrar Standings
    const standingsData = localStorage.getItem('cangrejeras_standings');
    if (standingsData) {
      const standings = JSON.parse(standingsData);
      const { error } = await supabase
        .from('standings')
        .upsert(standings, { onConflict: 'id' });
      
      if (error) throw error;
      console.log('✅ Tabla de posiciones migrada');
    }

    // 6. Limpiar localStorage (opcional)
    // localStorage.clear();
    
    console.log('🎉 Migración completada exitosamente!');
    return { success: true };

  } catch (error) {
    console.error('❌ Error en migración:', error);
    return { success: false, error };
  }
}
```

---

## 📦 Storage (Archivos)

### **Buckets de Storage**

```sql
-- Crear buckets en Supabase
INSERT INTO storage.buckets (id, name, public) VALUES
  ('players', 'players', true),
  ('media', 'media', true),
  ('news', 'news', true);

-- Políticas de acceso
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id IN ('players', 'media', 'news') );

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('players', 'media', 'news') 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('players', 'media', 'news') 
    AND is_admin()
  );
```

### **Estructura de Carpetas**

```
storage/
├── players/
│   ├── {player_id}/
│   │   ├── profile.jpg
│   │   └── action-shots/
│   │       ├── shot1.jpg
│   │       └── shot2.jpg
│
├── media/
│   ├── matches/
│   │   └── {match_id}/
│   │       ├── photo1.jpg
│   │       └── video1.mp4
│   ├── training/
│   └── events/
│
└── news/
    └── {news_id}/
        ├── cover.jpg
        └── gallery/
            ├── img1.jpg
            └── img2.jpg
```

---

## 🛠️ Funciones Útiles

### **Función: updated_at automático**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **Función: Auto-incrementar vote_count**

Ya mostrada en la sección de Votaciones.

### **Función: Calcular attack_percentage**

```sql
CREATE OR REPLACE FUNCTION calculate_attack_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.attacks_total > 0 THEN
    NEW.attack_percentage := (
      (NEW.attacks_successful - NEW.attacks_error)::DECIMAL / 
      NEW.attacks_total * 100
    );
  ELSE
    NEW.attack_percentage := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_attack_percentage
  BEFORE INSERT OR UPDATE ON player_stats
  FOR EACH ROW
  EXECUTE FUNCTION calculate_attack_percentage();
```

---

## 📊 Resumen de Tablas

| # | Tabla | Propósito | Registros Estimados |
|---|-------|-----------|---------------------|
| 1 | users | Administradores | 5-10 |
| 2 | players | Jugadoras roster | 15-20 |
| 3 | player_stats | Stats por temporada | 15-20/año |
| 4 | matches | Partidos | 30-50/año |
| 5 | match_players | Participación en partidos | 300-1000/año |
| 6 | match_events | Eventos en vivo | 1000-5000/partido |
| 7 | voting_sessions | Sesiones de votación | 30-50/año |
| 8 | vote_options | Opciones de voto | 150-250/año |
| 9 | votes | Votos emitidos | 5000-50000/año |
| 10 | news | Noticias | 100-200/año |
| 11 | standings | Posiciones liga | 10-15/temporada |
| 12 | media | Multimedia | 500-2000/año |
| 13 | sponsors | Patrocinadores | 10-20 |
| 14 | activity_logs | Logs admin | 1000-5000/mes |
| 15 | notification_preferences | Preferencias | 5-10 |
| 16 | notifications | Notificaciones | 100-500/mes |

**Total:** ~16 tablas  
**Volumen Anual Estimado:** ~10,000 - 60,000 registros

---

## 🚀 Próximos Pasos

1. **Crear proyecto en Supabase**
2. **Ejecutar scripts SQL en orden:**
   - Funciones helper primero
   - Tablas principales
   - Índices
   - Triggers
   - Políticas RLS
3. **Configurar Storage buckets**
4. **Migrar datos demo desde localStorage**
5. **Actualizar frontend para usar Supabase SDK**
6. **Configurar Realtime para votaciones en vivo**
7. **Implementar Edge Functions para lógica compleja**

---

🦀 **¡Base de datos lista para producción!** 🏐

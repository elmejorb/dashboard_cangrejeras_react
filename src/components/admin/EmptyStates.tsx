import { Plus, Users, Trophy, Vote, Newspaper, Image, Settings, FileText, Search } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  darkMode: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyPlayers({ darkMode, onAction, actionLabel = "Agregar Primera Jugadora" }: EmptyStateProps) {
  return (
    <EmptyStateWrapper darkMode={darkMode}>
      <EmptyStateIcon darkMode={darkMode} icon={Users} color="#C8A963" />
      <EmptyStateTitle darkMode={darkMode}>No hay jugadoras registradas</EmptyStateTitle>
      <EmptyStateDescription darkMode={darkMode}>
        Comienza agregando las jugadoras del equipo. Podrás gestionar sus perfiles, fotos y estadísticas.
      </EmptyStateDescription>
      {onAction && (
        <EmptyStateButton darkMode={darkMode} onClick={onAction} icon={Plus}>
          {actionLabel}
        </EmptyStateButton>
      )}
    </EmptyStateWrapper>
  );
}

export function EmptyMatches({ darkMode, onAction, actionLabel = "Crear Primer Partido" }: EmptyStateProps) {
  return (
    <EmptyStateWrapper darkMode={darkMode}>
      <EmptyStateIcon darkMode={darkMode} icon={Trophy} color="#E01E37" />
      <EmptyStateTitle darkMode={darkMode}>No hay partidos programados</EmptyStateTitle>
      <EmptyStateDescription darkMode={darkMode}>
        Crea tu primer partido para que los fans puedan ver los próximos juegos y seguir en vivo.
      </EmptyStateDescription>
      {onAction && (
        <EmptyStateButton darkMode={darkMode} onClick={onAction} icon={Plus}>
          {actionLabel}
        </EmptyStateButton>
      )}
    </EmptyStateWrapper>
  );
}

export function EmptyVoting({ darkMode, onAction, actionLabel = "Crear Primera Votación" }: EmptyStateProps) {
  return (
    <EmptyStateWrapper darkMode={darkMode}>
      <EmptyStateIcon darkMode={darkMode} icon={Vote} color="#8B5CF6" />
      <EmptyStateTitle darkMode={darkMode}>No hay votaciones activas</EmptyStateTitle>
      <EmptyStateDescription darkMode={darkMode}>
        Crea votaciones en tiempo real para que los fans elijan la mejor jugadora del partido.
      </EmptyStateDescription>
      {onAction && (
        <EmptyStateButton darkMode={darkMode} onClick={onAction} icon={Plus}>
          {actionLabel}
        </EmptyStateButton>
      )}
    </EmptyStateWrapper>
  );
}

export function EmptyNews({ darkMode, onAction, actionLabel = "Publicar Primera Noticia" }: EmptyStateProps) {
  return (
    <EmptyStateWrapper darkMode={darkMode}>
      <EmptyStateIcon darkMode={darkMode} icon={Newspaper} color="#10B981" />
      <EmptyStateTitle darkMode={darkMode}>No hay noticias publicadas</EmptyStateTitle>
      <EmptyStateDescription darkMode={darkMode}>
        Mantén a los fans informados con las últimas noticias del equipo.
      </EmptyStateDescription>
      {onAction && (
        <EmptyStateButton darkMode={darkMode} onClick={onAction} icon={Plus}>
          {actionLabel}
        </EmptyStateButton>
      )}
    </EmptyStateWrapper>
  );
}

export function EmptyMedia({ darkMode, onAction, actionLabel = "Subir Primera Foto" }: EmptyStateProps) {
  return (
    <EmptyStateWrapper darkMode={darkMode}>
      <EmptyStateIcon darkMode={darkMode} icon={Image} color="#EC4899" />
      <EmptyStateTitle darkMode={darkMode}>No hay fotos en la galería</EmptyStateTitle>
      <EmptyStateDescription darkMode={darkMode}>
        Comparte momentos especiales del equipo subiendo fotos a la galería.
      </EmptyStateDescription>
      {onAction && (
        <EmptyStateButton darkMode={darkMode} onClick={onAction} icon={Plus}>
          {actionLabel}
        </EmptyStateButton>
      )}
    </EmptyStateWrapper>
  );
}

export function EmptyStandings({ darkMode, onAction, actionLabel = "Configurar Tabla" }: EmptyStateProps) {
  return (
    <EmptyStateWrapper darkMode={darkMode}>
      <EmptyStateIcon darkMode={darkMode} icon={FileText} color="#F97316" />
      <EmptyStateTitle darkMode={darkMode}>Tabla de posiciones vacía</EmptyStateTitle>
      <EmptyStateDescription darkMode={darkMode}>
        Configura la tabla de posiciones para mostrar la posición del equipo en la liga.
      </EmptyStateDescription>
      {onAction && (
        <EmptyStateButton darkMode={darkMode} onClick={onAction} icon={Plus}>
          {actionLabel}
        </EmptyStateButton>
      )}
    </EmptyStateWrapper>
  );
}

export function EmptySearch({ darkMode, searchTerm }: EmptyStateProps & { searchTerm?: string }) {
  return (
    <EmptyStateWrapper darkMode={darkMode}>
      <EmptyStateIcon darkMode={darkMode} icon={Search} color="#94A3B8" />
      <EmptyStateTitle darkMode={darkMode}>No se encontraron resultados</EmptyStateTitle>
      <EmptyStateDescription darkMode={darkMode}>
        {searchTerm 
          ? `No encontramos resultados para "${searchTerm}". Intenta con otros términos.`
          : "No encontramos resultados. Intenta con otros términos de búsqueda."}
      </EmptyStateDescription>
    </EmptyStateWrapper>
  );
}

// Reusable components
function EmptyStateWrapper({ darkMode, children }: { darkMode: boolean; children: React.ReactNode }) {
  return (
    <div 
      className="glass-card rounded-2xl p-12 border text-center animate-scale-in"
      style={{
        background: darkMode ? 'var(--glass-bg-dark)' : 'var(--glass-bg-light)',
        borderColor: darkMode ? 'var(--glass-border-dark)' : 'var(--glass-border-light)',
        boxShadow: darkMode ? 'var(--shadow-lg-dark)' : 'var(--shadow-lg-light)'
      }}
    >
      {children}
    </div>
  );
}

function EmptyStateIcon({ 
  darkMode, 
  icon: Icon, 
  color 
}: { 
  darkMode: boolean; 
  icon: React.ElementType; 
  color: string;
}) {
  return (
    <div className="relative mb-6 inline-block">
      {/* Gradient background */}
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow"
        style={{
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `2px solid ${color}30`
        }}
      >
        <Icon size={36} style={{ color }} />
      </div>
      
      {/* Decorative ring */}
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{
          border: `2px solid ${color}`,
          animationDuration: '2s'
        }}
      ></div>
    </div>
  );
}

function EmptyStateTitle({ darkMode, children }: { darkMode: boolean; children: React.ReactNode }) {
  return (
    <h3 className={`text-xl mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {children}
    </h3>
  );
}

function EmptyStateDescription({ darkMode, children }: { darkMode: boolean; children: React.ReactNode }) {
  return (
    <p className={`text-sm mb-6 max-w-md mx-auto ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
      {children}
    </p>
  );
}

function EmptyStateButton({ 
  darkMode, 
  onClick, 
  icon: Icon, 
  children 
}: { 
  darkMode: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      className="group relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #C8A963 0%, #b89850 100%)',
        color: '#0C2340',
        boxShadow: '0 4px 16px rgba(200, 169, 99, 0.3)',
        border: 'none',
        transition: 'all var(--transition-base)'
      }}
    >
      <Icon size={18} className="mr-2 transition-transform duration-300 group-hover:rotate-90" />
      {children}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Button>
  );
}

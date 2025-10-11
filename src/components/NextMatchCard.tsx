import { Calendar, MapPin, Clock, Ticket, Home, Plane } from "lucide-react";
import { useMatches } from "../contexts/MatchContext";

interface NextMatchCardProps {
  darkMode: boolean;
}

export function NextMatchCard({ darkMode }: NextMatchCardProps) {
  const { nextMatch } = useMatches();

  // If no next match, show placeholder
  if (!nextMatch) {
    return (
      <div
        className="glass-card relative overflow-hidden rounded-2xl p-5 border"
        style={{
          background: darkMode 
            ? 'var(--glass-bg-dark)' 
            : 'var(--glass-bg-light)',
          borderColor: darkMode 
            ? 'var(--glass-border-dark)' 
            : 'var(--glass-border-light)',
          boxShadow: darkMode
            ? 'var(--shadow-lg-dark)'
            : 'var(--shadow-lg-light)'
        }}
      >
        <h3 className={`mb-4 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
          Próximo Partido
        </h3>
        <div className={`text-center py-8 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay partidos programados</p>
        </div>
      </div>
    );
  }

  const opponent = nextMatch.isHomeTeam ? nextMatch.awayTeam : nextMatch.homeTeam;
  
  // Format date
  const matchDate = new Date(nextMatch.date);
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const formattedDate = `${dayNames[matchDate.getDay()]}, ${matchDate.getDate()} de ${monthNames[matchDate.getMonth()]}`;

  // Format time
  const [hours, minutes] = nextMatch.time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const formattedTime = `${displayHour}:${minutes} ${ampm}`;

  return (
    <div
      className="glass-card card-interactive relative overflow-hidden rounded-2xl p-5 border"
      style={{
        background: darkMode 
          ? 'var(--glass-bg-dark)' 
          : 'var(--glass-bg-light)',
        borderColor: darkMode 
          ? 'var(--glass-border-dark)' 
          : 'var(--glass-border-light)',
        boxShadow: darkMode
          ? 'var(--shadow-lg-dark)'
          : 'var(--shadow-lg-light)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
          Próximo Partido
        </h3>
        {nextMatch.isHomeTeam !== undefined && (
          <div className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1.5 ${
            nextMatch.isHomeTeam 
              ? 'bg-[#C8A963]/20 text-[#C8A963] border-[#C8A963]/30' 
              : 'bg-[#0C2340]/20 text-[#0C2340] dark:text-[#C8A963] border-[#0C2340]/30 dark:border-[#C8A963]/30'
          }`}>
            {nextMatch.isHomeTeam ? (
              <>
                <Home size={12} />
                <span>Local</span>
              </>
            ) : (
              <>
                <Plane size={12} />
                <span>Visitante</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col items-center gap-2">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: 'rgba(12, 35, 64, 0.1)',
              borderColor: '#0C2340'
            }}
          >
            <span className="text-[#0C2340]">CAN</span>
          </div>
          <span className={`text-xs text-center ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
            Cangrejeras
          </span>
        </div>

        <div className={`text-2xl ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
          VS
        </div>

        <div className="flex flex-col items-center gap-2">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center border-2"
            style={{
              backgroundColor: 'rgba(232, 76, 76, 0.1)',
              borderColor: '#E84C4C'
            }}
          >
            <span className="text-[#E84C4C]">
              {opponent.substring(0, 3).toUpperCase()}
            </span>
          </div>
          <span className={`text-xs text-center ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
            {opponent}
          </span>
        </div>
      </div>

      {/* Match details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <Calendar className={`w-4 h-4 ${darkMode ? 'text-[#C8A963]' : 'text-[#0C2340]'}`} />
          <span className={`text-sm ${darkMode ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>
            {formattedDate}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className={`w-4 h-4 ${darkMode ? 'text-[#C8A963]' : 'text-[#0C2340]'}`} />
          <span className={`text-sm ${darkMode ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>
            {formattedTime}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className={`w-4 h-4 ${darkMode ? 'text-[#C8A963]' : 'text-[#0C2340]'}`} />
          <span className={`text-sm ${darkMode ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>
            {nextMatch.venue}
          </span>
        </div>
      </div>

      {nextMatch.description && (
        <p className={`text-xs mb-4 ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
          {nextMatch.description}
        </p>
      )}

      {/* CTA */}
      {nextMatch.ticketUrl ? (
        <a
          href={nextMatch.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button w-full text-white py-3 rounded-xl flex items-center justify-center gap-2 group"
          style={{
            background: 'linear-gradient(135deg, #0C2340 0%, #1e3a5f 100%)',
            boxShadow: '0 4px 16px rgba(12, 35, 64, 0.3)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Ticket size={18} className="transition-transform duration-300 group-hover:scale-110" />
          <span>Comprar Boletos</span>
        </a>
      ) : (
        <button 
          className="glass-button w-full text-white py-3 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #0C2340 0%, #1e3a5f 100%)',
            boxShadow: '0 4px 16px rgba(12, 35, 64, 0.3)',
            transition: 'all var(--transition-base)'
          }}
        >
          Ver detalles
        </button>
      )}

      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#0C2340]/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
}

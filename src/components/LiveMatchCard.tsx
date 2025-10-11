import { Play, MapPin, Home, Plane } from "lucide-react";
import { useMatches } from "../contexts/MatchContext";

interface LiveMatchCardProps {
  darkMode: boolean;
}

export function LiveMatchCard({ darkMode }: LiveMatchCardProps) {
  const { liveMatch } = useMatches();

  // If no live match, don't show the card
  if (!liveMatch) {
    return null;
  }

  const opponent = liveMatch.isHomeTeam ? liveMatch.awayTeam : liveMatch.homeTeam;
  const canScore = liveMatch.isHomeTeam ? liveMatch.homeScore : liveMatch.awayScore;
  const oppScore = liveMatch.isHomeTeam ? liveMatch.awayScore : liveMatch.homeScore;

  return (
    <div
      className="glass-card card-interactive relative overflow-hidden rounded-2xl p-5 border cursor-pointer group"
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
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E01E37] animate-pulse-glow shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></div>
          <span className="text-white text-xs">EN VIVO</span>
        </div>
        {liveMatch.isHomeTeam !== undefined && (
          <div className={`px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5 ${
            liveMatch.isHomeTeam 
              ? 'bg-[#C8A963]/20 text-[#C8A963] border-[#C8A963]/30' 
              : 'bg-[#0C2340]/20 text-[#0C2340] dark:text-[#C8A963] border-[#0C2340]/30 dark:border-[#C8A963]/30'
          }`}>
            {liveMatch.isHomeTeam ? (
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
        <span className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
          Votación Abierta
        </span>
      </div>

      {/* Match info */}
      <div className="mb-4">
        <h3 className={`text-xl mb-1 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
          vs {opponent}
        </h3>
        <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
          <MapPin size={14} />
          <span>{liveMatch.venue}</span>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 text-center">
          <div className="text-3xl text-[#0C2340] dark:text-[#C8A963]">
            {canScore ?? 0}
          </div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
            CAN
          </div>
        </div>
        <div className={`text-lg ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>-</div>
        <div className="flex-1 text-center">
          <div className="text-3xl text-[#E84C4C]">
            {oppScore ?? 0}
          </div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
            {opponent.substring(0, 3).toUpperCase()}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      {liveMatch.streamUrl && (
        <a 
          href={liveMatch.streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button w-full text-white py-3.5 rounded-xl flex items-center justify-center gap-2 group/btn"
          style={{
            background: 'linear-gradient(135deg, #E01E37 0%, #c01830 100%)',
            boxShadow: '0 4px 16px rgba(224, 30, 55, 0.3)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Play className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" fill="white" />
          <span>Ver el partido en vivo</span>
        </a>
      )}

      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E01E37]/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}

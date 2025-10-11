import { TrendingUp, Trophy, Lock } from "lucide-react";
import { useVoting } from "../contexts/VotingContext";
import { usePlayers } from "../contexts/PlayerContext";

interface LiveVotingSectionProps {
  darkMode: boolean;
}

export function LiveVotingSection({ darkMode }: LiveVotingSectionProps) {
  const { activePoll, vote } = useVoting();
  const { players } = usePlayers();

  const handleVote = (playerId: number) => {
    if (activePoll) {
      vote(activePoll.id, playerId);
    }
  };

  // If no active poll, show locked state
  if (!activePoll) {
    return (
      <div
        className="glass-card relative overflow-hidden rounded-2xl p-8 border text-center"
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
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
            <Lock className={`w-8 h-8 ${darkMode ? 'text-white/60' : 'text-gray-400'}`} />
          </div>
          <h3 className={`${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Votación Cerrada
          </h3>
          <p className={`text-sm ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
            No hay votaciones activas en este momento
          </p>
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#10B981]" />
          <h3 className={`${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            {activePoll.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-sm"></div>
          <span className="text-xs text-[#10B981]">En vivo</span>
        </div>
      </div>

      {activePoll.description && (
        <p className={`text-sm mb-4 ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
          {activePoll.description}
        </p>
      )}

      {/* Players */}
      <div className="space-y-4 mb-5">
        {activePoll.options
          .sort((a, b) => b.votes - a.votes)
          .map((option, index) => {
            // Join with PlayerContext to get current player data
            const player = players.find(p => p.id === option.playerId);
            
            // Skip if player not found (shouldn't happen, but safety check)
            if (!player) return null;
            
            return (
              <button
                key={option.playerId}
                onClick={() => handleVote(option.playerId)}
                disabled={activePoll.userHasVoted}
                className={`w-full text-left relative group ${
                  activePoll.userHasVoted 
                    ? 'cursor-not-allowed opacity-80' 
                    : 'cursor-pointer card-interactive'
                }`}
                style={{
                  transition: 'all var(--transition-base)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Trophy className="w-4 h-4 text-[#C8A963]" />
                    )}
                    <span className={`${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div 
                      className={`${
                        index === 0 ? 'text-[#C8A963]' : 
                        index === 1 ? 'text-[#E01E37]' : 
                        darkMode ? 'text-[#0C2340]' : 'text-[#0C2340]'
                      }`}
                    >
                      {option.percentage.toFixed(1)}%
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                      {option.votes.toLocaleString()} votos
                    </div>
                  </div>
                </div>

                <div className={`text-xs mb-2 ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                  {player.position} • #{player.jersey}
                </div>

              {/* Progress bar */}
              <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-[#1e293b]' : 'bg-gray-200'} shadow-inner`}>
                <div
                  className={`h-full rounded-full ${
                    index === 0 ? 'bg-gradient-to-r from-[#C8A963] to-[#d4b873]' : 
                    index === 1 ? 'bg-gradient-to-r from-[#E01E37] to-[#f02847]' : 
                    'bg-gradient-to-r from-[#0C2340] to-[#1e3a5f]'
                  }`}
                  style={{
                    width: `${option.percentage}%`,
                    transition: 'width 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: index === 0 
                      ? '0 2px 8px rgba(200, 169, 99, 0.4)' 
                      : index === 1 
                      ? '0 2px 8px rgba(224, 30, 55, 0.4)'
                      : '0 2px 8px rgba(12, 35, 64, 0.3)'
                  }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Vote status */}
      {activePoll.userHasVoted && (
        <div className="w-full bg-gradient-to-r from-[#10B981]/20 to-[#10B981]/10 text-[#10B981] py-3 rounded-xl text-center mb-3 border border-[#10B981]/30 animate-scale-in shadow-lg">
          <span className="inline-flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>Tu voto ha sido registrado</span>
          </span>
        </div>
      )}

      {/* Total votes */}
      <div className={`text-center text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
        Total: {activePoll.totalVotes.toLocaleString()} votos
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C8A963]/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}

import { Trophy } from "lucide-react";
import { useVoting } from "../contexts/VotingContext";
import { usePlayers } from "../contexts/PlayerContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PlayerData {
  id: string;
  name: string;
  photoUrl: string;
  position: string;
  jerseyNumber: number;
}

interface LeaderData {
  player: PlayerData;
  votes: number;
  percentage: number;
}

interface VoteLeaderboardProps {
  darkMode?: boolean;
  compact?: boolean;
  demoData?: LeaderData[]; // Optional demo data for preview
  demoTotalVotes?: number;
}

export function VoteLeaderboard({ darkMode = false, compact = false, demoData, demoTotalVotes }: VoteLeaderboardProps) {
  const { activePoll } = useVoting();
  const { players } = usePlayers();

  // Get top 3 players from active poll
  const getTop3 = () => {
    // Use demo data if provided
    if (demoData) {
      return demoData;
    }
    
    if (!activePoll) return [];
    
    const sortedOptions = [...activePoll.options]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3);
    
    return sortedOptions.map(option => {
      const player = players.find(p => p.id === option.playerId);
      return {
        player,
        votes: option.votes,
        percentage: option.percentage,
      };
    });
  };

  const top3 = getTop3();
  const totalVotes = demoTotalVotes || (activePoll?.totalVotes || 0);

  // If no active poll or no votes yet (and no demo data)
  if (!demoData && (!activePoll || top3.length === 0)) {
    return (
      <div 
        className="glass-card relative overflow-hidden rounded-2xl border"
        style={{
          background: darkMode ? 'var(--glass-bg-dark)' : 'var(--glass-bg-light)',
          borderColor: darkMode ? 'var(--glass-border-dark)' : 'var(--glass-border-light)',
          boxShadow: darkMode ? 'var(--shadow-lg-dark)' : 'var(--shadow-lg-light)',
          maxWidth: compact ? '380px' : '100%',
          margin: '0 auto',
        }}
      >
        <div className="p-8 text-center">
          <div className={`flex flex-col items-center gap-3`}>
            <Trophy className={`w-8 h-8 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
            <h3 className={`${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Votación Sin Iniciar
            </h3>
            <p className={`text-sm ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
              Los líderes aparecerán cuando comience la votación
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Color scheme for each position
  const positionColors = [
    {
      gradient: 'linear-gradient(135deg, #C8A963 0%, #D4B873 100%)', // Champion Gold
      textColor: '#C8A963',
      barColor: '#C8A963',
      shadow: '0 4px 20px rgba(200, 169, 99, 0.4)',
      accentBar: 'bg-[#C8A963]',
    },
    {
      gradient: 'linear-gradient(135deg, #E84C4C 0%, #F25C5C 100%)', // Action Red
      textColor: '#E84C4C',
      barColor: '#E84C4C',
      shadow: '0 4px 20px rgba(232, 76, 76, 0.4)',
      accentBar: 'bg-[#E84C4C]',
    },
    {
      gradient: 'linear-gradient(135deg, #10B981 0%, #14D99B 100%)', // Success Green (3rd place)
      textColor: '#10B981',
      barColor: '#10B981',
      shadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
      accentBar: 'bg-[#10B981]',
    },
  ];

  // Extract last name from full name
  const getLastName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1].toUpperCase();
  };

  return (
    <div 
      className="glass-card relative overflow-hidden rounded-2xl border"
      style={{
        background: darkMode ? 'var(--glass-bg-dark)' : '#1a1a2e',
        borderColor: darkMode ? 'var(--glass-border-dark)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: darkMode ? 'var(--shadow-xl-dark)' : '0 12px 48px rgba(0, 0, 0, 0.8)',
        maxWidth: compact ? '380px' : '100%',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div 
        className="relative py-4 px-6 text-center border-b"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)'
          }}
        ></div>
        <h2 
          className="relative tracking-wider"
          style={{
            fontWeight: 900,
            fontSize: compact ? '1.25rem' : '1.5rem',
            letterSpacing: '0.05em',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          LÍDERES EN VIVO
        </h2>
        <p className="text-xs mt-1 text-white/60">División de Votos Actual</p>
      </div>

      {/* Top 3 Players */}
      <div className="relative">
        {top3.map((item, index) => {
          if (!item.player) return null;
          
          const colors = positionColors[index];
          const lastName = getLastName(item.player.name);
          
          return (
            <div 
              key={item.player.id}
              className="relative flex items-center gap-4 p-4 border-b transition-all duration-300 hover:bg-white/5"
              style={{
                background: index === 0 ? 'rgba(200, 169, 99, 0.05)' : 'transparent',
                borderBottomColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Position Indicator - Vertical Color Bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  background: colors.gradient,
                  boxShadow: colors.shadow,
                }}
              ></div>

              {/* Player Photo */}
              <div 
                className="relative flex-shrink-0"
                style={{
                  width: compact ? '60px' : '70px',
                  height: compact ? '60px' : '70px',
                }}
              >
                {item.player.photoUrl ? (
                  <ImageWithFallback
                    src={item.player.photoUrl}
                    alt={item.player.name}
                    className="w-full h-full object-cover rounded-lg"
                    style={{
                      border: `2px solid ${colors.barColor}`,
                      boxShadow: colors.shadow,
                    }}
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-lg flex items-center justify-center text-white"
                    style={{
                      background: colors.gradient,
                      border: `2px solid ${colors.barColor}`,
                      boxShadow: colors.shadow,
                    }}
                  >
                    <span className="text-2xl" style={{ fontWeight: 800 }}>
                      {item.player.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Position Badge */}
                <div 
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                  style={{
                    background: colors.gradient,
                    fontWeight: 800,
                    boxShadow: colors.shadow,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {index + 1}
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div 
                  className="tracking-wider leading-tight"
                  style={{
                    fontSize: compact ? '1.5rem' : '1.75rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    fontStyle: 'italic',
                  }}
                >
                  {lastName}
                </div>
                <div className="text-xs text-white/60 mt-0.5">
                  {item.player.position} • #{item.player.jerseyNumber}
                </div>
              </div>

              {/* Percentage */}
              <div className="text-right flex-shrink-0">
                <div 
                  className="tracking-tight leading-none"
                  style={{
                    fontSize: compact ? '2rem' : '2.5rem',
                    fontWeight: 900,
                    background: colors.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))',
                  }}
                >
                  {item.percentage.toFixed(0)}%
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {item.votes.toLocaleString()} votos
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div 
        className="py-3 px-6 text-center border-t"
        style={{
          background: 'linear-gradient(135deg, rgba(12, 35, 64, 0.3) 0%, rgba(12, 35, 64, 0.1) 100%)',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="text-sm text-white/80" style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
          CANGREJERAS.COM/VOTA
        </div>
        {totalVotes > 0 && (
          <div className="text-xs text-white/40 mt-0.5">
            Total: {totalVotes.toLocaleString()} votos
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A963]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E84C4C]/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
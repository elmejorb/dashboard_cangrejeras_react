import { useEffect, useState } from 'react';
import { useVoting } from '../contexts/VotingContext';
import { usePlayers } from '../contexts/PlayerContext';

// Estilos de animación para las transiciones
const animationStyles = `
  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOutToLeft {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100px);
    }
  }

  @keyframes moveUp {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
      box-shadow: 0 10px 40px rgba(200, 169, 99, 0.6);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes moveDown {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(10px);
      opacity: 0.7;
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(200, 169, 99, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(200, 169, 99, 0.8);
    }
  }

  .candidate-enter {
    animation: slideInFromRight 0.6s ease-out;
  }

  .candidate-exit {
    animation: slideOutToLeft 0.4s ease-in;
  }

  .candidate-move-up {
    animation: moveUp 0.8s ease-out, glow 0.8s ease-out;
  }

  .candidate-move-down {
    animation: moveDown 0.6s ease-out;
  }

  .percentage-change {
    animation: pulse 0.5s ease-out;
  }
`;

interface Candidate {
  id: string;
  name: string;
  imageUrl?: string;
  position?: string;
  number?: string;
  votes: number;
  percentage: number;
}

interface CandidateWithAnimation extends Candidate {
  isNew?: boolean;
  positionChanged?: 'up' | 'down' | 'none';
  previousPosition?: number;
}

interface LiveVotingOverlayProps {
  mode?: 'standard' | 'compact'; // standard = para TV, compact = para overlays laterales
  backgroundColor?: string; // 'transparent', 'green', 'blue', o color hex
  showBackground?: boolean; // true = fondo visible, false = transparente
}

export function LiveVotingOverlay({
  mode = 'compact',
  backgroundColor = 'transparent',
  showBackground = false
}: LiveVotingOverlayProps) {
  const [candidates, setCandidates] = useState<CandidateWithAnimation[]>([]);
  const [previousCandidates, setPreviousCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [pollTitle, setPollTitle] = useState('LÍDERES EN VIVO');

  const { livePoll } = useVoting();
  const { players } = usePlayers();

  // Inyectar estilos de animación en el DOM
  useEffect(() => {
    const styleId = 'voting-overlay-animations';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = animationStyles;
      document.head.appendChild(styleElement);
    }

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (livePoll && livePoll.options && livePoll.options.length > 0 && livePoll.isActive) {
      // Calcular total de votos
      const total = livePoll.totalVotes || livePoll.options.reduce((sum: number, option: any) => sum + (option.votes || 0), 0);

      // Filtrar solo candidatos con votos > 0
      const withVotes = livePoll.options.filter((option: any) => (option.votes || 0) > 0);

      // Si no hay votos todavía, no mostrar nada
      if (withVotes.length === 0) {
        setCandidates([]);
        setTotalVotes(0);
        setPollTitle(livePoll.title || 'LÍDERES EN VIVO');
        return;
      }

      // Ordenar candidatos por votos (de mayor a menor) y tomar máximo 3
      const sorted = [...withVotes]
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, 3);

      // Mapear candidatos con información completa
      const mappedCandidates = sorted.map(option => {
        // Buscar jugadora usando el playerId (ahora ambos son string)
        const player = players.find(p => p.id === option.playerId);
        const percentage = total > 0 ? Math.round((option.votes / total) * 100) : 0;

        // Extraer apellido (última palabra del nombre)
        // Ejemplo: "Tamara Otene" -> "OTENE"
        const fullName = player?.name || 'JUGADORA';
        const nameParts = fullName.trim().split(/\s+/);
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : fullName.toUpperCase();

        return {
          id: option.playerId,
          name: lastName,
          imageUrl: player?.photoUrl,
          position: player?.position,
          number: player?.jerseyNumber ? `#${player.jerseyNumber}` : '',
          votes: option.votes || 0,
          percentage
        };
      });

      // Detectar cambios de posición para animaciones
      const candidatesWithAnimation = mappedCandidates.map((candidate, currentIndex) => {
        const previousIndex = previousCandidates.findIndex((p: Candidate) => p.id === candidate.id);
        const isNew = previousIndex === -1;

        let positionChanged: 'up' | 'down' | 'none' = 'none';
        if (!isNew && previousIndex !== -1) {
          if (previousIndex > currentIndex) {
            positionChanged = 'up'; // Subió de posición
          } else if (previousIndex < currentIndex) {
            positionChanged = 'down'; // Bajó de posición
          }
        }

        return {
          ...candidate,
          isNew,
          positionChanged,
          previousPosition: previousIndex !== -1 ? previousIndex : undefined
        };
      });

      setCandidates(candidatesWithAnimation);
      setPreviousCandidates(mappedCandidates);
      setTotalVotes(total);
      setPollTitle(livePoll.title || 'LÍDERES EN VIVO');
    } else {
      // No hay votación activa o está cerrada
      setCandidates([]);
      setTotalVotes(0);
      setPollTitle('LÍDERES EN VIVO');
    }
  }, [livePoll, players]);

  // Colores para cada posición
  const getPositionColor = (index: number) => {
    const colors = [
      '#C8A963', // Dorado - 1er lugar
      '#E84C4C', // Rojo - 2do lugar
      '#10B981', // Verde - 3er lugar
    ];
    return colors[index] || '#6B7280';
  };

  // Determinar el color de fondo
  const bgStyle = showBackground
    ? backgroundColor === 'transparent'
      ? 'bg-transparent'
      : backgroundColor === 'green'
      ? 'bg-green-500'
      : backgroundColor === 'blue'
      ? 'bg-blue-500'
      : ''
    : 'bg-transparent';

  const customBg = showBackground && !['transparent', 'green', 'blue'].includes(backgroundColor)
    ? { backgroundColor }
    : {};

  // Estado cuando no hay votación activa
  if (candidates.length === 0) {
    if (mode === 'compact') {
      return (
        <div
          className={`min-h-screen flex items-center justify-center p-8 ${bgStyle}`}
          style={customBg}
        >
          <div className="w-full max-w-md">
            <div
              className="rounded-3xl shadow-2xl overflow-hidden p-12 text-center"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              <div className="text-6xl mb-6 text-gray-400">🏆</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Votación Sin Iniciar
              </h2>
              <p className="text-gray-500">
                Los líderes aparecerán cuando comience la votación
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Modo standard (oscuro)
      return (
        <div
          className={`min-h-screen flex items-center justify-center p-8 ${bgStyle}`}
          style={customBg}
        >
          <div className="w-full" style={{ maxWidth: '440px' }}>
            <div
              className="rounded-3xl shadow-2xl overflow-hidden p-12 text-center"
              style={{ backgroundColor: '#4a5568' }}
            >
              <div className="text-6xl mb-6 text-gray-400">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Votación Sin Iniciar
              </h2>
              <p className="text-gray-300">
                Los líderes aparecerán cuando comience la votación
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  if (mode === 'compact') {
    // Vista compacta para overlays laterales (Glass Morphism)
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-8 ${bgStyle}`}
        style={customBg}
      >
        <div className="w-full" style={{ maxWidth: '380px' }}>
          {/* Glass Card con efectos */}
          <div
            className="glass-card relative overflow-hidden rounded-2xl border"
            style={{
              background: 'rgba(30, 41, 59, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(16px)'
            }}
          >
            {/* Header con Glass Effect */}
            <div
              className="relative py-4 px-6 text-center border-b"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                borderBottomColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)'
                }}
              />
              <h2
                className="relative tracking-wider"
                style={{
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                }}
              >
                {pollTitle}
              </h2>
              <p className="text-xs mt-1 text-white/60">División de Votos Actual</p>
            </div>

            {/* Candidates List */}
            <div className="relative">
              {candidates.map((candidate, index) => {
                const color = getPositionColor(index);
                const isFirst = index === 0;

                // Determinar clases de animación
                let animationClass = '';
                if (candidate.isNew) {
                  animationClass = 'candidate-enter';
                } else if (candidate.positionChanged === 'up') {
                  animationClass = 'candidate-move-up';
                } else if (candidate.positionChanged === 'down') {
                  animationClass = 'candidate-move-down';
                }

                return (
                  <div
                    key={candidate.id}
                    className={`relative flex items-center gap-4 p-4 border-b transition-all duration-300 hover:bg-white/5 ${animationClass}`}
                    style={{
                      background: isFirst ? 'rgba(200, 169, 99, 0.05)' : 'transparent',
                      borderBottomColor: 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {/* Barra lateral con gradiente */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{
                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        boxShadow: `0 4px 20px ${color}66`
                      }}
                    />

                    {/* Foto con badge de posición */}
                    <div className="relative flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                      {candidate.imageUrl ? (
                        <img
                          src={candidate.imageUrl}
                          alt={candidate.name}
                          className="w-full h-full object-cover rounded-lg"
                          style={{
                            border: `2px solid ${color}`,
                            boxShadow: `0 4px 20px ${color}66`
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-lg bg-gradient-to-br from-gray-600 to-gray-700"
                          style={{
                            border: `2px solid ${color}`,
                            boxShadow: `0 4px 20px ${color}66`
                          }}
                        />
                      )}
                      {/* Badge de posición */}
                      <div
                        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{
                          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                          fontWeight: 800,
                          boxShadow: `0 4px 20px ${color}66`,
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Info del candidato */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="tracking-wider leading-tight"
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                          fontStyle: 'italic'
                        }}
                      >
                        {candidate.name}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">
                        {candidate.position} • {candidate.number}
                      </div>
                    </div>

                    {/* Porcentaje */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className={`tracking-tight leading-none ${candidate.positionChanged !== 'none' ? 'percentage-change' : ''}`}
                        style={{
                          fontSize: '2rem',
                          fontWeight: 900,
                          color: color,
                          textShadow: `0 2px 8px ${color}66`
                        }}
                      >
                        {candidate.percentage}%
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {candidate.votes.toLocaleString()} votos
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
                borderTopColor: 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <div
                className="text-sm text-white/80"
                style={{
                  fontWeight: 600,
                  letterSpacing: '0.02em'
                }}
              >
                CANGREJERAS.COM/VOTA
              </div>
              <div className="text-xs text-white/40 mt-0.5">
                Total: {totalVotes.toLocaleString()} votos
              </div>
            </div>

            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200, 169, 99, 0.1)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(232, 76, 76, 0.1)' }} />
          </div>
        </div>
      </div>
    );
  }

  // Vista estándar para pantalla completa en TV (Glass Morphism Design)
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-8 ${bgStyle}`}
      style={customBg}
    >
      <div className="w-full" style={{ maxWidth: '440px' }}>
        {/* Glass Card con efectos */}
        <div
          className="relative overflow-hidden rounded-2xl border"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Header con Glass Effect */}
          <div
            className="relative py-4 px-6 text-center border-b"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              borderBottomColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)'
              }}
            />
            <h2
              className="relative tracking-wider"
              style={{
                fontWeight: 900,
                fontSize: '1.5rem',
                letterSpacing: '0.05em',
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              {pollTitle}
            </h2>
            <p className="text-xs mt-1 text-white/60">División de Votos Actual</p>
          </div>

          {/* Candidates List */}
          <div className="relative">
            {candidates.map((candidate, index) => {
              const color = getPositionColor(index);
              const isFirst = index === 0;

              // Determinar clases de animación
              let animationClass = '';
              if (candidate.isNew) {
                animationClass = 'candidate-enter';
              } else if (candidate.positionChanged === 'up') {
                animationClass = 'candidate-move-up';
              } else if (candidate.positionChanged === 'down') {
                animationClass = 'candidate-move-down';
              }

              return (
                <div
                  key={candidate.id}
                  className={`relative flex items-center gap-4 p-4 border-b transition-all duration-300 hover:bg-white/5 ${animationClass}`}
                  style={{
                    background: isFirst ? 'rgba(200, 169, 99, 0.05)' : 'transparent',
                    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {/* Barra lateral con gradiente */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{
                      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                      boxShadow: `0 4px 20px ${color}66`
                    }}
                  />

                  {/* Foto con badge de posición */}
                  <div className="relative flex-shrink-0" style={{ width: '70px', height: '70px' }}>
                    {candidate.imageUrl ? (
                      <img
                        src={candidate.imageUrl}
                        alt={candidate.name}
                        className="w-full h-full object-cover rounded-lg"
                        style={{
                          border: `2px solid ${color}`,
                          boxShadow: `0 4px 20px ${color}66`
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-lg bg-gradient-to-br from-gray-600 to-gray-700"
                        style={{
                          border: `2px solid ${color}`,
                          boxShadow: `0 4px 20px ${color}66`
                        }}
                      />
                    )}
                    {/* Badge de posición */}
                    <div
                      className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{
                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        fontWeight: 800,
                        boxShadow: `0 4px 20px ${color}66`,
                        border: '2px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Info del candidato */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="tracking-wider leading-tight"
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        fontStyle: 'italic'
                      }}
                    >
                      {candidate.name}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {candidate.position} • {candidate.number}
                    </div>
                  </div>

                  {/* Porcentaje */}
                  <div className="text-right flex-shrink-0" style={{ position: 'relative', zIndex: 10 }}>
                    <div
                      className={`tracking-tight leading-none ${candidate.positionChanged !== 'none' ? 'percentage-change' : ''}`}
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: color,
                        textShadow: `0 2px 8px ${color}66`,
                        display: 'inline-block',
                        position: 'relative'
                      }}
                    >
                      {candidate.percentage}%
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      {candidate.votes.toLocaleString()} votos
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
              borderTopColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <div
              className="text-sm text-white/80"
              style={{
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}
            >
              CANGREJERAS.COM/VOTA
            </div>
            <div className="text-xs text-white/40 mt-0.5">
              Total: {totalVotes.toLocaleString()} votos
            </div>
          </div>

          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(200, 169, 99, 0.1)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(232, 76, 76, 0.1)' }} />
        </div>
      </div>
    </div>
  );
}

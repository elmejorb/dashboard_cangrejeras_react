import { ArrowLeft } from "lucide-react";

interface Player {
  id: number;
  name: string;
  lastName: string;
  number: number;
  position: string;
  height: string;
  points: number;
  aces: number;
  blocks: number;
  status: 'active' | 'inactive';
  photo?: string;
  bio?: string;
  gamesPlayed?: number;
  gamesWon?: number;
  avgPerGame?: number;
  attacks?: number;
  effectiveness?: number;
  team?: string;
  league?: string;
  season?: string;
}

interface PlayerProfileProps {
  player: Player;
  darkMode: boolean;
  onBack: () => void;
}

// Helper para obtener iniciales
const getInitials = (name: string, lastName: string) => {
  const firstInitial = name.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

export function PlayerProfile({ player, darkMode, onBack }: PlayerProfileProps) {
  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-[#0F172A]' : 'bg-[#F2F4F7]'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${
        darkMode 
          ? 'bg-[#0F172A]/80 border-white/10' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-gray-100 text-gray-900'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Perfil de Jugadora
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Player Header Card */}
        <div className={`rounded-2xl border p-6 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}>
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar/Photo */}
            <div className="relative flex-shrink-0">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={`${player.name} ${player.lastName}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#0C2340] flex items-center justify-center text-white text-2xl">
                  {getInitials(player.name, player.lastName)}
                </div>
              )}
              {/* Number Badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#C8A963] text-white flex items-center justify-center text-sm font-bold border-2 border-white dark:border-[#0F172A]">
                {player.number}
              </div>
            </div>

            {/* Name and Position */}
            <div className="flex-1">
              <h2 className={`text-2xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.name} {player.lastName}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                {player.position}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl mb-1 ${darkMode ? 'text-[#E01E37]' : 'text-[#E01E37]'}`}>
                {player.points}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Puntos
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl mb-1 ${darkMode ? 'text-[#C8A963]' : 'text-[#C8A963]'}`}>
                {player.aces}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Aces
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl mb-1 ${darkMode ? 'text-white' : 'text-[#0C2340]'}`}>
                {player.blocks}
              </div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Bloqueos
              </div>
            </div>
          </div>
        </div>

        {/* Biography */}
        {player.bio && (
          <div className={`rounded-2xl border p-6 ${
            darkMode
              ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
              : 'bg-white/80 border-gray-200 backdrop-blur-xl'
          }`}>
            <h3 className={`mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Biografía
            </h3>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
              {player.bio}
            </p>
          </div>
        )}

        {/* Season Statistics */}
        <div className={`rounded-2xl border p-6 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}>
          <h3 className={`mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Estadísticas de la Temporada
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Partidos Jugados
              </div>
              <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.gamesPlayed || 0}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Partidos Ganados
              </div>
              <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.gamesWon || 0}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Puntos Totales
              </div>
              <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.points}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Promedio por Partido
              </div>
              <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.avgPerGame || 0}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Aces
              </div>
              <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.aces}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Bloqueos
              </div>
              <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.blocks}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Ataques
              </div>
              <div className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.attacks || 0}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Efectividad
              </div>
              <div className={`text-2xl ${
                (player.effectiveness || 0) >= 70 
                  ? 'text-[#10B981]' 
                  : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {player.effectiveness || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Team Information */}
        <div className={`rounded-2xl border p-6 ${
          darkMode
            ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        }`}>
          <h3 className={`mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Información del Equipo
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Equipo
              </div>
              <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.team || 'Cangrejeras de Santurce'}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Liga
              </div>
              <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.league || 'Liga Superior Femenina'}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Temporada
              </div>
              <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.season || '2025-2026'}
              </div>
            </div>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Posición
              </div>
              <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {player.position}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

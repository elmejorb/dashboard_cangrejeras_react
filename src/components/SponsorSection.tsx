import { Trophy } from "lucide-react";

interface SponsorSectionProps {
  darkMode: boolean;
}

export function SponsorSection({ darkMode }: SponsorSectionProps) {
  return (
    <div
      className="card-interactive relative overflow-hidden rounded-2xl p-8 border cursor-pointer group"
      style={{
        background: 'linear-gradient(135deg, #F2C94C 0%, #F2994A 100%)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(242, 201, 76, 0.3)',
        transition: 'all var(--transition-base)'
      }}
    >
      <div className="text-center relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 animate-float transition-transform duration-300 group-hover:scale-110">
            <Trophy className="w-10 h-10 text-[#0C2340] transition-transform duration-300 group-hover:rotate-12" />
          </div>
        </div>
        <h3 className="text-[#0C2340] mb-1 transition-all duration-300 group-hover:scale-105">
          PATROCINADOR OFICIAL
        </h3>
        <p className="text-[#0F172A] text-sm opacity-80">
          ESPACIO PUBLICITARIO
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 transition-all duration-300 group-hover:bg-white/40 group-hover:scale-105">
          <span className="text-xs text-[#0C2340]">Tu marca aquí</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="animate-float absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" style={{ animationDelay: '0.5s' }}></div>
      <div className="animate-float absolute bottom-0 right-0 w-40 h-40 bg-[#0C2340]/10 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #0C2340 10px, #0C2340 20px)'
      }}></div>
    </div>
  );
}

import { Clock, Info } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface TimeFormatHelperProps {
  darkMode: boolean;
}

/**
 * Helper component to show 24-hour format examples for Puerto Rico
 */
export function TimeFormatHelper({ darkMode }: TimeFormatHelperProps) {
  const commonTimes = [
    { label: "Mañana", time12: "9:00 AM", time24: "09:00" },
    { label: "Mediodía", time12: "12:00 PM", time24: "12:00" },
    { label: "Tarde", time12: "2:00 PM", time24: "14:00" },
    { label: "Partido típico", time12: "7:00 PM", time24: "19:00", highlight: true },
    { label: "Noche", time12: "10:00 PM", time24: "22:00" },
  ];

  return (
    <Alert className={darkMode ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30' : 'bg-[#8B5CF6]/5 border-[#8B5CF6]/20'}>
      <Info className="h-4 w-4 text-[#8B5CF6]" />
      <AlertDescription>
        <div className="space-y-2">
          <p className={`text-sm ${darkMode ? 'text-white/90' : 'text-gray-900'}`}>
            <Clock size={14} className="inline mr-1" />
            <strong>Formato 24 horas</strong> - Ejemplos comunes:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {commonTimes.map(({ label, time12, time24, highlight }) => (
              <div
                key={time24}
                className={`p-2 rounded ${
                  highlight
                    ? darkMode
                      ? 'bg-[#C8A963]/20 border border-[#C8A963]/40'
                      : 'bg-[#C8A963]/10 border border-[#C8A963]/30'
                    : darkMode
                      ? 'bg-white/5'
                      : 'bg-gray-50'
                }`}
              >
                <div className={`${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  {label}
                </div>
                <div className={`${darkMode ? 'text-white' : 'text-gray-900'} ${highlight ? 'font-medium' : ''}`}>
                  {time24}h
                </div>
                <div className={`text-[10px] ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  ({time12})
                </div>
              </div>
            ))}
          </div>
          <p className={`text-xs italic ${darkMode ? 'text-white/60' : 'text-gray-600'} flex items-center gap-1.5`}>
            <Info size={12} />
            <span>Tip: Partidos normalmente empiezan a las 19:00h (7:00 PM)</span>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

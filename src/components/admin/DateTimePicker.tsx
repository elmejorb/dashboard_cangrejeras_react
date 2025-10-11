import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  darkMode: boolean;
  label?: string;
  required?: boolean;
}

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  darkMode: boolean;
  label?: string;
  required?: boolean;
}

export function DatePicker({ value, onChange, darkMode, label, required }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value + 'T00:00:00') : null
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  // Current month/year for calendar display
  const [displayMonth, setDisplayMonth] = useState(
    selectedDate ? selectedDate.getMonth() : new Date().getMonth()
  );
  const [displayYear, setDisplayYear] = useState(
    selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const newDate = new Date(value + 'T00:00:00');
      setSelectedDate(newDate);
      setDisplayMonth(newDate.getMonth());
      setDisplayYear(newDate.getFullYear());
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(displayMonth, displayYear);
  const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handleDayClick = (day: number) => {
    const newDate = new Date(displayYear, displayMonth, day);
    setSelectedDate(newDate);
    const formattedDate = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'mm / dd / yyyy';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} / ${day} / ${year}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      displayMonth === today.getMonth() &&
      displayYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      displayMonth === selectedDate.getMonth() &&
      displayYear === selectedDate.getFullYear()
    );
  };

  return (
    <div className="space-y-2" ref={pickerRef}>
      {label && (
        <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
          <CalendarIcon size={14} className="text-[#C8A963]" />
          {label} {required && '*'}
        </Label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
            darkMode
              ? 'bg-gradient-to-br from-[#1E293B]/80 via-[#1E293B]/60 to-[#1E293B]/80 border-white/10 text-white hover:border-[#C8A963]/50'
              : 'bg-gradient-to-br from-white/95 via-white/80 to-white/95 border-gray-200 text-gray-900 hover:border-[#C8A963]/50'
          } backdrop-blur-xl`}
        >
          {/* Animated gradient overlay */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              darkMode
                ? 'bg-gradient-to-r from-[#C8A963]/10 via-[#C8A963]/5 to-transparent'
                : 'bg-gradient-to-r from-[#C8A963]/5 via-[#C8A963]/3 to-transparent'
            }`}
          />
          
          {/* Glow effect when focused */}
          {isOpen && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C8A963]/30 via-[#C8A963]/10 to-[#C8A963]/30 rounded-xl blur-sm -z-10 animate-pulse" />
          )}

          <div className="flex items-center justify-between relative z-10">
            <span className={selectedDate ? '' : darkMode ? 'text-white/40' : 'text-gray-400'}>
              {formatDisplayDate(selectedDate)}
            </span>
            <CalendarIcon size={18} className="text-[#C8A963]" />
          </div>
        </button>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div
            className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-[#1E293B]/95 via-[#0F172A]/95 to-[#1E293B]/95 border-white/10'
                : 'bg-gradient-to-br from-white/98 via-gray-50/98 to-white/98 border-gray-200'
            } backdrop-blur-2xl`}
          >
            {/* Animated glow border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C8A963]/20 via-[#C8A963]/5 to-[#C8A963]/20 rounded-2xl blur opacity-50" />
            
            <div className="relative p-4">
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    darkMode
                      ? 'hover:bg-white/10 text-white/70 hover:text-[#C8A963]'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-[#C8A963]'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-[#C8A963]/10' : 'bg-[#C8A963]/5'
                }`}>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {monthNames[displayMonth]} {displayYear}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    darkMode
                      ? 'hover:bg-white/10 text-white/70 hover:text-[#C8A963]'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-[#C8A963]'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, index) => (
                  <div
                    key={`day-${index}`}
                    className={`text-center text-xs py-2 ${
                      darkMode ? 'text-white/50' : 'text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {blanks.map((blank) => (
                  <div key={`blank-${blank}`} />
                ))}
                {days.map((day) => {
                  const today = isToday(day);
                  const selected = isSelected(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square rounded-lg text-sm transition-all duration-200
                        relative overflow-hidden group
                        ${
                          selected
                            ? darkMode
                              ? 'bg-gradient-to-br from-[#C8A963] to-[#B89954] text-[#0C2340] shadow-lg shadow-[#C8A963]/30 scale-105'
                              : 'bg-gradient-to-br from-[#C8A963] to-[#B89954] text-white shadow-lg shadow-[#C8A963]/30 scale-105'
                            : today
                            ? darkMode
                              ? 'bg-[#C8A963]/20 text-[#C8A963] border border-[#C8A963]/30'
                              : 'bg-[#C8A963]/10 text-[#C8A963] border border-[#C8A963]/30'
                            : darkMode
                            ? 'text-white/80 hover:bg-white/10 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      {!selected && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#C8A963]/0 to-[#C8A963]/0 group-hover:from-[#C8A963]/10 group-hover:to-[#C8A963]/5 transition-all duration-300" />
                      )}
                      <span className="relative z-10">{day}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleClear}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                    darkMode
                      ? 'text-[#E01E37] hover:bg-[#E01E37]/10'
                      : 'text-[#E01E37] hover:bg-[#E01E37]/10'
                  }`}
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                    darkMode
                      ? 'bg-gradient-to-r from-[#C8A963]/20 to-[#C8A963]/10 text-[#C8A963] hover:from-[#C8A963]/30 hover:to-[#C8A963]/20'
                      : 'bg-gradient-to-r from-[#C8A963]/10 to-[#C8A963]/5 text-[#C8A963] hover:from-[#C8A963]/20 hover:to-[#C8A963]/10'
                  }`}
                >
                  Hoy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TimePicker({ value, onChange, darkMode, label, required }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Convert 24-hour format to 12-hour format on initialization
  const getInitialHour = () => {
    if (!value) return 12;
    const hour24 = parseInt(value.split(':')[0]);
    if (hour24 === 0) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  };
  
  const [hour, setHour] = useState<number>(getInitialHour());
  const [minute, setMinute] = useState<number>(
    value ? parseInt(value.split(':')[1]) : 0
  );
  const [period, setPeriod] = useState<'AM' | 'PM'>(
    value ? (parseInt(value.split(':')[0]) >= 12 ? 'PM' : 'AM') : 'PM'
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const hour24 = parseInt(value.split(':')[0]);
      const newMinute = parseInt(value.split(':')[1]);
      const newPeriod = hour24 >= 12 ? 'PM' : 'AM';
      
      let newHour = hour24;
      if (hour24 === 0) newHour = 12;
      else if (hour24 > 12) newHour = hour24 - 12;
      
      setHour(newHour);
      setMinute(newMinute);
      setPeriod(newPeriod);
    }
  }, [value]);

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
    updateTime(newHour, minute, period);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    updateTime(hour, newMinute, period);
  };

  const handlePeriodToggle = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM';
    setPeriod(newPeriod);
    updateTime(hour, minute, newPeriod);
  };

  const updateTime = (h: number, m: number, p: 'AM' | 'PM') => {
    let hour24 = h;
    if (p === 'PM' && h !== 12) {
      hour24 = h + 12;
    } else if (p === 'AM' && h === 12) {
      hour24 = 0;
    }
    const formattedTime = `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange(formattedTime);
  };

  const formatDisplayTime = () => {
    if (!value) return '-- : --';
    return `${String(hour).padStart(2, '0')} : ${String(minute).padStart(2, '0')}`;
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="space-y-2" ref={pickerRef}>
      {label && (
        <Label className={`flex items-center gap-2 ${darkMode ? 'text-white/90' : 'text-gray-700'}`}>
          <Clock size={14} className="text-[#C8A963]" />
          {label} {required && '*'}
        </Label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
            darkMode
              ? 'bg-gradient-to-br from-[#1E293B]/80 via-[#1E293B]/60 to-[#1E293B]/80 border-white/10 text-white hover:border-[#C8A963]/50'
              : 'bg-gradient-to-br from-white/95 via-white/80 to-white/95 border-gray-200 text-gray-900 hover:border-[#C8A963]/50'
          } backdrop-blur-xl`}
        >
          {/* Animated gradient overlay */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              darkMode
                ? 'bg-gradient-to-r from-[#C8A963]/10 via-[#C8A963]/5 to-transparent'
                : 'bg-gradient-to-r from-[#C8A963]/5 via-[#C8A963]/3 to-transparent'
            }`}
          />
          
          {/* Glow effect when focused */}
          {isOpen && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C8A963]/30 via-[#C8A963]/10 to-[#C8A963]/30 rounded-xl blur-sm -z-10 animate-pulse" />
          )}

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${!value && (darkMode ? 'text-white/40' : 'text-gray-400')}`}>
                {formatDisplayTime()}
              </span>
              {value && (
                <span className={`text-sm px-2 py-1 rounded ${
                  darkMode ? 'bg-[#C8A963]/20 text-[#C8A963]' : 'bg-[#C8A963]/10 text-[#C8A963]'
                }`}>
                  {period}
                </span>
              )}
            </div>
            <Clock size={18} className="text-[#C8A963]" />
          </div>
        </button>

        {/* Time Picker Dropdown */}
        {isOpen && (
          <div
            className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-[#1E293B]/95 via-[#0F172A]/95 to-[#1E293B]/95 border-white/10'
                : 'bg-gradient-to-br from-white/98 via-gray-50/98 to-white/98 border-gray-200'
            } backdrop-blur-2xl`}
          >
            {/* Animated glow border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C8A963]/20 via-[#C8A963]/5 to-[#C8A963]/20 rounded-2xl blur opacity-50" />
            
            <div className="relative p-4">
              {/* Time Display */}
              <div className={`text-center mb-4 p-4 rounded-xl ${
                darkMode ? 'bg-[#C8A963]/10' : 'bg-[#C8A963]/5'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {String(hour).padStart(2, '0')}
                  </span>
                  <span className={`text-3xl text-[#C8A963]`}>:</span>
                  <span className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {String(minute).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={handlePeriodToggle}
                    className={`ml-2 px-3 py-1 rounded-lg transition-all ${
                      darkMode
                        ? 'bg-gradient-to-r from-[#C8A963] to-[#B89954] text-[#0C2340] hover:shadow-lg hover:shadow-[#C8A963]/30'
                        : 'bg-gradient-to-r from-[#C8A963] to-[#B89954] text-white hover:shadow-lg hover:shadow-[#C8A963]/30'
                    }`}
                  >
                    {period}
                  </button>
                </div>
              </div>

              {/* Hour and Minute Pickers */}
              <div className="grid grid-cols-2 gap-4">
                {/* Hours */}
                <div>
                  <div className={`text-xs text-center mb-2 ${
                    darkMode ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    Hora
                  </div>
                  <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {hours.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHourChange(h)}
                        className={`
                          py-2 rounded-lg text-sm transition-all duration-200
                          ${
                            h === hour
                              ? darkMode
                                ? 'bg-gradient-to-br from-[#C8A963] to-[#B89954] text-[#0C2340] shadow-lg shadow-[#C8A963]/30'
                                : 'bg-gradient-to-br from-[#C8A963] to-[#B89954] text-white shadow-lg shadow-[#C8A963]/30'
                              : darkMode
                              ? 'text-white/70 hover:bg-white/10 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {String(h).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minutes */}
                <div>
                  <div className={`text-xs text-center mb-2 ${
                    darkMode ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    Minuto
                  </div>
                  <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {minutes.filter(m => m % 5 === 0).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMinuteChange(m)}
                        className={`
                          py-2 rounded-lg text-sm transition-all duration-200
                          ${
                            m === minute
                              ? darkMode
                                ? 'bg-gradient-to-br from-[#C8A963] to-[#B89954] text-[#0C2340] shadow-lg shadow-[#C8A963]/30'
                                : 'bg-gradient-to-br from-[#C8A963] to-[#B89954] text-white shadow-lg shadow-[#C8A963]/30'
                              : darkMode
                              ? 'text-white/70 hover:bg-white/10 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {String(m).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Time Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
                {[
                  { label: '12:00 PM', h: 12, m: 0, p: 'PM' as const },
                  { label: '3:00 PM', h: 3, m: 0, p: 'PM' as const },
                  { label: '7:00 PM', h: 7, m: 0, p: 'PM' as const },
                ].map((time) => (
                  <button
                    key={time.label}
                    type="button"
                    onClick={() => {
                      setHour(time.h);
                      setMinute(time.m);
                      setPeriod(time.p);
                      updateTime(time.h, time.m, time.p);
                      setIsOpen(false);
                    }}
                    className={`py-2 px-2 rounded-lg text-xs transition-all ${
                      darkMode
                        ? 'bg-white/5 text-white/70 hover:bg-[#C8A963]/20 hover:text-[#C8A963]'
                        : 'bg-gray-100 text-gray-700 hover:bg-[#C8A963]/10 hover:text-[#C8A963]'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(200, 169, 99, 0.5)' : 'rgba(200, 169, 99, 0.5)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(200, 169, 99, 0.7)' : 'rgba(200, 169, 99, 0.7)'};
        }
      `}</style>
    </div>
  );
}

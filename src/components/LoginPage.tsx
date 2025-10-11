import { useState } from "react";
import { LogIn, Mail, Key, AlertCircle, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import DarkVeil from "./DarkVeil";
import { useAuth } from "../contexts/AuthContext";

interface LoginPageProps {
  darkMode: boolean;
}

export function LoginPage({ darkMode }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      // Success - AuthContext will handle state update
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas. Por favor verifica tu email y contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      {/* Animated Background - DarkVeil */}
      <div className="fixed inset-0 z-0">
        <DarkVeil 
          hueShift={200}
          noiseIntensity={0.03}
          scanlineIntensity={0.1}
          speed={0.3}
          scanlineFrequency={0.1}
          warpAmount={0.3}
          resolutionScale={0.8}
        />
      </div>
      
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 z-0 bg-[#0C2340]/70" style={{ transition: 'opacity var(--transition-base)' }}></div>

      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="animate-float absolute top-1/4 left-10 w-32 h-32 bg-[#C8A963]/10 rounded-full blur-3xl" style={{ animationDelay: '0s' }}></div>
        <div className="animate-float absolute bottom-1/3 right-10 w-40 h-40 bg-[#E01E37]/10 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#0C2340] to-[#C8A963] flex items-center justify-center ring-4 ring-white/20 animate-float group cursor-pointer"
            style={{
              boxShadow: 'var(--shadow-xl-dark), 0 0 40px rgba(200, 169, 99, 0.3)',
              transition: 'all var(--transition-base)'
            }}
          >
            <Shield size={36} className="text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          </div>
          <h1 className="text-3xl mb-2 text-white drop-shadow-lg" style={{ transition: 'all var(--transition-base)' }}>
            Panel de Administración
          </h1>
          <p className="text-[#C8A963] drop-shadow-md" style={{ transition: 'color var(--transition-fast)' }}>
            Cangrejeras de Santurce
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="glass-card rounded-2xl border p-8"
          style={{
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(var(--glass-blur))',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: 'var(--shadow-xl-dark), 0 0 60px rgba(12, 35, 64, 0.5)',
            transition: 'all var(--transition-base)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8A963]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cangrejeras.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 !bg-[#0C2340]/60 border-[#C8A963]/30 !text-white placeholder:text-white/40 focus:border-[#C8A963] focus:ring-[#C8A963]/20 hover:bg-[#0C2340]/70 focus:bg-[#0C2340]/80"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Contraseña
              </Label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8A963]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 !bg-[#0C2340]/60 border-[#C8A963]/30 !text-white placeholder:text-white/40 focus:border-[#C8A963] focus:ring-[#C8A963]/20 hover:bg-[#0C2340]/70 focus:bg-[#0C2340]/80"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="animate-slide-in-top">
                <AlertCircle size={18} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="glass-button w-full bg-gradient-to-r from-[#C8A963] to-[#b89850] hover:from-[#b89850] hover:to-[#C8A963] text-[#0C2340] shadow-lg hover:shadow-xl group"
              style={{
                transition: 'all var(--transition-base)'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0C2340]/30 border-t-[#0C2340] rounded-full animate-spin"></span>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  Iniciar Sesión
                </span>
              )}
            </Button>
          </form>

          {/* Info - Firebase Auth */}
          <div className="mt-6 pt-6 border-t border-white/10" style={{ transition: 'all var(--transition-base)' }}>
            <p className="text-sm text-center text-white/60" style={{ transition: 'color var(--transition-fast)' }}>
              Autenticación segura con Firebase
            </p>
            <div
              className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 group cursor-default"
              style={{
                transition: 'all var(--transition-base)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <p className="text-xs text-white/70 text-center">
                Utiliza las credenciales configuradas en Firebase Authentication
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p 
          className="text-center mt-6 text-sm text-white/40 drop-shadow-md hover:text-white/60"
          style={{ transition: 'color var(--transition-base)' }}
        >
          © 2025 Cangrejeras de Santurce. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

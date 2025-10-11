import { useState } from 'react';
import { Button } from '../ui/button';
import { Database, AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { migratePlayersToFirestore } from '../../scripts/migratePlayersToFirestore';
import { usePlayers } from '../../contexts/PlayerContext';

interface DatabaseMigrationProps {
  darkMode: boolean;
}

export function DatabaseMigration({ darkMode }: DatabaseMigrationProps) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const { currentUser } = useAuth();
  const { reloadPlayers } = usePlayers();

  const handleMigrateClick = async () => {
    if (!currentUser) {
      toast.error('Debes estar autenticado para migrar datos');
      return;
    }

    const confirmed = window.confirm(
      '¿Estás segura de que deseas migrar las 14 jugadoras a Firestore?\n\n' +
      'Este proceso:\n' +
      '• Creará documentos en la colección "players"\n' +
      '• No duplicará jugadoras existentes\n' +
      '• Asignará IDs del 1 al 14'
    );

    if (!confirmed) return;

    setIsMigrating(true);
    const loadingToast = toast.loading('Migrando jugadoras a Firestore...');

    try {
      const result = await migratePlayersToFirestore(currentUser.id);

      setMigrationResult(result);

      if (result.success) {
        toast.success(result.message, { id: loadingToast, duration: 5000 });

        // Recargar jugadoras en el contexto
        await reloadPlayers();
      } else {
        toast.error(result.message, { id: loadingToast, duration: 5000 });
      }
    } catch (error: any) {
      console.error('Error en migración:', error);
      toast.error('Error al migrar jugadoras: ' + error.message, {
        id: loadingToast,
        duration: 5000
      });
      setMigrationResult({
        success: false,
        message: error.message
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-6 ${
        darkMode
          ? 'bg-[#1E293B]/50 border-white/10 backdrop-blur-xl'
          : 'bg-white/80 border-gray-200 backdrop-blur-xl'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Database size={24} className="text-blue-500" />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Migración de Jugadoras a Firestore
          </h3>
          <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Guarda las 14 jugadoras del roster en la base de datos
          </p>
        </div>
      </div>

      <div
        className={`p-4 rounded-lg border mb-4 ${
          darkMode
            ? 'bg-blue-500/5 border-blue-500/20'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ¿Qué hace esta migración?
            </p>
            <ul className={`text-sm space-y-1 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
              <li>• Crea 14 jugadoras en Firestore colección "players"</li>
              <li>• Cada jugadora tiene ID numérico (1-14)</li>
              <li>• Incluye: nombre, apellido, número, posición, altura</li>
              <li>• Estado inicial: todas activas</li>
              <li>• No duplica si ya existen</li>
            </ul>
          </div>
        </div>
      </div>

      {migrationResult && (
        <div
          className={`p-4 rounded-lg border mb-4 ${
            migrationResult.success
              ? darkMode
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-green-50 border-green-200'
              : darkMode
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {migrationResult.success ? (
              <CheckCircle2 size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Resultado de la Migración
              </p>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                {migrationResult.created !== undefined && (
                  <li>✅ Creadas: {migrationResult.created}</li>
                )}
                {migrationResult.skipped !== undefined && (
                  <li>⏭️ Omitidas: {migrationResult.skipped}</li>
                )}
                {migrationResult.errors !== undefined && (
                  <li>❌ Errores: {migrationResult.errors}</li>
                )}
                {migrationResult.total !== undefined && (
                  <li>📊 Total procesadas: {migrationResult.total}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleMigrateClick}
        disabled={isMigrating || !currentUser}
        className={`w-full ${
          darkMode
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isMigrating ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Migrando Jugadoras...
          </>
        ) : (
          <>
            <Upload size={18} className="mr-2" />
            Migrar Jugadoras a Firestore
          </>
        )}
      </Button>

      {!currentUser && (
        <p className={`text-xs text-center mt-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          Debes estar autenticado para ejecutar la migración
        </p>
      )}
    </div>
  );
}

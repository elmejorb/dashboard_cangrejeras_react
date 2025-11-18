import { useSearchParams } from 'react-router-dom';
import { LiveVotingOverlay } from '../components/LiveVotingOverlay';

/**
 * Página pública para overlay de votación en vivo
 *
 * URL de acceso: /voting-overlay
 *
 * Parámetros opcionales:
 * - mode: 'standard' | 'compact' (default: 'compact')
 * - bg: 'transparent' | 'green' | 'blue' | hex color (default: 'transparent')
 * - show: 'true' | 'false' - mostrar fondo (default: 'false')
 *
 * Ejemplos de uso:
 * - /voting-overlay (vista compacta, fondo transparente)
 * - /voting-overlay?mode=standard (vista para TV)
 * - /voting-overlay?bg=green&show=true (fondo verde para chroma key)
 * - /voting-overlay?mode=compact&bg=%23FF0000&show=true (fondo rojo personalizado)
 */
export function VotingOverlay() {
  const [searchParams] = useSearchParams();

  const mode = (searchParams.get('mode') || 'compact') as 'standard' | 'compact';
  const backgroundColor = searchParams.get('bg') || 'transparent';
  const showBackground = searchParams.get('show') === 'true';

  return (
    <LiveVotingOverlay
      mode={mode}
      backgroundColor={backgroundColor}
      showBackground={showBackground}
    />
  );
}

import { useRef, useEffect } from 'react';
import './DarkVeil.css';

interface DarkVeilProps {
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  resolutionScale?: number;
}

export default function DarkVeil({
  speed = 0.5,
}: DarkVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    const drawGradient = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#0C2340';
      ctx.fillRect(0, 0, width, height);

      // Create animated gradient
      const gradient1 = ctx.createRadialGradient(
        width * (0.3 + Math.sin(time * 0.001) * 0.2),
        height * (0.3 + Math.cos(time * 0.0015) * 0.2),
        0,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      gradient1.addColorStop(0, 'rgba(200, 169, 99, 0.15)');
      gradient1.addColorStop(0.5, 'rgba(12, 35, 64, 0.3)');
      gradient1.addColorStop(1, 'rgba(12, 35, 64, 0)');

      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      // Second animated gradient
      const gradient2 = ctx.createRadialGradient(
        width * (0.7 + Math.sin(time * 0.0012) * 0.2),
        height * (0.7 + Math.cos(time * 0.0008) * 0.2),
        0,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      gradient2.addColorStop(0, 'rgba(224, 30, 55, 0.08)');
      gradient2.addColorStop(0.5, 'rgba(12, 35, 64, 0.2)');
      gradient2.addColorStop(1, 'rgba(12, 35, 64, 0)');

      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      // Add some moving dots for texture
      ctx.fillStyle = 'rgba(200, 169, 99, 0.1)';
      for (let i = 0; i < 50; i++) {
        const x = (width / 2) + Math.sin(time * 0.0005 + i) * (width * 0.4);
        const y = (height / 2) + Math.cos(time * 0.0007 + i) * (height * 0.4);
        const size = 2 + Math.sin(time * 0.001 + i) * 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      time += speed * 16; // Approximate 60fps
      drawGradient();
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  return <canvas ref={canvasRef} className="darkveil-canvas" />;
}

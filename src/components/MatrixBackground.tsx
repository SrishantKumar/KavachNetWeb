import { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'SRISHANT KUMAR';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);
    const depths: number[] = Array(Math.floor(columns)).fill(0).map(() => Math.random() * 2 - 1);
    const speeds: number[] = Array(Math.floor(columns)).fill(0).map(() => Math.random() * 0.5 + 0.5);
    const glowIntensity: number[] = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const depth = depths[i];
        const speed = speeds[i];
        
        // Calculate 3D effect based on depth
        const scale = 0.5 + (depth + 1) * 0.5;
        const adjustedFontSize = fontSize * scale;
        const xOffset = (mousePos.current.x - canvas.width / 2) * depth * 0.05;
        const yOffset = (mousePos.current.y - canvas.height / 2) * depth * 0.05;
        
        // Calculate distance from mouse for interaction
        const dx = (x + xOffset) - mousePos.current.x;
        const dy = (y + yOffset) - mousePos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interaction = Math.max(0, 1 - distance / 200);
        
        // Update glow intensity
        glowIntensity[i] = Math.max(1, glowIntensity[i] + interaction * 2);
        
        const text = characters[Math.floor(Math.random() * characters.length)];
        
        // Add depth-based color and glow effect
        const alpha = 0.3 + scale * 0.7;
        const hue = 0; // Red hue
        const saturation = 100;
        const lightness = 50 + depth * 10;
        ctx.shadowBlur = glowIntensity[i] * 5 * scale;
        ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.font = `${adjustedFontSize}px monospace`;
        ctx.fillText(text, x + xOffset, y + yOffset);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Update drops with varying speeds
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) {
          drops[i] = 0;
          glowIntensity[i] = 1;
          speeds[i] = Math.random() * 0.5 + 0.5;
        }
        drops[i] += speed;
        glowIntensity[i] *= 0.95;
      }
    };

    const interval = setInterval(draw, 33);
    
    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener('resize', resizeHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)'
      }}
    />
  );
};

export default MatrixBackground;
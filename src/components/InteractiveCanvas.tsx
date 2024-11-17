import React, { useEffect, useRef, useState } from 'react';
import { useMousePosition, useAnimationFrame, calculateDistance, lerp } from '../utils/animations';
import { theme } from '../styles/theme';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  alpha: number;
  speed: number;
}

interface InteractiveCanvasProps {
  particleCount?: number;
  particleSize?: number;
  interactionRadius?: number;
  speedFactor?: number;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  particleCount = 50,
  particleSize = 2,
  interactionRadius = 100,
  speedFactor = 0.05,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles
    const newParticles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      targetX: Math.random() * dimensions.width,
      targetY: Math.random() * dimensions.height,
      size: Math.random() * particleSize + 1,
      alpha: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 0.5 + 0.5,
    }));
    setParticles(newParticles);

    return () => window.removeEventListener('resize', handleResize);
  }, [dimensions.width, dimensions.height, particleCount, particleSize]);

  useAnimationFrame(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Update and draw particles
    const updatedParticles = particles.map(particle => {
      const distance = calculateDistance(
        particle.x,
        particle.y,
        mousePosition.x,
        mousePosition.y
      );

      if (distance < interactionRadius) {
        const angle = Math.atan2(
          mousePosition.y - particle.y,
          mousePosition.x - particle.x
        );
        particle.targetX = particle.x - Math.cos(angle) * interactionRadius;
        particle.targetY = particle.y - Math.sin(angle) * interactionRadius;
      } else {
        if (Math.random() < 0.01) {
          particle.targetX = Math.random() * dimensions.width;
          particle.targetY = Math.random() * dimensions.height;
        }
      }

      particle.x = lerp(particle.x, particle.targetX, speedFactor * particle.speed);
      particle.y = lerp(particle.y, particle.targetY, speedFactor * particle.speed);

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 0, ${particle.alpha})`;
      ctx.fill();

      // Draw connections
      particles.forEach(otherParticle => {
        const connectionDistance = calculateDistance(
          particle.x,
          particle.y,
          otherParticle.x,
          otherParticle.y
        );
        if (connectionDistance < interactionRadius / 2) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          const alpha = (1 - connectionDistance / (interactionRadius / 2)) * 0.2;
          ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
          ctx.stroke();
        }
      });

      return particle;
    });

    setParticles(updatedParticles);
  });

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default InteractiveCanvas;

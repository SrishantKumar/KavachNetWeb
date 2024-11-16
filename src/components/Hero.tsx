import React, { useEffect, useState } from 'react';
import InteractiveCanvas from './InteractiveCanvas';
import { theme } from '../styles/theme';
import { useMousePosition } from '../utils/animations';
import logo from '../assets/logo.png';

const Hero = () => {
  const [text, setText] = useState('');
  const fullText = 'Secure Your Digital World';
  const mousePosition = useMousePosition();
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setGlowPosition({
      x: mousePosition.x,
      y: mousePosition.y,
    });
  }, [mousePosition]);

  const handleGetStarted = () => {
    const cipherToolSection = document.getElementById('cipher-tool');
    if (cipherToolSection) {
      cipherToolSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <InteractiveCanvas
        particleCount={100}
        particleSize={2}
        interactionRadius={150}
        speedFactor={0.08}
      />
      
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 200px at ${glowPosition.x}px ${glowPosition.y}px, 
            rgba(255, 0, 0, 0.15),
            transparent 70%)`
        }}
      />

      <div className="relative z-10 text-center p-8">
        <div className="mb-8 transform hover:scale-105 transition-all duration-300">
          <img
            src={logo}
            alt="कवचNet Logo"
            className="w-40 h-40 mx-auto animate-float filter drop-shadow-glow"
          />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-8 relative transform hover:scale-105 transition-all duration-300">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-gradient">
            कवचNet
          </span>
        </h1>
        
        <div className="relative inline-block">
          <p className="text-2xl md:text-4xl text-white mb-8 typewriter-text">
            {text}
            <span className="animate-blink">|</span>
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGetStarted}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg
              transform hover:scale-105 transition-all duration-300 hover:shadow-glow
              relative overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 
              transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
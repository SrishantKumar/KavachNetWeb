import React, { useState, useEffect } from 'react';
import InteractiveCanvas from './InteractiveCanvas';
import { useMousePosition } from '../utils/animations';

const Testimonials = () => {
  const mousePosition = useMousePosition();
  const [scrambledTexts, setScrambledTexts] = useState<string[]>([]);
  
  const testimonials = [
    {
      text: "Best encryption tool I've ever used!",
      author: "Sarah Chen",
      role: "Security Engineer"
    },
    {
      text: "Incredibly intuitive and powerful.",
      author: "Alex Rodriguez",
      role: "Software Developer"
    },
    {
      text: "Perfect for learning cryptography.",
      author: "Michael Park",
      role: "Student"
    }
  ];

  const scrambleText = (text: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    return text
      .split('')
      .map(char => char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)])
      .join('');
  };

  useEffect(() => {
    const initialScrambled = testimonials.map(t => scrambleText(t.text));
    setScrambledTexts(initialScrambled);

    const intervals = testimonials.map((_, index) => {
      let iteration = 0;
      
      return setInterval(() => {
        setScrambledTexts(prev => {
          const newTexts = [...prev];
          const originalText = testimonials[index].text;
          
          if (iteration >= originalText.length) {
            clearInterval(intervals[index]);
            newTexts[index] = originalText;
          } else {
            newTexts[index] = originalText.substring(0, iteration) +
              scrambleText(originalText.substring(iteration));
            iteration += 1/3;
          }
          
          return newTexts;
        });
      }, 30);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <section id="testimonials" className="relative min-h-screen py-20 px-4 overflow-hidden">
      <InteractiveCanvas
        particleCount={60}
        particleSize={1.5}
        interactionRadius={120}
        speedFactor={0.06}
      />
      
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 180px at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(255, 0, 0, 0.12),
            transparent 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-gradient">
            What Our Users Say
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-red-500/20
                transform hover:scale-105 transition-all duration-300 hover:shadow-glow
                overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 
                group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <p className="text-xl text-gray-300 mb-6 font-mono">
                  {scrambledTexts[index] || testimonial.text}
                </p>
                <div className="border-t border-red-500/20 pt-4">
                  <p className="text-red-500 font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
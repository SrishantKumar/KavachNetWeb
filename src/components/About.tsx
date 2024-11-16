import React from 'react';
import { Shield, Lock, Key } from 'lucide-react';
import InteractiveCanvas from './InteractiveCanvas';
import { useMousePosition } from '../utils/animations';

const About = () => {
  const mousePosition = useMousePosition();

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Advanced Security",
      description: "State-of-the-art encryption algorithms to protect your sensitive data"
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: "Real-time Protection",
      description: "Instant encryption and decryption with live preview"
    },
    {
      icon: <Key className="w-12 h-12" />,
      title: "Threat Detection",
      description: "Analyze decrypted messages for a variety of Threat Level"
    }
  ];

  return (
    <section id="about" className="relative min-h-screen py-20 px-4 overflow-hidden">
      <InteractiveCanvas
        particleCount={75}
        particleSize={1.8}
        interactionRadius={130}
        speedFactor={0.07}
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
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-gradient">
              About कवचNet
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your trusted companion in the world of cybersecurity, providing cutting-edge
            encryption tools and protection mechanisms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-red-500/20
                transform hover:scale-105 transition-all duration-300 hover:shadow-glow
                overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 
                group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="text-red-500 mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-red-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
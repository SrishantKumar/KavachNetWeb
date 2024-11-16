import React, { useEffect, useState } from 'react';
import MatrixBackground from './components/MatrixBackground';
import ParticleFountain from './components/ParticleFountain';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import CipherTool from './components/CipherTool';
import EncryptionTool from './components/EncryptionTool';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Team from './components/Team';
import Download from './components/Download';
import { useMousePosition } from './utils/animations';

const App = () => {
  const mousePosition = useMousePosition();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress(currentScroll / totalScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/20 z-50">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-700"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Mouse Glow Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(255, 0, 0, 0.08),
            transparent 70%)`
        }}
      />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-gray-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(50,0,0,0.2),_rgba(0,0,0,0.9))]" />
        <MatrixBackground />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <section id="home">
            <Hero />
          </section>

          <About />

          <HowItWorks />

          <section id="encryption-tool" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-primary">
                Encrypt Your Message
              </h2>
              <EncryptionTool />
            </div>
          </section>

          <section id="cipher-tool" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-primary">
                Decrypt Your Message
              </h2>
              <CipherTool />
            </div>
          </section>

          <Testimonials />
          <Download />
          <Team />
          <Contact />
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-red-500/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            2024 कवचNet. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Made with ❤️ by Team DefendX
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
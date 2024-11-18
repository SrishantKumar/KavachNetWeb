import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { LogIn } from 'lucide-react';
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
import CollaborationSpace from './components/CollaborationSpace';
import { useMousePosition } from './utils/animations';

// Home Page Component
const HomePage = () => {
  const mousePosition = useMousePosition();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [user] = useAuthState(auth);

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
        <ParticleFountain />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <About />
        <HowItWorks />
        <EncryptionTool />
        <CipherTool />

        {/* Collaboration Section */}
        <section id="collaboration" className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto relative">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">
              Secure Collaboration Space
            </h2>
            {user ? (
              <CollaborationSpace />
            ) : (
              <div className="text-center p-8 bg-black/30 backdrop-blur-md rounded-lg border border-red-500/10">
                <p className="text-gray-400 mb-6">
                  Please sign in to access the collaboration space.
                </p>
                <button
                  onClick={() => {
                    const provider = new GoogleAuthProvider();
                    signInWithPopup(auth, provider);
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <LogIn size={18} />
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}
          </div>
        </section>

        <Download />
        <Testimonials />
        <Team />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-red-500/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            2024 कवचNet. All rights reserved Team DefendX.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Made with ❤️ by Team DefendX
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
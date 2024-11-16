import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const mainMenuItems = [
    { label: 'Home', href: '#home' },
    { label: 'Downloads', href: '#downloads' },
    { label: 'Decryption', href: '#cipher-tool' },
  ];

  const allMenuItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Encryption', href: '#encryption' },
    { label: 'Decryption', href: '#cipher-tool' },
    { label: 'Downloads', href: '#downloads' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setIsOpen(false);
  };

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Add custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful:', result.user);
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this website to sign in with Google');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Sign-in cancelled by user');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup closed by user');
      } else {
        alert('Error signing in: ' + error.message);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCollabClick = () => {
    const element = document.querySelector('#collaboration');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (user) {
      navigate('/collaboration');
    } else {
      handleSignIn();
    }
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={logo} 
                alt="कवचNet Logo" 
                className="h-10 w-auto mr-2 brightness-100 filter-none"
              />
              <a href="#" className="text-primary font-bold text-xl">कवचNet</a>
            </div>
            
            {/* Right side menu items and hamburger */}
            <div className="flex items-center space-x-6">
              {/* Main visible menu items */}
              <div className="hidden md:flex items-center space-x-6">
                {mainMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-300 hover:text-primary transition-colors relative group"
                  >
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </button>
                ))}

                {/* Collaboration Button */}
                <button
                  onClick={handleCollabClick}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <Users size={18} />
                  <span>Collaborate</span>
                </button>

                {/* Auth Button */}
                {loading ? (
                  <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                ) : user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center space-x-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
              
              {/* Hamburger menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white p-2 transition-colors duration-200 md:hidden"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-black/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 space-y-4">
          {allMenuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="block w-full text-left text-gray-300 hover:text-primary py-2 transition-colors"
            >
              {item.label}
            </button>
          ))}
          
          {/* Mobile Auth Buttons */}
          <div className="pt-4 border-t border-gray-800">
            {loading ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              </div>
            ) : user ? (
              <>
                <button
                  onClick={handleCollabClick}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors mb-4"
                >
                  <Users size={18} />
                  <span>Collaborate</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
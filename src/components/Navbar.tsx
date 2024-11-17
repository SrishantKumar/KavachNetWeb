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
    { label: 'Decryption', href: '#decryption' },
  ];

  const allMenuItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Encryption', href: '#encryption' },
    { label: 'Decryption', href: '#decryption' },
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
      
      switch (error.code) {
        case 'auth/operation-not-allowed':
          alert('Error: Google Sign-In is not enabled in Firebase Console. Please contact the administrator.');
          break;
        case 'auth/popup-blocked':
          alert('Error: Please allow popups for this website to sign in with Google');
          break;
        case 'auth/cancelled-popup-request':
          console.log('Sign-in cancelled by user');
          break;
        case 'auth/popup-closed-by-user':
          console.log('Sign-in popup closed by user');
          break;
        case 'auth/unauthorized-domain':
          alert('Error: This domain is not authorized in Firebase Console. Please contact the administrator.');
          break;
        default:
          alert(`Error signing in: ${error.message}`);
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
              <div className="hidden lg:flex items-center space-x-6">
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
              </div>

              {/* Auth and Collab Buttons */}
              <div className="hidden lg:flex items-center space-x-4">
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
              
              {/* Hamburger menu button - now visible on all screens */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-red-500 p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 relative group"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 top-3' : 'top-1'}`} />
                  <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out top-3 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 top-3' : 'top-5'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 z-40
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out menu - now with desktop styling */}
      <div 
        className={`fixed top-0 right-0 h-full w-[300px] lg:w-[350px] bg-gradient-to-b from-black/95 to-gray-900/95 backdrop-blur-xl transform transition-all duration-300 ease-in-out z-50 border-l border-red-500/10
          ${isOpen ? 'translate-x-0 shadow-2xl shadow-red-500/5' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20 scrollbar-track-transparent">
            <div className="space-y-1">
              {allMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left text-gray-300 hover:text-red-500 hover:bg-red-500/5 py-3 px-4 rounded-md transition-all duration-200 relative group"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full opacity-50"></span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile and Desktop Auth Buttons */}
          <div className="p-6 border-t border-gray-800/50">
            {loading ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              </div>
            ) : user ? (
              <>
                <button
                  onClick={handleCollabClick}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-lg hover:shadow-red-500/20 mb-4"
                >
                  <Users size={18} />
                  <span>Collaborate</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-red-500 py-2 px-4 rounded-md hover:bg-red-500/5 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-red-500 py-2 px-4 rounded-md hover:bg-red-500/5 transition-all duration-200"
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
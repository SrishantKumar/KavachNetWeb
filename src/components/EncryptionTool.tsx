import React, { useState } from 'react';
import { useMousePosition } from '../utils/animations';
import InteractiveCanvas from './InteractiveCanvas';
import { Lock, Unlock, RefreshCw } from 'lucide-react';

const EncryptionTool = () => {
  const [input, setInput] = useState('');
  const [shift, setShift] = useState(3);
  const [encryptedText, setEncryptedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const mousePosition = useMousePosition();

  const encrypt = (text: string, shift: number): string => {
    return text
      .split('')
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;
          return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
      })
      .join('');
  };

  const handleEncrypt = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (isAutoMode) {
        // In auto mode, use a random shift between 1-25
        const randomShift = Math.floor(Math.random() * 25) + 1;
        setShift(randomShift);
        const result = encrypt(input, randomShift);
        setEncryptedText(result);
      } else {
        const result = encrypt(input, shift);
        setEncryptedText(result);
      }
      setIsProcessing(false);
    }, 500); // Artificial delay for effect
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(encryptedText);
  };

  return (
    <section id="encryption" className="relative min-h-screen flex items-center justify-center py-20 px-4">
      <InteractiveCanvas
        particleCount={80}
        particleSize={2}
        interactionRadius={150}
        speedFactor={0.08}
      />
      
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 180px at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(255, 0, 0, 0.12),
            transparent 70%)`
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
            Encrypt Your Message
          </h2>
          <p className="text-gray-300 text-lg">
            Use our Caesar cipher encryption tool to secure your messages
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-2xl">
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Enter your message:</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 px-4 py-2 bg-black/50 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Type your message here..."
            />
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAutoMode}
                onChange={(e) => setIsAutoMode(e.target.checked)}
                className="form-checkbox text-red-500 rounded border-white/20"
              />
              <span className="text-gray-300">Auto-generate shift</span>
            </label>

            {!isAutoMode && (
              <div className="flex items-center space-x-2">
                <label className="text-gray-300">Shift value (1-25):</label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={shift}
                  onChange={(e) => setShift(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-black/50 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleEncrypt}
            disabled={isProcessing || !input}
            className={`w-full py-3 rounded-lg font-medium mb-6 transition-all duration-300 flex items-center justify-center
              ${isProcessing || !input
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Encrypting...
              </span>
            ) : (
              <>
                {isAutoMode ? <RefreshCw className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                {isAutoMode ? 'Auto Encrypt' : 'Encrypt Message'}
              </>
            )}
          </button>

          {encryptedText && (
            <div className="mt-6">
              <label className="block text-gray-300 mb-2">Encrypted message:</label>
              <div className="relative">
                <textarea
                  readOnly
                  value={encryptedText}
                  className="w-full h-32 px-4 py-2 bg-black/50 text-green-400 font-mono rounded-lg"
                />
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
              {isAutoMode && (
                <p className="text-gray-400 mt-2 text-sm">
                  Shift value used: {shift}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EncryptionTool;

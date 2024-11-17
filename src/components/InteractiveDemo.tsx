import React, { useState } from 'react';
import { Lock, Unlock, RefreshCw } from 'lucide-react';

const InteractiveDemo = () => {
  const [inputText, setInputText] = useState('');
  const [shift, setShift] = useState(3);
  const [encryptedText, setEncryptedText] = useState('');
  const [isAutoMode, setIsAutoMode] = useState(false);

  const caesarCipher = (text: string, shift: number): string => {
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
    if (isAutoMode) {
      // Simulate auto-detection of shift
      const detectedShift = Math.floor(Math.random() * 25) + 1;
      setShift(detectedShift);
      setEncryptedText(caesarCipher(inputText, detectedShift));
    } else {
      setEncryptedText(caesarCipher(inputText, shift));
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
      <h3 className="text-2xl font-bold text-white mb-6">Try It Now!</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Enter your message:</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-black/30 text-white rounded-lg p-3 border border-white/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            rows={3}
            placeholder="Type something to encrypt..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAutoMode}
              onChange={(e) => setIsAutoMode(e.target.checked)}
              className="form-checkbox text-red-500 rounded border-white/20"
            />
            <span className="text-gray-300">Auto-detect shift</span>
          </label>

          {!isAutoMode && (
            <div className="flex items-center space-x-2">
              <label className="text-gray-300">Shift:</label>
              <input
                type="number"
                value={shift}
                onChange={(e) => setShift(parseInt(e.target.value) || 0)}
                className="w-20 bg-black/30 text-white rounded p-1 border border-white/20"
                min="1"
                max="25"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleEncrypt}
          className="flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-medium hover:from-red-600 hover:to-red-800 transition-all duration-300"
        >
          {isAutoMode ? <RefreshCw className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
          {isAutoMode ? 'Auto Encrypt' : 'Encrypt Message'}
        </button>

        {encryptedText && (
          <div>
            <label className="block text-gray-300 mb-2">Encrypted result:</label>
            <div className="bg-black/30 text-white rounded-lg p-3 border border-white/20">
              {encryptedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveDemo;

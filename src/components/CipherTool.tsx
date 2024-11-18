import React, { useState, useEffect } from 'react';
import InteractiveCanvas from './InteractiveCanvas';
import { useMousePosition } from '../utils/animations';
import { Lock, Unlock } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { useDecryptionHistory } from '../hooks/useDecryptionHistory';
import { analyzeThreat } from '../utils/threatAnalysis';

interface CipherToolProps {
  /**
   * The initial message to be decrypted.
   */
  initialMessage?: string;
}

const CipherTool: React.FC<CipherToolProps> = ({ initialMessage }) => {
  const [input, setInput] = useState(initialMessage || '');
  const [decryptedText, setDecryptedText] = useState('');
  const [shift, setShift] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [threatAnalysis, setThreatAnalysis] = useState<any>(null);
  const mousePosition = useMousePosition();
  const [user] = useAuthState(auth);
  const { addDecryptionHistory } = useDecryptionHistory();

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
      handleDecrypt();
    }
  }, [initialMessage]);

  // Common English words for validation
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he',
    'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
    'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
    'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
    'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
    'day', 'most', 'us', 'is', 'was', 'were', 'are', 'been', 'has', 'had', 'did', 'doing', 'does', 'done'
  ]);

  // English letter frequency
  const letterFrequency: { [key: string]: number } = {
    'e': 12.7, 't': 9.1, 'a': 8.2, 'o': 7.5, 'i': 7.0, 'n': 6.7, 's': 6.3,
    'h': 6.1, 'r': 6.0, 'd': 4.3, 'l': 4.0, 'c': 2.8, 'u': 2.8, 'm': 2.4,
    'w': 2.4, 'f': 2.2, 'g': 2.0, 'y': 2.0, 'p': 1.9, 'b': 1.5, 'v': 1.0,
    'k': 0.8, 'j': 0.15, 'x': 0.15, 'q': 0.10, 'z': 0.07
  };

  const caesarDecrypt = (text: string, shift: number): string => {
    return text
      .split('')
      .map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;
          return String.fromCharCode(((code - base - shift + 26) % 26) + base);
        }
        return char;
      })
      .join('');
  };

  const scoreText = (text: string): number => {
    // Convert to lowercase for analysis
    const lowerText = text.toLowerCase();
    
    // Split into words and remove punctuation
    const words = lowerText.split(/[^a-z]+/).filter(word => word.length > 0);
    
    if (words.length === 0) return 0;

    // Calculate word score
    const commonWordCount = words.filter(word => commonWords.has(word)).length;
    const wordScore = (commonWordCount / words.length) * 100;

    // Calculate letter frequency score
    const letterCounts: { [key: string]: number } = {};
    let totalLetters = 0;

    lowerText.split('').forEach(char => {
      if (char.match(/[a-z]/)) {
        letterCounts[char] = (letterCounts[char] || 0) + 1;
        totalLetters++;
      }
    });

    let frequencyScore = 0;
    if (totalLetters > 0) {
      let totalDiff = 0;
      Object.keys(letterFrequency).forEach(letter => {
        const expectedFreq = letterFrequency[letter];
        const actualFreq = ((letterCounts[letter] || 0) / totalLetters) * 100;
        totalDiff += Math.abs(expectedFreq - actualFreq);
      });
      frequencyScore = Math.max(0, 100 - (totalDiff / 2));
    }

    // Combine scores with weights
    const combinedScore = (wordScore * 0.6) + (frequencyScore * 0.4);
    
    // Bonus for longer texts
    const lengthBonus = Math.min(20, words.length / 2);
    
    return combinedScore + lengthBonus;
  };

  const handleDecrypt = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setThreatAnalysis(null);
    
    try {
      const results: { text: string; score: number; shift: number }[] = [];

      // Try all possible shifts (0-25)
      for (let shift = 0; shift < 26; shift++) {
        const decrypted = caesarDecrypt(input, shift);
        const score = scoreText(decrypted);
        results.push({ text: decrypted, score, shift });
      }

      // Sort by score in descending order
      results.sort((a, b) => b.score - a.score);

      // Get the best result
      const bestResult = results[0];
      
      if (bestResult.score > 20) { // Lower threshold for better detection
        setDecryptedText(bestResult.text);
        setShift(bestResult.shift);
        
        // Perform threat analysis
        try {
          const analysis = await analyzeThreat(bestResult.text);
          setThreatAnalysis(analysis);
          
          // Save to history if user is logged in
          if (user) {
            await addDecryptionHistory({
              userId: user.uid,
              encryptedText: input,
              decryptedText: bestResult.text,
              timestamp: new Date(),
              method: 'auto',
              analysis
            });
          }
        } catch (analysisError) {
          console.error('Error during threat analysis:', analysisError);
          setThreatAnalysis({
            threatLevel: 'low',
            score: 0,
            indicators: [],
            locations: [],
            timeIndicators: [],
            summary: 'Unable to perform threat analysis.',
            details: {
              sensitiveData: false,
              massImpact: false,
              infrastructure: false,
              timeProximity: false,
              coordinatedActivity: false
            }
          });
        }
      } else {
        // Try the top 3 results and check if any contain common words
        const validResult = results.slice(0, 3).find(result => 
          result.text.toLowerCase().split(/\s+/).some(word => commonWords.has(word))
        );
        
        if (validResult) {
          setDecryptedText(validResult.text);
          setShift(validResult.shift);
          // Perform threat analysis for the valid result
          const analysis = await analyzeThreat(validResult.text);
          setThreatAnalysis(analysis);
        } else {
          setDecryptedText('Unable to decrypt. Please check if the text is encrypted using Caesar cipher.');
        }
      }
    } catch (error) {
      console.error('Error during decryption:', error);
      setDecryptedText('An error occurred during decryption.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="decryption" className="py-20 px-4 relative">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(239, 68, 68, 0.2), transparent 80%)`
        }}
      />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-500 to-red-600">
              Caesar Cipher Decryption Tool
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Decrypt messages encoded with Caesar cipher
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto p-4 space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter encrypted text..."
                className="w-full h-32 p-4 bg-black/30 backdrop-blur-sm text-white rounded-lg border border-red-500/20 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-gray-400">
                <Lock size={16} />
                <span className="text-sm">{input.length} characters</span>
              </div>
            </div>

            {/* Decrypt Button */}
            <button
              onClick={handleDecrypt}
              disabled={loading || !input.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition-colors"
            >
              <Unlock size={18} />
              <span>Decrypt</span>
            </button>
          </div>

          {/* Processing Animation */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          )}

          {/* Results Section */}
          {decryptedText && (
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-red-500/20">
              <h3 className="text-lg font-semibold text-red-500 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Unlock size={20} className="mr-2" />
                  Decrypted Text
                </div>
                {shift !== null && (
                  <span className="text-sm font-normal text-red-400">
                    Shift: {shift}
                  </span>
                )}
              </h3>
              <p className="text-white whitespace-pre-wrap">{decryptedText}</p>
            </div>
          )}
          {threatAnalysis && (
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-red-500/20">
              <h3 className="text-lg font-semibold text-red-500 mb-4 flex items-center">
                <span className="mr-2">⚠️</span>
                Threat Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Threat Level:</span>
                  <span className={`px-3 py-1 rounded-full text-white ${
                    {
                      'low': 'bg-green-500',
                      'medium': 'bg-yellow-500',
                      'high': 'bg-orange-500',
                      'critical': 'bg-red-500'
                    }[threatAnalysis.threatLevel]
                  }`}>
                    {threatAnalysis.threatLevel.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Summary:</p>
                  <p className="text-white">{threatAnalysis.summary}</p>
                </div>

                {threatAnalysis.indicators.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Threat Indicators:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {threatAnalysis.indicators.map((indicator: any, index: number) => (
                        <li key={index} className="text-white">
                          {indicator.word} ({indicator.category}) - {indicator.context}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {threatAnalysis.locations.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Locations Mentioned:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {threatAnalysis.locations.map((location: any, index: number) => (
                        <li key={index} className="text-white">
                          {location.name} - {location.context}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {threatAnalysis.timeIndicators.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Time Indicators:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {threatAnalysis.timeIndicators.map((time: any, index: number) => (
                        <li key={index} className="text-white">
                          {time.raw} - {time.context}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-2">Details:</p>
                    <ul className="space-y-1">
                      {Object.entries(threatAnalysis.details).map(([key, value]: [string, any]) => (
                        <li key={key} className="flex items-center">
                          <span className={`w-4 h-4 rounded-full mr-2 ${value ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Threat Score:</p>
                    <div className="text-2xl font-bold text-red-500">
                      {Math.round(threatAnalysis.score)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CipherTool;
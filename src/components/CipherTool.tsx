import React, { useState, useEffect } from 'react';
import InteractiveCanvas from './InteractiveCanvas';
import { useMousePosition } from '../utils/animations';
import { Lock, Unlock, Zap, Search, Clock, MapPin, AlertTriangle } from 'lucide-react';

interface ClueAnalysis {
  dates: string[];
  locations: string[];
  actions: string[];
  keywords: string[];
  threatLevel: 'low' | 'medium' | 'high';
  timeline: string;
  strategy: string;
  context: string[];
  patterns: {
    type: string;
    description: string;
    confidence: number;
  }[];
}

const CipherTool = () => {
  const [input, setInput] = useState('');
  const [shift, setShift] = useState(3);
  const [manualDecryption, setManualDecryption] = useState('');
  const [autoDecryptions, setAutoDecryptions] = useState<string[]>([]);
  const [bestDecryption, setBestDecryption] = useState('');
  const [clueAnalysis, setClueAnalysis] = useState<ClueAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mousePosition = useMousePosition();

  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const charsetLength = charset.length;

  const caesarDecrypt = (text: string, shift: number): string => {
    return text
      .split('')
      .map(char => {
        const index = charset.indexOf(char);
        if (index === -1) return char;
        
        const newIndex = (index - shift + charsetLength) % charsetLength;
        return charset[newIndex];
      })
      .join('');
  };

  const commonPatterns = {
    words: [
      // Very common words (weight: 3)
      { pattern: /\b(the|be|to|of|and|a|in|that|have|i|it|for|not|on|with|he|as|you|do|at)\b/gi, weight: 3 },
      // Common words (weight: 2)
      { pattern: /\b(this|but|his|by|from|they|we|say|her|she|or|an|will|my|one|all|would|there|their)\b/gi, weight: 2 },
      // Technical terms (weight: 2)
      { pattern: /\b(bomb|threat|attack|security|emergency|alert|warning|danger|critical|urgent)\b/gi, weight: 2 },
      // Location indicators (weight: 2)
      { pattern: /\b(in|at|near|around|inside|outside|behind|front|building|room)\b/gi, weight: 2 }
    ],
    // Common word endings (weight: 1)
    suffixes: [
      { pattern: /(?:ing|ed|ly|tion|ment|ness|ous|ful|less|able|ible)$/gi, weight: 1 }
    ],
    // Common word beginnings (weight: 1)
    prefixes: [
      { pattern: /^(?:un|re|in|im|dis|pre|pro|con|com|ex|en|em|de|sub|sup|trans|inter|intra)(?=[a-z])/gi, weight: 1 }
    ],
    // Common bigrams (weight: 1)
    bigrams: [
      { pattern: /\b(?:of the|in the|to the|on the|for the|with the|at the|is a|from the|by the)\b/gi, weight: 1 }
    ]
  };

  const scoreText = (text: string): number => {
    let score = 0;
    
    // Word pattern scoring
    commonPatterns.words.forEach(({ pattern, weight }) => {
      const matches = text.match(pattern) || [];
      score += matches.length * weight;
    });

    // Suffix scoring
    commonPatterns.suffixes.forEach(({ pattern, weight }) => {
      const matches = text.match(pattern) || [];
      score += matches.length * weight;
    });

    // Prefix scoring
    commonPatterns.prefixes.forEach(({ pattern, weight }) => {
      const matches = text.match(pattern) || [];
      score += matches.length * weight;
    });

    // Bigram scoring
    commonPatterns.bigrams.forEach(({ pattern, weight }) => {
      const matches = text.match(pattern) || [];
      score += matches.length * weight;
    });

    // Character frequency analysis
    const charFreq = new Map<string, number>();
    const totalChars = text.length;
    text.toLowerCase().split('').forEach(char => {
      charFreq.set(char, (charFreq.get(char) || 0) + 1);
    });

    // English letter frequency scoring
    const englishFreq = new Map([
      ['e', 12.7], ['t', 9.1], ['a', 8.2], ['o', 7.5], ['i', 7.0],
      ['n', 6.7], ['s', 6.3], ['h', 6.1], ['r', 6.0], ['d', 4.3],
      ['l', 4.0], ['u', 2.8], ['c', 2.8], ['m', 2.4], ['w', 2.4],
      ['f', 2.2], ['g', 2.0], ['y', 2.0], ['p', 1.9], ['b', 1.5]
    ]);

    englishFreq.forEach((expectedFreq, char) => {
      const actualFreq = ((charFreq.get(char) || 0) / totalChars) * 100;
      score += (1 - Math.abs(expectedFreq - actualFreq) / expectedFreq) * 2;
    });

    // Sentence structure scoring
    const sentences = text.match(/[.!?]+\s+[A-Z][a-z]+/g) || [];
    score += sentences.length * 2;

    // Capitalization scoring
    const properNouns = text.match(/[A-Z][a-z]+/g) || [];
    score += properNouns.length;

    // Punctuation scoring
    const punctuation = text.match(/[,.!?;:]/g) || [];
    score += punctuation.length * 0.5;

    // Context-specific scoring for security-related content
    const securityTerms = /\b(bomb|threat|attack|urgent|emergency)\b/gi;
    const securityMatches = text.match(securityTerms) || [];
    score += securityMatches.length * 5; // High weight for security terms

    return score;
  };

  const commonWords = [
    // Common English words
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    // Technical terms
    'data', 'file', 'code', 'key', 'encrypt', 'decrypt', 'secure', 'password',
    'system', 'access', 'user', 'network', 'server', 'client', 'protocol',
    // Common patterns
    'http', 'https', 'www', 'com', 'org', 'net', 'gov', 'edu'
  ];

  const analyzeText = (text: string): ClueAnalysis => {
    // Enhanced date and time patterns
    const dateTimePatterns = [
      // Numeric dates
      { 
        pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
        type: 'date'
      },
      { 
        pattern: /\b\d{4}-\d{2}-\d{2}\b/g, // YYYY-MM-DD
        type: 'date'
      },
      // Written dates with numbers
      { 
        pattern: /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?\b/gi,
        type: 'date'
      },
      // Written dates with written numbers
      {
        pattern: /\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty-first|twenty-second|twenty-third|twenty-fourth|twenty-fifth|twenty-sixth|twenty-seventh|twenty-eighth|twenty-ninth|thirtieth|thirty-first)\s+(?:of\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s*,?\s*\d{4})?\b/gi,
        type: 'date'
      },
      // Time patterns
      {
        pattern: /\b(?:(?:0?[1-9]|1[0-2])[:.](?:[0-5][0-9])(?:\s*[AaPp][Mm])?|\d{1,2}\s*[AaPp][Mm])\b/g, // 12-hour format
        type: 'time'
      },
      {
        pattern: /\b(?:[01]?[0-9]|2[0-3])[:.](?:[0-5][0-9])(?:\s*(?:hours|hrs))?\b/g, // 24-hour format
        type: 'time'
      },
      // Written times
      {
        pattern: /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+o'?clock\b/gi,
        type: 'time'
      },
      // Time periods
      {
        pattern: /\b(?:morning|afternoon|evening|night|midnight|noon)\b/gi,
        type: 'period'
      },
      // Relative time
      {
        pattern: /\b(?:today|tomorrow|tonight|yesterday)\b/gi,
        type: 'relative'
      }
    ];

    // Number word to digit mapping
    const numberWords: { [key: string]: number } = {
      'one': 1, 'first': 1,
      'two': 2, 'second': 2,
      'three': 3, 'third': 3,
      'four': 4, 'fourth': 4,
      'five': 5, 'fifth': 5,
      'six': 6, 'sixth': 6,
      'seven': 7, 'seventh': 7,
      'eight': 8, 'eighth': 8,
      'nine': 9, 'ninth': 9,
      'ten': 10, 'tenth': 10,
      'eleven': 11, 'eleventh': 11,
      'twelve': 12, 'twelfth': 12,
      'thirteen': 13, 'thirteenth': 13,
      'fourteen': 14, 'fourteenth': 14,
      'fifteen': 15, 'fifteenth': 15,
      'sixteen': 16, 'sixteenth': 16,
      'seventeen': 17, 'seventeenth': 17,
      'eighteen': 18, 'eighteenth': 18,
      'nineteen': 19, 'nineteenth': 19,
      'twenty': 20, 'twentieth': 20
    };

    // Month word to number mapping
    const monthWords: { [key: string]: number } = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4,
      'may': 5, 'june': 6, 'july': 7, 'august': 8,
      'september': 9, 'october': 10, 'november': 11, 'december': 12
    };

    // Function to convert written time to 24-hour format
    const parseWrittenTime = (timeStr: string): string => {
      timeStr = timeStr.toLowerCase();
      let hour = 0;
      let period = '';

      // Extract hour from words
      for (const [word, num] of Object.entries(numberWords)) {
        if (timeStr.includes(word)) {
          hour = num;
          break;
        }
      }

      // Determine period
      if (timeStr.includes('morning') || timeStr.includes('am')) period = 'AM';
      else if (timeStr.includes('afternoon') || timeStr.includes('evening') || timeStr.includes('pm')) period = 'PM';
      else if (timeStr.includes('night')) period = 'PM';

      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      return `${hour.toString().padStart(2, '0')}:00`;
    };

    // Function to convert written date to standardized format
    const parseWrittenDate = (dateStr: string): string => {
      dateStr = dateStr.toLowerCase();
      let month = 0;
      let day = 0;
      let year = new Date().getFullYear(); // Default to current year if not specified

      // Extract month
      for (const [word, num] of Object.entries(monthWords)) {
        if (dateStr.includes(word)) {
          month = num;
          break;
        }
      }

      // Extract day
      for (const [word, num] of Object.entries(numberWords)) {
        if (dateStr.includes(word)) {
          day = num;
          break;
        }
      }

      // Extract year if present
      const yearMatch = dateStr.match(/\d{4}/);
      if (yearMatch) {
        year = parseInt(yearMatch[0]);
      }

      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };

    // Extract all date and time references
    const dateTimeRefs = dateTimePatterns.flatMap(({ pattern, type }) => {
      const matches = text.match(pattern) || [];
      return matches.map(match => {
        let standardized = match;
        if (type === 'time' && match.toLowerCase().includes('o\'clock')) {
          standardized = parseWrittenTime(match);
        } else if (type === 'date' && /[a-zA-Z]/.test(match)) {
          standardized = parseWrittenDate(match);
        }
        return { original: match, standardized, type };
      });
    });

    // Combine date and time references into a timeline
    const timelineEvents = dateTimeRefs.reduce((events: string[], ref) => {
      if (ref.type === 'date') {
        // Look for associated time references nearby in the text
        const timeRefs = dateTimeRefs.filter(t => t.type === 'time');
        if (timeRefs.length > 0) {
          timeRefs.forEach(timeRef => {
            events.push(`${ref.standardized} ${timeRef.standardized} - "${ref.original} at ${timeRef.original}"`);
          });
        } else {
          events.push(`${ref.standardized} - "${ref.original}"`);
        }
      }
      return events;
    }, []);

    // If no specific dates found, look for relative time references
    if (timelineEvents.length === 0) {
      const relativeRefs = dateTimeRefs.filter(ref => ref.type === 'relative' || ref.type === 'period');
      if (relativeRefs.length > 0) {
        timelineEvents.push(...relativeRefs.map(ref => `Relative time: ${ref.original}`));
      }
    }

    // Tripura Educational Institutions (with variations)
    const tripuraInstitutions = [
      'NIT Agartala',
      'National Institute of Technology Agartala',
      'NIT, Agartala',
      'N.I.T. Agartala',
      'NIT-Agartala',
      'NITA',
      'Barjala, Jirania',
      'Jirania',
    ];

    // Tripura Cities and Areas
    const tripuraCities = [
      'Agartala',
      'Dharmanagar',
      'Udaipur',
      'Kailashahar',
      'Ambassa',
      'Khowai',
      'Teliamura',
      'Melaghar',
      'Belonia',
      'Sabroom',
      'Barjala',
      'Jirania',
      'Old Agartala',
      'Ranirbazar',
      'Jogendranagar',
      'Badharghat',
      'Bishramganj',
      'Mohanpur',
      'Amarpur',
      'Kamalpur'
    ];

    // Tripura Landmarks
    const tripuraLandmarks = [
      'Ujjayanta Palace',
      'Neermahal',
      'Unakoti',
      'Tripura Sundari Temple',
      'Sepahijala Wildlife Sanctuary',
      'Dumboor Lake',
      'Jampui Hills',
      'Cloudtail Hills',
      'Heritage Park',
      'College Tilla',
      'Maharaja Bir Bikram College',
      'Tripura University',
      'ICFAI University',
      'Agartala Airport',
      'MBB College',
      'Agartala Railway Station',
      'Agartala City Center',
      'Buddha Temple',
      'Fourteen Gods Temple',
      'Chaturdash Devata Temple'
    ];

    // Function to create a case-insensitive pattern from array of terms
    const createLocationPattern = (terms: string[]) => {
      const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      return new RegExp(`\\b(?:${escapedTerms.join('|')})\\b`, 'i');
    };

    // Create patterns from our location lists
    const locationPatterns = [
      // Tripura specific patterns
      createLocationPattern(tripuraInstitutions),
      createLocationPattern(tripuraCities),
      createLocationPattern(tripuraLandmarks),
      
      // Campus-specific patterns
      /\b(?:Block|Building|Campus|Wing|Gate|Hostel|Lab|Library|Auditorium|Canteen|Ground|Department)\s+[A-Za-z0-9-]+\b/i,
      /\b(?:Room|Hall|Floor|Office)\s+[A-Za-z0-9-]+\b/i,
      
      // Directional patterns
      /\b(?:North|South|East|West|Central)\s+(?:Block|Wing|Gate|Campus)\b/i,
      
      // Infrastructure patterns
      /\b(?:Server Room|Data Center|Control Room|Command Center|Security Office|Main Gate|Research Lab)\b/i,
      
      // Address patterns
      /\b(?:Barjala|Jirania|Agartala)\s+(?:Road|Highway|Street|Lane|Path|Avenue)\b/i,
      
      // Coordinate patterns
      /\b\d{1,2}°\s*[NS]\s*\d{1,2}°\s*[EW]\b/
    ];

    // Function to find all locations in text
    const findLocations = (text: string): string[] => {
      const locations = new Set<string>();
      
      // Direct match for NIT Agartala variations
      if (text.toLowerCase().includes('nit') && text.toLowerCase().includes('agartala')) {
        locations.add('NIT Agartala');
      }
      
      // Check all other patterns
      locationPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Clean up the match and add to locations
            const cleanMatch = match.trim();
            locations.add(cleanMatch);
            
            // If we find a building/room in NIT, add NIT Agartala as context
            if (cleanMatch.match(/\b(?:Block|Building|Room|Lab|Department)\b/i)) {
              locations.add('NIT Agartala');
            }
          });
        }
      });

      return Array.from(locations);
    };

    // Find actions (using existing patterns)
    const actionPatterns = [
      // Critical severity actions (immediate threat)
      { 
        pattern: /\b(?:bomb|explosive|detonate|blast|kill|murder|assassinate|eliminate|destroy)\b/i, 
        severity: 4,
        category: 'CRITICAL'
      },
      // High severity actions (potential violence)
      { 
        pattern: /\b(?:hack|breach|infiltrate|steal|hijack|kidnap|assault|attack|weapon|threat)\b/i, 
        severity: 3,
        category: 'HIGH'
      },
      // Medium severity actions (suspicious activity)
      { 
        pattern: /\b(?:access|compromise|execute|launch|target|exploit|disrupt|damage)\b/i, 
        severity: 2,
        category: 'MEDIUM'
      },
      // Low severity actions (reconnaissance)
      { 
        pattern: /\b(?:scan|probe|monitor|observe|gather|collect|survey|watch)\b/i, 
        severity: 1,
        category: 'LOW'
      }
    ];

    // Analyze actions and their severity
    const detectedActions = actionPatterns.flatMap(({ pattern, severity, category }) => {
      const matches = text.match(pattern) || [];
      return matches.map(match => ({
        action: match,
        severity,
        category
      }));
    });

    // Critical location patterns
    const criticalLocations = [
      'NIT Agartala',
      'National Institute of Technology',
      'Airport',
      'Railway Station',
      'Government',
      'Police',
      'Military',
      'Hospital',
      'School',
      'College',
      'University',
      'Temple',
      'Mosque',
      'Church'
    ];

    // Calculate enhanced threat level
    const maxSeverity = Math.max(...detectedActions.map(a => a.severity), 0);
    const hasCriticalKeywords = detectedActions.some(a => a.category === 'CRITICAL');
    const hasCriticalLocation = findLocations(text).some(loc => 
      criticalLocations.some(critical => 
        loc.toLowerCase().includes(critical.toLowerCase())
      )
    );
    
    // Determine threat level with more nuanced analysis
    let threatLevel: 'low' | 'medium' | 'high';
    if (hasCriticalKeywords && hasCriticalLocation) {
      threatLevel = 'high';
    } else if (hasCriticalKeywords || (maxSeverity >= 3 && hasCriticalLocation)) {
      threatLevel = 'high';
    } else if (maxSeverity >= 2 || hasCriticalLocation) {
      threatLevel = 'medium';
    } else {
      threatLevel = 'low';
    }

    // Generate detailed analysis
    const analysis = {
      dates: dateTimeRefs.filter(ref => ref.type === 'date').map(ref => ref.original),
      locations: findLocations(text),
      actions: detectedActions.map(a => a.action),
      keywords: text.match(/\b(?:password|credentials|key|token|secret|classified)\b/i) || [],
      threatLevel,
      timeline: timelineEvents.length > 0
        ? timelineEvents.join('\n')
        : 'No specific dates or times mentioned',
      strategy: `Detected ${detectedActions.length} suspicious actions. ${
        hasCriticalKeywords ? 'CRITICAL THREAT DETECTED' : 
        hasCriticalLocation ? 'Sensitive location identified' : 
        'Standard monitoring advised'
      }`,
      context: [
        ...findLocations(text),
        ...detectedActions.map(a => `${a.category} severity action: ${a.action}`),
        ...timelineEvents
      ],
      patterns: [
        ...detectedActions.map(a => ({
          type: a.category,
          description: `Detected "${a.action}" - ${a.category} severity action`,
          confidence: a.severity * 25
        })),
        ...dateTimeRefs.map(ref => ({
          type: 'TEMPORAL',
          description: `Detected ${ref.type}: ${ref.original}`,
          confidence: 90
        }))
      ]
    };

    return analysis;
  };

  const handleManualDecrypt = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const decrypted = caesarDecrypt(input, shift);
      setManualDecryption(decrypted);
      setClueAnalysis(analyzeText(decrypted));
      setIsProcessing(false);
    }, 500);
  };

  const handleAutoDecrypt = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Try different cipher methods
      const attempts = [
        // Caesar cipher with all possible shifts
        ...Array.from({ length: 26 }, (_, i) => ({
          method: 'Caesar',
          shift: i,
          text: caesarDecrypt(input, i)
        })),
        // ROT13 (special case of Caesar)
        {
          method: 'ROT13',
          shift: 13,
          text: caesarDecrypt(input, 13)
        },
        // Atbash cipher (reverse alphabet)
        {
          method: 'Atbash',
          shift: 0,
          text: input.split('').map(char => {
            if (char.match(/[A-Z]/)) {
              return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
            } else if (char.match(/[a-z]/)) {
              return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
            }
            return char;
          }).join('')
        }
      ];

      // Score each attempt
      const scored = attempts.map(attempt => ({
        ...attempt,
        score: scoreText(attempt.text)
      }));

      // Sort by score and get best results
      const bestResults = scored.sort((a, b) => b.score - a.score);
      const bestResult = bestResults[0];

      // Get top 5 unique results
      const uniqueResults = bestResults
        .filter((result, index, self) => 
          index === self.findIndex(r => r.text === result.text)
        )
        .slice(0, 5);

      setAutoDecryptions(uniqueResults.map(r => 
        `${r.text} (${r.method}${r.method === 'Caesar' ? `, shift: ${r.shift}` : ''})`
      ));
      setBestDecryption(bestResult.text);
      setClueAnalysis(analyzeText(bestResult.text));
      setShift(bestResult.method === 'Caesar' ? bestResult.shift : 0);
      setIsProcessing(false);

      // If high-confidence match found with security terms, trigger immediate analysis
      if (bestResult.score > 50 && /\b(bomb|threat|attack|urgent|emergency)\b/i.test(bestResult.text)) {
        setClueAnalysis(analyzeText(bestResult.text));
      }
    }, 800);
  };

  return (
    <section id="cipher-tool" className="relative min-h-screen py-20 px-4">
      <InteractiveCanvas
        particleCount={80}
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

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-700">
            Decryption Tool
          </span>
        </h2>

        <div className="space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter encrypted text..."
                className="w-full h-40 bg-black/30 text-white p-4 rounded-lg border border-red-500/20
                  focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none
                  backdrop-blur-sm resize-none"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-red-500 mb-2">Shift Value (0-25)</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={shift}
                  onChange={(e) => setShift(Math.min(25, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full p-3 bg-black/30 text-white rounded-lg border border-red-500/20
                    focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                />
              </div>
              
              <button
                onClick={handleManualDecrypt}
                disabled={isProcessing}
                className="w-full p-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg
                  transform hover:scale-105 transition-all duration-300 hover:shadow-glow
                  flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Unlock className="w-5 h-5" />
                Decrypt
              </button>
              
              <button
                onClick={handleAutoDecrypt}
                disabled={isProcessing}
                className="w-full p-3 border-2 border-red-600 text-white rounded-lg
                  transform hover:scale-105 transition-all duration-300 hover:bg-red-600/10
                  flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                Auto-Decrypt
              </button>
            </div>
          </div>

          {/* Results Section */}
          {(manualDecryption || bestDecryption) && (
            <div className="bg-black/30 p-6 rounded-lg border border-red-500/20 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-red-500 mb-4">Decryption Results</h3>
              
              {manualDecryption && (
                <div className="mb-4">
                  <h4 className="text-red-400 mb-2">Manual Decryption (Shift: {shift})</h4>
                  <p className="text-white bg-black/40 p-3 rounded-lg">{manualDecryption}</p>
                </div>
              )}
              
              {bestDecryption && (
                <div>
                  <h4 className="text-red-400 mb-2">Best Auto-Decryption Result</h4>
                  <p className="text-white bg-black/40 p-3 rounded-lg">{bestDecryption}</p>
                </div>
              )}
            </div>
          )}

          {/* Clue Analysis Section */}
          {clueAnalysis && (
            <div className="bg-black/30 p-6 rounded-lg border border-red-500/20 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-red-500 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Clue Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="text-red-400 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Threat Level
                    </h4>
                    <div className={`
                      inline-block px-3 py-1 rounded-full text-sm
                      ${clueAnalysis.threatLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                        clueAnalysis.threatLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'}
                    `}>
                      {clueAnalysis.threatLevel.toUpperCase()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-red-400 flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </h4>
                    <p className="text-gray-300">{clueAnalysis.timeline}</p>
                  </div>

                  <div>
                    <h4 className="text-red-400 flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      Locations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {clueAnalysis.locations.length > 0 ? (
                        clueAnalysis.locations.map((loc, i) => (
                          <span key={i} className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg text-sm">
                            {loc}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">No locations detected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-red-400 mb-2">Detected Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {clueAnalysis.actions.map((action, i) => (
                        <span key={i} className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg text-sm">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-red-400 mb-2">Security Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {clueAnalysis.keywords.map((keyword, i) => (
                        <span key={i} className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-black/40 rounded-lg">
                <h4 className="text-red-400 mb-2">Strategy Analysis</h4>
                <p className="text-gray-300">{clueAnalysis.strategy}</p>
              </div>

              <div className="mt-6 p-4 bg-black/40 rounded-lg">
                <h4 className="text-red-400 mb-2">Context Analysis</h4>
                <div className="flex flex-wrap gap-2">
                  {clueAnalysis.context.length > 0 ? (
                    clueAnalysis.context.map((context, i) => (
                      <span key={i} className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg text-sm">
                        {context}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No context detected</span>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-black/40 rounded-lg">
                <h4 className="text-red-400 mb-2">Pattern Analysis</h4>
                <div className="flex flex-wrap gap-2">
                  {clueAnalysis.patterns.length > 0 ? (
                    clueAnalysis.patterns.map((pattern, i) => (
                      <div key={i} className="bg-red-500/10 text-red-400 px-2 py-1 rounded-lg text-sm">
                        <span className="font-bold">{pattern.type}</span>: {pattern.description} (Confidence: {pattern.confidence}%)
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">No patterns detected</span>
                  )}
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
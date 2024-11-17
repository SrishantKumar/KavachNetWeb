import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Indian cities for location recognition
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad',
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
  'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Thiruvananthapuram', 'Solapur'
];

// High-risk terms categorized by type
const DANGER_WORDS = {
  critical: [
    'bomb', 'blast', 'explosion', 'detonate', 'explosive', 'suicide bomber',
    'terrorist', 'terrorism', 'hijack', 'hostage', 'assassinate'
  ],
  severe: [
    'kill', 'murder', 'attack', 'weapon', 'missile', 'gunman', 'shooter',
    'militant', 'extremist', 'massacre', 'genocide'
  ],
  high: [
    'destroy', 'damage', 'sabotage', 'infiltrate', 'breach', 'threat',
    'dangerous', 'emergency', 'critical', 'lethal'
  ],
  medium: [
    'hack', 'malware', 'ransomware', 'virus', 'exploit', 'vulnerability',
    'suspicious', 'warning', 'alert', 'compromise'
  ]
};

// Severity multipliers for different categories
const SEVERITY_MULTIPLIERS = {
  critical: 10.0,  // Maximum severity
  severe: 8.0,     // Very high severity
  high: 6.0,       // High severity
  medium: 4.0      // Medium severity
};

// Context multipliers for threat assessment
const CONTEXT_MULTIPLIERS = {
  multipleLocations: 1.5,    // Multiple locations mentioned
  timeSpecified: 1.3,        // Specific time/date mentioned
  multipleKeywords: 1.4,     // Multiple danger words
  proximityWords: 1.2,       // Words like "immediate", "soon", "today"
  massTerms: 1.6            // Words indicating mass impact: "crowd", "public", "everyone"
};

// Helper function to check for proximity words
const hasProximityWords = (text: string): boolean => {
  const proximityWords = [
    'immediate', 'soon', 'today', 'tonight', 'tomorrow', 'now',
    'urgent', 'quickly', 'fast', 'rapid'
  ];
  return proximityWords.some(word => text.toLowerCase().includes(word));
};

// Helper function to check for mass impact terms
const hasMassImpactTerms = (text: string): boolean => {
  const massTerms = [
    'crowd', 'public', 'everyone', 'population', 'city', 'mass', 'people',
    'civilians', 'residents', 'citizens', 'community'
  ];
  return massTerms.some(word => text.toLowerCase().includes(word));
};

interface ThreatIndicator {
  word: string;
  category: string;
  context: string;
  severity: number;
}

interface Location {
  city: string;
  context: string;
  coordinates?: { lat: number; lng: number };
}

interface TimeIndicator {
  raw: string;
  parsed: Date;
  context: string;
}

export interface ThreatAnalysis {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  indicators: ThreatIndicator[];
  locations: Location[];
  timeIndicators: TimeIndicator[];
  summary: string;
}

// Helper function to extract dates from text
const extractDates = (text: string): TimeIndicator[] => {
  const datePatterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g,
    // DD Month YYYY
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi,
    // HH:MM format
    /(\d{1,2}):(\d{2})(?:\s*[AaPp][Mm])?/g
  ];

  const timeIndicators: TimeIndicator[] = [];
  
  for (const pattern of datePatterns) {
    const matches = text.matchAll(new RegExp(pattern, 'g'));
    for (const match of matches) {
      const raw = match[0];
      try {
        const parsed = new Date(raw);
        if (!isNaN(parsed.getTime())) {
          timeIndicators.push({
            raw,
            parsed,
            context: text.substring(Math.max(0, match.index! - 30), 
                                 Math.min(text.length, match.index! + raw.length + 30))
          });
        }
      } catch (e) {
        console.error('Error parsing date:', raw);
      }
    }
  }

  return timeIndicators;
};

// Calculate severity score for individual words
const calculateWordSeverity = (word: string, category: string): number => {
  const baseScore = SEVERITY_MULTIPLIERS[category as keyof typeof SEVERITY_MULTIPLIERS] || 1.0;
  
  // Additional severity for compound terms
  if (word.includes(' ')) {
    return baseScore * 1.2; // 20% increase for compound terms
  }
  
  return baseScore;
};

// Helper function to find danger words with context
const findDangerWords = (text: string): ThreatIndicator[] => {
  const indicators: ThreatIndicator[] = [];
  const lowerText = text.toLowerCase();

  Object.entries(DANGER_WORDS).forEach(([category, words]) => {
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const contextStart = Math.max(0, match.index - 30);
        const contextEnd = Math.min(text.length, match.index + word.length + 30);
        
        indicators.push({
          word: match[0],
          category,
          context: text.substring(contextStart, contextEnd),
          severity: calculateWordSeverity(word, category)
        });
      }
    });
  });

  return indicators;
};

// Helper function to find Indian cities
const findLocations = (text: string): Location[] => {
  const locations: Location[] = [];
  
  INDIAN_CITIES.forEach(city => {
    const regex = new RegExp(`\\b${city}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const contextStart = Math.max(0, match.index - 30);
      const contextEnd = Math.min(text.length, match.index + city.length + 30);
      
      locations.push({
        city: city,
        context: text.substring(contextStart, contextEnd),
        // Coordinates would be added here in a real implementation
      });
    }
  });

  return locations;
};

// Calculate overall threat score
const calculateThreatScore = (
  indicators: ThreatIndicator[], 
  locations: Location[],
  timeIndicators: TimeIndicator[],
  text: string
): number => {
  if (indicators.length === 0) return 0;

  // Base score from danger words
  let score = indicators.reduce((sum, indicator) => sum + indicator.severity, 0);

  // Apply context multipliers
  if (locations.length > 1) {
    score *= CONTEXT_MULTIPLIERS.multipleLocations;
  }
  
  if (timeIndicators.length > 0) {
    score *= CONTEXT_MULTIPLIERS.timeSpecified;
  }
  
  if (indicators.length > 1) {
    score *= CONTEXT_MULTIPLIERS.multipleKeywords;
  }
  
  if (hasProximityWords(text)) {
    score *= CONTEXT_MULTIPLIERS.proximityWords;
  }
  
  if (hasMassImpactTerms(text)) {
    score *= CONTEXT_MULTIPLIERS.massTerms;
  }

  // Check for critical combinations
  const hasCriticalTerm = indicators.some(i => i.category === 'critical');
  const hasSevereTerm = indicators.some(i => i.category === 'severe');
  
  if (hasCriticalTerm && hasSevereTerm) {
    score *= 1.5; // 50% increase for critical + severe combination
  }

  // Ensure the score is capped at 10
  return Math.min(Math.max(score, 0), 10);
};

// Determine threat level based on score
const determineThreatLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 7) return 'critical';
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
};

// Generate threat summary
const generateThreatSummary = (
  indicators: ThreatIndicator[], 
  locations: Location[], 
  timeIndicators: TimeIndicator[],
  score: number
): string => {
  const threatLevel = determineThreatLevel(score);
  const criticalIndicators = indicators.filter(i => i.category === 'critical');
  
  let summary = '';
  
  // Add threat level context
  if (criticalIndicators.length > 0) {
    summary += `CRITICAL ALERT: Found ${criticalIndicators.length} high-risk indicators. `;
  }
  
  // Location context
  if (locations.length > 0) {
    summary += `Locations at risk: ${locations.map(l => l.city).join(', ')}. `;
  }
  
  // Time context
  if (timeIndicators.length > 0) {
    summary += `Time references: ${timeIndicators.map(t => t.raw).join(', ')}. `;
  }
  
  // Threat details
  const categorizedThreats = indicators.reduce((acc, curr) => {
    acc[curr.category] = acc[curr.category] || [];
    acc[curr.category].push(curr.word);
    return acc;
  }, {} as Record<string, string[]>);
  
  Object.entries(categorizedThreats).forEach(([category, words]) => {
    summary += `${category.toUpperCase()} threats detected: ${words.join(', ')}. `;
  });

  return summary;
};

// Main threat analysis function
export const analyzeThreat = async (text: string): Promise<ThreatAnalysis> => {
  try {
    // Find all indicators
    const indicators = findDangerWords(text);
    const locations = findLocations(text);
    const timeIndicators = extractDates(text);

    // Calculate threat score and level
    const score = calculateThreatScore(indicators, locations, timeIndicators, text);
    const threatLevel = determineThreatLevel(score);
    const summary = generateThreatSummary(indicators, locations, timeIndicators, score);

    const analysis: ThreatAnalysis = {
      threatLevel,
      score,
      indicators,
      locations,
      timeIndicators,
      summary
    };

    // Store in Firebase asynchronously without waiting
    if (threatLevel === 'high' || threatLevel === 'critical') {
      const db = getFirestore();
      addDoc(collection(db, 'threats'), {
        ...analysis,
        timestamp: serverTimestamp(),
        text: text.slice(0, 1000) // Store first 1000 chars only
      }).catch(error => {
        console.error('Error storing threat:', error);
      });
    }

    return analysis;
  } catch (error) {
    console.error('Error in threat analysis:', error);
    // Return a default analysis in case of error
    return {
      threatLevel: 'low',
      score: 0,
      indicators: [],
      locations: [],
      timeIndicators: [],
      summary: 'Error occurred during threat analysis'
    };
  }
};

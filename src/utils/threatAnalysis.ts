import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Indian cities and states for location recognition
const INDIAN_LOCATIONS = {
  metropolitanCities: [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'
  ],
  majorCities: [
    'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
    'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur'
  ],
  states: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal'
  ],
  unionTerritories: [
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ],
  landmarks: [
    'Red Fort', 'India Gate', 'Gateway of India', 'Taj Mahal', 'Qutub Minar', 'Charminar',
    'Hawa Mahal', 'Victoria Memorial', 'Golden Temple', 'Lotus Temple', 'Parliament House',
    'Rashtrapati Bhavan'
  ]
};

// Important locations and infrastructure
const CRITICAL_LOCATIONS = [
  'airport', 'station', 'railway', 'metro', 'bus terminal', 'port', 'harbor',
  'hospital', 'school', 'college', 'university', 'mall', 'market', 'stadium',
  'temple', 'mosque', 'church', 'gurudwara', 'embassy', 'consulate',
  'parliament', 'assembly', 'secretariat', 'court', 'police station',
  'military base', 'air force', 'naval base', 'army cantonment',
  'power plant', 'nuclear plant', 'dam', 'reservoir', 'bridge', 'tunnel'
];

// High-risk terms categorized by type
const DANGER_WORDS = {
  critical: [
    'bomb', 'blast', 'explosion', 'detonate', 'explosive', 'suicide bomber',
    'terrorist', 'terrorism', 'hijack', 'hostage', 'assassinate', 'bioweapon',
    'nuclear', 'chemical weapon', 'radiological', 'mass casualty', 'kill',
    'murder', 'assassinate', 'death', 'deadly', 'lethal', 'fatal',
    'anthrax', 'ricin', 'sarin', 'nerve agent', 'dirty bomb', 'biological weapon',
    'mass destruction', 'genocide', 'massacre', 'execution', 'annihilation'
  ],
  severe: [
    'attack', 'weapon', 'missile', 'gunman', 'shooter', 'militant', 'extremist',
    'massacre', 'genocide', 'insurgent', 'rebellion', 'uprising', 'riot',
    'violent', 'ammunition', 'casualties', 'harm', 'dangerous', 'threat',
    'destroy', 'damage', 'sabotage', 'assault', 'armed', 'violence',
    'guerrilla', 'militia', 'insurgency', 'radicalization', 'extremism',
    'cyber attack', 'data breach', 'ransomware', 'malware', 'trojan'
  ],
  high: [
    'infiltrate', 'breach', 'threat', 'dangerous', 'emergency', 'critical',
    'conspiracy', 'radical', 'extremism', 'subversive', 'guerrilla', 'militia',
    'hostilities', 'fight', 'combat', 'battle', 'war', 'conflict', 'force',
    'espionage', 'surveillance', 'intelligence', 'covert', 'classified',
    'restricted', 'confidential', 'secret', 'top secret', 'sensitive'
  ],
  medium: [
    'hack', 'malware', 'ransomware', 'virus', 'exploit', 'vulnerability',
    'suspicious', 'warning', 'alert', 'compromise', 'unauthorized', 'intrusion',
    'classified', 'confidential', 'sensitive', 'restricted', 'secret',
    'phishing', 'social engineering', 'identity theft', 'fraud', 'scam',
    'backdoor', 'zero-day', 'exploit', 'botnet', 'keylogger'
  ],
  behavioral: [
    'suspicious', 'unusual', 'abnormal', 'erratic', 'concerning', 'alarming',
    'radical', 'extreme', 'fanatic', 'obsessed', 'unstable', 'volatile',
    'unpredictable', 'aggressive', 'hostile', 'threatening', 'intimidating'
  ],
  financial: [
    'money laundering', 'fraud', 'illegal transaction', 'black money',
    'hawala', 'shell company', 'tax evasion', 'financial crime',
    'cryptocurrency', 'dark web', 'underground market', 'illegal trade'
  ]
};

// Severity multipliers for different categories
const SEVERITY_MULTIPLIERS = {
  critical: 10.0,   // Maximum severity
  severe: 7.0,      // Very high severity
  high: 5.0,        // High severity
  medium: 3.0,      // Medium severity
  behavioral: 2.0,  // Behavioral indicators
  financial: 2.5    // Financial crime indicators
};

// Context multipliers for threat assessment
const CONTEXT_MULTIPLIERS = {
  multipleLocations: 2.0,     // Multiple locations mentioned
  timeSpecified: 1.5,         // Specific time/date mentioned
  multipleKeywords: 2.0,      // Multiple danger words
  proximityWords: 1.8,        // Words like "immediate", "soon", "today"
  massTerms: 2.0,            // Words indicating mass impact
  sensitiveData: 1.5,        // Contains sensitive information
  coordination: 1.8,         // Indicates coordinated activity
  infrastructure: 2.0,       // Critical infrastructure mentioned
  repetition: 1.5,          // Same threat terms repeated
  proximity: 1.7,           // Geographic proximity to sensitive locations
  timing: 1.6,             // Time-based correlation
  technicalDetail: 1.8,    // Presence of technical details
  financialImpact: 1.5,    // Financial implications
  crossBorder: 1.9,        // International/cross-border elements
  socialMedia: 1.4,        // Social media involvement
  encryption: 1.6,         // Use of encryption/security terms
  darkWeb: 2.0            // Dark web references
};

interface ThreatIndicator {
  word: string;
  category: string;
  context: string;
  severity: number;
}

interface Location {
  name: string;
  type: 'metropolitan' | 'major' | 'state' | 'union-territory' | 'landmark' | 'critical';
  context: string;
}

interface TimeIndicator {
  raw: string;
  parsed: Date;
  context: string;
}

interface ClueIndicator {
  type: 'location' | 'time' | 'method' | 'target' | 'actor';
  detail: string;
  confidence: number;
  context: string;
  severity: number;
  relatedTerms: string[];
}

interface LocationDetail {
  name: string;
  type: 'metropolitan' | 'major' | 'state' | 'union-territory' | 'landmark' | 'critical';
  context: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  nearbyLocations?: string[];
  criticalInfrastructure?: string[];
  populationDensity?: 'high' | 'medium' | 'low';
  securityLevel?: 'high' | 'medium' | 'low';
}

export interface ThreatAnalysis {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  indicators: ThreatIndicator[];
  locations: LocationDetail[];
  timeIndicators: TimeIndicator[];
  summary: string;
  clues: ClueIndicator[];
  details: {
    sensitiveData: boolean;
    massImpact: boolean;
    infrastructure: boolean;
    timeProximity: boolean;
    coordinatedActivity: boolean;
    behavioralIndicators: string[];
    technicalIndicators: string[];
    financialIndicators: string[];
    geopoliticalContext: string[];
    relatedThreats: string[];
    recommendedActions: string[];
    confidenceScore: number;
    severityBreakdown: {
      technical: number;
      physical: number;
      social: number;
      financial: number;
    };
    riskFactors: {
      category: string;
      level: number;
      description: string;
    }[];
    timeline: {
      detected: Date;
      estimated: Date;
      critical: Date;
    };
    locationDetails: {
      primaryLocation?: LocationDetail;
      affectedArea: string[];
      criticalTargets: string[];
      evacuationZones?: string[];
      securityCheckpoints?: string[];
    };
    detectedPatterns: {
      locations: {
        name: string;
        type: string;
        nearbyInfrastructure?: string[];
      }[];
      timeReferences: {
        specific: string[];
        relative: string[];
        duration: string[];
      };
      massImpactTerms: string[];
      infrastructureRefs: string[];
      coordinationIndicators: string[];
    };
  };
}

// Helper function to check for proximity words
const hasProximityWords = (text: string): boolean => {
  const proximityWords = [
    'immediate', 'soon', 'today', 'tonight', 'tomorrow', 'now',
    'urgent', 'quickly', 'fast', 'rapid', 'imminent', 'approaching'
  ];
  return proximityWords.some(word => text.toLowerCase().includes(word));
};

// Helper function to check for mass impact terms
const hasMassImpactTerms = (text: string): boolean => {
  const massTerms = [
    'crowd', 'public', 'everyone', 'population', 'city', 'mass', 'people',
    'civilians', 'residents', 'citizens', 'community', 'gathering', 'assembly',
    'demonstration', 'protest', 'rally', 'congregation', 'masses'
  ];
  return massTerms.some(word => text.toLowerCase().includes(word));
};

// Helper function to check for sensitive data indicators
const hasSensitiveData = (text: string): boolean => {
  const sensitiveTerms = [
    'password', 'credential', 'secret', 'private', 'confidential', 'classified',
    'restricted', 'sensitive', 'proprietary', 'internal', 'undisclosed'
  ];
  return sensitiveTerms.some(word => text.toLowerCase().includes(word));
};

// Helper function to check for infrastructure references
const hasInfrastructureReferences = (text: string): boolean => {
  const infrastructureTerms = [
    'power plant', 'grid', 'pipeline', 'railway', 'airport', 'port', 'bridge',
    'dam', 'facility', 'station', 'network', 'infrastructure', 'utility',
    'water supply', 'communication', 'transportation', 'hospital'
  ];
  return infrastructureTerms.some(word => text.toLowerCase().includes(word));
};

// Indian city coordinates (add more as needed)
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 }
};

// Critical infrastructure types for cities
const CITY_INFRASTRUCTURE: { [key: string]: string[] } = {
  'Patna': [
    'Patna Junction Railway Station',
    'Jay Prakash Narayan International Airport',
    'Gandhi Maidan',
    'Bihar Legislative Assembly',
    'Patna High Court',
    'AIIMS Patna',
    'Patna Medical College and Hospital',
    'Bihar Museum',
    'Golghar',
    'Eco Park'
  ],
  // Add for other cities as needed
};

// Enhanced findLocations function
const findLocations = (text: string): LocationDetail[] => {
  const locations: LocationDetail[] = [];
  const words = text.split(/\s+/);
  const lowerText = text.toLowerCase();

  // Function to add location with enhanced details
  const addLocationWithDetails = (name: string, type: LocationDetail['type'], index: number) => {
    const start = Math.max(0, index - 4);
    const end = Math.min(words.length, index + 5);
    const context = words.slice(start, end).join(' ');
    
    const location: LocationDetail = {
      name,
      type,
      context,
      coordinates: CITY_COORDINATES[name],
      criticalInfrastructure: CITY_INFRASTRUCTURE[name] || [],
      populationDensity: 'high',
      securityLevel: 'high'
    };

    // Add nearby locations if available
    if (CITY_INFRASTRUCTURE[name]) {
      location.nearbyLocations = CITY_INFRASTRUCTURE[name].slice(0, 5);
    }

    locations.push(location);
  };

  // Check for locations in text
  words.forEach((word, index) => {
    // Check metropolitan cities
    INDIAN_LOCATIONS.metropolitanCities.forEach(city => {
      if (word.includes(city)) {
        addLocationWithDetails(city, 'metropolitan', index);
      }
    });

    // Check major cities
    INDIAN_LOCATIONS.majorCities.forEach(city => {
      if (word.includes(city)) {
        addLocationWithDetails(city, 'major', index);
      }
    });

    // Check states
    INDIAN_LOCATIONS.states.forEach(state => {
      if (text.includes(state)) {
        addLocationWithDetails(state, 'state', index);
      }
    });

    // Check landmarks
    INDIAN_LOCATIONS.landmarks.forEach(landmark => {
      if (text.includes(landmark)) {
        addLocationWithDetails(landmark, 'landmark', index);
      }
    });
  });

  return locations;
};

// Function to extract clues from text
const extractClues = (
  text: string,
  indicators: ThreatIndicator[],
  locations: LocationDetail[],
  timeIndicators: TimeIndicator[]
): ClueIndicator[] => {
  const clues: ClueIndicator[] = [];

  // Location clues
  locations.forEach(location => {
    clues.push({
      type: 'location',
      detail: `Target location identified: ${location.name}`,
      confidence: 0.9,
      context: location.context,
      severity: 9,
      relatedTerms: location.criticalInfrastructure || []
    });
  });

  // Time clues
  timeIndicators.forEach(time => {
    clues.push({
      type: 'time',
      detail: `Time frame identified: ${time.raw}`,
      confidence: 0.85,
      context: time.context,
      severity: 8,
      relatedTerms: ['immediate', 'urgent', 'countdown']
    });
  });

  // Method clues
  indicators.forEach(indicator => {
    if (indicator.category === 'critical') {
      clues.push({
        type: 'method',
        detail: `Attack method identified: ${indicator.word}`,
        confidence: 0.95,
        context: indicator.context,
        severity: 10,
        relatedTerms: ['explosive', 'detonation', 'blast radius']
      });
    }
  });

  // Target clues
  if (locations.length > 0) {
    const location = locations[0];
    if (location.criticalInfrastructure) {
      location.criticalInfrastructure.forEach(target => {
        clues.push({
          type: 'target',
          detail: `Potential target identified: ${target}`,
          confidence: 0.7,
          context: `Near ${location.name}`,
          severity: 8,
          relatedTerms: ['crowded', 'public', 'infrastructure']
        });
      });
    }
  }

  return clues;
};

// Calculate severity score for individual words
const calculateWordSeverity = (word: string, category: string): number => {
  const baseScore = SEVERITY_MULTIPLIERS[category as keyof typeof SEVERITY_MULTIPLIERS] || 1.0;
  return baseScore * 10; // Scale up the base score
};

// Helper function to find danger words with context
const findDangerWords = (text: string): ThreatIndicator[] => {
  const indicators: ThreatIndicator[] = [];
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word, index) => {
    for (const [category, categoryWords] of Object.entries(DANGER_WORDS)) {
      if (categoryWords.some(dangerWord => {
        // Check for exact match or as part of a word
        return word.includes(dangerWord) || 
               text.toLowerCase().includes(dangerWord);
      })) {
        // Get context (words before and after)
        const start = Math.max(0, index - 3);
        const end = Math.min(words.length, index + 4);
        const context = words.slice(start, end).join(' ');
        
        indicators.push({
          word: word,
          category: category,
          context: context,
          severity: calculateWordSeverity(word, category)
        });
        break;
      }
    }
  });
  
  return indicators;
};

// Enhanced threat score calculation
const calculateThreatScore = (
  indicators: ThreatIndicator[],
  locations: LocationDetail[],
  timeIndicators: TimeIndicator[],
  text: string
): number => {
  let score = 0;
  const textLower = text.toLowerCase();

  // Base score from danger words
  indicators.forEach(indicator => {
    score += calculateWordSeverity(indicator.word, indicator.category);
  });

  // Location-based scoring
  if (locations.length > 0) {
    score *= CONTEXT_MULTIPLIERS.multipleLocations;
    
    // Check for proximity to sensitive locations
    const hasSensitiveLocations = locations.some(loc => 
      CRITICAL_LOCATIONS.some(critical => loc.name.toLowerCase().includes(critical))
    );
    if (hasSensitiveLocations) {
      score *= CONTEXT_MULTIPLIERS.proximity;
    }
  }

  // Time-based scoring
  if (timeIndicators.length > 0) {
    score *= CONTEXT_MULTIPLIERS.timeSpecified;
    
    // Check for immediate threats
    const hasImmediateThreat = timeIndicators.some(time => {
      const timeDiff = time.parsed.getTime() - new Date().getTime();
      return timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours
    });
    if (hasImmediateThreat) {
      score *= CONTEXT_MULTIPLIERS.timing;
    }
  }

  // Technical detail scoring
  if (hasTechnicalDetails(text)) {
    score *= CONTEXT_MULTIPLIERS.technicalDetail;
  }

  // Dark web references
  if (hasDarkWebReferences(text)) {
    score *= CONTEXT_MULTIPLIERS.darkWeb;
  }

  // Encryption/security terms
  if (hasEncryptionTerms(text)) {
    score *= CONTEXT_MULTIPLIERS.encryption;
  }

  // Cross-border elements
  if (hasCrossBorderElements(text)) {
    score *= CONTEXT_MULTIPLIERS.crossBorder;
  }

  // Social media involvement
  if (hasSocialMediaReferences(text)) {
    score *= CONTEXT_MULTIPLIERS.socialMedia;
  }

  // Additional context multipliers
  if (hasProximityWords(text)) score *= CONTEXT_MULTIPLIERS.proximityWords;
  if (hasMassImpactTerms(text)) score *= CONTEXT_MULTIPLIERS.massTerms;
  if (hasSensitiveData(text)) score *= CONTEXT_MULTIPLIERS.sensitiveData;
  if (hasInfrastructureReferences(text)) score *= CONTEXT_MULTIPLIERS.infrastructure;

  // Normalize score to 0-10 range
  return Math.min(Math.max(score, 0), 10);
};

// New helper functions for enhanced analysis
const hasTechnicalDetails = (text: string): boolean => {
  const technicalTerms = [
    'protocol', 'encryption', 'algorithm', 'payload', 'exploit',
    'vulnerability', 'zero-day', 'backdoor', 'malware', 'ransomware',
    'botnet', 'ddos', 'injection', 'buffer overflow', 'rootkit'
  ];
  return technicalTerms.some(term => text.toLowerCase().includes(term));
};

const hasDarkWebReferences = (text: string): boolean => {
  const darkWebTerms = [
    'dark web', 'darknet', 'tor', 'onion', 'hidden service',
    'underground market', 'black market', 'silk road', 'cryptocurrency',
    'bitcoin', 'monero', 'anonymous', 'encrypted chat'
  ];
  return darkWebTerms.some(term => text.toLowerCase().includes(term));
};

const hasEncryptionTerms = (text: string): boolean => {
  const encryptionTerms = [
    'encrypted', 'encryption', 'cipher', 'key', 'ssl', 'tls',
    'vpn', 'proxy', 'tunnel', 'secure channel', 'pgp', 'gpg'
  ];
  return encryptionTerms.some(term => text.toLowerCase().includes(term));
};

const hasCrossBorderElements = (text: string): boolean => {
  const crossBorderTerms = [
    'international', 'cross-border', 'foreign', 'overseas',
    'global', 'multinational', 'worldwide', 'transnational'
  ];
  return crossBorderTerms.some(term => text.toLowerCase().includes(term));
};

const hasSocialMediaReferences = (text: string): boolean => {
  const socialMediaTerms = [
    'social media', 'facebook', 'twitter', 'instagram', 'telegram',
    'whatsapp', 'signal', 'discord', 'reddit', 'youtube'
  ];
  return socialMediaTerms.some(term => text.toLowerCase().includes(term));
};

// Determine threat level based on score
const determineThreatLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  // Score is now normalized to 0-10 range
  if (score >= 7.5) return 'critical';
  if (score >= 5.0) return 'high';
  if (score >= 2.5) return 'medium';
  return 'low';
};

// Generate threat summary
const generateThreatSummary = (
  indicators: ThreatIndicator[],
  locations: LocationDetail[],
  timeIndicators: TimeIndicator[],
  score: number
): string => {
  const parts: string[] = [];

  // Add threat level
  if (score >= 7.5) {
    parts.push('CRITICAL THREAT LEVEL:');
  } else if (score >= 5.0) {
    parts.push('HIGH THREAT LEVEL:');
  } else if (score >= 2.5) {
    parts.push('MEDIUM THREAT LEVEL:');
  } else {
    parts.push('LOW THREAT LEVEL:');
  }

  // Add indicator summary
  if (indicators.length > 0) {
    const categories = new Set(indicators.map(i => i.category));
    parts.push(`Detected ${indicators.length} threat indicators across ${categories.size} categories.`);
  }

  // Add location summary
  if (locations.length > 0) {
    const locationTypes = new Set(locations.map(l => l.type));
    const criticalLocations = locations.filter(l => l.type === 'critical');
    const metropolitanLocations = locations.filter(l => l.type === 'metropolitan');

    if (criticalLocations.length > 0) {
      parts.push(`Mentions ${criticalLocations.length} critical locations.`);
    }
    if (metropolitanLocations.length > 0) {
      parts.push(`References ${metropolitanLocations.length} metropolitan cities.`);
    }
    parts.push(`Total locations mentioned: ${locations.length} across ${locationTypes.size} categories.`);
  }

  // Add time sensitivity
  if (timeIndicators.length > 0) {
    parts.push('Time-sensitive content detected.');
  }

  // Add threat context
  if (score >= 7.5) {
    parts.push('Immediate attention and response required.');
  } else if (score >= 5.0) {
    parts.push('Careful monitoring and assessment needed.');
  }

  return parts.join(' ');
};

// Time patterns for detection
const TIME_PATTERNS = {
  specific: [
    /\d{1,2}[:h]\d{2}\s*(?:AM|PM|am|pm)?/,  // 11:00 AM, 11h00
    /\d{1,2}\s*(?:AM|PM|am|pm)/,            // 11 AM
    /\d{1,2}:\d{2}/,                        // 14:00
    /\d{4}\s*(?:hrs|hours)?/                // 1400 hrs
  ],
  relative: [
    /tonight/i,
    /tomorrow/i,
    /today/i,
    /next\s+\d+\s+(?:hour|minute|day|week)s?/i,
    /in\s+\d+\s+(?:hour|minute|day|week)s?/i,
    /this\s+(?:morning|afternoon|evening|night)/i
  ],
  duration: [
    /\d+\s+(?:hour|minute|day|week)s?/i,
    /(?:few|couple of)\s+(?:hour|minute|day|week)s?/i
  ]
};

// Mass impact patterns
const MASS_IMPACT_PATTERNS = [
  /crowd(?:ed)?/i,
  /public/i,
  /gathering/i,
  /assembly/i,
  /population/i,
  /civilian/i,
  /resident/i,
  /people/i,
  /community/i,
  /mass/i
];

// Infrastructure patterns
const INFRASTRUCTURE_PATTERNS = [
  /station/i,
  /airport/i,
  /railway/i,
  /hospital/i,
  /school/i,
  /college/i,
  /university/i,
  /mall/i,
  /market/i,
  /stadium/i,
  /temple/i,
  /mosque/i,
  /church/i,
  /bridge/i,
  /highway/i,
  /road/i
];

// Coordinated activity patterns
const COORDINATION_PATTERNS = [
  /group/i,
  /team/i,
  /cell/i,
  /network/i,
  /multiple/i,
  /together/i,
  /coordinate/i,
  /simultaneous/i,
  /planned/i,
  /organized/i
];

interface DetectedPatterns {
  locations: {
    name: string;
    type: string;
    coordinates?: { lat: number; lng: number };
    nearbyInfrastructure?: string[];
  }[];
  timeReferences: {
    specific: string[];
    relative: string[];
    duration: string[];
  };
  massImpact: string[];
  infrastructure: string[];
  coordination: string[];
}

const findTimePatterns = (text: string): { specific: string[]; relative: string[]; duration: string[] } => {
  const result = {
    specific: [] as string[],
    relative: [] as string[],
    duration: [] as string[]
  };

  // Find specific times
  TIME_PATTERNS.specific.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      result.specific.push(...matches);
    }
  });

  // Find relative times
  TIME_PATTERNS.relative.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      result.relative.push(...matches);
    }
  });

  // Find durations
  TIME_PATTERNS.duration.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      result.duration.push(...matches);
    }
  });

  return result;
};

const findPatterns = (text: string): DetectedPatterns => {
  const patterns: DetectedPatterns = {
    locations: [],
    timeReferences: {
      specific: [],
      relative: [],
      duration: []
    },
    massImpact: [],
    infrastructure: [],
    coordination: []
  };

  // Find locations
  const locations = findLocations(text);
  patterns.locations = locations.map(loc => ({
    name: loc.name,
    type: loc.type,
    coordinates: loc.coordinates,
    nearbyInfrastructure: loc.criticalInfrastructure
  }));

  // Find time references
  patterns.timeReferences = findTimePatterns(text);

  // Find mass impact terms
  MASS_IMPACT_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      patterns.massImpact.push(...matches);
    }
  });

  // Find infrastructure references
  INFRASTRUCTURE_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      patterns.infrastructure.push(...matches);
    }
  });

  // Find coordination patterns
  COORDINATION_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      patterns.coordination.push(...matches);
    }
  });

  return patterns;
};

// Main threat analysis function
export const analyzeThreat = async (text: string): Promise<ThreatAnalysis> => {
  try {
    const patterns = findPatterns(text);
    const indicators = findDangerWords(text);
    const locations = findLocations(text);
    const timeIndicators: TimeIndicator[] = []; // Implement date extraction if needed
    const clues = extractClues(text, indicators, locations, timeIndicators);
    const score = calculateThreatScore(indicators, locations, timeIndicators, text);
    const threatLevel = determineThreatLevel(score);

    // Only include details that were actually detected
    const details = {
      sensitiveData: hasSensitiveData(text),
      massImpact: patterns.massImpact.length > 0,
      infrastructure: patterns.infrastructure.length > 0,
      timeProximity: patterns.timeReferences.specific.length > 0 || patterns.timeReferences.relative.length > 0,
      coordinatedActivity: patterns.coordination.length > 0,
      behavioralIndicators: [],
      technicalIndicators: [],
      financialIndicators: [],
      geopoliticalContext: [],
      relatedThreats: [],
      recommendedActions: [],
      confidenceScore: calculateConfidenceScore(patterns),
      severityBreakdown: {
        technical: 0,
        physical: score,
        social: patterns.massImpact.length > 0 ? score : 0,
        financial: 0
      },
      riskFactors: generateRiskFactors(patterns),
      timeline: {
        detected: new Date(),
        estimated: new Date(),
        critical: new Date()
      },
      locationDetails: {
        primaryLocation: locations[0],
        affectedArea: locations.map(loc => loc.name),
        criticalTargets: locations.flatMap(loc => loc.criticalInfrastructure || []),
        evacuationZones: locations.map(loc => `${loc.name} city center`),
        securityCheckpoints: locations.map(loc => `${loc.name} major intersections`)
      },
      // Add detected patterns for display
      detectedPatterns: {
        locations: patterns.locations.map(loc => ({
          name: loc.name,
          type: loc.type,
          nearbyInfrastructure: loc.nearbyInfrastructure
        })),
        timeReferences: patterns.timeReferences,
        massImpactTerms: patterns.massImpact,
        infrastructureRefs: patterns.infrastructure,
        coordinationIndicators: patterns.coordination
      }
    };

    return {
      threatLevel,
      score,
      indicators,
      locations,
      timeIndicators,
      clues,
      summary: generateThreatSummary(indicators, locations, timeIndicators, score),
      details
    };
  } catch (error) {
    console.error('Error in threat analysis:', error);
    return {
      threatLevel: 'low',
      score: 0,
      indicators: [],
      locations: [],
      timeIndicators: [],
      clues: [],
      summary: 'Error in threat analysis',
      details: {
        sensitiveData: false,
        massImpact: false,
        infrastructure: false,
        timeProximity: false,
        coordinatedActivity: false,
        behavioralIndicators: [],
        technicalIndicators: [],
        financialIndicators: [],
        geopoliticalContext: [],
        relatedThreats: [],
        recommendedActions: [],
        confidenceScore: 0,
        severityBreakdown: {
          technical: 0,
          physical: 0,
          social: 0,
          financial: 0
        },
        riskFactors: [],
        timeline: {
          detected: new Date(),
          estimated: new Date(),
          critical: new Date()
        },
        locationDetails: {
          affectedArea: [],
          criticalTargets: []
        },
        detectedPatterns: {
          locations: [],
          timeReferences: { specific: [], relative: [], duration: [] },
          massImpactTerms: [],
          infrastructureRefs: [],
          coordinationIndicators: []
        }
      }
    };
  }
};

// Calculate confidence score based on detected patterns
const calculateConfidenceScore = (patterns: DetectedPatterns): number => {
  let confidence = 0;
  let factors = 0;

  // Location confidence
  if (patterns.locations.length > 0) {
    confidence += 0.3;  // 30% weight for location
    factors++;
  }

  // Time reference confidence
  if (patterns.timeReferences.specific.length > 0) {
    confidence += 0.3;  // 30% weight for specific time
    factors++;
  } else if (patterns.timeReferences.relative.length > 0) {
    confidence += 0.2;  // 20% weight for relative time
    factors++;
  }

  // Mass impact confidence
  if (patterns.massImpact.length > 0) {
    confidence += 0.15;  // 15% weight for mass impact
    factors++;
  }

  // Infrastructure confidence
  if (patterns.infrastructure.length > 0) {
    confidence += 0.15;  // 15% weight for infrastructure
    factors++;
  }

  // Coordination confidence
  if (patterns.coordination.length > 0) {
    confidence += 0.1;  // 10% weight for coordination
    factors++;
  }

  // Normalize confidence score
  return factors > 0 ? (confidence / factors) * 10 : 0;
};

// Generate risk factors based on detected patterns
const generateRiskFactors = (patterns: DetectedPatterns): { category: string; level: number; description: string }[] => {
  const riskFactors: { category: string; level: number; description: string }[] = [];

  // Location-based risks
  if (patterns.locations.length > 0) {
    patterns.locations.forEach(loc => {
      if (loc.nearbyInfrastructure && loc.nearbyInfrastructure.length > 0) {
        riskFactors.push({
          category: 'Location',
          level: 8,
          description: `Critical infrastructure near ${loc.name}: ${loc.nearbyInfrastructure.join(', ')}`
        });
      }
    });
  }

  // Time-based risks
  if (patterns.timeReferences.specific.length > 0) {
    riskFactors.push({
      category: 'Timing',
      level: 9,
      description: `Specific time mentioned: ${patterns.timeReferences.specific.join(', ')}`
    });
  } else if (patterns.timeReferences.relative.length > 0) {
    riskFactors.push({
      category: 'Timing',
      level: 7,
      description: `Relative time frame: ${patterns.timeReferences.relative.join(', ')}`
    });
  }

  // Mass impact risks
  if (patterns.massImpact.length > 0) {
    riskFactors.push({
      category: 'Mass Impact',
      level: 8,
      description: `Potential mass casualty terms detected: ${patterns.massImpact.join(', ')}`
    });
  }

  // Infrastructure risks
  if (patterns.infrastructure.length > 0) {
    riskFactors.push({
      category: 'Infrastructure',
      level: 8,
      description: `Critical infrastructure mentioned: ${patterns.infrastructure.join(', ')}`
    });
  }

  // Coordination risks
  if (patterns.coordination.length > 0) {
    riskFactors.push({
      category: 'Coordination',
      level: 7,
      description: `Signs of coordinated activity: ${patterns.coordination.join(', ')}`
    });
  }

  return riskFactors;
};

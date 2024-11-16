import React from 'react';
import { Shield, Clock, AlertTriangle, Award } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Real-time Decryption',
    description: 'Instantly decrypt messages as you type with advanced algorithms'
  },
  {
    icon: Clock,
    title: 'Clue Analysis',
    description: 'Smart detection of patterns and timeline analysis'
  },
  {
    icon: AlertTriangle,
    title: 'Danger Detection',
    description: 'Automatic detection of suspicious keywords and phrases'
  },
  {
    icon: Award,
    title: 'Military-grade Security',
    description: 'Built with industry-standard encryption protocols'
  }
];

const FeatureCarousel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={index}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureCarousel;

import React from 'react';
import { Check, X } from 'lucide-react';

const features = [
  {
    name: 'Real-time Decryption',
    extension: true,
    app: true,
  },
  {
    name: 'Offline Mode',
    extension: false,
    app: true,
  },
  {
    name: 'Clue Analysis',
    extension: true,
    app: true,
  },
  {
    name: 'Danger Word Detection',
    extension: true,
    app: true,
  },
  {
    name: 'File Encryption',
    extension: false,
    app: true,
  },
  {
    name: 'Cross-platform Sync',
    extension: true,
    app: true,
  },
];

const ComparisonTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-4 px-6 text-left text-white">Feature</th>
            <th className="py-4 px-6 text-center text-white">Chrome Extension</th>
            <th className="py-4 px-6 text-center text-white">Android App</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={index}
              className="border-b border-white/10 hover:bg-white/5 transition-colors"
            >
              <td className="py-4 px-6 text-gray-300">{feature.name}</td>
              <td className="py-4 px-6 text-center">
                {feature.extension ? (
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-red-500 mx-auto" />
                )}
              </td>
              <td className="py-4 px-6 text-center">
                {feature.app ? (
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                ) : (
                  <X className="w-5 h-5 text-red-500 mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;

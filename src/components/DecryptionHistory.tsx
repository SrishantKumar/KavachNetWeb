import React from 'react';
import { DecryptionHistoryItem } from '../hooks/useDecryptionHistory';
import { formatDistanceToNow } from 'date-fns';
import { Lock, Unlock, Clock, AlertTriangle } from 'lucide-react';

interface DecryptionHistoryProps {
  history: DecryptionHistoryItem[];
  onSelectMessage?: (encrypted: string) => void;
}

const DecryptionHistory: React.FC<DecryptionHistoryProps> = ({ history, onSelectMessage }) => {
  const getThreatLevelColor = (analysis: any) => {
    if (!analysis?.threatLevel) return 'text-gray-500';
    switch (analysis.threatLevel) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No decryption history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer"
          onClick={() => onSelectMessage?.(item.encryptedText)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span className="text-sm font-mono text-gray-300">{item.encryptedText.substring(0, 30)}...</span>
            </div>
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
          
          <div className="mt-2 flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Unlock className="w-4 h-4 text-green-500" />
              <span className="text-sm font-mono text-gray-300">{item.decryptedText.substring(0, 30)}...</span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </span>
          </div>

          {item.analysis && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertTriangle className={`w-4 h-4 ${getThreatLevelColor(item.analysis)}`} />
              <span className={`text-xs ${getThreatLevelColor(item.analysis)}`}>
                {item.analysis.threatLevel?.toUpperCase()} Threat Level
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DecryptionHistory;

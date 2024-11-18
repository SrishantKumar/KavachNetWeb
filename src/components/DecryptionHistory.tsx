import React from 'react';
import { DecryptionHistoryItem } from '../hooks/useDecryptionHistory';
import { formatDistanceToNow } from 'date-fns';
import { Lock, Unlock, Clock, AlertTriangle, Shield, Eye, Trash2 } from 'lucide-react';

interface DecryptionHistoryProps {
  history: DecryptionHistoryItem[];
  onSelectMessage?: (encrypted: string) => void;
  onDeleteMessage?: (id: string) => void;
}

const DecryptionHistory: React.FC<DecryptionHistoryProps> = ({ 
  history, 
  onSelectMessage,
  onDeleteMessage 
}) => {
  const getThreatLevelColor = (analysis: any) => {
    if (!analysis?.threatLevel) return 'text-gray-500';
    switch (analysis.threatLevel) {
      case 'critical':
        return 'text-red-600';
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

  const getThreatLevelBg = (analysis: any) => {
    if (!analysis?.threatLevel) return 'bg-gray-800/50';
    switch (analysis.threatLevel) {
      case 'critical':
        return 'bg-red-950/30';
      case 'high':
        return 'bg-red-900/20';
      case 'medium':
        return 'bg-yellow-900/20';
      case 'low':
        return 'bg-green-900/20';
      default:
        return 'bg-gray-800/50';
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800/30 rounded-lg border border-gray-700">
        <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No decryption history available</p>
        <p className="text-gray-500 text-sm mt-2">Decrypted messages will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className={`${getThreatLevelBg(item.analysis)} backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-70 transition-all border border-gray-700/50`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-red-500" />
                <span className="text-sm font-mono text-gray-300 truncate">{item.encryptedText.substring(0, 40)}...</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Unlock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-mono text-gray-300 truncate">{item.decryptedText.substring(0, 40)}...</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onSelectMessage?.(item.encryptedText)}
                className="p-1.5 rounded-full hover:bg-gray-700/50 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMessage?.(item.id);
                }}
                className="p-1.5 rounded-full hover:bg-gray-700/50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-700/50 pt-3">
            {item.analysis && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-4 h-4 ${getThreatLevelColor(item.analysis)}`} />
                <span className={`text-xs font-medium ${getThreatLevelColor(item.analysis)}`}>
                  {item.analysis.threatLevel?.toUpperCase()} Threat Level
                </span>
                {item.analysis.score && (
                  <span className="text-xs text-gray-500">
                    (Score: {item.analysis.score.toFixed(1)})
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </span>
            </div>
          </div>

          {item.analysis?.summary && (
            <div className="mt-2 text-xs text-gray-400 bg-black/20 rounded p-2">
              {item.analysis.summary}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DecryptionHistory;

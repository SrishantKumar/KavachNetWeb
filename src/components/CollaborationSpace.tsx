import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Loader, Lock, Unlock, Clock, Users, Users2, Laptop, Share2, BarChart2, MessageSquare, Send, Tag, Plus, Map, MapPin, Radio, AlertOctagon, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDecryptionHistory } from '../hooks/useDecryptionHistory';
import { formatDistanceToNow } from 'date-fns';
import type { DecryptionHistoryItem } from '../hooks/useDecryptionHistory';

const CollaborationSpace = () => {
  const [user] = useAuthState(auth);
  const { getDecryptionHistory } = useDecryptionHistory();
  const [decryptionHistory, setDecryptionHistory] = useState<DecryptionHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DecryptionHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDecryptionHistory();
    }
  }, [user]);

  const loadDecryptionHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const history = await getDecryptionHistory(user.uid);
      setDecryptionHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
    setLoading(false);
  };

  const getThreatLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'low':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getThreatLevelIcon = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-green-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-200">Authentication Required</h2>
        <p className="text-gray-400">Please sign in to access the collaboration space.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] to-[#141B2D] relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Secure Collaboration Space</h1>
          <p className="text-xl text-gray-400">View and analyze decrypted messages with your team</p>
        </div>

        {/* Main Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Decryption History */}
          <div className="space-y-4">
            <div className="bg-white/[0.02] backdrop-blur-md rounded-xl p-6 border border-white/[0.05] shadow-lg relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300">
              <div className="relative z-10">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-500" />
                  Decryption History
                </h2>
                {decryptionHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No decryption history available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {decryptionHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                          selectedItem?.id === item.id
                            ? 'border-red-500/50 bg-white/[0.03]'
                            : 'border-white/[0.05] hover:border-red-500/30 bg-black/20 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Lock className="w-4 h-4 text-red-500" />
                            <span className="font-mono text-sm text-gray-300">
                              {item.encryptedText.substring(0, 30)}...
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full border backdrop-blur-sm ${getThreatLevelColor(item.analysis?.threatLevel)}`}>
                            {getThreatLevelIcon(item.analysis?.threatLevel)}
                            <span className="ml-2">{item.analysis?.threatLevel?.toUpperCase() || 'UNKNOWN'} THREAT</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            {selectedItem ? (
              <div className="bg-white/[0.02] backdrop-blur-md rounded-xl p-6 border border-white/[0.05] shadow-lg relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300">
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Threat Analysis
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Original & Decrypted Messages */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Encrypted Message:</label>
                        <div className="font-mono text-sm bg-black/20 p-4 rounded-lg border border-white/[0.05]">
                          {selectedItem.encryptedText}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Decrypted Message:</label>
                        <div className="font-mono text-sm bg-black/20 p-4 rounded-lg border border-white/[0.05]">
                          {selectedItem.decryptedText}
                        </div>
                      </div>
                    </div>

                    {/* Analysis Details */}
                    {selectedItem.analysis && (
                      <div className="space-y-6">
                        {/* Threat Level */}
                        <div className={`p-4 rounded-lg border ${getThreatLevelColor(selectedItem.analysis.threatLevel)}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {getThreatLevelIcon(selectedItem.analysis.threatLevel)}
                            <h3 className="font-semibold">Threat Level: {selectedItem.analysis.threatLevel.toUpperCase()}</h3>
                          </div>
                          <p className="text-sm opacity-90">{selectedItem.analysis.strategy}</p>
                        </div>

                        {/* Timeline & Context */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 bg-black/20 p-4 rounded-lg border border-white/[0.05]">
                            <h3 className="text-sm font-semibold text-gray-300">Timeline</h3>
                            <p className="text-sm text-gray-400">{selectedItem.analysis.timeline}</p>
                          </div>
                          <div className="space-y-2 bg-black/20 p-4 rounded-lg border border-white/[0.05]">
                            <h3 className="text-sm font-semibold text-gray-300">Context</h3>
                            <ul className="text-sm text-gray-400 list-disc list-inside">
                              {selectedItem.analysis.context.map((ctx, index) => (
                                <li key={index}>{ctx}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Keywords & Locations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 bg-black/20 p-4 rounded-lg border border-white/[0.05]">
                            <h3 className="text-sm font-semibold text-gray-300">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.analysis.keywords.map((keyword, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-red-500/10 border border-red-500/20 text-red-400"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 bg-black/20 p-4 rounded-lg border border-white/[0.05]">
                            <h3 className="text-sm font-semibold text-gray-300">Locations</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.analysis.locations.map((location, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-red-500/10 border border-red-500/20 text-red-400"
                                >
                                  {location}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Patterns */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-300">Detected Patterns</h3>
                          <div className="space-y-2">
                            {selectedItem.analysis.patterns.map((pattern, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-black/20 border border-white/[0.05]"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-sm text-gray-300">{pattern.type}</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-[#1F2A40] backdrop-blur-sm">
                                    {pattern.confidence}% confidence
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400">{pattern.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] backdrop-blur-md rounded-xl p-6 border border-white/[0.05] shadow-lg relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-300">
                <div className="relative z-10 text-center">
                  <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a message to view its analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collaborative Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <Users2 className="w-6 h-6 mr-2 text-red-500" />
            Collaborative Tools
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shared Workspace */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-xl p-6 border border-white/[0.05] shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Laptop className="w-5 h-5 mr-2 text-red-500" />
                Shared Workspace
              </h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-400">Threat Analysis</label>
                    <div className={`px-3 py-1 rounded-full text-sm ${getThreatLevelColor(selectedItem?.analysis?.threatLevel)}`}>
                      <div className="flex items-center gap-2">
                        {getThreatLevelIcon(selectedItem?.analysis?.threatLevel)}
                        <span>{selectedItem?.analysis?.threatLevel?.toUpperCase() || 'UNKNOWN'}</span>
                      </div>
                    </div>
                  </div>
                  <textarea 
                    className="w-full bg-black/30 text-gray-300 rounded-md p-3 border border-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                    rows={4}
                    placeholder="Share your analysis and findings..."
                    value={selectedItem?.analysis?.strategy || ''}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/20 transition-all">
                    <Share2 className="w-4 h-4 inline-block mr-1" />
                    Share Analysis
                  </button>
                  <button className="px-4 py-2 bg-black/20 hover:bg-white/[0.02] text-gray-300 rounded-md border border-white/[0.05] transition-all">
                    <BarChart2 className="w-4 h-4 inline-block mr-1" />
                    View Patterns
                  </button>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-xl p-6 border border-white/[0.05] shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-red-500" />
                Live Chat
              </h3>
              <div className="space-y-4">
                <div className="h-48 overflow-y-auto bg-black/20 rounded-lg p-4 border border-white/[0.05]">
                  <div className="space-y-3">
                    {/* Sample Messages */}
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">A</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Agent Smith</p>
                        <div className="bg-black/20 rounded-lg p-2 mt-1">
                          <p className="text-sm text-gray-300">Found a pattern in the latest decryption.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-black/20 text-gray-300 rounded-md px-3 py-2 border border-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                    placeholder="Type your message..."
                  />
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/20 transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Clue Sharing */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-xl p-6 border border-white/[0.05] shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-red-500" />
                Clue Sharing
              </h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/[0.05]">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 text-sm rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      #DangerWord
                    </span>
                    <span className="px-3 py-1 text-sm rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      #Timeline
                    </span>
                    <span className="px-3 py-1 text-sm rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      #Location
                    </span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full bg-black/20 text-gray-300 rounded-md px-3 py-2 border border-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                    placeholder="Add new tag or pattern..."
                  />
                </div>
                <button className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/20 transition-all">
                  <Plus className="w-4 h-4 inline-block mr-1" />
                  Add Pattern
                </button>
              </div>
            </div>

            {/* Visualization Tools */}
            <div className="bg-white/[0.02] backdrop-blur-md rounded-xl p-6 border border-white/[0.05] shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Map className="w-5 h-5 mr-2 text-red-500" />
                Visualization Tools
              </h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/[0.05] h-48 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-red-500/50 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Interactive map and timeline visualization</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/20 transition-all">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    Timeline View
                  </button>
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md border border-red-500/20 transition-all">
                    <MapPin className="w-4 h-4 inline-block mr-1" />
                    Map View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Updates Banner */}
          <div className="mt-8 bg-white/[0.02] backdrop-blur-md rounded-xl p-4 border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Radio className="w-5 h-5 text-red-500 animate-pulse mr-2" />
                <span className="text-gray-300">Real-Time Updates Active</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">3 team members online</span>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-[#1F2A40] flex items-center justify-center text-red-400">A</div>
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-[#1F2A40] flex items-center justify-center text-red-400">B</div>
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-[#1F2A40] flex items-center justify-center text-red-400">C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationSpace;

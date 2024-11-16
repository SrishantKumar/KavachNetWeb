import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Share2, Shield, AlertTriangle, Loader } from 'lucide-react';
import { useMessages, useWorkspace } from '../hooks/useFirestore';
import { auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const CollaborationSpace = () => {
  // Use a default workspace ID for now - in a real app, this would come from the URL or user selection
  const workspaceId = 'default-workspace';
  const [user] = useAuthState(auth);
  const { messages, loading: messagesLoading, error: messagesError, addMessage, updateMessage } = useMessages(workspaceId);
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace(workspaceId);
  
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  const getThreatColor = (level: string) => {
    switch (level) {
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

  const addNote = async () => {
    if (!selectedMessage || !newNote.trim() || !user) return;

    const message = messages.find(m => m.id === selectedMessage);
    if (!message) return;

    try {
      await updateMessage(selectedMessage, {
        notes: [...message.notes, newNote.trim()]
      });
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  if (messagesLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (messagesError || workspaceError) {
    return (
      <div className="text-red-500 text-center py-8">
        {messagesError || workspaceError}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Please sign in to access the collaboration space.</p>
      </div>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Investigation Workspace
          </h2>
          <p className="text-gray-400">
            Collaborate with your team to analyze encrypted messages
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Message List */}
          <div className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-red-500/10">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Encrypted Messages
            </h3>
            <div className="space-y-4">
              {messages.map(message => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message.id)}
                  className={`w-full p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-all text-left ${
                    selectedMessage === message.id ? 'border-red-500 bg-red-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-mono text-sm text-gray-400 break-all">
                      {message.text}
                    </div>
                    <span className={`ml-2 flex items-center gap-1 ${getThreatColor(message.threatLevel)}`}>
                      <AlertTriangle className="w-4 h-4" />
                      {message.threatLevel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-red-500/10">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Threat Analysis
            </h3>
            
            {selectedMessage ? (
              <div className="space-y-6">
                {messages.filter(m => m.id === selectedMessage).map(message => (
                  <div key={message.id} className="space-y-6">
                    <div>
                      <h4 className="text-gray-400 mb-2">Decrypted Message:</h4>
                      <p className="font-mono text-white bg-gray-800 p-3 rounded">
                        {message.decrypted}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-gray-400 mb-2">Investigation Notes:</h4>
                      <div className="space-y-2 mb-4">
                        {message.notes.map((note, index) => (
                          <div key={index} className="bg-gray-800 p-3 rounded text-gray-300">
                            {note}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={addNote}
                          disabled={!newNote.trim()}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-400">
                        <Share2 className="w-4 h-4" />
                        Share Analysis
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a message to view analysis
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborationSpace;

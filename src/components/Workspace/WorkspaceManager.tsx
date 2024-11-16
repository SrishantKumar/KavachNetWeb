import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWorkspace } from '../../hooks/useFirestore';
import { Briefcase, Plus, Users, Shield } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'workspaces'), {
        name,
        createdBy: user.uid,
        members: [{ userId: user.uid, role: 'coordinator' }],
        createdAt: serverTimestamp(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Create Workspace</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Investigation Team Alpha"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkspaceManager: React.FC = () => {
  const [user] = useAuthState(auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const { workspace } = useWorkspace(selectedWorkspace || 'default-workspace');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator':
        return 'text-red-500';
      case 'analyzer':
        return 'text-blue-500';
      case 'decryptor':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Please sign in to manage workspaces</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              Workspaces
            </h2>
            <p className="text-gray-400 mt-1">
              Manage your investigation workspaces and team members
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </button>
        </div>

        {workspace && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {workspace.name}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Created {new Date(workspace.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-5 h-5" />
                  {workspace.members.length} members
                </div>
                <button className="text-red-500 hover:text-red-400">
                  <Shield className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400">Team Members</h4>
              <div className="grid gap-4">
                {workspace.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        {member.userId.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white">{member.userId}</div>
                        <div className={`text-sm ${getRoleColor(member.role)}`}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Handle workspace creation success
        }}
      />
    </div>
  );
};

export default WorkspaceManager;

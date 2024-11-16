import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { usePermissions } from '../../hooks/usePermissions';
import { Mail, UserPlus, X } from 'lucide-react';

interface Invitation {
  id: string;
  workspaceId: string;
  inviteeEmail: string;
  role: 'analyzer' | 'decryptor';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  createdBy: string;
}

interface InvitationManagerProps {
  workspaceId: string;
}

const InvitationManager: React.FC<InvitationManagerProps> = ({ workspaceId }) => {
  const [user] = useAuthState(auth);
  const { checkPermission } = usePermissions(workspaceId);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'analyzer' | 'decryptor'>('analyzer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitations = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, `workspaces/${workspaceId}/invitations`),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        const invitationData: Invitation[] = [];
        snapshot.forEach((doc) => {
          invitationData.push({ id: doc.id, ...doc.data() } as Invitation);
        });
        setInvitations(invitationData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    loadInvitations();
  }, [workspaceId, user]);

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !checkPermission('canInviteMembers')) return;

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, `workspaces/${workspaceId}/invitations`), {
        workspaceId,
        inviteeEmail: email,
        role,
        status: 'pending',
        createdAt: Date.now(),
        createdBy: user.uid,
      });

      // Send email notification using EmailJS
      // You can reuse your existing EmailJS configuration
      setEmail('');
      setRole('analyzer');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!user || !checkPermission('canInviteMembers')) return;

    try {
      await deleteDoc(
        doc(db, `workspaces/${workspaceId}/invitations/${invitationId}`)
      );
      setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!checkPermission('canInviteMembers')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/10">
        <h3 className="text-lg font-semibold text-white mb-4">Invite Team Member</h3>
        <form onSubmit={sendInvitation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="colleague@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'analyzer' | 'decryptor')}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="analyzer">Analyzer</option>
              <option value="decryptor">Decryptor</option>
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Send Invitation
              </>
            )}
          </button>
        </form>
      </div>

      {invitations.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/10">
          <h3 className="text-lg font-semibold text-white mb-4">Pending Invitations</h3>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded"
              >
                <div>
                  <div className="text-white">{invitation.inviteeEmail}</div>
                  <div className="text-sm text-gray-400">
                    Role: {invitation.role}
                  </div>
                </div>
                <button
                  onClick={() => cancelInvitation(invitation.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationManager;

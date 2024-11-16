import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWorkspace } from './useFirestore';

export type Role = 'coordinator' | 'analyzer' | 'decryptor';

export interface Permission {
  canCreateWorkspace: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canDeleteMessages: boolean;
  canDecryptMessages: boolean;
  canAnalyzeMessages: boolean;
  canGenerateKeys: boolean;
  canViewAnalytics: boolean;
}

const DEFAULT_PERMISSIONS: Record<Role, Permission> = {
  coordinator: {
    canCreateWorkspace: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canDeleteMessages: true,
    canDecryptMessages: true,
    canAnalyzeMessages: true,
    canGenerateKeys: true,
    canViewAnalytics: true,
  },
  analyzer: {
    canCreateWorkspace: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canDeleteMessages: false,
    canDecryptMessages: false,
    canAnalyzeMessages: true,
    canGenerateKeys: false,
    canViewAnalytics: true,
  },
  decryptor: {
    canCreateWorkspace: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canDeleteMessages: false,
    canDecryptMessages: true,
    canAnalyzeMessages: false,
    canGenerateKeys: true,
    canViewAnalytics: false,
  },
};

export const usePermissions = (workspaceId: string) => {
  const [user] = useAuthState(auth);
  const { workspace } = useWorkspace(workspaceId);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        if (!user || !workspace) {
          setPermissions(null);
          setUserRole(null);
          return;
        }

        const member = workspace.members.find((m) => m.userId === user.uid);
        if (!member) {
          setError('User is not a member of this workspace');
          setPermissions(null);
          setUserRole(null);
          return;
        }

        const role = member.role as Role;
        setUserRole(role);
        setPermissions(DEFAULT_PERMISSIONS[role]);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setPermissions(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user, workspace]);

  const checkPermission = (permission: keyof Permission): boolean => {
    if (!permissions) return false;
    return permissions[permission];
  };

  return {
    userRole,
    permissions,
    loading,
    error,
    checkPermission,
    isCoordinator: userRole === 'coordinator',
    isAnalyzer: userRole === 'analyzer',
    isDecryptor: userRole === 'decryptor',
  };
};

export const useWorkspaceAccess = (workspaceId: string) => {
  const { permissions, loading, error } = usePermissions(workspaceId);
  const [user] = useAuthState(auth);

  const enforcePermission = async (
    permission: keyof Permission,
    action: () => Promise<void>
  ) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    if (!permissions) {
      throw new Error('No permissions available');
    }

    if (!permissions[permission]) {
      throw new Error('Insufficient permissions');
    }

    await action();
  };

  return {
    enforcePermission,
    loading,
    error,
  };
};

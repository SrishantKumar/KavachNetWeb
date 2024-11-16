import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Message {
  id: string;
  text: string;
  decrypted: string;
  threatLevel: 'low' | 'medium' | 'high';
  timestamp: number;
  notes: string[];
  userId: string;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  createdBy: string;
  members: {
    userId: string;
    role: 'analyzer' | 'decryptor' | 'coordinator';
  }[];
  createdAt: number;
}

export const useMessages = (workspaceId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('workspaceId', '==', workspaceId)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const messageData: Message[] = [];
        snapshot.forEach((doc) => {
          messageData.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(messageData.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [workspaceId]);

  const addMessage = async (message: Omit<Message, 'id'>) => {
    try {
      await addDoc(collection(db, 'messages'), message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateMessage = async (messageId: string, updates: Partial<Message>) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    deleteMessage
  };
};

export const useWorkspace = (workspaceId: string) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'workspaces', workspaceId),
      (doc) => {
        if (doc.exists()) {
          setWorkspace({ id: doc.id, ...doc.data() } as Workspace);
        } else {
          setWorkspace(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [workspaceId]);

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    try {
      await updateDoc(doc(db, 'workspaces', workspaceId), updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    workspace,
    loading,
    error,
    updateWorkspace
  };
};

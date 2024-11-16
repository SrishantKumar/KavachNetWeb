import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DecryptionHistoryItem {
  id?: string;
  userId: string;
  encryptedText: string;
  decryptedText: string;
  timestamp: Date;
  method: 'auto' | 'manual';
  analysis: any;
}

export const useDecryptionHistory = () => {
  const addDecryptionHistory = async (historyItem: Omit<DecryptionHistoryItem, 'id'>) => {
    try {
      const historyRef = collection(db, 'decryptionHistory');
      await addDoc(historyRef, {
        ...historyItem,
        timestamp: Timestamp.fromDate(historyItem.timestamp)
      });
    } catch (error) {
      console.error('Error adding decryption history:', error);
      throw error;
    }
  };

  const getDecryptionHistory = async (userId: string): Promise<DecryptionHistoryItem[]> => {
    try {
      const historyRef = collection(db, 'decryptionHistory');
      const q = query(
        historyRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate()
      })) as DecryptionHistoryItem[];
    } catch (error) {
      console.error('Error getting decryption history:', error);
      return [];
    }
  };

  return {
    addDecryptionHistory,
    getDecryptionHistory
  };
};

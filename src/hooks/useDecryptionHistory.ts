import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ThreatAnalysis } from '../utils/threatAnalysis';

export interface DecryptionHistoryItem {
  id?: string;
  userId: string;
  encryptedText: string;
  decryptedText: string;
  timestamp: Date;
  method: 'auto' | 'manual';
  analysis: ThreatAnalysis;
}

export const useDecryptionHistory = () => {
  const addDecryptionHistory = async (historyItem: Omit<DecryptionHistoryItem, 'id'>) => {
    try {
      const historyRef = collection(db, 'decryptionHistory');
      await addDoc(historyRef, {
        ...historyItem,
        timestamp: Timestamp.fromDate(historyItem.timestamp),
        analysis: {
          ...historyItem.analysis,
          threatLevel: historyItem.analysis?.threatLevel || 'unknown',
          score: historyItem.analysis?.score || 0,
          indicators: historyItem.analysis?.indicators || [],
          locations: historyItem.analysis?.locations || [],
          timeIndicators: historyItem.analysis?.timeIndicators || [],
          summary: historyItem.analysis?.summary || 'No threat analysis available',
          details: historyItem.analysis?.details || {
            sensitiveData: false,
            massImpact: false,
            infrastructure: false,
            timeProximity: false,
            coordinatedActivity: false
          }
        }
      });
    } catch (error) {
      console.error('Error adding decryption history:', error);
      throw error;
    }
  };

  const deleteDecryptionHistory = async (id: string) => {
    try {
      const docRef = doc(db, 'decryptionHistory', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting decryption history:', error);
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
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp).toDate(),
          analysis: {
            ...data.analysis,
            threatLevel: data.analysis?.threatLevel || 'unknown',
            score: data.analysis?.score || 0,
            indicators: data.analysis?.indicators || [],
            locations: data.analysis?.locations || [],
            timeIndicators: data.analysis?.timeIndicators || [],
            summary: data.analysis?.summary || 'No threat analysis available',
            details: data.analysis?.details || {
              sensitiveData: false,
              massImpact: false,
              infrastructure: false,
              timeProximity: false,
              coordinatedActivity: false
            }
          }
        } as DecryptionHistoryItem;
      });
    } catch (error) {
      console.error('Error getting decryption history:', error);
      return [];
    }
  };

  return {
    addDecryptionHistory,
    getDecryptionHistory,
    deleteDecryptionHistory
  };
};

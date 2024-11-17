import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB8xv1eEBVr-eR2XeY4VZQ3ZAnt_rqPcBw",
  authDomain: "kavachnet-9602e.firebaseapp.com",
  projectId: "kavachnet-9602e",
  storageBucket: "kavachnet-9602e.firebasestorage.app",
  messagingSenderId: "673982619413",
  appId: "1:673982619413:web:7ef0cf6741bc24dc50d31c",
  measurementId: "G-5MZ277H3NE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Enable Firestore offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.log('Persistence not supported by browser');
    }
  });

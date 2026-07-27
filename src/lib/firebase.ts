import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export function initAnonymousAuth(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            await signInAnonymously(auth);
          } catch {
            // Anonymous auth disabled or restricted - proceeding with unauthenticated Firestore access
          }
        }
        if (unsub) unsub();
        resolve();
      }, () => resolve());
    } catch {
      resolve();
    }
  });
}

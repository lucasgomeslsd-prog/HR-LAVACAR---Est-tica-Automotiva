import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with auto detect long polling for maximum network stability in iframe/proxy environments
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : '(default)';

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, databaseId);

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


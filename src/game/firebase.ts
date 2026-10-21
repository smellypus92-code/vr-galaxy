import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile interface
export interface UserProfileData {
  uid: string;
  displayName: string;
  photoURL?: string;
  highScore: number;
  maxCombo?: number;
  totalKills?: number;
  deflections?: number;
  shardsSliced?: number;
  selectedChampion?: string;
  unlockedAchievements?: string[];
  credits?: number;
  unlockedExclusiveBadges?: string[];
  dailyMissionsState?: string;
  admobConfig?: string;
  reticleStyle?: string;
  reticleIdleColor?: string;
  reticleTargetColor?: string;
  updatedAt?: string;
}

export interface LeaderboardItem {
  id: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  score: number;
  wave: number;
  maxCombo: number;
  champion: string;
  createdAt?: string;
}

// Sign in with Google
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err) {
    console.error('Google sign-in error:', err);
    return null;
  }
}

// Sign out
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out error:', err);
  }
}

// Save or update user profile in Firestore
export async function saveUserProfile(data: Partial<UserProfileData>): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}`;
  try {
    const existingSnap = await getDoc(doc(db, 'users', user.uid));
    const prev = existingSnap.exists() ? (existingSnap.data() as UserProfileData) : null;

    // Merge unlocked achievements
    let mergedAchievements = prev?.unlockedAchievements || [];
    if (data.unlockedAchievements) {
      mergedAchievements = Array.from(new Set([...mergedAchievements, ...data.unlockedAchievements]));
    }

    // Merge unlocked exclusive daily badges
    let mergedExclusiveBadges = prev?.unlockedExclusiveBadges || [];
    if (data.unlockedExclusiveBadges) {
      mergedExclusiveBadges = Array.from(new Set([...mergedExclusiveBadges, ...data.unlockedExclusiveBadges]));
    }

    const payload: UserProfileData = {
      uid: user.uid,
      displayName: data.displayName || user.displayName || 'Cyber Operative',
      highScore: Math.max(prev?.highScore || 0, data.highScore || 0),
      maxCombo: Math.max(prev?.maxCombo || 0, data.maxCombo || 0),
      totalKills: Math.max(prev?.totalKills || 0, data.totalKills !== undefined ? data.totalKills : 0),
      deflections: Math.max(prev?.deflections || 0, data.deflections !== undefined ? data.deflections : 0),
      shardsSliced: Math.max(prev?.shardsSliced || 0, data.shardsSliced !== undefined ? data.shardsSliced : 0),
      selectedChampion: data.selectedChampion || prev?.selectedChampion || 'ELENA',
      unlockedAchievements: mergedAchievements,
      credits: data.credits !== undefined ? data.credits : (prev?.credits || 0),
      unlockedExclusiveBadges: mergedExclusiveBadges,
      dailyMissionsState: data.dailyMissionsState || prev?.dailyMissionsState || '',
      admobConfig: data.admobConfig || prev?.admobConfig || '',
      reticleStyle: data.reticleStyle || prev?.reticleStyle || 'CYBER_RING',
      reticleIdleColor: data.reticleIdleColor || prev?.reticleIdleColor || '#00f3ff',
      reticleTargetColor: data.reticleTargetColor || prev?.reticleTargetColor || '#ff0055',
      updatedAt: new Date().toISOString(),
    };

    if (user.photoURL) {
      payload.photoURL = user.photoURL;
    }

    await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch user profile
export async function fetchUserProfile(uid: string): Promise<UserProfileData | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// Submit score to global leaderboard
export async function submitLeaderboardScore(score: number, wave: number, maxCombo: number, champion: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || score <= 0) return;

  const entryId = `${user.uid}_${Date.now()}`;
  const path = `leaderboard/${entryId}`;

  const payload: Omit<LeaderboardItem, 'id'> = {
    uid: user.uid,
    displayName: user.displayName || 'Cyber Beach Ace',
    score,
    wave,
    maxCombo,
    champion,
    createdAt: new Date().toISOString(),
  };

  if (user.photoURL) {
    payload.photoURL = user.photoURL;
  }

  try {
    await setDoc(doc(db, 'leaderboard', entryId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Fetch top leaderboard scores
export async function fetchLeaderboard(): Promise<LeaderboardItem[]> {
  const path = 'leaderboard';
  try {
    const q = query(collection(db, path), orderBy('score', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<LeaderboardItem, 'id'>),
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export { onAuthStateChanged };

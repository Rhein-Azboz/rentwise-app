// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// SIGN UP
export async function signUp(
  email: string,
  password: string,
  role: 'student' | 'owner',
  name: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Save user record to Firestore
  await setDoc(doc(db, 'users', uid), {
    uid,
    role,
    name,
    email,
    isVerified: role === 'student' ? true : false,
    isBanned: false,
    verificationStatus: role === 'owner' ? 'pending' : null,
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

// LOG IN
export async function logIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// GET USER DATA from Firestore
export async function getUserData(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return snap.data();
  return null;
}

// LOG OUT
export async function logOut() {
  await signOut(auth);
}
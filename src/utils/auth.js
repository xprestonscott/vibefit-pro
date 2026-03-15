import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

// ── Save user profile to Firestore ───────────────────────────
export async function saveProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    name:       data.name       || '',
    email:      data.email      || '',
    goal:       data.goal       || '',
    experience: data.experience || '',
    joinDate:   data.joinDate   || new Date().toISOString(),
    onboarded:  data.onboarded  || false,
    updatedAt:  serverTimestamp(),
  }, { merge: true })
}

// ── Get user profile from Firestore ──────────────────────────
export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ── Sign up with email ────────────────────────────────────────
export async function signUp(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await saveProfile(cred.user.uid, { name, email, joinDate: new Date().toISOString(), onboarded: false })
  return cred.user
}

// ── Sign in with email ────────────────────────────────────────
export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

// ── Sign in with Google ───────────────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const cred     = await signInWithPopup(auth, provider)
  // Create profile if first time
  const existing = await getProfile(cred.user.uid)
  if (!existing) {
    await saveProfile(cred.user.uid, {
      name:      cred.user.displayName || '',
      email:     cred.user.email       || '',
      joinDate:  new Date().toISOString(),
      onboarded: false,
    })
  }
  return cred.user
}

// ── Sign out ──────────────────────────────────────────────────
export async function logOut() {
  await signOut(auth)
}

// ── Listen for auth state changes ────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

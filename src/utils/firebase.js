import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            "AIzaSyDf3SfLO0JUK_yGeRYZsRmw-Sp7tNlTJzI",
  authDomain:        "vibefit-pro.firebaseapp.com",
  projectId:         "vibefit-pro",
  storageBucket:     "vibefit-pro.firebasestorage.app",
  messagingSenderId: "887910271308",
  appId:             "1:887910271308:web:e1d5ed73b9daa2a69367e9",
  measurementId:     "G-L8MNWHV1B5",
}

const app = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)

import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp, orderBy, limit,
  addDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Save user profile ─────────────────────────────────────────
export async function saveUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    name:       data.name       || '',
    email:      data.email      || '',
    goal:       data.goal       || '',
    experience: data.experience || '',
    weight:     data.weight     || '',
    height:     data.height     || '',
    activity:   data.activity   || '',
    joinDate:   data.joinDate   || new Date().toISOString(),
    onboarded:  true,
    updatedAt:  serverTimestamp(),
  }, { merge: true })
}

// ── Search users by name ──────────────────────────────────────
export async function searchUsers(term) {
  const snap = await getDocs(query(collection(db, 'users'), limit(50)))
  return snap.docs
    .map(d => d.data())
    .filter(u => u.name?.toLowerCase().includes(term.toLowerCase()))
}

// ── Get all users (for discover) ─────────────────────────────
export async function getAllUsers(excludeUid) {
  const snap = await getDocs(query(collection(db, 'users'), limit(30)))
  return snap.docs.map(d => d.data()).filter(u => u.uid !== excludeUid)
}

// ── Send friend request ───────────────────────────────────────
export async function sendFriendRequest(fromUid, fromName, toUid) {
  const id = `${fromUid}_${toUid}`
  await setDoc(doc(db, 'friendRequests', id), {
    id, fromUid, fromName, toUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

// ── Accept friend request ─────────────────────────────────────
export async function acceptFriendRequest(requestId, uid1, uid2) {
  await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' })
  await setDoc(doc(db, 'friends', `${uid1}_${uid2}`), { uid1, uid2, since: serverTimestamp() })
  await setDoc(doc(db, 'friends', `${uid2}_${uid1}`), { uid1: uid2, uid2: uid1, since: serverTimestamp() })
}

// ── Decline friend request ────────────────────────────────────
export async function declineFriendRequest(requestId) {
  await deleteDoc(doc(db, 'friendRequests', requestId))
}

// ── Remove friend ─────────────────────────────────────────────
export async function removeFriend(uid1, uid2) {
  await deleteDoc(doc(db, 'friends', `${uid1}_${uid2}`))
  await deleteDoc(doc(db, 'friends', `${uid2}_${uid1}`))
}

// ── Get friends list ──────────────────────────────────────────
export async function getFriends(uid) {
  const q    = query(collection(db, 'friends'), where('uid1', '==', uid))
  const snap = await getDocs(q)
  const uids = snap.docs.map(d => d.data().uid2)
  if (!uids.length) return []
  const profiles = await Promise.all(uids.map(id => getDoc(doc(db, 'users', id))))
  return profiles.filter(d => d.exists()).map(d => d.data())
}

// ── Get friend status between two users ──────────────────────
export async function getFriendStatus(myUid, theirUid) {
  const [f, req, inbound] = await Promise.all([
    getDoc(doc(db, 'friends', `${myUid}_${theirUid}`)),
    getDoc(doc(db, 'friendRequests', `${myUid}_${theirUid}`)),
    getDoc(doc(db, 'friendRequests', `${theirUid}_${myUid}`)),
  ])
  if (f.exists())       return 'friends'
  if (req.exists())     return 'pending'
  if (inbound.exists()) return 'inbound'
  return 'none'
}

// ── Listen for incoming friend requests ──────────────────────
export function listenForRequests(uid, callback) {
  const q = query(
    collection(db, 'friendRequests'),
    where('toUid', '==', uid),
    where('status', '==', 'pending')
  )
  return onSnapshot(q, snap => callback(snap.docs.map(d => d.data())))
}

// ── Post to feed ──────────────────────────────────────────────
export async function postToFeed(uid, name, text, type = 'update') {
  await addDoc(collection(db, 'feed'), {
    uid, name, text, type,
    likes: [],
    createdAt: serverTimestamp(),
  })
}

// ── Listen to feed (real-time) ────────────────────────────────
export function listenToFeed(callback) {
  const q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), limit(30))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

// ── Toggle like ───────────────────────────────────────────────
export async function toggleLike(postId, uid) {
  const ref  = doc(db, 'feed', postId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const likes = snap.data().likes || []
  await updateDoc(ref, {
    likes: likes.includes(uid) ? arrayRemove(uid) : arrayUnion(uid)
  })
}

// ── Delete post ───────────────────────────────────────────────
export async function deletePost(postId) {
  await deleteDoc(doc(db, 'feed', postId))
}

// ── Send direct message ───────────────────────────────────────
export async function sendMessage(fromUid, fromName, toUid, text) {
  const chatId = [fromUid, toUid].sort().join('_')
  await addDoc(collection(db, 'messages', chatId, 'msgs'), {
    fromUid, fromName, toUid, text,
    createdAt: serverTimestamp(),
    read: false,
  })
  // Update chat thread
  await setDoc(doc(db, 'chats', chatId), {
    participants: [fromUid, toUid],
    lastMessage: text,
    lastFrom: fromName,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// ── Listen to messages ────────────────────────────────────────
export function listenToMessages(uid1, uid2, callback) {
  const chatId = [uid1, uid2].sort().join('_')
  const q = query(
    collection(db, 'messages', chatId, 'msgs'),
    orderBy('createdAt', 'asc'),
    limit(100)
  )
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

// src/services/listings.service.ts
import {
  collection, addDoc, getDocs, getDoc,
  doc, updateDoc, query, where,
  orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Listing } from '../types/listing.types';
import { getDistanceFromNEU } from '../utils/distance';

export async function createListing(
  data: Omit<Listing, 'listingId' | 'distanceFromNEU' | 'status' | 'averageRating' | 'reviewCount' | 'createdAt'>
) {
  const distanceFromNEU = getDistanceFromNEU(data.latitude, data.longitude);
  const docRef = await addDoc(collection(db, 'listings'), {
    ...data,
    distanceFromNEU,
    status: 'pending',
    averageRating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getApprovedListings(): Promise<Listing[]> {
  const q = query(
    collection(db, 'listings'),
    where('status', '==', 'approved'),
    orderBy('distanceFromNEU', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ listingId: d.id, ...d.data() } as Listing));
}

export async function getListingById(listingId: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, 'listings', listingId));
  if (snap.exists()) return { listingId: snap.id, ...snap.data() } as Listing;
  return null;
}

export async function getOwnerListings(ownerId: string): Promise<Listing[]> {
  const q = query(
    collection(db, 'listings'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ listingId: d.id, ...d.data() } as Listing));
}

export async function getPendingListings(): Promise<Listing[]> {
  const q = query(
    collection(db, 'listings'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ listingId: d.id, ...d.data() } as Listing));
}

export async function updateListingStatus(
  listingId: string,
  status: 'approved' | 'rejected'
) {
  await updateDoc(doc(db, 'listings', listingId), { status });
}
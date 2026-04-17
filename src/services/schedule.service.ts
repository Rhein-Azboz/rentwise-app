// src/services/schedule.service.ts
import {
  collection, addDoc, getDocs, doc,
  updateDoc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ViewingSchedule, ScheduleStatus } from '../types/schedule.types';

// Student requests a viewing
export async function requestViewing(
  data: Omit<ViewingSchedule, 'scheduleId' | 'status' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'viewingSchedules'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get all schedules for a student
export async function getStudentSchedules(studentId: string): Promise<ViewingSchedule[]> {
  const q = query(
    collection(db, 'viewingSchedules'),
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ scheduleId: d.id, ...d.data() } as ViewingSchedule));
}

// Get all schedules for an owner
export async function getOwnerSchedules(ownerId: string): Promise<ViewingSchedule[]> {
  const q = query(
    collection(db, 'viewingSchedules'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ scheduleId: d.id, ...d.data() } as ViewingSchedule));
}

// Update schedule status (owner accepts/rejects, student cancels)
export async function updateScheduleStatus(
  scheduleId: string,
  status: ScheduleStatus
): Promise<void> {
  await updateDoc(doc(db, 'viewingSchedules', scheduleId), { status });
}
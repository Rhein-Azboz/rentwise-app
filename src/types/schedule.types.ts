// src/types/schedule.types.ts
export type ScheduleStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type ViewingSchedule = {
  scheduleId: string;
  studentId: string;
  studentName: string;
  ownerId: string;
  listingId: string;
  listingTitle: string;
  proposedDate: string;   // stored as ISO string
  proposedTime: string;   // e.g. "2:00 PM"
  status: ScheduleStatus;
  createdAt: any;
};
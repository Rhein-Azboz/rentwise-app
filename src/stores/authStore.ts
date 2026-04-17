// src/stores/authStore.ts
import { create } from 'zustand';

type User = {
  uid: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  name: string;
  isVerified?: boolean;
  isBanned?: boolean;
};

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (val: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (val) => set({ isLoading: val }),
}));

// Add this at the bottom of src/stores/authStore.ts

type LocationStore = {
  pickedLat: number | null;
  pickedLng: number | null;
  setPicked: (lat: number, lng: number) => void;
  clearPicked: () => void;
};

export const useLocationStore = create<LocationStore>((set) => ({
  pickedLat: null,
  pickedLng: null,
  setPicked: (lat, lng) => set({ pickedLat: lat, pickedLng: lng }),
  clearPicked: () => set({ pickedLat: null, pickedLng: null }),
}));
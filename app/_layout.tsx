// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { getUserData, logOut } from '../src/services/auth.service';
import { useAuthStore } from '../src/stores/authStore';
//import Mapbox from '@rnmapbox/maps';

//Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const data = await getUserData(firebaseUser.uid);

        if (!data) {
          await logOut();
          router.replace('/(auth)/login');
          setLoading(false);
          return;
        }

        // Block banned users immediately
        if (data.isBanned) {
          await logOut();
          router.replace('/(auth)/login');
          setLoading(false);
          return;
        }

        // Block owners who are not yet approved
        if (data.role === 'owner' && data.verificationStatus !== 'approved') {
          setLoading(false);
          router.replace('/(auth)/owner-pending');
          return;
        }

        // All checks passed — set user and go to app
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          role: data.role,
          name: data.name,
          isVerified: data.isVerified,
          isBanned: data.isBanned,
        });

        router.replace('/(tabs)');

      } else {
        setUser(null);
        router.replace('/(auth)/login');
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
import { setupDatabase } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Slot, router } from 'expo-router';
import { useEffect, useState } from 'react';
import 'react-native-get-random-values';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setupDatabase();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(app)/');
      } else {
        router.replace('/(auth)/');
      }
    });

    setReady(true);
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  return (
    <Slot />
  );
}
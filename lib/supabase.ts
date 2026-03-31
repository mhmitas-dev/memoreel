import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const CHUNK_SIZE = 1800; // safe under 2048 limit

const ChunkedSecureStore = {
    async getItem(key: string): Promise<string | null> {
        const countStr = await SecureStore.getItemAsync(`${key}_count`);
        if (!countStr) return null;

        const count = parseInt(countStr, 10);
        let value = '';
        for (let i = 0; i < count; i++) {
            const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
            if (chunk === null) return null;
            value += chunk;
        }
        return value;
    },

    async setItem(key: string, value: string): Promise<void> {
        const chunks = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
            chunks.push(value.slice(i, i + CHUNK_SIZE));
        }
        await SecureStore.setItemAsync(`${key}_count`, String(chunks.length));
        await Promise.all(
            chunks.map((chunk, i) =>
                SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk)
            )
        );
    },

    async removeItem(key: string): Promise<void> {
        const countStr = await SecureStore.getItemAsync(`${key}_count`);
        if (!countStr) return;

        const count = parseInt(countStr, 10);
        await SecureStore.deleteItemAsync(`${key}_count`);
        await Promise.all(
            Array.from({ length: count }, (_, i) =>
                SecureStore.deleteItemAsync(`${key}_chunk_${i}`)
            )
        );
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ChunkedSecureStore,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

GoogleSignin.configure({
    webClientId: '1006777619003-ls2po4eq7aa80pp5d4g0mqijekd9ahav.apps.googleusercontent.com', // from Google Cloud Console
    scopes: ['profile', 'email'],
});

export async function signInWithGoogle() {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        const idToken = userInfo.data?.idToken;
        if (!idToken) throw new Error('No ID token returned');

        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });

        if (error) throw error;
        return data;

    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled, do nothing
            return null;
        }
        throw error;
    }
}

export async function signOut() {
    await GoogleSignin.signOut();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}
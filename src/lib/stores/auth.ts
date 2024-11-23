import { writable } from 'svelte/store';
import { pb } from '$lib/pocketbase';
import type { Record } from 'pocketbase';

export const currentUser = writable<Record | null>(pb.authStore.model);

// Update store on auth changes
pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model);
});

export async function login(email: string, password: string) {
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);

        if (!authData.record.verified) {
            throw new Error('Please verify your email before logging in.');
        }

        currentUser.set(authData.record);
        return authData;
    } catch (e: any) {
        console.error('Login error:', e);
        throw e;
    }
}

export async function register(email: string, password: string, passwordConfirm: string) {
    const user = await pb.collection('users').create(
        {
            email,
            password,
            passwordConfirm,
        },
        {
            requireVerification: true, // Ensure verification email is sent
        }
    );
    return user; // Do not auto-login until the user verifies their email
}


export async function logout() {
    pb.authStore.clear();
    currentUser.set(null);
}

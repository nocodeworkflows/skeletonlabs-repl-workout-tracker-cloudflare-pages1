import { writable } from 'svelte/store';
import { pb } from '$lib/pocketbase';
import type { Record } from 'pocketbase';

export const currentUser = writable<Record | null>(pb.authStore.model);

// Update store on auth changes
pb.authStore.onChange((auth) => {
    currentUser.set(pb.authStore.model);
});

export async function login(email: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(email, password);
    currentUser.set(authData.record);
    return authData;
}

export async function register(email: string, password: string, passwordConfirm: string) {
    const user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
    });
    await login(email, password);
    return user;
}

export async function logout() {
    pb.authStore.clear();
    currentUser.set(null);
}
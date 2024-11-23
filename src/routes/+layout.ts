import { redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase';

// This enables client-side routing and disables SSR
export const prerender = false;
export const ssr = false;
export const csr = true;

// Handle 404 errors gracefully
export const trailingSlash = 'never';

// Protected routes that require authentication
const protectedRoutes = ['/workouts', '/exercises', '/templates'];

// Auth check for protected routes
export async function load({ url }) {
    const isProtectedRoute = protectedRoutes.some(route => 
        url.pathname.startsWith(route)
    );

    if (isProtectedRoute && !pb.authStore.isValid) {
        throw redirect(303, '/login');
    }

    return {};
}
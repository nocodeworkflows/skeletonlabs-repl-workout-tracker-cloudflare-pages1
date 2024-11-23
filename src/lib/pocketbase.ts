import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

// Create a single PocketBase instance
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

// Helper function to handle network errors
export async function handlePocketbaseError(error: any): Promise<string> {
    console.error('PocketBase error:', error);
    
    if (error?.isAbort) {
        return 'Request was cancelled. Please try again.';
    }
    if (error?.status === 0) {
        return 'Network error. Please check your connection.';
    }
    if (error?.status === 404) {
        return 'Resource not found.';
    }
    if (error?.response?.message) {
        return error.response.message;
    }
    return 'An unexpected error occurred.';
}

// Wrapper for PocketBase requests with retry logic
export async function retryRequest<T>(
    requestFn: () => Promise<T>,
    maxAttempts = 3,
    delayMs = 1000
): Promise<T> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await requestFn();
        } catch (error: any) {
            lastError = error;
            
            // Don't retry if it's a 404 or auth error
            if (error?.status === 404 || error?.status === 401) {
                throw error;
            }
            
            // Don't retry if explicitly aborted
            if (error?.isAbort) {
                throw error;
            }
            
            // Wait before retrying
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            }
        }
    }
    
    throw lastError;
}

// Get the current user's ID safely
export function getCurrentUserId(): string {
    if (!pb.authStore.model?.id) {
        throw new Error('User not authenticated');
    }
    return pb.authStore.model.id;
}
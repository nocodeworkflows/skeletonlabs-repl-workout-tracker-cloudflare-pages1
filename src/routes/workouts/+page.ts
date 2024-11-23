import type { PageLoad } from './$types';
import { pb, retryRequest, handlePocketbaseError, getCurrentUserId } from '$lib/pocketbase';
import type { Workout } from '$lib/types';

export const load: PageLoad = async ({ depends }) => {
    // Add dependency on workouts to allow manual refreshing
    depends('workouts');

    const abortController = new AbortController();

    try {
        const userId = getCurrentUserId();
        
        const workouts = await retryRequest(() => 
            pb.collection('workouts').getFullList<Workout>({
                sort: '-performed_date',
                expand: 'workout_template,workout_exercises(workout).exercise',
                filter: `user = "${userId}" && status != "draft"`,
                $cancelKey: abortController.signal
            })
        );

        return {
            workouts,
            error: null
        };
    } catch (e: any) {
        // Don't show error for aborted requests
        if (e?.isAbort) {
            return {
                workouts: [],
                error: null
            };
        }

        console.error('Error loading workouts:', e);
        return {
            workouts: [],
            error: await handlePocketbaseError(e)
        };
    } finally {
        abortController.abort();
    }
};
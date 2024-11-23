import type { PageLoad } from './$types';
import { pb, retryRequest } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { Workout, WorkoutExercise, WorkoutSet } from '$lib/types';

export const load: PageLoad = async ({ params }) => {
    try {
        const [workout, workoutExercises, sets] = await Promise.all([
            retryRequest(() => 
                pb.collection('workouts').getOne<Workout>(params.id, {
                    expand: 'workout_template,workout_exercises(workout).exercise'
                })
            ),
            retryRequest(() => 
                pb.collection('workout_exercises').getFullList<WorkoutExercise>({
                    filter: `workout = "${params.id}"`,
                    expand: 'exercise',
                    sort: 'display_order'
                })
            ),
            retryRequest(() => 
                pb.collection('workout_sets').getFullList<WorkoutSet>({
                    filter: `workout = "${params.id}"`,
                    sort: 'created'
                })
            )
        ]);

        if (!workout) {
            throw error(404, 'Workout not found');
        }

        return {
            workout,
            workoutExercises,
            sets,
            error: null
        };
    } catch (e: any) {
        console.error('Error loading workout:', e);
        if (e?.status === 404) {
            throw error(404, 'Workout not found');
        }
        throw error(500, await handlePocketbaseError(e));
    }
};
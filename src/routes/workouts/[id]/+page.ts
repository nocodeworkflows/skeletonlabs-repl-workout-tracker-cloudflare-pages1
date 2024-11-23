import type { PageLoad } from './$types';
import { pb } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        // First check if workout exists
        const workout = await pb.collection('workouts').getOne(params.id, {
            expand: 'workout_template'
        });

        if (!workout) {
            throw error(404, 'Workout not found');
        }

        // Then load related data
        const [workoutExercises, exercises, sets] = await Promise.all([
            pb.collection('workout_exercises').getFullList({
                filter: `workout = "${params.id}"`,
                expand: 'exercise',
                sort: 'display_order'
            }),
            pb.collection('exercises').getFullList({
                sort: 'name'
            }),
            pb.collection('workout_sets').getFullList({
                filter: `workout = "${params.id}"`,
                sort: 'created'
            })
        ]);

        return {
            workout,
            workoutExercises,
            exercises,
            sets
        };
    } catch (e: any) {
        console.error('Error loading workout:', e);
        if (e?.status === 404) {
            throw error(404, 'Workout not found');
        }
        throw error(500, 'Failed to load workout');
    }
};
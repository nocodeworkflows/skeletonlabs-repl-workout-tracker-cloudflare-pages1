import type { PageLoad } from './$types';
import { pb } from '$lib/pocketbase';
import type { WorkoutTemplate, Exercise } from '$lib/types';

export const load: PageLoad = async () => {
    try {
        const [templates, exercises] = await Promise.all([
            pb.collection('workout_templates').getFullList<WorkoutTemplate>({
                sort: '-created',
                expand: 'template_exercises(workout_template).exercise'
            }),
            pb.collection('exercises').getFullList<Exercise>({
                sort: 'name'
            })
        ]);

        return {
            templates,
            exercises,
            error: null
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return {
            templates: [],
            exercises: [],
            error: 'Failed to load templates and exercises'
        };
    }
};
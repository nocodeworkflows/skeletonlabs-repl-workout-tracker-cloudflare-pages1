import { writable } from 'svelte/store';
import type { Workout, WorkoutExercise, WorkoutSet } from '$lib/types';

export interface WorkoutStore {
    currentWorkout: Workout | null;
    exercises: WorkoutExercise[];
    sets: WorkoutSet[];
    loading: boolean;
    error: string | null;
}

export const workoutStore = writable<WorkoutStore>({
    currentWorkout: null,
    exercises: [],
    sets: [],
    loading: false,
    error: null
});
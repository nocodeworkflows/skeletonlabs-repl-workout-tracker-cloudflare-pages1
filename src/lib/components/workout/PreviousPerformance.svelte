<script lang="ts">
    import type { WorkoutSet } from '$lib/types';
    import { pb } from '$lib/pocketbase';
    import { onMount } from 'svelte';
    import LoadingSpinner from '../LoadingSpinner.svelte';
    
    export let exerciseId: string;
    
    let previousSets: WorkoutSet[] = [];
    let loading = true;
    let error: string | null = null;
    
    onMount(async () => {
        try {
            // Get the last workout that included this exercise
            const workouts = await pb.collection('workouts').getList(1, 1, {
                filter: `workout_exercises.exercise = "${exerciseId}" && status = "completed"`,
                sort: '-performed_date',
                expand: 'workout_exercises(workout).exercise'
            });
            
            if (workouts.items.length > 0) {
                const lastWorkout = workouts.items[0];
                const workoutExercise = lastWorkout.expand?.['workout_exercises(workout)']
                    ?.find((we: any) => we.exercise === exerciseId);
                
                if (workoutExercise) {
                    // Get the sets for this exercise from the last workout
                    const sets = await pb.collection('workout_sets').getFullList({
                        filter: `workout_exercise = "${workoutExercise.id}"`,
                        sort: 'set_number'
                    });
                    previousSets = sets;
                }
            }
        } catch (e) {
            console.error('Error loading previous performance:', e);
            error = 'Failed to load previous performance';
        } finally {
            loading = false;
        }
    });
</script>

<div class="card variant-ghost p-4">
    <h3 class="h3 mb-4">Previous Performance</h3>
    
    {#if loading}
        <div class="flex justify-center p-4">
            <LoadingSpinner />
        </div>
    {:else if error}
        <p class="text-error-500">{error}</p>
    {:else if previousSets.length === 0}
        <p class="text-sm opacity-75">No previous data available</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="table table-compact">
                <thead>
                    <tr>
                        <th>Set</th>
                        <th>Weight</th>
                        <th>Reps</th>
                    </tr>
                </thead>
                <tbody>
                    {#each previousSets as set}
                        <tr>
                            <td>{set.set_number}</td>
                            <td>{set.weight}kg</td>
                            <td>{set.reps}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
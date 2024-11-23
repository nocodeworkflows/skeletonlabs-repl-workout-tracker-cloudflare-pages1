<script lang="ts">
    import type { PageData } from './$types';
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import ExerciseCard from '$lib/components/workout/ExerciseCard.svelte';
    
    export let data: PageData;
    
    $: ({ workout, workoutExercises, sets } = data);
    
    let loading = false;
    let error: string | null = null;

    // Group sets by exercise
    $: exerciseSets = sets.reduce((acc, set) => {
        const exerciseId = set.workout_exercise;
        if (!acc[exerciseId]) {
            acc[exerciseId] = [];
        }
        acc[exerciseId].push(set);
        return acc;
    }, {} as Record<string, typeof sets>);
    
    async function handleWorkoutComplete() {
        loading = true;
        error = null;
        
        try {
            await pb.collection('workouts').update(workout.id, {
                status: 'completed'
            });
            
            await goto('/workouts');
        } catch (e) {
            console.error('Error completing workout:', e);
            error = 'Failed to complete workout';
        } finally {
            loading = false;
        }
    }

    async function handleSetUpdate(event: CustomEvent) {
        const { workoutExerciseId, setData, setId } = event.detail;
        
        try {
            if (setId) {
                // Update existing set
                await pb.collection('workout_sets').update(setId, setData);
                sets = sets.map(s => s.id === setId ? { ...s, ...setData } : s);
            } else {
                // Create new set
                const newSet = await pb.collection('workout_sets').create({
                    ...setData,
                    workout: workout.id,
                    workout_exercise: workoutExerciseId
                });
                sets = [...sets, newSet];
            }
        } catch (e) {
            console.error('Error updating set:', e);
            error = 'Failed to update set';
        }
    }

    async function handleSetDelete(event: CustomEvent) {
        const { setId } = event.detail;
        
        try {
            await pb.collection('workout_sets').delete(setId);
            sets = sets.filter(s => s.id !== setId);
        } catch (e) {
            console.error('Error deleting set:', e);
            error = 'Failed to delete set';
        }
    }
</script>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="h1">
            {workout.expand?.workout_template?.name || 'Custom Workout'}
        </h1>
        <div class="flex gap-2">
            <button
                class="btn variant-filled-success"
                on:click={handleWorkoutComplete}
                disabled={loading || workout.status !== 'in_progress'}
            >
                {#if loading}
                    <LoadingSpinner size="sm" />
                {:else}
                    Complete Workout
                {/if}
            </button>
        </div>
    </div>
    
    {#if error}
        <ErrorAlert message={error} />
    {/if}

    <div class="grid grid-cols-1 gap-4">
        {#each workoutExercises.filter(we => we.expand?.exercise) as workoutExercise (workoutExercise.id)}
            <ExerciseCard
                {workoutExercise}
                sets={exerciseSets[workoutExercise.id] || []}
                on:setUpdate={handleSetUpdate}
                on:setDelete={handleSetDelete}
            />
        {:else}
            <div class="card variant-ghost-surface p-4 text-center">
                <p>No exercises found for this workout.</p>
                <a href="/workouts" class="btn variant-filled-primary mt-4">Return to Workouts</a>
            </div>
        {/each}
    </div>
</div>
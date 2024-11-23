<script lang="ts">
    import type { PageData } from './$types';
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import ExerciseCard from '$lib/components/workout/ExerciseCard.svelte';
    
    export let data: PageData;
    
    $: ({ workout, workoutExercises, exercises, sets } = data);
    
    let loading = false;
    let error: string | null = null;
    let showExerciseSelect = false;
    let showDeleteConfirm = false;

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

    async function handleWorkoutDelete() {
        loading = true;
        error = null;
        
        try {
            await pb.collection('workouts').delete(workout.id);
            await goto('/workouts');
        } catch (e) {
            console.error('Error deleting workout:', e);
            error = 'Failed to delete workout';
        } finally {
            loading = false;
            showDeleteConfirm = false;
        }
    }
    
    async function handleAddExercise(exerciseId: string) {
        loading = true;
        error = null;
        
        try {
            const newExercise = await pb.collection('workout_exercises').create({
                workout: workout.id,
                exercise: exerciseId,
                display_order: workoutExercises.length + 1,
                skipped: false
            });
            
            const expandedExercise = await pb.collection('workout_exercises').getOne(newExercise.id, {
                expand: 'exercise'
            });
            
            workoutExercises = [...workoutExercises, expandedExercise];
            showExerciseSelect = false;
        } catch (e) {
            console.error('Error adding exercise:', e);
            error = 'Failed to add exercise';
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
                class="btn variant-filled-error"
                on:click={() => showDeleteConfirm = true}
                disabled={loading}
            >
                Delete Workout
            </button>
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

    {#if showDeleteConfirm}
        <div class="card variant-ghost-error p-4 mb-4">
            <h3 class="h3 mb-2">Delete Workout?</h3>
            <p class="mb-4">Are you sure you want to delete this workout? This action cannot be undone.</p>
            <div class="flex justify-end gap-2">
                <button
                    class="btn variant-soft"
                    on:click={() => showDeleteConfirm = false}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    class="btn variant-filled-error"
                    on:click={handleWorkoutDelete}
                    disabled={loading}
                >
                    {#if loading}
                        <LoadingSpinner size="sm" />
                    {:else}
                        Delete
                    {/if}
                </button>
            </div>
        </div>
    {/if}

    <div class="mb-4">
        <button
            class="btn variant-filled-primary"
            on:click={() => showExerciseSelect = !showExerciseSelect}
        >
            {showExerciseSelect ? 'Hide Exercise List' : 'Add Exercise'}
        </button>

        {#if showExerciseSelect}
            <div class="card variant-ghost-surface p-4 mt-4">
                <h2 class="h2 mb-4">Select Exercise</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {#each exercises.filter(e => !workoutExercises.some(we => we.expand?.exercise?.id === e.id)) as exercise}
                        <button
                            class="btn variant-soft"
                            on:click={() => handleAddExercise(exercise.id)}
                            disabled={loading}
                        >
                            {exercise.name}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

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
                <p>No exercises added yet. Click "Add Exercise" to begin your workout.</p>
            </div>
        {/each}
    </div>
</div>
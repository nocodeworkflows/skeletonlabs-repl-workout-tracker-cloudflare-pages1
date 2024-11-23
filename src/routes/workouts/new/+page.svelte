<script lang="ts">
    import type { PageData } from './$types';
    import { pb, handlePocketbaseError, getCurrentUserId } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import ExerciseSearch from '$lib/components/workouts/ExerciseSearch.svelte';
    
    export let data: PageData;
    
    $: ({ templates, exercises, error: loadError } = data);
    
    let selectedTemplate: string | null = null;
    let workoutDate = new Date().toISOString().split('T')[0];
    let notes = '';
    let error = loadError;
    let loading = false;
    let selectedExercises: string[] = [];
    
    $: selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    $: isCustomWorkout = !selectedTemplate;
    
    async function startWorkout() {
        if (loading) return;
        
        loading = true;
        error = null;
        
        try {
            const userId = getCurrentUserId();
            
            // Create the workout first
            const workout = await pb.collection('workouts').create({
                performed_date: new Date(workoutDate).toISOString(),
                notes,
                workout_template: selectedTemplate,
                status: 'in_progress',
                user: userId
            });

            // Create workout exercises based on template or selection
            if (selectedTemplate && selectedTemplateData?.expand?.['template_exercises(workout_template)']) {
                // Process template exercises sequentially to maintain order
                for (const [index, te] of selectedTemplateData.expand['template_exercises(workout_template)'].entries()) {
                    if (!te.expand?.exercise) continue;
                    
                    await pb.collection('workout_exercises').create({
                        workout: workout.id,
                        exercise: te.expand.exercise.id,
                        display_order: index,
                        notes: te.notes || '',
                        skipped: false,
                        user: userId
                    });
                }
            } else if (selectedExercises.length > 0) {
                // Process custom exercises sequentially to maintain order
                for (const [index, exerciseId] of selectedExercises.entries()) {
                    await pb.collection('workout_exercises').create({
                        workout: workout.id,
                        exercise: exerciseId,
                        display_order: index,
                        skipped: false,
                        user: userId
                    });
                }
            }

            // Navigate to the workout page after all exercises are created
            await goto(`/workouts/${workout.id}`);
        } catch (e) {
            console.error('Error starting workout:', e);
            error = await handlePocketbaseError(e);
            
            // If workout creation failed, try to clean up
            if (error && workout?.id) {
                try {
                    await pb.collection('workouts').delete(workout.id);
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
            }
        } finally {
            loading = false;
        }
    }
    
    function toggleExercise(exerciseId: string) {
        selectedExercises = selectedExercises.includes(exerciseId)
            ? selectedExercises.filter(id => id !== exerciseId)
            : [...selectedExercises, exerciseId];
    }

    function removeExercise(exerciseId: string) {
        selectedExercises = selectedExercises.filter(id => id !== exerciseId);
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="h1 mb-4">Start New Workout</h1>

    {#if error}
        <ErrorAlert message={error} />
    {/if}

    <div class="card p-4">
        <form on:submit|preventDefault={startWorkout} class="space-y-4">
            <label class="label">
                <span>Workout Date</span>
                <input
                    type="date"
                    bind:value={workoutDate}
                    class="input"
                    required
                />
            </label>

            <label class="label">
                <span>Workout Template (Optional)</span>
                <select 
                    bind:value={selectedTemplate} 
                    class="select"
                    on:change={() => selectedExercises = []}
                >
                    <option value={null}>No template (custom workout)</option>
                    {#each templates as template}
                        <option value={template.id}>{template.name}</option>
                    {/each}
                </select>
            </label>

            {#if selectedTemplate && selectedTemplateData?.expand?.['template_exercises(workout_template)']}
                <div class="card variant-ghost p-4">
                    <h3 class="h3 mb-2">Template Exercises:</h3>
                    <ul class="list-disc list-inside">
                        {#each selectedTemplateData.expand['template_exercises(workout_template)'] as te}
                            {#if te.expand?.exercise}
                                <li>{te.expand.exercise.name}</li>
                            {/if}
                        {/each}
                    </ul>
                </div>
            {:else}
                <div class="card variant-ghost p-4">
                    <h3 class="h3 mb-2">Select Exercises:</h3>
                    
                    {#if selectedExercises.length > 0}
                        <div class="mb-4">
                            <h4 class="h4 mb-2">Selected Exercises:</h4>
                            <div class="flex flex-wrap gap-2">
                                {#each selectedExercises as exerciseId}
                                    {#if exercises.find(e => e.id === exerciseId)}
                                        <div class="chip variant-filled">
                                            <span>{exercises.find(e => e.id === exerciseId)?.name}</span>
                                            <button class="chip-btn" on:click={() => removeExercise(exerciseId)}>✕</button>
                                        </div>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <ExerciseSearch
                        {exercises}
                        selectedExercises={selectedExercises}
                        onToggle={toggleExercise}
                        {loading}
                    />
                </div>
            {/if}

            <label class="label">
                <span>Notes (Optional)</span>
                <textarea
                    bind:value={notes}
                    class="textarea"
                    rows="3"
                    placeholder="Add any notes about this workout..."
                />
            </label>

            <button 
                type="submit" 
                class="btn variant-filled-primary w-full"
                disabled={loading || (!selectedTemplate && selectedExercises.length === 0)}
            >
                {#if loading}
                    <LoadingSpinner size="sm" />
                {:else}
                    Start Workout
                {/if}
            </button>
        </form>
    </div>
</div>
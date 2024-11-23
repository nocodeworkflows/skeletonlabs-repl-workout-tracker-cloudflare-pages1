<script lang="ts">
    import { pb, handlePocketbaseError, getCurrentUserId } from '$lib/pocketbase';
    import type { Exercise, MuscleGroup } from '$lib/types';
    import { MUSCLE_GROUPS } from '$lib/types';
    import { onMount, onDestroy } from 'svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import ExerciseFilters from '$lib/components/exercises/ExerciseFilters.svelte';
    import ExerciseNameInput from '$lib/components/exercises/ExerciseNameInput.svelte';

    let exercises: Exercise[] = [];
    let loading = true;
    let error: string | null = null;
    let searchTerm = '';
    let selectedMuscleGroup: MuscleGroup | 'all' = 'all';
    let exerciseType: 'all' | 'global' | 'custom' = 'all';
    let abortController: AbortController;

    let newExercise = {
        name: '',
        description: '',
        equipment_needed: '',
        muscle_group: 'Chest' as MuscleGroup,
        user: '',
        is_global: false
    };

    $: filteredExercises = exercises.filter(exercise => {
        const matchesSearch = searchTerm === '' || 
            exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscleGroup = selectedMuscleGroup === 'all' || 
            exercise.muscle_group === selectedMuscleGroup;
        const matchesType = exerciseType === 'all' || 
            (exerciseType === 'global' ? exercise.is_global : !exercise.is_global);
        
        return matchesSearch && matchesMuscleGroup && matchesType;
    });

    function sanitizeHtml(text: string): string {
        return text.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    async function loadExercises() {
        try {
            abortController = new AbortController();
            const userId = getCurrentUserId();
            const records = await pb.collection('exercises').getFullList<Exercise>({
                sort: '-created',
                filter: `is_global = true || user = "${userId}"`,
                $cancelKey: abortController.signal
            });
            exercises = records;
            error = null;
        } catch (e: any) {
            if (!e.isAbort) {
                error = await handlePocketbaseError(e);
            }
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadExercises();
    });

    onDestroy(() => {
        if (abortController) {
            abortController.abort();
        }
    });

    async function createExercise() {
        if (loading) return;
        
        loading = true;
        error = null;

        try {
            const userId = getCurrentUserId();
            const record = await pb.collection('exercises').create<Exercise>({
                ...newExercise,
                user: userId
            });
            
            exercises = [record, ...exercises];
            
            // Reset form
            newExercise = {
                name: '',
                description: '',
                equipment_needed: '',
                muscle_group: 'Chest',
                user: '',
                is_global: false
            };
        } catch (e) {
            error = await handlePocketbaseError(e);
        } finally {
            loading = false;
        }
    }

    async function deleteExercise(id: string) {
        if (loading) return;
        
        loading = true;
        error = null;

        try {
            await pb.collection('exercises').delete(id);
            exercises = exercises.filter((ex) => ex.id !== id);
        } catch (e) {
            error = await handlePocketbaseError(e);
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="h1 mb-4">Exercises</h1>

    {#if error}
        <ErrorAlert message={error} />
    {/if}

    <div class="card p-4 mb-4">
        <h2 class="h2 mb-4">Add New Exercise</h2>
        <form on:submit|preventDefault={createExercise} class="space-y-4">
            <label class="label">
                <span>Name</span>
                <ExerciseNameInput
                    bind:value={newExercise.name}
                    {exercises}
                />
            </label>

            <label class="label">
                <span>Description</span>
                <textarea
                    bind:value={newExercise.description}
                    class="textarea"
                    placeholder="Exercise description"
                />
            </label>

            <label class="label">
                <span>Equipment Needed</span>
                <input
                    type="text"
                    bind:value={newExercise.equipment_needed}
                    class="input"
                    placeholder="Required equipment"
                />
            </label>

            <label class="label">
                <span>Muscle Group</span>
                <select 
                    bind:value={newExercise.muscle_group} 
                    class="select"
                >
                    {#each MUSCLE_GROUPS as { value, label }}
                        <option {value}>{label}</option>
                    {/each}
                </select>
            </label>

            <button 
                type="submit" 
                class="btn variant-filled-primary"
                disabled={loading}
            >
                {#if loading}
                    <LoadingSpinner size="sm" />
                {:else}
                    Add Exercise
                {/if}
            </button>
        </form>
    </div>

    <ExerciseFilters
        bind:searchTerm
        bind:selectedMuscleGroup
        bind:exerciseType
    />

    {#if loading && exercises.length === 0}
        <div class="flex justify-center p-8">
            <LoadingSpinner size="lg" />
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each filteredExercises as exercise}
                <div class="card p-4">
                    <h3 class="h3 mb-3">{exercise.name}</h3>
                    <p class="badge variant-filled-primary pt-1 mb-3">
                        {MUSCLE_GROUPS.find(mg => mg.value === exercise.muscle_group)?.label || exercise.muscle_group}
                    </p>
                    {#if exercise.equipment_needed}
                        <p class="text-sm mb-2">
                            <span class="font-semibold">Equipment:</span>
                            {exercise.equipment_needed}
                        </p>
                    {/if}
                    {#if exercise.description}
                        <p class="mb-4">{sanitizeHtml(exercise.description)}</p>
                    {/if}
                    <div class="flex justify-between items-center">
                        <span class="text-sm opacity-75">
                            {exercise.is_global ? 'Global Exercise' : `Created: ${new Date(exercise.created).toLocaleDateString()}`}
                        </span>
                        {#if !exercise.is_global}
                            <button
                                class="btn variant-filled-error"
                                on:click={() => deleteExercise(exercise.id)}
                                disabled={loading}
                            >
                                Delete
                            </button>
                        {/if}
                    </div>
                </div>
            {:else}
                <div class="col-span-full text-center p-8">
                    <p class="text-lg opacity-75">No exercises found matching your criteria.</p>
                </div>
            {/each}
        </div>
    {/if}
</div>
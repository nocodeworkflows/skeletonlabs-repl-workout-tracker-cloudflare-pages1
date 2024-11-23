<script lang="ts">
    import type { Exercise } from '$lib/types';
    import { fade } from 'svelte/transition';
    import { MUSCLE_GROUPS } from '$lib/types';

    export let exercises: Exercise[] = [];
    export let selectedExercises: string[] = [];
    export let onToggle: (exerciseId: string) => void;
    export let loading = false;

    let searchTerm = '';
    let selectedMuscleGroup = 'all';

    $: filteredExercises = exercises.filter(exercise => {
        const matchesSearch = searchTerm === '' || 
            exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscleGroup = selectedMuscleGroup === 'all' || 
            exercise.muscle_group === selectedMuscleGroup;
        
        return matchesSearch && matchesMuscleGroup;
    });
</script>

<div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="label">
            <span>Search Exercises</span>
            <input
                type="text"
                bind:value={searchTerm}
                class="input"
                placeholder="Search exercises..."
            />
        </label>

        <label class="label">
            <span>Filter by Muscle Group</span>
            <select 
                bind:value={selectedMuscleGroup}
                class="select"
            >
                <option value="all">All Muscle Groups</option>
                {#each MUSCLE_GROUPS as { value, label }}
                    <option {value}>{label}</option>
                {/each}
            </select>
        </label>
    </div>

    <div 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
        transition:fade
    >
        {#each filteredExercises as exercise (exercise.id)}
            <button
                class="btn {selectedExercises.includes(exercise.id) ? 'variant-filled' : 'variant-soft'}"
                on:click={() => onToggle(exercise.id)}
                disabled={loading}
            >
                <div class="text-left w-full">
                    <div class="flex justify-between items-center">
                        <span>{exercise.name}</span>
                        {#if exercise.is_global}
                            <span class="badge variant-soft-secondary">Global</span>
                        {/if}
                    </div>
                    <div class="text-sm opacity-75">{exercise.muscle_group}</div>
                </div>
            </button>
        {:else}
            <div class="col-span-full text-center p-4 opacity-75">
                {searchTerm ? 'No exercises found matching your search' : 'No exercises available'}
            </div>
        {/each}
    </div>
</div>
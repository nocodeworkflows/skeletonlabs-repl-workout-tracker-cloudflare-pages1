<script lang="ts">
    import type { Exercise } from '$lib/types';
    import { fade } from 'svelte/transition';

    export let exercises: Exercise[] = [];
    export let onSelect: (exerciseId: string) => void;
    export let loading = false;

    let searchTerm = '';

    $: filteredExercises = searchTerm
        ? exercises.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : exercises;
</script>

<div class="space-y-4">
    <label class="label">
        <span>Search Exercises</span>
        <input
            type="text"
            bind:value={searchTerm}
            class="input"
            placeholder="Search exercises..."
        />
    </label>

    <div 
        class="grid grid-cols-2 gap-2"
        transition:fade
    >
        {#each filteredExercises as exercise (exercise.id)}
            <button
                class="btn variant-soft"
                on:click={() => onSelect(exercise.id)}
                disabled={loading}
            >
                <div class="text-left">
                    <div>{exercise.name}</div>
                    <div class="text-sm opacity-75">{exercise.muscle_group}</div>
                </div>
            </button>
        {:else}
            <div class="col-span-2 text-center p-4 opacity-75">
                {searchTerm ? 'No exercises found matching your search' : 'No exercises available'}
            </div>
        {/each}
    </div>
</div>
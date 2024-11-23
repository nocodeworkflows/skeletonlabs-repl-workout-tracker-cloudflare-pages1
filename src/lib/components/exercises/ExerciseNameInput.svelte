<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import type { Exercise } from '$lib/types';

    export let value = '';
    export let exercises: Exercise[] = [];

    let showSuggestions = false;
    let inputElement: HTMLInputElement;

    $: suggestions = value
        ? exercises.filter(ex => 
            ex.name.toLowerCase().includes(value.toLowerCase()) &&
            ex.name.toLowerCase() !== value.toLowerCase()
        ).slice(0, 5)
        : [];

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        value = target.value;
        showSuggestions = true;
    }

    function selectSuggestion(name: string) {
        value = name;
        showSuggestions = false;
    }

    // Close suggestions when clicking outside
    function handleClickOutside(event: MouseEvent) {
        if (inputElement && !inputElement.contains(event.target as Node)) {
            showSuggestions = false;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    });
</script>

<div class="relative" bind:this={inputElement}>
    <input
        type="text"
        {value}
        on:input={handleInput}
        class="input w-full"
        placeholder="Exercise name"
        required
    />
    
    {#if showSuggestions && suggestions.length > 0}
        <div 
            class="absolute z-50 w-full mt-1 card variant-filled-surface shadow-xl"
            transition:fade
        >
            <div class="p-2 space-y-2">
                <p class="text-sm opacity-75 px-2">Similar exercises found:</p>
                {#each suggestions as exercise}
                    <button
                        class="w-full text-left p-2 hover:variant-soft-primary rounded"
                        on:click={() => selectSuggestion(exercise.name)}
                    >
                        <div>
                            <span class="font-semibold">{exercise.name}</span>
                            <span class="badge variant-soft ml-2">
                                {exercise.is_global ? 'Global' : 'Custom'}
                            </span>
                        </div>
                        {#if exercise.description}
                            <p class="text-sm opacity-75 truncate">{exercise.description}</p>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
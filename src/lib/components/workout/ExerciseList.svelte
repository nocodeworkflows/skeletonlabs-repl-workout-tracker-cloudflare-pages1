<script lang="ts">
    import type { WorkoutExercise } from '$lib/types';
    
    export let exercises: WorkoutExercise[];
    export let onExerciseSelect: (exerciseId: string) => void;
    export let loading = false;
    
    function handleExerciseClick(exerciseId: string) {
        if (!loading) {
            onExerciseSelect(exerciseId);
        }
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
    {#each exercises as exercise}
        <button
            class="btn variant-soft"
            on:click={() => handleExerciseClick(exercise.id)}
            disabled={loading}
        >
            {exercise.name}
        </button>
    {/each}
</div>
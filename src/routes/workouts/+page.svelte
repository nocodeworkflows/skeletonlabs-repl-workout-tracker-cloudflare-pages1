<script lang="ts">
    import type { PageData } from './$types';
    import { workoutStore } from '$lib/stores/workout';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';

    export let data: PageData;
    
    $: ({ workouts } = data);

    function getStatusBadgeClass(status: string) {
        switch (status) {
            case 'in_progress':
                return 'variant-filled-warning';
            case 'completed':
                return 'variant-filled-success';
            case 'cancelled':
                return 'variant-filled-error';
            default:
                return 'variant-filled-surface';
        }
    }
</script>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="h1">Workouts</h1>
        <a href="/workouts/new" class="btn variant-filled-primary">Start New Workout</a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each workouts || [] as workout}
            <div class="card p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="h3">
                        {workout.expand?.workout_template?.name || 'Custom Workout'}
                    </h3>
                    {#if workout.status}
                        <span class="badge {getStatusBadgeClass(workout.status)}">
                            {workout.status.replace('_', ' ')}
                        </span>
                    {/if}
                </div>
                <p class="text-sm opacity-75 mb-2">
                    {new Date(workout.performed_date).toLocaleDateString()}
                </p>
                {#if workout.exercises?.length > 0}
                    <div class="mb-2">
                        <p class="text-sm font-semibold">Exercises:</p>
                        <ul class="list-disc list-inside text-sm">
                            {#each workout.exercises as exercise}
                                <li>{exercise.expand?.exercise?.name}</li>
                            {/each}
                        </ul>
                    </div>
                {/if}
                {#if workout.notes}
                    <p class="mb-4 text-sm">{workout.notes}</p>
                {/if}
                <a 
                    href="/workouts/{workout.id}" 
                    class="btn variant-ghost-primary w-full"
                >
                    View Details
                </a>
            </div>
        {:else}
            <div class="col-span-full text-center p-8">
                <p class="text-lg opacity-75">No workouts found. Start your first workout!</p>
                <a href="/workouts/new" class="btn variant-ghost-primary mt-4">Start New Workout</a>
            </div>
        {/each}
    </div>
</div>
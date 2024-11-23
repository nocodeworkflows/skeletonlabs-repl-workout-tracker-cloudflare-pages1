<script lang="ts">
    import type { WorkoutSet } from '$lib/types';
    import { createEventDispatcher } from 'svelte';
    
    export let sets: WorkoutSet[];
    
    const dispatch = createEventDispatcher<{
        delete: { setId: string };
        edit: { set: WorkoutSet };
    }>();
</script>

<div class="overflow-x-auto">
    <table class="table table-compact table-hover">
        <thead>
            <tr>
                <th>Set</th>
                <th>Weight (kg)</th>
                <th>Reps</th>
                <th>Notes</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each sets as set (set.id)}
                <tr>
                    <td>{set.set_number}</td>
                    <td>{set.weight}</td>
                    <td>{set.reps}</td>
                    <td>{set.notes || '-'}</td>
                    <td class="flex gap-2">
                        <button
                            class="btn btn-sm variant-soft-warning"
                            on:click={() => dispatch('edit', { set })}
                        >
                            Edit
                        </button>
                        <button
                            class="btn btn-sm variant-soft-error"
                            on:click={() => dispatch('delete', { setId: set.id })}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            {:else}
                <tr>
                    <td colspan="5" class="text-center">No sets recorded yet</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { WorkoutExercise, WorkoutSet } from '$lib/types';
    import SetForm from './SetForm.svelte';
    
    export let workoutExercise: WorkoutExercise & { expand: { exercise: { name: string } } };
    export let sets: WorkoutSet[] = [];
    
    const dispatch = createEventDispatcher();
    
    let showForm = false;
    let editingSet: WorkoutSet | null = null;
    
    $: nextSetNumber = sets.length + 1;
    $: exerciseName = workoutExercise?.expand?.exercise?.name || 'Unknown Exercise';
    
    function handleSetSave(event: CustomEvent) {
        const setData = {
            ...event.detail,
            set_number: editingSet ? editingSet.set_number : nextSetNumber
        };
        
        dispatch('setUpdate', {
            workoutExerciseId: workoutExercise.id,
            setData,
            setId: editingSet?.id
        });
        
        showForm = false;
        editingSet = null;
    }
    
    function handleSetDelete(setId: string) {
        dispatch('setDelete', { setId });
    }
    
    function handleSetEdit(set: WorkoutSet) {
        editingSet = set;
        showForm = true;
    }
</script>

<div class="card variant-ghost-surface p-4">
    <div class="flex justify-between items-center mb-4">
        <h2 class="h2">{exerciseName}</h2>
        <button
            class="btn variant-soft"
            on:click={() => {
                showForm = !showForm;
                editingSet = null;
            }}
        >
            {showForm ? 'Cancel' : 'Add Set'}
        </button>
    </div>

    {#if showForm}
        <div class="mb-4">
            <SetForm
                initialData={editingSet}
                on:save={handleSetSave}
                on:cancel={() => {
                    showForm = false;
                    editingSet = null;
                }}
            />
        </div>
    {/if}

    {#if sets.length > 0}
        <div class="overflow-x-auto">
            <table class="table table-compact w-full">
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
                                    on:click={() => handleSetEdit(set)}
                                >
                                    Edit
                                </button>
                                <button
                                    class="btn btn-sm variant-soft-error"
                                    on:click={() => handleSetDelete(set.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <p class="text-center opacity-75">No sets recorded yet</p>
    {/if}
</div>
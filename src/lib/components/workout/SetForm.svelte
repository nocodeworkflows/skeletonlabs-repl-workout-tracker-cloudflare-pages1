<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { WorkoutSet } from '$lib/types';
    
    export let initialData: WorkoutSet | null = null;
    
    const dispatch = createEventDispatcher();
    
    let weight = initialData?.weight ?? 0;
    let reps = initialData?.reps ?? 0;
    let notes = initialData?.notes ?? '';
    
    function handleSubmit() {
        dispatch('save', { weight, reps, notes });
    }
    
    function handleCancel() {
        dispatch('cancel');
    }

    function handleFocus(event: FocusEvent) {
        const input = event.target as HTMLInputElement;
        input.select();
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="grid gap-4">
    <div class="grid grid-cols-2 gap-4">
        <label class="label">
            <span>Weight (kg)</span>
            <input
                type="number"
                bind:value={weight}
                min="0"
                step="0.5"
                inputmode="decimal"
                class="input"
                required
                on:focus={handleFocus}
            />
        </label>
        
        <label class="label">
            <span>Reps</span>
            <input
                type="number"
                bind:value={reps}
                min="1"
                inputmode="numeric"
                class="input"
                required
                on:focus={handleFocus}
            />
        </label>
    </div>
    
    <label class="label">
        <span>Notes (Optional)</span>
        <input
            type="text"
            bind:value={notes}
            class="input"
            placeholder="Optional notes about this set..."
        />
    </label>
    
    <div class="flex justify-end gap-2">
        <button
            type="button"
            class="btn variant-ghost"
            on:click={handleCancel}
        >
            Cancel
        </button>
        <button
            type="submit"
            class="btn variant-filled-primary"
        >
            {initialData ? 'Update' : 'Add'} Set
        </button>
    </div>
</form>
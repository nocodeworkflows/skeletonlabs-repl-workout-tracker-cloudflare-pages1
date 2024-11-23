<script lang="ts">
    import { MUSCLE_GROUPS } from '$lib/types';
    import type { MuscleGroup } from '$lib/types';

    export let searchTerm = '';
    export let selectedMuscleGroup: MuscleGroup | 'all' = 'all';
    export let exerciseType: 'all' | 'global' | 'custom' = 'all';
</script>

<div class="card p-4 mb-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="label">
            <span>Search</span>
            <input
                type="text"
                bind:value={searchTerm}
                class="input"
                placeholder="Search exercises..."
            />
        </label>

        <label class="label">
            <span>Muscle Group</span>
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

        <label class="label">
            <span>Exercise Type</span>
            <select
                bind:value={exerciseType}
                class="select"
            >
                <option value="all">All Exercises</option>
                <option value="global">Global Exercises</option>
                <option value="custom">My Exercises</option>
            </select>
        </label>
    </div>
</div>
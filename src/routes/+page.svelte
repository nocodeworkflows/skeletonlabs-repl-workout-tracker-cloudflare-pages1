<script lang="ts">
    import { currentUser } from '$lib/stores/auth';
</script>

<div class="container mx-auto p-4">
    <div class="card p-8 text-center">
        <h1 class="h1 mb-4">Welcome to Workout Tracker</h1>
        
        {#if $currentUser}
            <p class="mb-4">Track your workouts and monitor your progress.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/workouts" class="card p-4 variant-filled-secondary text-center">
                    <h2 class="h2">Workouts</h2>
                    <p>Start and track your workouts</p>
                </a>

                <a href="/exercises" class="card p-4 variant-filled-tertiary text-center">
                    <h2 class="h2">Exercises</h2>
                    <p>Manage your exercise library</p>
                </a>

                <a href="/templates" class="card p-4 variant-filled-primary text-center">
                    <h2 class="h2">Templates</h2>
                    <p>Create workout templates</p>
                </a>
            </div>
        {:else}
            <p class="mb-4">Please login or register to start tracking your workouts.</p>
            <div class="flex justify-center gap-4">
                <a href="/login" class="btn variant-filled-primary">Login</a>
                <a href="/register" class="btn variant-filled-secondary">Register</a>
            </div>
        {/if}
    </div>
</div>
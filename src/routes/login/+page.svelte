<script lang="ts">
    import { login } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

    let email = '';
    let password = '';
    let loading = false;
    let error: string | null = null;

    async function handleLogin() {
        loading = true;
        error = null;

        try {
            await login(email, password);
            await goto('/workouts');
        } catch (e: any) {
            console.error('Login error:', e);
            error = e?.message || 'Failed to login';
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-md">
    <div class="card p-4">
        <h1 class="h1 mb-4">Login</h1>

        {#if error}
            <ErrorAlert message={error} />
        {/if}

        <form on:submit|preventDefault={handleLogin} class="space-y-4">
            <label class="label">
                <span>Email</span>
                <input
                    type="email"
                    bind:value={email}
                    class="input"
                    required
                    autocomplete="email"
                />
            </label>

            <label class="label">
                <span>Password</span>
                <input
                    type="password"
                    bind:value={password}
                    class="input"
                    required
                    autocomplete="current-password"
                />
            </label>

            <button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
                {#if loading}
                    <LoadingSpinner size="sm" />
                {:else}
                    Login
                {/if}
            </button>
        </form>

        <div class="mt-4 text-center">
            <a href="/register" class="anchor">Don't have an account? Register</a>
        </div>
    </div>
</div>
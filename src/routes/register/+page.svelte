<script lang="ts">
    import { register } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

    let email = '';
    let password = '';
    let passwordConfirm = '';
    let loading = false;
    let error: string | null = null;

    async function handleRegister() {
        if (password !== passwordConfirm) {
            error = 'Passwords do not match';
            return;
        }

        loading = true;
        error = null;

        try {
            await register(email, password, passwordConfirm);
            await goto('/workouts');
        } catch (e: any) {
            console.error('Registration error:', e);
            error = e?.message || 'Failed to register';
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-md">
    <div class="card p-4">
        <h1 class="h1 mb-4">Register</h1>

        {#if error}
            <ErrorAlert message={error} />
        {/if}

        <form on:submit|preventDefault={handleRegister} class="space-y-4">
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
                    autocomplete="new-password"
                />
            </label>

            <label class="label">
                <span>Confirm Password</span>
                <input
                    type="password"
                    bind:value={passwordConfirm}
                    class="input"
                    required
                    autocomplete="new-password"
                />
            </label>

            <button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
                {#if loading}
                    <LoadingSpinner size="sm" />
                {:else}
                    Register
                {/if}
            </button>
        </form>

        <div class="mt-4 text-center">
            <a href="/login" class="anchor">Already have an account? Login</a>
        </div>
    </div>
</div>
<script lang="ts">
    import '../app.postcss';
    import { AppShell, AppBar } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';
    import { currentUser, logout } from '$lib/stores/auth';
    import { goto } from '$app/navigation';

    async function handleLogout() {
        await logout();
        await goto('/login');
    }
</script>

<AppShell>
    <svelte:fragment slot="header">
        <!-- Top Navigation -->
        <AppBar class="sticky top-0 z-10">
            <svelte:fragment slot="lead">
                <a href="/" class="text-xl uppercase font-bold hover:opacity-80">Workout Tracker</a>
            </svelte:fragment>
            <svelte:fragment slot="trail">
                {#if $currentUser}
                    <!-- Desktop Navigation -->
                    <nav class="hidden md:flex items-center gap-4 mr-4">
                        <a 
                            class="btn btn-sm {$page.url.pathname.startsWith('/workouts') ? 'variant-filled' : 'variant-ghost'}-surface" 
                            href="/workouts"
                        >
                            Workouts
                        </a>
                        <a 
                            class="btn btn-sm {$page.url.pathname === '/exercises' ? 'variant-filled' : 'variant-ghost'}-surface" 
                            href="/exercises"
                        >
                            Exercises
                        </a>
                        <a 
                            class="btn btn-sm {$page.url.pathname === '/templates' ? 'variant-filled' : 'variant-ghost'}-surface" 
                            href="/templates"
                        >
                            Templates
                        </a>
                    </nav>
                    <div class="flex items-center gap-4 border-l pl-4">
                        <span class="text-sm opacity-75 hidden sm:inline">{$currentUser.email}</span>
                        <button class="btn btn-sm variant-ghost-surface" on:click={handleLogout}>
                            Logout
                        </button>
                    </div>
                {:else}
                    <nav class="flex gap-4">
                        <a 
                            class="btn btn-sm variant-ghost-surface" 
                            href="/login"
                        >
                            Login
                        </a>
                        <a 
                            class="btn btn-sm variant-filled-primary" 
                            href="/register"
                        >
                            Register
                        </a>
                    </nav>
                {/if}
            </svelte:fragment>
        </AppBar>
    </svelte:fragment>

    <!-- Main Content -->
    <div class="pb-16 md:pb-0">
        <slot />
    </div>

    <!-- Mobile Bottom Navigation -->
    {#if $currentUser}
        <div class="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-500/30 md:hidden">
            <nav class="container flex justify-around p-2">
                <a 
                    href="/workouts" 
                    class="flex flex-col items-center p-2 {$page.url.pathname.startsWith('/workouts') ? 'text-primary-500' : 'text-white'}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                    </svg>
                    <span class="text-xs">Workouts</span>
                </a>
                <a 
                    href="/exercises" 
                    class="flex flex-col items-center p-2 {$page.url.pathname === '/exercises' ? 'text-primary-500' : 'text-white'}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 4v16"/>
                        <path d="M18 4v16"/>
                        <path d="M3 8h3"/>
                        <path d="M3 16h3"/>
                        <path d="M18 8h3"/>
                        <path d="M18 16h3"/>
                        <path d="M9 4h6"/>
                        <path d="M9 20h6"/>
                    </svg>
                    <span class="text-xs">Exercises</span>
                </a>
                <a 
                    href="/templates" 
                    class="flex flex-col items-center p-2 {$page.url.pathname === '/templates' ? 'text-primary-500' : 'text-white'}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                        <line x1="15" y1="3" x2="15" y2="21"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="3" y1="15" x2="21" y2="15"/>
                    </svg>
                    <span class="text-xs">Templates</span>
                </a>
            </nav>
        </div>
    {/if}
</AppShell>
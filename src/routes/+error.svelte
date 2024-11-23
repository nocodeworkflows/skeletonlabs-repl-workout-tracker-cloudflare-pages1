<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="container mx-auto p-4 text-center">
    <div class="card variant-ghost-error p-8">
        <h1 class="h1 mb-4">Error {$page.status}</h1>
        <p class="text-lg mb-4">{$page.error?.message || 'Page not found'}</p>
        <div class="flex justify-center gap-4">
            <a href="/" class="btn variant-filled-primary">Return Home</a>
        </div>
    </div>
</div>
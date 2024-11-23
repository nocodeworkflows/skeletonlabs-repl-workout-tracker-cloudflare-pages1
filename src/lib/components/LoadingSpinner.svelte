<script lang="ts">
    export let size: 'sm' | 'md' | 'lg' = 'md';
    
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };
</script>

<div class="flex justify-center items-center">
    <div class={`animate-spin rounded-full border-4 border-primary-500 border-t-transparent ${sizeClasses[size]}`}></div>
</div>
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env?: {
				// Add any Cloudflare environment variables here
				ENVIRONMENT?: string;
				PUBLIC_POCKETBASE_URL?: string;
			};
			context?: {
				waitUntil?(promise: Promise<any>): void;
			};
			caches?: CacheStorage & { default: Cache };
		}
	}
}

export {};
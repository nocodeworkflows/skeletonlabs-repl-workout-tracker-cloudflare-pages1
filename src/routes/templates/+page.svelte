<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { PageData } from './$types';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import ExerciseSearch from '$lib/components/templates/ExerciseSearch.svelte';
	import { getCurrentUserId } from '$lib/pocketbase';

	export let data: PageData;
	
	let error = '';
	let loading = false;
	let mounted = false;
	$: ({ templates, exercises } = data);

	let newTemplate = {
		name: '',
		description: '',
		user: getCurrentUserId()
	};

	onMount(() => {
		mounted = true;
		return () => {
			mounted = false;
		};
	});

	async function createTemplate() {
		loading = true;
		error = '';
		try {
			const record = await pb.collection('workout_templates').create(newTemplate);
			templates = [record, ...templates];
			newTemplate = {
				name: '',
				description: '',
				user: getCurrentUserId()
			};
		} catch (e) {
			console.error('Error creating template:', e);
			error = 'Failed to create template';
		} finally {
			loading = false;
		}
	}

	async function deleteTemplate(id: string) {
		loading = true;
		error = '';
		try {
			await pb.collection('workout_templates').delete(id);
			templates = templates.filter((t) => t.id !== id);
		} catch (e) {
			console.error('Error deleting template:', e);
			error = 'Failed to delete template';
		} finally {
			loading = false;
		}
	}

	async function addExerciseToTemplate(templateId: string, exerciseId: string) {
		if (!mounted || loading) return;
		
		loading = true;
		error = '';
		try {
			const templateExercises = await pb
				.collection('template_exercises')
				.getFullList({
					filter: `workout_template = "${templateId}"`
				});

			const newOrder = templateExercises.length + 1;

			await pb.collection('template_exercises').create({
				workout_template: templateId,
				exercise: exerciseId,
				display_order: newOrder,
				user: getCurrentUserId()
			});

			// Refresh the specific template
			const updatedTemplate = await pb.collection('workout_templates').getOne(templateId, {
				expand: 'template_exercises(workout_template).exercise'
			});
			
			if (mounted) {
				templates = templates.map(t => 
					t.id === templateId ? updatedTemplate : t
				);
			}
		} catch (e) {
			console.error('Error adding exercise:', e);
			error = 'Failed to add exercise to template';
		} finally {
			if (mounted) {
				loading = false;
			}
		}
	}

	async function removeExerciseFromTemplate(templateId: string, templateExerciseId: string) {
		if (!mounted || loading) return;
		
		loading = true;
		error = '';
		try {
			await pb.collection('template_exercises').delete(templateExerciseId);
			
			// Refresh the specific template
			const updatedTemplate = await pb.collection('workout_templates').getOne(templateId, {
				expand: 'template_exercises(workout_template).exercise'
			});
			
			if (mounted) {
				templates = templates.map(t => 
					t.id === templateId ? updatedTemplate : t
				);
			}
		} catch (e) {
			console.error('Error removing exercise:', e);
			error = 'Failed to remove exercise from template';
		} finally {
			if (mounted) {
				loading = false;
			}
		}
	}

	function handleDndConsider(event: CustomEvent<{ items: any[] }>, templateId: string) {
		if (!mounted) return;
		
		const template = templates.find(t => t.id === templateId);
		if (!template?.expand?.['template_exercises(workout_template)']) return;

		template.expand['template_exercises(workout_template)'] = event.detail.items;
		templates = [...templates]; // Trigger reactivity
	}

	async function handleDndFinalize(event: CustomEvent<{ items: any[] }>, templateId: string) {
		if (!mounted || loading) return;
		
		const template = templates.find(t => t.id === templateId);
		if (!template?.expand?.['template_exercises(workout_template)']) return;

		loading = true;
		try {
			template.expand['template_exercises(workout_template)'] = event.detail.items;
			templates = [...templates]; // Trigger reactivity

			// Update display_order for all exercises
			await Promise.all(
				event.detail.items.map((item, index) =>
					pb.collection('template_exercises').update(item.id, {
						display_order: index + 1
					})
				)
			);
		} catch (e) {
			console.error('Error updating exercise order:', e);
			error = 'Failed to update exercise order';
		} finally {
			if (mounted) {
				loading = false;
			}
		}
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="h1 mb-4">Workout Templates</h1>

	{#if error}
		<div class="alert variant-filled-error mb-4">{error}</div>
	{/if}

	<div class="card p-4 mb-4">
		<h2 class="h2 mb-4">Create New Template</h2>
		<form on:submit|preventDefault={createTemplate} class="space-y-4">
			<label class="label">
				<span>Name</span>
				<input
					type="text"
					bind:value={newTemplate.name}
					class="input"
					required
					placeholder="Template name"
				/>
			</label>

			<label class="label">
				<span>Description</span>
				<textarea
					bind:value={newTemplate.description}
					class="textarea"
					placeholder="Template description"
				/>
			</label>

			<button type="submit" class="btn variant-filled-primary" disabled={loading}>
				{#if loading}
					<span class="loading loading-spinner loading-sm mr-2"></span>
				{/if}
				Create Template
			</button>
		</form>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		{#each templates as template (template.id)}
			<div class="card p-4">
				<div class="flex justify-between items-start mb-4">
					<div>
						<h3 class="h3">{template.name}</h3>
						{#if template.description}
							<p class="text-sm opacity-75 mb-2">{template.description}</p>
						{/if}
					</div>
					<button
						class="btn variant-filled-error"
						on:click={() => deleteTemplate(template.id)}
						disabled={loading}
					>
						Delete
					</button>
				</div>

				<div class="mb-4">
					<h4 class="h4 mb-2">Exercises</h4>
					{#if template.expand?.['template_exercises(workout_template)']?.length}
						<section
							use:dndzone={{
								items: template.expand['template_exercises(workout_template)'],
								dragDisabled: loading,
								flipDurationMs: 300,
								dropTargetStyle: {
									outline: '2px dashed var(--color-primary-500)'
								}
							}}
							on:consider={(e) => handleDndConsider(e, template.id)}
							on:finalize={(e) => handleDndFinalize(e, template.id)}
							class="space-y-2"
						>
							{#each template.expand['template_exercises(workout_template)'] as templateExercise (templateExercise.id)}
								<div
									animate:flip={{duration: 300}}
									class="card variant-soft flex justify-between items-center p-2"
								>
									<div class="flex items-center gap-2">
										<span class="grip cursor-move select-none">⋮⋮</span>
										<span>{templateExercise.expand?.exercise?.name}</span>
									</div>
									<button
										class="btn btn-sm variant-soft-error"
										on:click={() => removeExerciseFromTemplate(template.id, templateExercise.id)}
										disabled={loading}
									>
										Remove
									</button>
								</div>
							{/each}
						</section>
					{:else}
						<p class="text-sm opacity-75">No exercises added yet</p>
					{/if}
				</div>

				<div>
					<h4 class="h4 mb-2">Add Exercise</h4>
					<ExerciseSearch
						{exercises}
						{loading}
						onSelect={(exerciseId) => addExerciseToTemplate(template.id, exerciseId)}
					/>
				</div>
			</div>
		{:else}
			<div class="col-span-full text-center p-8">
				<p class="text-lg opacity-75">No templates found. Create your first template!</p>
			</div>
		{/each}
	</div>
</div>
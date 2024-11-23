import type { PageLoad } from './$types';
import { pb, getCurrentUserId } from '$lib/pocketbase';

export const load: PageLoad = async () => {
	try {
		const userId = getCurrentUserId();
		const [templateRecords, exerciseRecords] = await Promise.all([
			pb.collection('workout_templates').getFullList({
				sort: '-created',
				expand: 'template_exercises(workout_template).exercise',
				filter: `user = "${userId}"`
			}),
			pb.collection('exercises').getFullList()
		]);

		return {
			templates: templateRecords,
			exercises: exerciseRecords
		};
	} catch (e) {
		console.error('Error loading data:', e);
		return {
			templates: [],
			exercises: []
		};
	}
};
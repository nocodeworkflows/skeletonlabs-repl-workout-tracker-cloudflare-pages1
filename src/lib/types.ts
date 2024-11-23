// PocketBase expanded record types
export interface Exercise {
    id: string;
    name: string;
    description?: string;
    equipment_needed?: string;
    muscle_group: MuscleGroup;
    user: string;
    created: string;
    is_global: boolean;
}

// Must match exactly with PocketBase select options
export type MuscleGroup = 
    | 'Chest'
    | 'Back'
    | 'Biceps'
    | 'Triceps'
    | 'Shoulders'
    | 'Quads'
    | 'Hamstrings'
    | 'Glutes'
    | 'Calves'
    | 'Core'
    | 'Forearms'
    | 'Traps'
    | 'Lats'
    | 'Hip Flexors'
    | 'Serratus Anterior';

// Muscle group options for UI display
export const MUSCLE_GROUPS: Array<{ value: MuscleGroup; label: string }> = [
    { value: 'Chest', label: 'Chest' },
    { value: 'Back', label: 'Back' },
    { value: 'Biceps', label: 'Biceps' },
    { value: 'Triceps', label: 'Triceps' },
    { value: 'Shoulders', label: 'Shoulders' },
    { value: 'Quads', label: 'Quads' },
    { value: 'Hamstrings', label: 'Hamstrings' },
    { value: 'Glutes', label: 'Glutes' },
    { value: 'Calves', label: 'Calves' },
    { value: 'Core', label: 'Core' },
    { value: 'Forearms', label: 'Forearms' },
    { value: 'Traps', label: 'Traps' },
    { value: 'Lats', label: 'Lats' },
    { value: 'Hip Flexors', label: 'Hip Flexors' },
    { value: 'Serratus Anterior', label: 'Serratus Anterior' }
];
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ref, onUnmounted } from 'vue';
import type { Subscription, Observable } from 'dexie';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Wraps a Dexie observable into Vue reactivity
 */
export function useDexieObservable<T>(
	observable: Observable<T>,
	initialValue?: T
) {
	const value = ref<T | undefined>(initialValue);
	let sub: Subscription | null = null;

	sub = observable.subscribe({
		next: (val) => (value.value = val),
		error: (err) => {
			console.error('Dexie observable error:', err);
		},
	});

	onUnmounted(() => {
		sub?.unsubscribe();
	});

	return value;
}

export function categorizeFileType(
	mimeType: string
): 'spreadsheet' | 'document' | 'image' | 'other' {
	if (mimeType.startsWith('image/')) {
		return 'image';
	} else if (
		mimeType === 'text/csv' ||
		mimeType.includes('spreadsheet') ||
		mimeType.includes('excel')
	) {
		return 'spreadsheet';
	} else if (
		mimeType.startsWith('text/') ||
		mimeType.includes('document') ||
		mimeType.includes('pdf')
	) {
		return 'document';
	}
	return 'other';
}

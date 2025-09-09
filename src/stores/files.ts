import { defineStore } from 'pinia';
import { liveQuery } from 'dexie';
import { db, type FileMetadata } from '@/db';
import { useDexieObservable } from '@/lib/utils';
import { computed } from 'vue';

export const useFilesStore = defineStore('files', () => {
	const all = useDexieObservable(liveQuery(() => db.fileMetadata.toArray()));
	const recent = useDexieObservable(
		liveQuery(() =>
			db.fileMetadata.orderBy('uploadedAt').reverse().limit(5).toArray()
		)
	);

	const total = useDexieObservable(liveQuery(() => db.fileMetadata.count()));
	const types = computed(() => {
		if (!all.value?.length) return [];
		return Array.from(new Set(all.value?.map((file) => file.type)));
	});

	const add = (newFileMetadata: FileMetadata) =>
		db.fileMetadata.add(newFileMetadata);
	const remove = async (id: number | undefined) => {
		if (id === undefined) return;
		await db.fileMetadata.delete(id);
	};

	return { all, recent, total, types, add, remove };
});

import { defineStore } from 'pinia';
import { liveQuery } from 'dexie';
import { db, type FileMetadata, type RawFileData } from '@/db';
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

	const add = (newData: FileMetadata) => db.fileMetadata.add(newData);
	const remove = async (id: number) => {
		await db.parsedCSVData.where('fileId').equals(id).delete();
		await db.rawFiles.where('fileId').equals(id).delete();
		await db.fileMetadata.delete(id);
	};

	const getMeta = async (id: number) => db.fileMetadata.get(id);
	const addRaw = async (data: RawFileData) => db.rawFiles.add(data);
	const getRaw = async (id: number) =>
		db.rawFiles.where('fileId').equals(id).first();

	return {
		all,
		recent,
		total,
		types,
		add,
		remove,
		getMeta,
		addRaw,
		getRaw,
	};
});

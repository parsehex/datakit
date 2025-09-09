import { defineStore } from 'pinia';
import { db, type ParsedCSVData } from '@/db';

export const useParsedStore = defineStore('parsed', () => {
	const addCSV = (newData: ParsedCSVData) => db.parsedCSVData.add(newData);
	const getCSV = async (id: number) => db.parsedCSVData.get(id);
	const updateCSV = async (id: number | ParsedCSVData, changes: any) =>
		db.parsedCSVData.update(id, changes);

	return {
		addCSV,
		getCSV,
		updateCSV,
	};
});

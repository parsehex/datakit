import Dexie, { type Table } from 'dexie';

export interface FileMetadata {
	id?: number;
	name: string;
	type: string; // e.g., 'spreadsheet', 'document', 'image'
	mime: string; // e.g., 'text/csv', 'application/pdf', 'image/png'
	size: number;
	lastModified: Date;
	uploadedAt: Date;
	parsedDataId?: number; // Reference to parsed data if applicable
}

export interface RawFileData {
	id?: number;
	fileId: number; // Foreign key to FileMetadata
	data: ArrayBuffer; // Raw binary data of the file
}

export interface ParsedCSVData {
	id?: number;
	fileId: number; // Foreign key to FileMetadata
	headers: string[];
	rows: string[][];
}

export class DataKitDexie extends Dexie {
	fileMetadata!: Table<FileMetadata, number>;
	rawFiles!: Table<RawFileData, number>;
	parsedCSVData!: Table<ParsedCSVData, number>;

	constructor() {
		super('DataKitDatabase');
		this.version(1).stores({
			fileMetadata: '++id, name, type, uploadedAt',
			rawFiles: '++id, fileId',
			parsedCSVData: '++id, fileId',
		});
	}
}

export const db = new DataKitDexie();

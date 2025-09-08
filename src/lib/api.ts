import { db } from '@/db';

export async function deleteFile(id: number | undefined) {
	if (id === undefined) return;
	await db.fileMetadata.delete(id);
}

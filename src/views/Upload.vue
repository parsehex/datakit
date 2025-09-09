<script setup lang="ts">
import { ref } from 'vue';
import { type FileMetadata, type RawFileData, type ParsedCSVData } from '@/db';
import { parseCSV } from '@/lib/csvParser';
import { categorizeFileType } from '@/lib/utils';
import { useFilesStore } from '@/stores/files';
import { useParsedStore } from '@/stores/parsed';

const filesStore = useFilesStore();
const parsedStore = useParsedStore();

const selectedFiles = ref<File[]>([]);
const uploadedFiles = ref<FileMetadata[]>([]);

const handleFileChange = async (event: Event) => {
	const input = event.target as HTMLInputElement;
	if (input.files) {
		selectedFiles.value = Array.from(input.files);
		for (const file of selectedFiles.value) {
			const reader = new FileReader();

			reader.onload = async (e) => {
				if (e.target?.result) {
					const newFileMetadata: FileMetadata = {
						name: file.name,
						type: categorizeFileType(file.type) || 'other',
						mime: file.type,
						size: file.size,
						lastModified: new Date(file.lastModified),
						uploadedAt: new Date(),
					};

					let parsedDataId: number | undefined;

					if (file.type === 'text/csv') {
						try {
							const csvString = new TextDecoder().decode(e.target.result as ArrayBuffer);
							const parsed = await parseCSV(csvString);
							const newParsedCSVData: Omit<ParsedCSVData, 'id'> = {
								fileId: 0, // Will be updated after fileMetadata is added
								headers: parsed.headers,
								rows: parsed.rows,
							};
							parsedDataId = await parsedStore.addCSV(newParsedCSVData);
							newFileMetadata.parsedDataId = parsedDataId;
						} catch (error) {
							console.error('Error parsing CSV:', error);
							// Optionally, handle error in UI
						}
					}

					const fileId = await filesStore.add(newFileMetadata);

					// Update fileId for parsed data if it was a CSV
					if (parsedDataId) {
						await parsedStore.updateCSV(parsedDataId, { fileId: fileId });
					}

					const newRawFileData: RawFileData = {
						fileId: fileId,
						data: e.target.result as ArrayBuffer,
					};
					await filesStore.addRaw(newRawFileData);

					uploadedFiles.value.push({ ...newFileMetadata, id: fileId });
				}
			};

			reader.readAsArrayBuffer(file); // Read as ArrayBuffer for raw storage, then decode for parsing
		}
	}
};
</script>
<template>
	<div class="container mx-auto p-4">
		<h1 class="text-3xl font-bold mb-4">Upload Data</h1>
		<p class="mb-4 text-red-600 font-semibold"> Important: All data uploaded to DataKit is stored locally and
			unprotected in your browser. Please <u>do not upload or store any sensitive information</u>. </p>
		<div class="mb-4 border-2 border-dashed border-gray-300 p-8 text-center">
			<label for="file-upload" class="cursor-pointer text-blue-500 hover:underline"> Drag and drop files here, or click
				to select files </label>
			<input id="file-upload" type="file" multiple class="hidden" @change="handleFileChange" />
		</div>
		<div v-if="uploadedFiles.length">
			<h2 class="text-2xl font-semibold mb-2 mt-4">Newly-Added Files</h2>
			<ul>
				<li v-for="file in uploadedFiles" :key="file.id">
					<RouterLink :to="`/view/${file.id}`">
						<span>{{ file.name }} ({{ file.type }}) - {{ file.size }} bytes</span>
					</RouterLink>
				</li>
			</ul>
		</div>
		<p v-else>No files selected.</p>
	</div>
</template>

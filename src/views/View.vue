<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import FileMetadataDisplay from '@/components/FileMetadataDisplay.vue';
import { db, type FileMetadata, type RawFileData, type ParsedCSVData } from '@/db';

const route = useRoute();
const fileId = ref<number | null>(null);
const fileMetadata = ref<FileMetadata | null>(null);
const rawFileData = ref<RawFileData | null>(null);
const parsedCSVData = ref<ParsedCSVData | null>(null);
const fileContent = ref<string | null>(null);
const imageUrl = ref<string | null>(null);

const fetchData = async (id: number) => {
	// Clean up previous object URL if any
	if (imageUrl.value) {
		URL.revokeObjectURL(imageUrl.value);
		imageUrl.value = null;
	}

	const metadata = await db.fileMetadata.get(id);
	if (metadata) {
		fileMetadata.value = metadata;
		const rawData = await db.rawFiles.where('fileId').equals(id).first();
		if (rawData) {
			rawFileData.value = rawData;
		}

		if (fileMetadata.value.mime === 'text/csv' && fileMetadata.value.parsedDataId) {
			const parsedData = await db.parsedCSVData.get(fileMetadata.value.parsedDataId);
			if (parsedData) {
				parsedCSVData.value = parsedData;
			}
		}

		if (rawFileData.value && rawFileData.value.data) {
			if (fileMetadata.value.mime.startsWith('text')) {
				fileContent.value = new TextDecoder().decode(rawFileData.value.data);
			} else if (fileMetadata.value.type === 'image') {
				const blob = new Blob([rawFileData.value.data], { type: fileMetadata.value.mime });
				imageUrl.value = URL.createObjectURL(blob);
				fileContent.value = null; // Clear text content for images
			} else {
				fileContent.value = `Binary content of type: ${fileMetadata.value.mime}`;
			}
		}
	} else {
		fileMetadata.value = null;
		rawFileData.value = null;
		parsedCSVData.value = null;
		fileContent.value = null;
		imageUrl.value = null;
	}
};

onUnmounted(() => {
	if (imageUrl.value) {
		URL.revokeObjectURL(imageUrl.value);
	}
});

onMounted(() => {
	if (route.params.id) {
		fileId.value = Number(route.params.id);
		fetchData(fileId.value);
	}
});

watch(() => route.params.id, (newId) => {
	if (newId) {
		fileId.value = Number(newId);
		fetchData(fileId.value);
	}
});
</script>
<template>
	<div class="container mx-auto">
		<div v-if="fileMetadata">
			<FileMetadataDisplay :metadata="fileMetadata" />
			<!-- start File Content -->
			<h2 class="text-2xl font-semibold my-4">File Content</h2>
			<div v-if="parsedCSVData">
				<!-- CSV files -->
				<div class="overflow-x-auto">
					<table class="min-w-full bg-white border border-gray-300">
						<thead>
							<tr>
								<th v-for="header in parsedCSVData.headers" :key="header" class="py-2 px-4 border-b">{{ header }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(row, rowIndex) in parsedCSVData.rows" :key="rowIndex">
								<td v-for="(cell, cellIndex) in row" :key="cellIndex" class="py-2 px-4 border-b">{{ cell }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div v-else-if="fileMetadata.type === 'image' && imageUrl">
				<!-- images -->
				<img :src="imageUrl" :alt="fileMetadata.name" class="max-w-full h-auto rounded-lg shadow-md" />
			</div>
			<div v-else-if="fileContent">
				<!-- other file types -->
				<pre class="bg-gray-100 p-4 rounded overflow-auto max-h-96">{{ fileContent }}</pre>
			</div>
			<p v-else> File content not available. </p>
		</div>
		<p v-else>Loading file data or file not found...</p>
	</div>
</template>

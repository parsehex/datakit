<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import FileMetadataDisplay from '@/components/FileMetadataDisplay.vue';
import { type FileMetadata, type RawFileData, type ParsedCSVData } from '@/db';
import { useFilesStore } from '@/stores/files';
import { useParsedStore } from '@/stores/parsed';

const route = useRoute();
const filesStore = useFilesStore();
const parsed = useParsedStore();
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

	const metadata = await filesStore.getMeta(id);
	if (metadata) {
		fileMetadata.value = metadata;
		const rawData = await filesStore.getRaw(id);
		if (rawData) rawFileData.value = rawData;

		const { type, mime, parsedDataId } = fileMetadata.value;
		if (mime === 'text/csv' && parsedDataId) {
			const parsedData = await parsed.getCSV(parsedDataId);
			if (parsedData) parsedCSVData.value = parsedData;
		}

		if (rawFileData.value && rawFileData.value.data) {
			if (mime.startsWith('text')) {
				fileContent.value = new TextDecoder().decode(rawFileData.value.data);
			} else if (type === 'image') {
				const blob = new Blob([rawFileData.value.data], { type: mime });
				imageUrl.value = URL.createObjectURL(blob);
				fileContent.value = null; // Clear text content for images
			} else {
				fileContent.value = `Binary content of type: ${mime}`;
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

const loadFile = (newId?: string | string[]) => {
	if (!newId) {
		if (typeof route.params.id === 'string') newId = route.params.id;
		else if (Array.isArray(route.params.id)) newId = route.params.id[0];
	}
	if (!newId) return;
	fileId.value = Number(newId);
	fetchData(fileId.value);
};
onMounted(loadFile);
watch(() => route.params.id, loadFile);
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

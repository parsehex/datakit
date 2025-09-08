<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Trash } from 'lucide-vue-next';
import { liveQuery } from 'dexie';
import { Button } from '@/components/ui/button';
import { db } from '@/db';
import { deleteFile } from '@/lib/api';
import { useDexieObservable } from '@/lib/utils';

const files = useDexieObservable(liveQuery(() => db.fileMetadata.toArray()));
const fileTypes = ref<string[]>([]);
const selectedFileType = ref<string>('All');

const filteredFiles = computed(() => {
	if (selectedFileType.value === 'All') {
		return files.value;
	}
	return files.value?.filter(file => file.type === selectedFileType.value);
});

const getUniqueFileTypes = () => {
	const types = new Set(files.value?.map(file => file.type));
	fileTypes.value = ['All', ...Array.from(types)];
};

watch(() => files.value, getUniqueFileTypes);
</script>
<template>
	<div class="container mx-auto p-4">
		<h1 class="text-3xl font-bold mb-4">Browse Data</h1>
		<p class="mb-4"> Here you can see a list of all the data files you've added to DataKit. </p>
		<div class="mb-4 flex space-x-2">
			<Button v-for="type in fileTypes" :key="type" :variant="selectedFileType === type ? 'default' : 'outline'"
				@click="selectedFileType = type"> {{ type }} </Button>
		</div>
		<div class="mt-4">
			<h2 class="text-2xl font-semibold mb-2">Files</h2>
			<ul v-if="filteredFiles?.length">
				<li v-for="file in filteredFiles" :key="file.id"
					class="mb-2 p-2 border rounded flex justify-between items-center">
					<RouterLink :to="`/view/${file.id}`" class="w-full">
						<span>{{ file.name }} ({{ file.type }}) - {{ file.size }} bytes</span>
					</RouterLink>
					<div class="flex space-x-2">
						<Button variant="destructive" size="sm" @click="deleteFile(file.id)">
							<Trash />
						</Button>
					</div>
				</li>
			</ul>
			<p v-else>No data files found. Go to the <RouterLink to="/upload" class="text-blue-500 hover:underline">Upload
					page</RouterLink> to add some!</p>
		</div>
	</div>
</template>

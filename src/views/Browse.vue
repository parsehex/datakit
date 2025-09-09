<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Trash } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useFilesStore } from '@/stores/files';

const filesStore = useFilesStore();
const selectedFileType = ref<string>('All');

const filteredFiles = computed(() => {
	if (selectedFileType.value === 'All') return filesStore.all;
	return filesStore.all?.filter(file => file.type === selectedFileType.value);
});
</script>
<template>
	<div class="container mx-auto p-4">
		<h1 class="text-3xl font-bold mb-4">Browse Data</h1>
		<p class="mb-4"> Here you can see a list of all the data files you've added to DataKit. </p>
		<div class="mb-4 flex space-x-2">
			<Button :variant="selectedFileType === 'All' ? 'default' : 'outline'" @click="selectedFileType = 'All'"> All
			</Button>
			<Button v-for="type in filesStore.types" :key="type" :variant="selectedFileType === type ? 'default' : 'outline'"
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
						<Button variant="destructive" size="sm" @click="filesStore.remove(file.id)">
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

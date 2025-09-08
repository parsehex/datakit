<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { liveQuery } from "dexie";
import { db } from '@/db';
import { useDexieObservable } from '@/lib/utils';

const totalFiles = useDexieObservable(liveQuery(() => db.fileMetadata.count()));
const recentFiles = useDexieObservable(liveQuery(() => db.fileMetadata.orderBy('uploadedAt').reverse().limit(5).toArray()));
</script>
<template>
	<div class="container mx-auto p-4">
		<p class="mb-4"> This is a single-page web application designed to help you view and manage data directly in your
			browser. </p>
		<p> You can upload various data types, browse your existing datasets, and view their contents. All data is stored
			locally on your device and is not sent anywhere. </p>
		<hr class="my-8" />
		<div v-if="recentFiles?.length" class="mt-4">
			<h3 class="text-xl font-semibold mb-2">Recently Added Files</h3>
			<ul>
				<li v-for="file in recentFiles" :key="file.id" class="mb-1">
					<RouterLink :to="`/view/${file.id}`" class="text-blue-500 hover:underline"> {{ file.name }} ({{ new
						Date(file.uploadedAt).toLocaleDateString() }}) </RouterLink>
				</li>
			</ul>
		</div>
		<p v-else>No data uploaded yet. Go to the <RouterLink to="/upload" class="text-blue-500 hover:underline">Upload page
			</RouterLink> to get started!</p>
		<p v-if="totalFiles" class="mt-4">Total files uploaded: <strong>{{ totalFiles }}</strong></p>
	</div>
</template>

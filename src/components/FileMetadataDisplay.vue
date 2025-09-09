<script setup lang="ts">
import { File, Calendar, HardDrive, Type, Image, FileText, Trash } from 'lucide-vue-next';
import { Button } from './ui/button';
import type { FileMetadata } from '@/db';
import router from '@/router';
import { useFilesStore } from '@/stores/files';

const props = defineProps<{
	metadata: FileMetadata;
}>();

const filesStore = useFilesStore();

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIconComponent = (mimeType: string): any => {
	if (mimeType.startsWith('image/')) {
		return Image;
	} else if (mimeType.startsWith('text/')) {
		return FileText;
	}
	return File;
};

const fileIconComponent = getFileIconComponent(props.metadata.mime);
</script>
<template>
	<div class="bg-card p-6 rounded-lg shadow-md mb-6">
		<div class="flex items-center justify-between mb-4">
			<h1 class="text-3xl font-bold flex items-center space-x-3">
				<component :is="fileIconComponent" :size="32" class="text-primary" />
				<span>{{ metadata.name }}</span>
				<small v-if="metadata.id">
					<Button variant="destructive" size="sm"
						@click="() => { if (!metadata.id) return; filesStore.remove(metadata.id); router.replace('/'); }">
						<Trash />
					</Button>
				</small>
			</h1>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
			<div class="flex items-center space-x-3">
				<Type :size="20" class="text-muted-foreground" />
				<span><strong>MIME Type:</strong> {{ metadata.mime }}</span>
			</div>
			<div class="flex items-center space-x-3">
				<HardDrive :size="20" class="text-muted-foreground" />
				<span><strong>File Size:</strong> {{ formatFileSize(metadata.size) }}</span>
			</div>
			<div class="flex items-center space-x-3">
				<Calendar :size="20" class="text-muted-foreground" />
				<span><strong>Uploaded At:</strong> {{ new Date(metadata.uploadedAt).toLocaleString() }}</span>
			</div>
		</div>
	</div>
</template>

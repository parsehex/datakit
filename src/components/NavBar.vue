<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Button } from './ui/button';
</script>
<template>
	<nav class="bg-gray-800 p-4">
		<div class="container mx-auto flex justify-between items-center">
			<RouterLink to="/" class="text-white text-xl font-bold">DataKit</RouterLink>
			<div class="space-x-4">
				<RouterLink to="/">
					<Button variant="ghost" class="text-white hover:bg-gray-700">Home</Button>
				</RouterLink>
				<RouterLink to="/browse">
					<Button variant="ghost" class="text-white hover:bg-gray-700">Browse</Button>
				</RouterLink>
				<RouterLink to="/upload">
					<Button variant="ghost" class="text-white hover:bg-gray-700">Upload</Button>
				</RouterLink>
			</div>
		</div>
	</nav>
</template>

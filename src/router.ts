import { createRouter, createWebHistory } from 'vue-router';
import MainView from '@/views/Main.vue';
import UploadView from '@/views/Upload.vue';
import BrowseView from '@/views/Browse.vue';
import ViewView from '@/views/View.vue';

const routes = [
	{
		path: '/',
		name: 'Main',
		component: MainView,
	},
	{
		path: '/upload',
		name: 'Upload',
		component: UploadView,
	},
	{
		path: '/browse',
		name: 'Browse',
		component: BrowseView,
	},
	{
		path: '/view/:id',
		name: 'View',
		component: ViewView,
		props: true,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;

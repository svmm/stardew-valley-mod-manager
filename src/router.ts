import {
	createWebHistory,
	createRouter,
	RouteRecordRaw,
} from "vue-router";

// Components
import AppComponent from "./App.vue";
import ModListComponent from './components/mod-list.component.vue';

const history = createWebHistory();

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		redirect: '/mod-list',
	},
	{
		path: "/mod-list",
		component: ModListComponent,
	},
];

const router = createRouter({
	history,
	routes,
});

export default router;

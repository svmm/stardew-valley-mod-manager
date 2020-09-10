import { createApp } from 'vue';
import './index.css';

// Components
import App from './App.vue';

// Services
import { ModsServiceSymbol, createModsService } from './services/mods.service';

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js');
	});
}

const app = createApp(App)

app.provide(ModsServiceSymbol, createModsService());

app.mount('#app');

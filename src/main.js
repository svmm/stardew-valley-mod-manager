import { createApp } from 'vue';

// Styles
import './main.scss';

// Components
import SVMM from './stardew-valley-mod-manager.component.vue';

// Services
import { ModsListServiceSymbol, createModsListService } from './mod-list/mod-list.service';
import { ModService } from './core/services/mod.service';

// Plugins
import ModalPlugin from './shared/components/modal/modal.plugin';

if ('serviceWorker' in navigator && window.location.hostname.includes('github')) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/stardew-valley-mod-manager/service-worker.js');
	});
}

const app = createApp(SVMM);

app.use(ModalPlugin);

app.provide(ModsListServiceSymbol, createModsListService());
app.provide(ModService.symbol, ModService);

app.mount('#app');

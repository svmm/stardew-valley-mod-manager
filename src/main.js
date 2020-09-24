import { createApp } from 'vue';

// Styles
import './index.scss';

// Components
import SVMM from './stardew-valley-mod-manager.component.vue';

// Services
import { ModsServiceSymbol, createModsService } from './mod-list/mod-list.service';
import { ModalServiceSymbol, createModalService } from './shared/components/modal/modal.service';

// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', () => {
// 		navigator.serviceWorker.register('/stardew-valley-mod-manager/service-worker.js');
// 	});
// }

const app = createApp(SVMM);

app.provide(ModsServiceSymbol, createModsService());
app.provide(ModalServiceSymbol, createModalService());

app.mount('#app');

import { App } from 'vue';

// Components
import ModalComponent from './modal.component.vue';

// Services
import { ModalService } from './modal.service';

export default {
	install: (app: App) => {
		const modalService = new ModalService();

		app.config.globalProperties.$modalService = {
			showModal: modalService.showModal.bind(modalService),
			hideModal: modalService.hideModal.bind(modalService),
			addModal: modalService.showModal.bind(modalService),
		}

		app.provide('modalService', modalService);

		app.component('modal', ModalComponent);
	}
}

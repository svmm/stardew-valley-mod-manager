import { reactive, readonly, ref, Ref, inject } from 'vue';

interface ModalControls {
	show: () => void,
	hide: () => void,
}

interface ModalState {
	[name: string]: ModalControls;
}

interface ModalService {
	readonly modals: ModalState,
	addModal: (name: string, controls: ModalControls) => void,
	showModal: (name: string) => void,
	hideModal: (name: string) => void,
}

export const createModalService = () => {
	const modals: ModalState = reactive({});
	const currentlyShownModal: Ref<string> = ref(null);

	const addModal = (name: string, controls: ModalControls) => {
		if (modals[name]) {
			throw new Error(`Modal ${ name } already exists`);
		}

		modals[name] = controls;
	}

	const hideModal = (name: string) => {
		modals[name].hide();
		currentlyShownModal.value = null;
	}

	const showModal = (name: string) => {
		if (currentlyShownModal) {
			hideModal(name);
		}

		modals[name].show();
		currentlyShownModal.value = name;
	}

	return {
		modals: readonly(modals),
		addModal,
		showModal,
		hideModal,
	}
};

export const ModalServiceSymbol = Symbol('modals');

export const useModalService: () => ModalService = () => inject(ModalServiceSymbol);

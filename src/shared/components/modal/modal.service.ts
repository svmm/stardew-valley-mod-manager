import { reactive, ref, Ref } from 'vue';
import { Injectable } from '../../decorators/injectable.decorator';

interface ModalControls {
	show: () => void,
	hide: () => void,
}

interface ModalState {
	[name: string]: ModalControls;
}

@Injectable
export class ModalService {
	private readonly _modals: ModalState = reactive({});
	private readonly _currentlyShownModal: Ref<string> = ref(null);

	public get modals(): ModalState {
		return this._modals;
	}

	public get currentlyShownModal(): Ref<string> {
		return this._currentlyShownModal;
	}

	public addModal(name: string, controls: ModalControls): void {
		if (this._modals[name]) {
			throw new Error(`Modal ${ name } already exists`);
		}

		this._modals[name] = controls;
	}

	public hideModal(name: string): void {
		this._modals[name].hide();
		this.currentlyShownModal.value = null;
	}

	public showModal(name: string): void {
		if (this.currentlyShownModal) {
			this.hideModal(name);
		}

		this._modals[name].show();
		this.currentlyShownModal.value = name;
	}
}

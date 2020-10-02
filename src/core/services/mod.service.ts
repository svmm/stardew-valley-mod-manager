import { readonly, inject, reactive, computed, ref, Ref } from 'vue';
import { Injectable } from '../../shared/decorators/injectable.decorator';

@Injectable
class ModServiceClass {
	private _modDirectory: any = ref(null);

	public get modDirectory(): Ref<any> {
		return this._modDirectory;
	}

	public setModDirectory(directoryHandle) {
		this._modDirectory.value = directoryHandle;
	}
}


export const ModService = new ModServiceClass();

import { reactive, readonly, inject } from 'vue';

interface Mod {
	name: string,
	directory: any, // FileSystemDirectoryHandle
	configFile: any, // FileSystemFileHandle
	manifestFile: any, // FileSystemFileHandle
}

interface ModsService {
	readonly mods: Mod[],
	getMods: () => void,
}

export const createModsService = () => {
	const mods: Mod[] = reactive([]);

	const getMods = async () => {
		const fileHandle = await window.showDirectoryPicker();

		for await (const entry of fileHandle.getEntries()) {
			if (entry.isDirectory) {
				let nestedDirectoryHandle;

				try {
					nestedDirectoryHandle = await fileHandle.getDirectory(entry.name);
				} catch (e) {
					console.log('awdawd', e);
				}

				let configFile;

				try {
					configFile = await nestedDirectoryHandle.getFile('config.json');
				} catch (e) {
					configFile = null;
				}

				let manifestFile;

				try {
					manifestFile = await nestedDirectoryHandle.getFile('manifest.json');
				} catch (e) {
					manifestFile = null;
				}

				mods.push({
					name: entry.name,
					directory: nestedDirectoryHandle,
					configFile,
					manifestFile,
				});
			}
		}
	}

	return {
		mods: readonly(mods),
		getMods,
	}
};

export const ModsServiceSymbol = Symbol('mods');

export const useModsService: () => ModsService = () => inject(ModsServiceSymbol);

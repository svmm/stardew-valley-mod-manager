import { reactive, readonly, toRaw, inject } from 'vue';

// Services
import { getFolder, deleteFolder } from '../core/services/file-system.service';
import { ModService } from '../core/services/mod.service';

// Intefaces
import { Mod } from '../shared/interfaces/mod.interface';
import { Directory } from '../shared/interfaces/Directory.interface';

interface ModsListService {
	readonly mods: {
		directories: any,
		mods: {
			[name: string]: Mod,
		},
	},
	modDirectoryHandle: any,
	getMods: () => void,
	deleteMod: (fileHandle: any) => {}
}

export const createModsListService = () => {
	const mods = reactive({
		directories: {},
		mods: {},
	});

	const getMods = async () => {
		for (const key in mods.mods) delete mods.mods[key];
		for (const key in mods.directories) delete mods.directories[key];

		if (!ModService.modDirectory.value) {
			ModService.setModDirectory(await getFolder());
		} else {
			ModService.setModDirectory(await getFolder(ModService.modDirectory.value.handle));
		}

		const sortedMods = sortFilesIntoMods(ModService.modDirectory.value);

		Object.assign(mods, sortedMods);
	}

	interface ModDirectory {
		directories: {
			[directoryName: string]: ModDirectory,
		},
		mods: {
			[modName: string]: Mod,
		}
	}

	const sortFilesIntoMods = (parentDirectory: Directory): ModDirectory => {
		const modsToReturn: ModDirectory = {
			directories: {},
			mods: {},
		};

		const checkDirectoryForMods = (directory: Directory) => {
			if (directory?.files?.['manifest.json']) {
				modsToReturn.mods[directory.name] = {
					name: directory.name,
					configFile: directory.files['config.json'] || null,
					manifestFile: directory.files['manifest.json'] || null,
					files: directory.files,
					directoryHandle: directory.handle,
					parentDirectoryHandle: directory.parentHandle,
				};

				return;
			}

			const childDirectories = Object.values(directory.directories).filter(dir => dir.name[0] !== '.');

			for (const childDirectory of childDirectories) {
				checkDirectoryForMods(childDirectory);
			}
		}

		checkDirectoryForMods(parentDirectory);

		return modsToReturn;
	}

	const deleteMod = async (mod: Mod) => {
		await deleteFolder(mod.parentDirectoryHandle, mod.name);

		await getMods();
	}

	return {
		mods: readonly(mods),
		modDirectoryHandle: ModService.modDirectory.value,
		sortFilesIntoMods,
		getMods,
		deleteMod,
	}
};

export const ModsListServiceSymbol = Symbol('ModListService');

export const useModsListService: () => ModsListService = () => inject(ModsListServiceSymbol);

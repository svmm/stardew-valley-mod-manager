import { reactive, readonly, Ref, ref, inject } from 'vue';

// Services
import { getFolder, deleteFolder } from '../core/services/file-system.service';

// Intefaces
import { Mod } from '../shared/interfaces/mod.interface';
import { Directory } from '../shared/interfaces/Directory.interface';

interface ModsService {
	readonly mods: {
		directories: any,
		mods: {
			[name: string]: Mod,
		},
	},
	getMods: () => void,
	deleteMod: (fileHandle: any) => {}
}

export const createModsService = () => {
	const mods = reactive({
		directories: {},
		mods: {},
	});
	let modDirectoryHandle: any;

	const getMods = async () => {
		for (const key in mods.mods) delete mods.mods[key];
		for (const key in mods.directories) delete mods.directories[key];

		let files: Directory;

		if (!modDirectoryHandle) {
			files = await getFolder();
		} else {
			files = await getFolder(modDirectoryHandle);
		}

		modDirectoryHandle = files.handle;

		console.log(files);

		const sortedMods = sortFilesIntoMods(files);

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

	const readFile = async (mod: string, fileName: string) => {

	}

	return {
		mods: readonly(mods),
		sortFilesIntoMods,
		getMods,
		deleteMod,
	}
};

export const ModsServiceSymbol = Symbol('mods');

export const useModsService: () => ModsService = () => inject(ModsServiceSymbol);

import { readonly, inject, reactive, computed, ref, Ref } from 'vue';
import { Injectable } from '../../shared/decorators/injectable.decorator';

// Services
import { FileSystemService } from '../../core/services/file-system.service';

// Interfaces
import { Directory } from '../../shared/interfaces/Directory.interface';
import { Mod } from '../../shared/interfaces/mod.interface';
import { ModDirectory } from '../../shared/interfaces/mod-directory.interface';

@Injectable
class ModServiceClass {
	private _modDirectory: Ref<Directory> = ref(null);
	public readonly mods: ModDirectory = reactive({
		directories: {},
		mods: {},
	});

	public get modDirectory(): Ref<Directory> {
		return this._modDirectory;
	}

	public async setModDirectory(directoryHandle: Directory): Promise<void> {
		this._modDirectory.value = directoryHandle;
		FileSystemService.requestPermission(directoryHandle.handle);
	}

	public async getMods(): Promise<void> {
		for (const key in this.mods.mods) delete this.mods.mods[key];
		for (const key in this.mods.directories) delete this.mods.directories[key];

		if (!ModService.modDirectory.value) {
			ModService.setModDirectory(await FileSystemService.getFolder());
		} else {
			ModService.setModDirectory(await FileSystemService.getFolder(this.modDirectory.value.handle));
		}

		const sortedMods = await this.sortFilesIntoMods(ModService.modDirectory.value);

		Object.assign(this.mods, sortedMods);
	}

	public async sortFilesIntoMods(parentDirectory: Directory): Promise<ModDirectory> {
		const modsToReturn: ModDirectory = {
			directories: {},
			mods: {},
		};

		const checkDirectoryForMods = async (directory: Directory) => {
			if (directory?.files?.['manifest.json']) {
				const manifestFile = await directory.files['manifest.json'].getFile();
				const manifestFileContents = JSON.parse(await manifestFile.text());
				modsToReturn.mods[manifestFileContents.Name] = {
					name: manifestFileContents.Name,
					author: manifestFileContents.Author,
					version: manifestFileContents.Version,
					description: manifestFileContents.Description,
					configFile: directory.files['config.json'] || null,
					manifestFile: directory.files['manifest.json'] || null,
					files: directory.files,
					directoryHandle: directory.handle,
					parentDirectoryHandle: directory.parentHandle,
					directoryName: directory.name,
					active: /^\./.test(directory.name) ? false : true,
				};

				return;
			}

			// const childDirectories = Object.values(directory.directories).filter(dir => dir.name[0] !== '.');
			const childDirectories = Object.values(directory.directories);

			for (const childDirectory of childDirectories) {
				await checkDirectoryForMods(childDirectory);
			}
		}

		await checkDirectoryForMods(parentDirectory);

		return modsToReturn;
	}

	public async deleteMod(mod: Mod): Promise<void> {
		await FileSystemService.deleteFolder(mod.parentDirectoryHandle, mod.directoryName);

		await this.getMods();
	}

	/**
	 * Change the active status for a single mod
	 */
	public setModActiveStatus(mod: Mod, active: boolean): void {
		this.mods.mods[mod.name].active = active;
	}
}


export const ModService = new ModServiceClass();

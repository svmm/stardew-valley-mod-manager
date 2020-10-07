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
	public readonly mods = reactive({
		directories: {},
		mods: {},
	});

	public get modDirectory(): Ref<Directory> {
		return this._modDirectory;
	}

	public setModDirectory(directoryHandle: Directory): void {
		this._modDirectory.value = directoryHandle;
	}

	public async getMods () {
		for (const key in this.mods.mods) delete this.mods.mods[key];
		for (const key in this.mods.directories) delete this.mods.directories[key];

		if (!ModService.modDirectory.value) {
			ModService.setModDirectory(await FileSystemService.getFolder());
		} else {
			ModService.setModDirectory(await FileSystemService.getFolder(ModService.modDirectory.value.handle));
		}

		const sortedMods = this.sortFilesIntoMods(ModService.modDirectory.value);

		Object.assign(this.mods, sortedMods);
	}

	public sortFilesIntoMods(parentDirectory: Directory): ModDirectory {
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

	public async deleteMod(mod: Mod): Promise<void> {
		await FileSystemService.deleteFolder(mod.parentDirectoryHandle, mod.name);

		await this.getMods();
	}
}


export const ModService = new ModServiceClass();

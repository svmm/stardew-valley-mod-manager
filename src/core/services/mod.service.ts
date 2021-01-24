import { readonly, inject, reactive, computed, ref, Ref, ComputedRef, unref } from 'vue';
import { Injectable } from '../../shared/decorators/injectable.decorator';

// Services
import { FileSystemService } from '../../core/services/file-system.service';

// Interfaces
import { Directory } from '../../shared/interfaces/Directory.interface';
import { Mod } from '../../shared/interfaces/mod.interface';
import { ModDirectory } from '../../shared/interfaces/mod-directory.interface';
import { Profile, Profiles } from '../../shared/interfaces/profile.interface';
import { ModalService } from '../../shared/components/modal/modal.service';

@Injectable
class ModServiceClass {
	public readonly mods: ModDirectory = reactive({
		directories: {},
		mods: {},
	});
	private readonly _profiles: Profiles = reactive({});

	public profiles: ComputedRef<Profile[]> = computed(() => {
		return Object.values(this._profiles);
	});

	private _modDirectory: Ref<Directory> = ref(null);
	private _currentProfile: Ref<string> = ref(null);

	public get modDirectory(): Ref<Directory> {
		return this._modDirectory;
	}

	public currentProfile: ComputedRef<Profile> = computed(() => {
		if (this._profiles[this._currentProfile.value]) {
			return this._profiles[this._currentProfile.value];
		}

		return null;
	});

	public currentProfileName: ComputedRef<string> = computed(() => this?.currentProfile?.value?.name);

	public async setModDirectory(directoryHandle: Directory): Promise<void> {
		this._modDirectory.value = directoryHandle;
		FileSystemService.requestPermission(directoryHandle.handle);
	}

	public setCurrentProfile(profile: Profile | string): void {
		if (typeof profile === 'string') {
			this._currentProfile.value = profile;
			return;
		}

		this._currentProfile.value = profile.key;
	}

	public async getMods(): Promise<void> {
		for (const key in this.mods.mods) delete this.mods.mods[key];
		for (const key in this.mods.directories) delete this.mods.directories[key];
		for (const key in this._profiles) delete this._profiles[key];

		const directory = this.modDirectory?.value?.handle;

		const modFolder = await FileSystemService.getFolder(directory);

		this.setModDirectory(modFolder);

		if (Object.keys(modFolder.directories).length === 0) {
			return;
		}

		const sortedMods = await this.sortDirectoryIntoProfiles(modFolder);

		let activeProfile = Object.values(sortedMods).find(profile => profile.active);

		if (!activeProfile) {
			activeProfile = Object.values(sortedMods)[0];
		}

		this.setCurrentProfile(activeProfile);

		Object.assign(this._profiles, sortedMods);
	}

	public async sortDirectoryIntoProfiles(parentDirectory: Directory): Promise<Profiles> {
		const profiles: Profiles = {};

		const checkDirectoryForMods = async (directory: Directory, recursive: boolean = true): Promise<{[key: string]: Mod}> => {
			let mods: {[key: string]: Mod} = {};

			if (directory?.files?.['manifest.json']) {
				const manifestFile = await directory.files['manifest.json'].getFile();
				const fileContentsJson = await manifestFile.text();
				const manifestFileContents = JSON.parse(this.sanitiseJson(fileContentsJson));

				mods[manifestFileContents.Name] = {
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

				return mods;
			}

			const childDirectories = Object.values(directory.directories);

			for (const childDirectory of childDirectories) {
				const childMods = await checkDirectoryForMods(childDirectory);
				mods = {
					...mods,
					...recursive ? childMods : {},
				}
			}

			return mods;
		}

		// Check for parent level mods for the "default" profile
		let parentLevelMods = {};
		for (const childDirectory of Object.values(parentDirectory.directories)) {
			const childMods = await checkDirectoryForMods(childDirectory, false);
			parentLevelMods = {
				...parentLevelMods,
				...childMods,
			}
		}

		const parentLevelModValues = Object.values(parentLevelMods);

		if (parentLevelModValues.length) {
			profiles['Default'] = {
				name: 'Default',
				key: 'Default',
				active: true,
				mods: parentLevelMods,
				directory: parentDirectory.handle,
				parentDirectory: null,
			}
		}

		for (const [profileFolderName, directory] of Object.entries(parentDirectory.directories)) {
			if (directory.files['manifest.json']) {
				continue;
			}

			let profileName = profileFolderName;

			let active = true;

			if (profileFolderName[0] === '.') {
				profileName = profileFolderName.substr(1, profileFolderName.length);

				if (!profiles['Default']) {
					active = false;
				}
			}

			if (!profiles[profileFolderName]) {
				profiles[profileFolderName] = {
					name: profileName,
					key: profileFolderName,
					active,
					mods: {},
					directory: directory.handle,
					parentDirectory: directory.parentHandle,
				};
			}

			profiles[profileFolderName].mods = await checkDirectoryForMods(directory);
		}

		return profiles;
	}

	public async createProfile(name: string): Promise<void> {
		await FileSystemService.createDirectory(this.modDirectory.value.handle, name);
		this.setCurrentProfile(name);
		await this.getMods();
	}

	public async deleteMod(mod: Mod): Promise<void> {
		await FileSystemService.deleteFolder(mod.parentDirectoryHandle, mod.directoryName);

		await this.getMods();
	}

	/**
	 * Change the active status for a single mod
	 */
	public setModActiveStatus(mod: Mod, active: boolean): void {
		mod.active = active;
	}

	/**
	 * Enable or disable a mod
	 */
	public async toggleMod(mod: Mod): Promise<void> {
		await FileSystemService.requestPermission(mod.parentDirectoryHandle);

		if (mod.active) {
			await FileSystemService.copyFolder(mod.directoryHandle, mod.parentDirectoryHandle, `.${ mod.directoryHandle.name }`);
			this.setModActiveStatus(mod, false);
		} else {
			await FileSystemService.copyFolder(mod.directoryHandle, mod.parentDirectoryHandle, `${ mod.name }`);
			this.setModActiveStatus(mod, true);
		}

		await FileSystemService.deleteFolder(mod.parentDirectoryHandle, mod.directoryHandle.name);
		await this.getMods();
	}

	public async setActiveProfile(profile: Profile): Promise<void> {
		console.log(profile);
		const currentProfileName = `.${ this.currentProfile.value.name }`;
		console.log(currentProfileName);

		await Promise.all([
			await FileSystemService.renameFolder(this.currentProfile.value.directory, this.currentProfile.value.parentDirectory, currentProfileName),
			await FileSystemService.renameFolder(profile.directory, profile.parentDirectory, profile.name),
		]);

		this.setCurrentProfile(profile);

		await this.getMods();
	}

	public sanitiseJson(json: string): string {
		return json
			.replace(/\s/g, '')
			.replace(/\r/g, '')
			.replace(/\n/g, '')
			.replace(/\,\}/g, '}');
	}
}

export const ModService = new ModServiceClass();

// Interfaces
import { Mod } from './mod.interface';

export interface Profile {
	name: string;
	key: string;
	parentDirectory: FileSystemDirectoryHandle,
	directory: FileSystemDirectoryHandle,
	active: boolean;
	mods: {
		[key: string]: Mod;
	}
}

export interface Profiles {
	[key: string]: Profile;
}

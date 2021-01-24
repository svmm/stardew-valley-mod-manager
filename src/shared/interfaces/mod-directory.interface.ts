// Interfaces
import { Mod } from './mod.interface';

export interface ModDirectory {
	directories: {
		[directoryName: string]: ModDirectory,
	},
	mods: {
		[modName: string]: Mod,
	}
}

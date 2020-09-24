import { FileWithRelativePath } from './directory.interface';

export interface Mod {
	name: string,
	configFile: File, // File
	manifestFile: File, // File
	files: {
		[name: string]: FileWithRelativePath,
	},
	directoryHandle: any,
	parentDirectoryHandle: any,
}

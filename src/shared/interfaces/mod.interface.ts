export interface Mod {
	name: string,
	author: string;
	version: string;
	description: string;
	configFile: FileSystemFileHandle,
	manifestFile: FileSystemFileHandle,
	files: {
		[name: string]: FileSystemFileHandle,
	},
	directoryHandle: FileSystemDirectoryHandle,
	parentDirectoryHandle: FileSystemDirectoryHandle,
	directoryName: string;
	active: boolean;
}

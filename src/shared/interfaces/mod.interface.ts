export interface Mod {
	name: string,
	configFile: FileSystemFileHandle,
	manifestFile: FileSystemFileHandle,
	files: {
		[name: string]: FileSystemFileHandle,
	},
	directoryHandle: FileSystemDirectoryHandle,
	parentDirectoryHandle: FileSystemDirectoryHandle,
}

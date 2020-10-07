export interface Directory {
	name: string,
	handle: FileSystemDirectoryHandle,
	parentHandle: FileSystemDirectoryHandle,
	directories: {
		[key: string]: Directory,
	},
	files: {
		[key: string]: FileSystemFileHandle,
	},
}

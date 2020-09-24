export interface FileWithRelativePath extends File {
	webkitRelativepath: string;
}

export interface Directory {
	name: string,
	handle: any, // FileSystemDirectoryHandle?
	parentHandle: any, // FileSystemDirectoryHandle?
	directories: {
		[key: string]: Directory,
	},
	files: {
		[key: string]: FileWithRelativePath
	},
}

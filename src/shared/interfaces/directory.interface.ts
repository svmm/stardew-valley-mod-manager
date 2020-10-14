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

export interface DirectoryArray {
	name: string; // The name of the item
	parentDirectoryPath: string;	// This is the path of the directory that this item is in
	// parentDirectoryHandle?: FileSystemDirectoryHandle;
	directoryPath: string,
	handle?: FileSystemDirectoryHandle;
}

export interface FileArray {
	name: string; // The name of the item
	// parentDirectoryPath: string;	// This is the path of the directory that this item is in
	// parentDirectoryHandle?: FileSystemDirectoryHandle;
	directoryPath: string,
	handle?: FileSystemFileHandle;
}

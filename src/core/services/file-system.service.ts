import {
	showDirectoryPicker,
} from 'native-file-system-adapter';

// Intefaces
import { Directory } from '../../shared/interfaces/directory.interface';

export const getDirectory = async (directoryHandle, path = directoryHandle.name, parentHandle = directoryHandle): Promise<Directory> => {
	const directory: Directory = {
		name: path,
		handle: directoryHandle,
		parentHandle: parentHandle || null,
		directories: {},
		files: {},
	};

	for await (const entry of directoryHandle.getEntries()) {
		const nestedPath = `${path}/${entry.name}`;
		if (entry.isFile) {
			const file = await entry.getFile();

			Object.defineProperty(file, 'webkitRelativePath', {
				configurable: true,
				enumerable: true,
				get: () => nestedPath,
			});

			directory.files[entry.name] = file;
		} else if (entry.isDirectory) {
			directory.directories[entry.name] = await getDirectory(entry, entry.name, parentHandle || directoryHandle);
		}
	}

	return directory as Directory;
}

export const getFolder = async (directoryHandle?: any) => {
	const handle = directoryHandle || await showDirectoryPicker();
	return getDirectory(handle);
}

export const deleteFolder = async (directoryHandle, folderName) => {
	await directoryHandle.removeEntry(folderName, {
		recursive: true,
	});
}

export const createFolder = async (directoryHandle, folderName) => {
	// TODO
}

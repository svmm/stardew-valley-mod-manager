import {
	showDirectoryPicker,
} from 'native-file-system-adapter';

// Intefaces
import { Directory } from '../../shared/interfaces/directory.interface';

export class FileSystemService {
	public static async getDirectory(
		directoryHandle,
		path = directoryHandle.name,
		parentHandle = directoryHandle
	): Promise<Directory> {
		const directory: Directory = {
			name: path,
			handle: directoryHandle,
			parentHandle: parentHandle || null,
			directories: {},
			files: {},
		};

		const isModDirectory = await this.getFile(directoryHandle, 'manifest.json');

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
				if (isModDirectory) {
					directory.directories[entry.name] = {
						name: entry.name,
						handle: entry,
						parentHandle: parentHandle || directoryHandle,
						directories: {},
						files: {},
					};

					continue;
				}

				directory.directories[entry.name] = await this.getDirectory(entry, entry.name, parentHandle || directoryHandle);
			}
		}

		return directory as Directory;
	}

	public static async getFolder(directoryHandle?: any): Promise<Directory> {
		const handle = directoryHandle || await showDirectoryPicker();
		return this.getDirectory(handle);
	}

	public static async getFile(directoryHandle: any, filename: string): Promise<any> {
		let fileHandle: any = null;

		try {
			fileHandle = await directoryHandle.getFile(filename, {
				create: false,
			});
		} catch (e) {
			// It's fine
		}

		return fileHandle;
	}

	public static async deleteFolder(directoryHandle, folderName: string): Promise<void> {
		await directoryHandle.removeEntry(folderName, {
			recursive: true,
		});
	}

	public static async addFolder(directoryhandle, directoryHandleToAdd): Promise<void> {
		// Todo
	}
}

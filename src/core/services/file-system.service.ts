// Intefaces
import { Directory } from '../../shared/interfaces/directory.interface';

// Services
import { ZipContentDirectory, ZipFile } from './zip.service';

export class FileSystemService {
	/**
	 * This method recursively maps all directories and files under a given directory.
	 */
	public static async getDirectory(
		directoryHandle: FileSystemDirectoryHandle,
		recursive: boolean = false,
		path = directoryHandle.name,
		parentHandle: FileSystemDirectoryHandle = directoryHandle,
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
			if (entry.isFile) {
				directory.files[entry.name] = entry;
			} else if (entry.isDirectory) {
				if (recursive) {
					directory.directories[entry.name] = await this.getDirectory(entry, recursive, entry.name, parentHandle || directoryHandle);
				}

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

				directory.directories[entry.name] = await this.getDirectory(entry, recursive, entry.name, parentHandle || directoryHandle);
			}
		}

		return directory as Directory;
	}

	/**
	 * This method returns opens a directory picker and the user can choose the directory they want.
	 * It returns a map of the whole directory recursively (except for Mod directories)
	 */
	public static async getFolder(directoryHandle?: FileSystemDirectoryHandle): Promise<Directory> {
		const handle: FileSystemDirectoryHandle = directoryHandle || await window.showDirectoryPicker();
		return this.getDirectory(handle);
	}

	/**
	 * This method reads or creates a file in a given directory using it's filename
	 */
	public static async getFile(directoryHandle: FileSystemDirectoryHandle, filename: string, create: boolean = false): Promise<FileSystemFileHandle> {
		let fileHandle: FileSystemFileHandle = null;

		try {
			fileHandle = await directoryHandle.getFile(filename, {
				create,
			});
		} catch (e) {
			// It's fine
		}

		return fileHandle;
	}

	/**
	 * Deletes a folder and all contents from the given directory
	 */
	public static async deleteFolder(directoryHandle: FileSystemDirectoryHandle, folderName: string): Promise<void> {
		await directoryHandle.removeEntry(folderName, {
			recursive: true,
		});
	}

	/**
	 * This file populates a directory for either a fully qualified folder structure, or from a zip file
	 */
	public static async populateDirectory (parentHandle: FileSystemDirectoryHandle, directory: Directory): Promise<void>;
	public static async populateDirectory (parentHandle: FileSystemDirectoryHandle, directory: ZipContentDirectory): Promise<void>;
	public static async populateDirectory (parentHandle: FileSystemDirectoryHandle, directory: Directory | ZipContentDirectory): Promise<void> {
		const newDirectoryHandle = await this.createDirectory(parentHandle, directory.name);

		const fileCreations: Promise<any>[] = [];
		const directoryCreations: Promise<any>[] = [];

		for (const [ fileName, file ] of Object.entries(directory.files)) {
			const fileEntry = <FileSystemFileHandle | ZipFile>file;

			fileCreations.push(new Promise( async resolve => {
				const fileHandle = await this.createFile(newDirectoryHandle, fileName);

				const fileStream = await fileHandle.createWritable({
					keepExistingData: false,
				});

				let contents: Blob;

				if ((<ZipFile>fileEntry)?.content) {
					contents = new Blob([(<ZipFile>fileEntry).content]);
				} else if ((<FileSystemFileHandle>fileEntry)?.isFile) {
					const fileToCopyHandle = await (<FileSystemFileHandle>fileEntry).getFile();
					contents = new Blob([await fileToCopyHandle.text()]);
				}

				await fileStream.write(contents);

				await fileStream.close();

				resolve();
			}));
		}

		for (const childDirectory of Object.values(directory.directories)) {
			directoryCreations.push(this.populateDirectory(newDirectoryHandle, childDirectory));
		}

		await Promise.all(fileCreations);
		await Promise.all(directoryCreations);
	}

	/**
	 * Copies directory contents to a new directory
	 */
	public static async copyFolder(directoryToCopy: FileSystemDirectoryHandle, destination: FileSystemDirectoryHandle, folderName: string): Promise<void> {
		const fullDirectoryToCopy = await this.getDirectory(directoryToCopy, true);

		const newFolderHandle = await this.createDirectory(destination, folderName);

		this.populateDirectory(newFolderHandle, fullDirectoryToCopy);
	}

	/**
	 * Returns a newly created directory handle
	 */
	public static async createDirectory(parentDirectoryHandle: FileSystemDirectoryHandle, folderName: string): Promise<FileSystemDirectoryHandle> {
		return parentDirectoryHandle.getDirectory(folderName, {
			create: true,
		});
	}

	/**
	 * Returns a newly created file handle
	 */
	public static async createFile(directoryHandle: FileSystemDirectoryHandle, fileName: string): Promise<FileSystemFileHandle> {
		return this.getFile(directoryHandle, fileName, true);
	}

	public static async addFolder(directoryhandle, directoryHandleToAdd): Promise<void> {
		// Todo
	}
}

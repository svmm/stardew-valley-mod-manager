// Interfaces
import { Directory, DirectoryArray, FileArray } from '../../shared/interfaces/directory.interface';

// Services
import { ZipContentDirectory, ZipFile } from './zip.service';
import { chunkArray } from '../../shared/services/utils.service';

// Workers
import FileSystemWorker from '../web-workers/file-system?worker';

export class FileSystemService {

	// Holds handle references outside `populateDirectory` recursive scope so they can be GCd as the method runs
	private static fileHandles = {}
	private static directoryHandles = {}

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

		for await (const entry of directoryHandle.values()) {
			if (entry.kind === 'file') {
				directory.files[entry.name] = entry;
			} else if (entry.kind === 'directory') {
				if (entry.name === '') {
					continue;
				}

				if (recursive) {
					directory.directories[entry.name] = await this.getDirectory(entry, recursive, entry.name, directoryHandle);
					continue;
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

				directory.directories[entry.name] = await this.getDirectory(entry, recursive, entry.name, directoryHandle);
			}
		}

		return directory as Directory;
	}

	/**
	 * Turns a <Directory> into an array of objects to create.
	 * Arrays are easily chunkable and mean we don't have to rely on recursion
	 * to populate later directories.
	 */
	public static getDirectoryArray(
		directory: Directory | ZipContentDirectory,
		path = directory.name,
	): { directories: DirectoryArray[], files: FileArray[] } {
		const output: { directories: DirectoryArray[], files: FileArray[] } = {
			directories: [],
			files: [],
		}

		const handleFile = (obj: FileArray) => {
			output.files.push(obj);
		}

		const handleDirectory = (obj: DirectoryArray) => {
			output.directories.push(obj);
		}

		const recurse = (
			handle: Directory | ZipContentDirectory,
			currentPath: string = '',
			completeDirectoryPath: string = `${currentPath}/${handle.name}`
		) => {
			handleDirectory({
				name: handle.name,
				parentDirectoryPath: currentPath,
				directoryPath: completeDirectoryPath,
			});

			const handleFiles = Object.values(handle.files);
			const handleDirectories = Object.values(handle.directories);

			if (handleFiles.length) {
				for (const file of handleFiles) {
					handleFile({
						name: file.name,
						// parentDirectoryPath: currentPath,
						directoryPath: completeDirectoryPath,
						handle: file,
					});
				}
			}

			if (handleDirectories.length) {
				for (const childDirectory of handleDirectories) {
					recurse(childDirectory, completeDirectoryPath);
				}
			}
		}

		recurse(directory, '', directory.name);

		return output;
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
			fileHandle = await directoryHandle.getFileHandle(filename, {
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
	 * This is a debug method for quickly generating lots of file handles to test browser performance.
	 */
	public static async DEBUG_getHandles(directoryHandle: FileSystemDirectoryHandle): Promise<void> {
		const handles = []

		console.log(directoryHandle);

		for (let i = 0; i < 5; i++) {
			const file = await directoryHandle.getFileHandle(`handle${i}`, {create: true})
			handles.push(file);
			const label = `${performance.now()}`;
			console.time(`${label}-creatStream`);
			const stream = await file.createWritable({
				keepExistingData: false,
			});
			console.timeEnd(`${label}-creatStream`);
			console.time(`${label}-writeFile`);
			await stream.write('hello');
			console.timeEnd(`${label}-writeFile`);
			console.time(`${label}-closeFile`);
			await stream.close();
			console.timeEnd(`${label}-closeFile`);
		}
	}

	/**
	 * This file populates a directory for either a fully qualified folder structure, or from a zip file
	 */
	public static async populateDirectory(parentHandle: FileSystemDirectoryHandle, directory: Directory): Promise<void>;
	public static async populateDirectory(parentHandle: FileSystemDirectoryHandle, directory: ZipContentDirectory): Promise<void>;
	public static async populateDirectory(parentHandle: FileSystemDirectoryHandle, directory: Directory | ZipContentDirectory): Promise<void> {
		//await this.populateDirectoryFiles(parentHandle, directory);

		const worker: Worker = new FileSystemWorker();

		worker.postMessage({
			type: 'createDirectoryFiles',
			parentHandle,
			directoryToCreate: directory,
		});

		await new Promise(resolve => {
			worker.onmessage = message => {
				if (message.data === 'createDirectoryFiles:done') {
					resolve();
				}
			};
		});

		worker.terminate();

		for (const childDirectory of Object.values(directory.directories)) {
			const handleId = performance.now();

			this.directoryHandles[handleId] = await this.createDirectory(parentHandle, childDirectory.name);
			await this.populateDirectory(this.directoryHandles[handleId], childDirectory);
			this.directoryHandles[handleId] = null;
		}
	}

	/**
	 * This file populates a directory for either a fully qualified folder structure, or from a zip file
	 */
	public static async populateDirectoryArray(parentHandle: FileSystemDirectoryHandle, directory: Directory): Promise<void>;
	public static async populateDirectoryArray(parentHandle: FileSystemDirectoryHandle, directory: ZipContentDirectory): Promise<void>;
	public static async populateDirectoryArray(parentHandle: FileSystemDirectoryHandle, directory: Directory | ZipContentDirectory): Promise<void> {
		const directoryArrays = this.getDirectoryArray(directory);

		const chunkedDirectories = chunkArray(directoryArrays.directories, 10);
		const chunkedFiles = chunkArray(directoryArrays.files, 20);

		const directoryHandleMap: {[key: string]: FileSystemDirectoryHandle} = {}

		for (const directorySubArray of chunkedDirectories) {
			for (const subDirectory of directorySubArray) {
				const handle = await this.createDirectory(directoryHandleMap[subDirectory.parentDirectoryPath] || parentHandle, subDirectory.name);
				directoryHandleMap[subDirectory.directoryPath] = handle;
			}
		}

		const worker: Worker = new FileSystemWorker();

		for (const fileSubArray of chunkedFiles) {
			const index = chunkedFiles.indexOf(fileSubArray);

			const files: {
				name: string;
				contents: Blob;
				parentHandle: FileSystemDirectoryHandle;
			}[] = [];

			for (const subFile of fileSubArray) {
				files.push({
					name: subFile.name,
					contents: await this.getFileContents(subFile.handle),
					parentHandle: directoryHandleMap[subFile.directoryPath],
				});
			}

			worker.postMessage({
				type: 'createDirectoryFile',
				payload: files,
			});

			await new Promise(resolve => {
				worker.onmessage = message => {
					if (message.data === 'createDirectoryFile:done') {
						resolve();
					}
				};
			});

			await new Promise(resolve => setTimeout(() => resolve(), 150)); // Trying to force GC
		}

		worker.terminate();
	}

	/**
	 * Copies directory contents to a new directory
	 */
	public static async copyFolder(directoryToCopy: FileSystemDirectoryHandle, destination: FileSystemDirectoryHandle, folderName: string): Promise<void> {
		const fullDirectoryToCopy = await this.getDirectory(directoryToCopy, true);

		fullDirectoryToCopy.name = folderName;

		await this.populateDirectoryArray(destination, fullDirectoryToCopy);
	}

	/**
	 * Rename directory
	 */
	public static async renameFolder(directory: FileSystemDirectoryHandle, parentDirectory: FileSystemDirectoryHandle, folderName: string): Promise<void> {
		await this.copyFolder(directory, parentDirectory, folderName);
		await this.deleteFolder(parentDirectory, directory.name);
	}

	/**
	 * Returns a newly created directory handle
	 */
	public static async createDirectory(parentDirectoryHandle: FileSystemDirectoryHandle, folderName: string): Promise<FileSystemDirectoryHandle> {
		return parentDirectoryHandle.getDirectoryHandle(folderName, {
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

	/**
	 * Requests write permission in a given directory
	 */
	public static async requestPermission(
		directoryHandle: FileSystemDirectoryHandle,
		mode: 'read' | 'readwrite' = 'readwrite',
	): Promise<void> {
		await directoryHandle.requestPermission({
			mode,
		});
	}

	private static async getFileContents(file: FileSystemFileHandle): Promise<Blob>;
	private static async getFileContents(file: ZipFile): Promise<Blob>;
	private static async getFileContents(file: FileSystemFileHandle | ZipFile): Promise<Blob> {
		let contents: Blob;

		if ((<ZipFile>file)?.content) {
			contents = new Blob([(<ZipFile>file).content]);
		} else if ((<FileSystemFileHandle>file)?.kind === 'file') {
			const fileToCopyHandle = await (<FileSystemFileHandle>file).getFile();
			contents = new Blob([await fileToCopyHandle.text()]);
		}

		return contents;
	}
}

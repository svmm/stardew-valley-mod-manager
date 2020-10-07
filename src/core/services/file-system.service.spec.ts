// Services
import { FileSystemService } from './file-system.service';

// Interfaces
import { Directory } from '../../shared/interfaces/directory.interface';

const fileHandleStub = (name: string, value: string = 'test'): FileSystemFileHandle => ({
	name,
	isFile: true,
	isDirectory: false,
	getFile(): any {
		return Promise.resolve({
			text() {
				return Promise.resolve(value);
			},
		});
	},
	kind: 'file',

	// Just to make the typings happy
	createWritable: (): any => ({
		write: jest.fn(),
		close: jest.fn(),
	}),
	isSameEntry: (): any => {},
	queryPermission: (): any => {},
	requestPermission: (): any => {},
});

const directoryHandleStub = (name: string, entries: (FileSystemFileHandle | FileSystemDirectoryHandle)[] = []): FileSystemDirectoryHandle => ({
	name,
	isFile: false,
	isDirectory: true,
	getEntries(): any {
		return entries;
	},
	kind: 'directory',

	// Just to make the typings happy
	isSameEntry: (): any => {},
	queryPermission: (): any => {},
	requestPermission: (): any => {},
	getDirectory: (): any => {},
	entries: (): any => {},
	getDirectoryHandle: (): any => {},
	getFile: (): any => {},
	getFileHandle: (): any => {},
	keys: (): any => {},
	removeEntry: (): any => {},
	resolve: (): any => {},
	values: (): any => {},
	[Symbol.asyncIterator]: (): any => {},
});

type DirectoryOptions = Partial<{[key in keyof Directory]: Directory[key]}>;

const directoryStub = (options: DirectoryOptions): Directory => ({
	name: options?.name,
	handle: options?.handle,
	parentHandle: options?.parentHandle,
	directories: options?.directories,
	files: options?.files,
});

describe('FileSystemService', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('getFolder', () => {
		it('init', () => {
			expect(FileSystemService.getDirectory).toBeDefined();
		});

		it('Should return an object', async () => {
			const directoryHandle = directoryHandleStub('parent', [
				fileHandleStub('test'),
			])

			const response = await FileSystemService.getDirectory(directoryHandle);

			expect(response).toBeDefined();
			expect(response).toBeInstanceOf(Object);
			expect(response.name).toBe('parent');
			expect(response.directories).toBeDefined();
			expect(response.files).toBeDefined();
		});

		it('Should return a directory with a nested directory', async () => {
			const directoryHandle = directoryHandleStub('parent', [
				directoryHandleStub('dir1', [
					directoryHandleStub('dir2'),
				]),
			]);

			const response = await FileSystemService.getDirectory(directoryHandle);

			const [ directory1 ] = Object.values(response.directories);

			const [ directory2 ] = Object.values(directory1.directories);

			expect(directory1.name).toBe('dir1');
			expect(directory2.name).toBe('dir2');
		});

		it('Should return a directory with 10 files', async () => {
			const directoryHandle = directoryHandleStub('parent', [
				fileHandleStub('test1'),
				fileHandleStub('test2'),
				fileHandleStub('test3'),
				fileHandleStub('test4'),
				fileHandleStub('test5'),
				fileHandleStub('test6'),
				fileHandleStub('test7'),
				fileHandleStub('test8'),
				fileHandleStub('test9'),
				fileHandleStub('test10'),
			]);

			const directory = await FileSystemService.getDirectory(directoryHandle);

			expect(Object.keys(directory.files)).toHaveLength(10);
		});

		it('A directory should have it\'s handle', async () => {
			const directoryHandle = directoryHandleStub('parent');

			const directory = await FileSystemService.getDirectory(directoryHandle);

			expect(directory.handle).toBeDefined();
		});

		it('Mod directories shouldn\'t recursively load all sub-folders by default when top level', async () => {
			const spy_getFile = jest.spyOn(FileSystemService, 'getFile');
			spy_getFile.mockImplementation(() => Promise.resolve(fileHandleStub('manifest.json')));

			const directoryHandle = directoryHandleStub('parent', [
				fileHandleStub('manifest.json'),
				directoryHandleStub('assetFolder', [
					directoryHandleStub('evenMoreAssets'),
				]),
			]);

			const directory = await FileSystemService.getDirectory(directoryHandle);

			expect(directory.directories.assetFolder.directories).toEqual({});
		});

		it('Mod directories shouldn\'t recursively load all sub-folders by default when 1st level', async () => {
			const spy_getFile = jest.spyOn(FileSystemService, 'getFile');
			spy_getFile.mockImplementation(directoryHandle => {
				if (directoryHandle.name === 'storage') {
					return Promise.resolve(fileHandleStub('manifest.json'))
				}
			});

			const directoryHandle = directoryHandleStub('parent', [
				directoryHandleStub('storage', [
					fileHandleStub('manifest.json'),
					directoryHandleStub('assets'),
				]),
			]);

			const directory = await FileSystemService.getDirectory(directoryHandle);

			expect(directory.directories.storage.directories.assets.directories).toEqual({});
		});
	});

	describe('populateDirectory', () => {
		it('Should correctly populate a directory using a fully qualified directory', async () => {
			const output = {};

			const file = fileHandleStub('manifest.json', 'hello world');
			const spy_write = jest.fn(content => output[file.name] = content);
			const spy_close = jest.fn(() => {});

			jest.spyOn(file, 'createWritable').mockImplementation(() => Promise.resolve((<any>{
				write: spy_write,
				close: spy_close,
			})));

			jest.spyOn(FileSystemService, 'createFile').mockImplementation(() => Promise.resolve(file));
			jest.spyOn(FileSystemService, 'createDirectory').mockImplementation(() => Promise.resolve(<any>{}));

			const directoryToCopy = directoryStub({
				name: 'parent',
				directories: {},
				files: {
					'manifest.json': file,
				},
			});

			await FileSystemService.populateDirectory(directoryHandleStub('parent'), directoryToCopy);

			expect(output['manifest.json']).toBeDefined();
		});
	});

	describe('copyFolder', () => {

	});
});

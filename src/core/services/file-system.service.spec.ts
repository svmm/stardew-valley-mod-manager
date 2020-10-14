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
	values(): any {
		return entries;
	},
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

	describe('getDirectoryArray', () => {
		it('Should return an object with directory and file arrays', async () => {
			const directory = directoryStub({
				name: 'parent',
				handle: directoryHandleStub('parent'),
				parentHandle: null,
				directories: {},
				files: {},
			});

			const output = FileSystemService.getDirectoryArray(directory);

			expect(output.files).toBeInstanceOf(Array);
			expect(output.directories).toBeInstanceOf(Array);
		});

		it('Should return 2 directories in the array', async () => {
			const directory = directoryStub({
				name: 'parent',
				handle: directoryHandleStub('parent'),
				parentHandle: null,
				directories: {
					'child': directoryStub({
						name: 'child',
						handle: directoryHandleStub('child'),
						parentHandle: null,
						directories: {},
						files: {},
					}),
				},
				files: {},
			});

			const output = FileSystemService.getDirectoryArray(directory);

			expect(output.directories).toHaveLength(2);
		});

		it('Should return 2 directories, second entry should have the name "child"', async () => {
			const directory = directoryStub({
				name: 'parent',
				handle: directoryHandleStub('parent'),
				parentHandle: null,
				directories: {
					'child': directoryStub({
						name: 'child',
						handle: directoryHandleStub('child'),
						parentHandle: null,
						directories: {},
						files: {},
					}),
				},
				files: {},
			});

			const output = FileSystemService.getDirectoryArray(directory);

			const [ , childDirectory ] = output.directories;

			expect(output.directories).toHaveLength(2);
			expect(childDirectory.name).toBe('child');
		});

		it('Should return 1 file', async () => {
			const directory = directoryStub({
				name: 'parent',
				handle: directoryHandleStub('parent'),
				parentHandle: null,
				directories: {},
				files: {
					'manifest.json': fileHandleStub('manifest.json'),
				},
			});

			const output = FileSystemService.getDirectoryArray(directory);

			const [ file ] = output.files;

			expect(output.files).toHaveLength(1);
			expect(file.name).toBe('manifest.json');
		});

		it('Child directories should have correct names', async () => {
			const directory = directoryStub({
				name: 'parent',
				handle: directoryHandleStub('parent'),
				parentHandle: null,
				directories: {
					'child1': directoryStub({
						name: 'child1',
						handle: directoryHandleStub('child1'),
						parentHandle: null,
						directories: {
							'child2': directoryStub({
								name: 'child2',
								handle: directoryHandleStub('child2'),
								parentHandle: null,
								directories: {},
								files: {},
							}),
						},
						files: {},
					}),
				},
				files: {},
			});

			const output = FileSystemService.getDirectoryArray(directory);

			const [ parent, child1, child2 ] = output.directories;

			expect(parent.name).toBe('parent');
			expect(parent.parentDirectoryPath).toBe('');
			expect(parent.directoryPath).toBe('parent');

			expect(child1.name).toBe('child1');
			expect(child1.parentDirectoryPath).toBe('parent');
			expect(child1.directoryPath).toBe('parent/child1');

			expect(child2.name).toBe('child2');
			expect(child2.parentDirectoryPath).toBe('parent/child1');
			expect(child2.directoryPath).toBe('parent/child1/child2');
		});
	});

	xdescribe('populateDirectory', () => {
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

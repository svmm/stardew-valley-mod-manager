import { FileSystemHandle } from 'browser-nativefs';
// import {
// 	showDirectoryPicker,
// } from 'native-file-system-adapter';

// Services
import { getDirectory } from './file-system.service';

interface FileStub {
	name: string;
	isFile: boolean;
	isDirectory: boolean;
	getFile: () => any,
}

interface DirectoryStub {
	name: string;
	isFile: boolean;
	isDirectory: boolean;
	getEntries: () => (DirectoryStub | FileStub)[];
}

const fileHandleStub = (name: string, value: {
	path: string,
} = {path: 'test'}): FileStub => ({
	name,
	isFile: true,
	isDirectory: false,
	getFile() {
		return value;
	},
});

const directoryHandleStub = (name: string, entries: (FileStub | DirectoryStub)[] = []): DirectoryStub => ({
	name,
	isFile: false,
	isDirectory: true,
	getEntries() {
		return entries;
	},
})

describe('FileSystemService', () => {
	describe('getFolder', () => {
		it('init', () => {
			expect(getDirectory).toBeDefined();
		});

		it('Should return an object', async () => {
			const directoryHandle = directoryHandleStub('parent', [
				fileHandleStub('test'),
			])

			const response = await getDirectory(directoryHandle);

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

			const response = await getDirectory(directoryHandle);

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

			const directory = await getDirectory(directoryHandle);

			expect(Object.keys(directory.files)).toHaveLength(10);
		});

		it('A directory should have it\'s handle', async () => {
			const directoryHandle = directoryHandleStub('parent');

			const directory = await getDirectory(directoryHandle);

			expect(directory.handle).toBeDefined();
		});
	});
});

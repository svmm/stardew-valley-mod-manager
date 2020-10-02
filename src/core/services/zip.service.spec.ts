const reader = () => {

}

const writer = () => {

}

Object.defineProperty(window, 'zip', {
	writable: true,
	value: {
		createReader() {
			return;
		},
		createWriter() {
			return;
		},
		useWebWorkers: true,
		workerScriptsPath: '',
		workerScripts: {},
		Reader: reader,
		TextReader: reader,
		BlobReader: reader,
		Data64URIReader: reader,
		HttpReader: reader,
		ZipReader: reader,
		Writer: writer,
		TextWriter: writer,
		BlobWriter: writer,
		Data64URIWriter: writer,
		FileWriter: writer,
		ZipWriter: writer,
	},
});

import { ZipService } from './zip.service';

const entryStub = (partialEntry: Partial<zip.Entry> = {}, data: any = ''): zip.Entry => ({
	comment: '',
	compressedSize: 0,
	uncompressedSize: 0,
	crc32: 0,
	directory: false,
	filename: 'test',
	getData() {
		return data;
	},
	lastModDate: null,
	lastModDateRaw: null,
	...partialEntry,
});

describe('ZipService', () => {
	beforeAll(() => {

	});

	describe('init', () => {
		it('Should be defined', () => {
			expect(ZipService).toBeDefined();
		});
	});

	describe('sortEntries', () => {
		let spy_readEntryContent;

		beforeEach(() => {
			spy_readEntryContent = jest.spyOn(ZipService, 'readEntryContent');
			spy_readEntryContent.mockImplementation(() => {
				return 'hello';
			});
		});

		afterEach(() => {
			jest.resetAllMocks();
		});

		it('Should return an object with directories and files', async () => {
			const directory = await ZipService.sortEntries([]);

			expect(directory).toBeInstanceOf(Object);
			expect(directory.files).toBeInstanceOf(Object);
			expect(directory.directories).toBeInstanceOf(Object);
		});

		it('Should return an object with directories and files with 1 entry', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test',
				}),
			]);

			expect(directory.files['test']).toBeDefined();
			expect(directory.files['test'].content).toBe('hello');
		});

		it('Should return an object with 1 directory', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test/hello.txt',
					directory: false,
				}),
			]);

			expect(directory.directories['test']).toBeDefined();
		});

		it('Should return an object with 1 directory with 1 file', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test/hello.txt',
					directory: false,
				}),
			]);

			expect(directory.directories['test']).toBeDefined();
			expect(directory.directories['test'].files['hello.txt']).toBeDefined();
			expect(directory.directories['test'].files['hello.txt'].content).toBe('hello');
		});

		it('Should return an object with 2 directories with 1 file each', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test1/hello.txt',
					directory: false,
				}),
				entryStub({
					filename: 'test2/hello.txt',
					directory: false,
				}),
			]);

			expect(directory.directories['test1']).toBeDefined();
			expect(directory.directories['test2']).toBeDefined();
			expect(directory.directories['test1'].files['hello.txt']).toBeDefined();
			expect(directory.directories['test2'].files['hello.txt']).toBeDefined();
		});

		it('Should return 5 nested directories from 5 entries', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test1',
					directory: true,
				}),
				entryStub({
					filename: 'test1/test2',
					directory: true,
				}),
				entryStub({
					filename: 'test1/test2/test3',
					directory: true,
				}),
				entryStub({
					filename: 'test1/test2/test3/test4',
					directory: true,
				}),
				entryStub({
					filename: 'test1/test2/test3/test4/test5',
					directory: true,
				}),
			]);

			expect(
				directory
					.directories['test1']
					.directories['test2']
					.directories['test3']
					.directories['test4']
					.directories['test5']
			).toBeDefined();
		});

		it('Directories should be nested', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test1',
					directory: true,
				}),
				entryStub({
					filename: 'test1/test2',
					directory: true,
				}),
			]);

			expect(
				directory
					.directories['test1']
					.directories['test2']
			).toBeDefined();
			expect(
				directory
					.directories['test2']
			).toBeUndefined();
		});

		it('Should return 5 nested directories from 1 entry', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test1/test2/test3/test4/test5',
					directory: true,
				}),
			]);

			expect(
				directory
					.directories['test1']
					.directories['test2']
					.directories['test3']
					.directories['test4']
					.directories['test5']
			).toBeDefined();
		});

		it('Should create 5 nested directories and the last should have a file', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'test1/test2/test3/test4/test5/hello.txt',
					directory: false,
				}),
			]);

			expect(
				directory
					.directories['test1']
					.directories['test2']
					.directories['test3']
					.directories['test4']
					.directories['test5']
			).toBeDefined();
			expect(
				directory
					.directories['test1']
					.directories['test2']
					.directories['test3']
					.directories['test4']
					.directories['test5']
					.files['hello.txt']
			).toBeDefined();
		});

		it('Should have no directories and 1 file', async () => {
			const directory = await ZipService.sortEntries([
				entryStub({
					filename: 'hello.txt',
					directory: false,
				}),
			]);

			expect(directory.files['hello.txt']).toBeDefined();
		});
	});
})

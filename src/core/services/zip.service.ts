export interface ZipContentDirectory {
	name: string;
	files: {
		[filePath: string]: {
			content: any,
		}
	};
	directories: {
		[directoryPath: string]: ZipContentDirectory,
	};
}

export class ZipService {
	public static extract(zipData: Blob): Promise<ZipContentDirectory> {
		window.zip.workerScriptsPath = '/js/zip.js/';

		return new Promise<ZipContentDirectory>((resolve, reject) => {
			zip.createReader(
				new zip.BlobReader(zipData),
				zipReader => {
					zipReader.getEntries(async (zipEntries: zip.Entry[]) => {
						try {
							const zipContent = await this.sortEntries(zipEntries);

							zipReader.close(() => {
								resolve(zipContent);
							});

						} catch (e) {
							zipReader.close(() => {
								reject(e);
							});
						}
					});
				},
				reject
			);
		});
	}

	/**
	 * This method transforms an array of file paths ['test.txt', 'folder/child.txt']
	 * Into an object of files and directories {files: {'test.txt': {}}, directories: {folder: {}}}
	 */
	public static async sortEntries(entries: zip.Entry[]): Promise<ZipContentDirectory> {
		let directory: ZipContentDirectory = {
			name: 'root',
			files: {},
			directories: {},
		};

		const getDirectory = (filename: string, isDirectory: boolean = false): ZipContentDirectory => {
			const parts = filename.split('/');

			if (parts.length === 1) {
				return directory;
			}

			if (!isDirectory) {
				parts.pop(); // Remove the filename from the parts
			}

			for (let obj = directory, ptr = obj, i = 0, j = parts.length; i < j; i++) {
				if (!ptr.directories[parts[i]]) {
					ptr.directories[parts[i]] = {
						name: parts[i],
						directories: {},
						files: {},
					};
				}

				ptr = ptr.directories[parts[i]];
			}

			let directoryToReturn = directory;

			for (const part of parts) {
				directoryToReturn = directoryToReturn.directories[part];
			}

			return directoryToReturn;
		}

		for (let entry of entries) {
			const path = entry.filename;

			const fileName = entry.filename.split('/').pop();

			const nestedDirectory = getDirectory(path, entry.directory);

			if (!entry.directory) {
				let entryContent: string = await this.readEntryContent(entry);
				nestedDirectory.files[fileName] = {
					content: entryContent
				};
			}
		}

		return directory;
	}

	public static readEntryContent(entry: zip.Entry): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			let writer;

			switch(entry.filename.split('.')[1]) {
				case 'json':
				case 'txt':
					writer = new zip.TextWriter('utf-8');
					break;
				default:
					writer = new zip.BlobWriter('binary');
					break;
			}

			entry.getData(
				writer,
				(resultText: string) => {
					resolve(resultText);
				},
				(current: number, total: number) => {
					console.debug(`${entry.filename}: ${current}/${total}B`);
				}
			);
		});
	}

}

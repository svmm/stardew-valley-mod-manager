// Interfaces
import { Directory } from '../../shared/interfaces/directory.interface';
import { ZipFile } from '../services/zip.service';

interface DirectoryFiles {
	directoryToCreate: Directory;
	parentHandle: FileSystemDirectoryHandle;
}

interface DirectoryFile {
	name: string;
	contents: Blob;
	parentHandle: FileSystemDirectoryHandle;
}

enum PayloadTypes {
	'createDirectoryFiles',
	'createDirectoryFile',
}

interface PayloadTypeMap {
	[PayloadTypes.createDirectoryFiles]: DirectoryFiles,
	[PayloadTypes.createDirectoryFile]: DirectoryFile[],
}

type TypeofPayloadTypes = typeof PayloadTypes;
type KeyofPayloadTypes = keyof TypeofPayloadTypes;
type MapEnumToTypes<T extends KeyofPayloadTypes , U = PayloadTypeMap[TypeofPayloadTypes[T]]> = U;

interface Message<T extends KeyofPayloadTypes = KeyofPayloadTypes,  K = MapEnumToTypes<T>> extends MessageEvent {
	data: {
		type: T,
		payload: K,
	},
}

/**
 * This method reads or creates a file in a given directory using it's filename
*/
const getFile = async (directoryHandle: FileSystemDirectoryHandle, filename: string, create: boolean = false): Promise<FileSystemFileHandle> => {
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

onmessage = async (payload: Message): Promise<void> => {

	const type = payload.data.type;

	switch (type) {
		// case 'createDirectoryFiles':
		// 	const { directoryToCreate, parentHandle } = <DirectoryFiles>payload.data.payload;

		// 	let fileCreations: Promise<any>[] = [];

		// 	for (const [ fileName, file ] of Object.entries(directoryToCreate.files)) {
		// 		const fileEntry = <FileSystemFileHandle | ZipFile>file;

		// 		fileCreations.push(new Promise( async resolve => {
		// 			let fileHandle = await getFile(parentHandle, fileName, true);

		// 			const fileStream = await fileHandle.createWritable({
		// 				keepExistingData: false,
		// 			});

		// 			let contents: Blob;

		// 			if ((<ZipFile>fileEntry)?.content) {
		// 				contents = new Blob([(<ZipFile>fileEntry).content]);
		// 			} else if ((<FileSystemFileHandle>fileEntry)?.isFile) {
		// 				const fileToCopyHandle = await (<FileSystemFileHandle>fileEntry).getFile();
		// 				contents = new Blob([await fileToCopyHandle.text()]);
		// 			}

		// 			await fileStream.write(contents);

		// 			await fileStream.close();

		// 			fileHandle = null;

		// 			resolve(fileName);
		// 		}));
		// 	}

		// 	await Promise.all(fileCreations);

		// 	fileCreations = null;

		// 	postMessage('createDirectoryFiles:done');

		// 	break;

		case 'createDirectoryFile':
			const promises: Promise<void>[] = [];

			for (const fileToCreate of <DirectoryFile[]>payload.data.payload) {
				promises.push(new Promise(async resolve => {
					const { name, contents, parentHandle } = <DirectoryFile>fileToCreate;
					// console.log(`creating ${ name }`)
					const label = `${performance.now()}`;
					console.time(label);

					let fileHandle = await getFile(parentHandle, name, true);

					let fileStream = await fileHandle.createWritable({
						keepExistingData: false,
					});

					// console.log(parentHandle, name, contents, fileStream);

					// console.time(`writing ${name}`);
					await fileStream.write(contents);
					// console.timeEnd(`writing ${name}`);

					// console.time(`closing ${name}`);
					// console.log(fileStream.__proto__, JSON.stringify(fileStream), fileStream.close);
					await fileStream.close();
					// console.timeEnd(`closing ${name}`);

					console.timeEnd(label);

					// console.log(`created ${ name }`, fileHandle);

					fileHandle = null;
					fileStream = null

					resolve();
				}));
			}

			await Promise.all(promises);

			postMessage('createDirectoryFile:done');

			break;
	}

}

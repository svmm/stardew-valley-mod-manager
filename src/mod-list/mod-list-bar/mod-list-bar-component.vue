<template>
	<div class="mod-list-bar">
		<button class="mod-list-bar-btn" @click="getMods">
			<i></i>
			<span v-if="!modDirectory">Choose Folder</span>
			<span v-else>Refresh</span>
		</button>
		<p class="folder-name" @click="getMods">
			<span v-if="!modDirectory" class="placeholder">Please choose folder</span>
			<span v-else>{{ modDirectory?.name }}</span>
		</p>
		<button
			@click="uploadZipFile"
			class="btn mod-list-bar-btn"
			:class="{disabled: !modDirectory}"
			:disabled="!modDirectory"
		>
			<i class="btn-icon plus"></i>
			Upload
		</button>
	</div>
</template>

<script lang="ts">
	import {
		showOpenFilePicker,
	} from 'native-file-system-adapter';

	// Services
	import { ZipService, ZipContentDirectory } from '../../core/services/zip.service';
	import { getFolder, deleteFolder } from '../../core/services/file-system.service';
	import { ModService } from '../../core/services/mod.service';
	import { useModsListService } from '../mod-list.service';

	export default {
		name: 'mod-list-bar',
		setup() {
			const { mods, getMods, deleteMod } = useModsListService();

			const createDirectory = async (parentHandle, directory: ZipContentDirectory) => {
				const newDirectoryHandle = await parentHandle.getDirectory(directory.name, {
					create: true,
				});

				const fileCreations: Promise<any>[] = [];
				const directoryCreations: Promise<any>[] = [];

				for (const [ fileName, file ] of Object.entries(directory.files)) {
					fileCreations.push(new Promise( async resolve => {
						const fileHandle = await newDirectoryHandle.getFile(fileName, {
							create: true,
						});

						const fileStream = await fileHandle.createWritable({
							keepExistingData: false,
						});

						await fileStream.write(new Blob([file.content]));

						await fileStream.close();

						resolve();
					}));
				}

				for (const childDirectory of Object.values(directory.directories)) {
					directoryCreations.push(createDirectory(newDirectoryHandle, childDirectory));
				}

				await Promise.all(fileCreations);
				await Promise.all(directoryCreations);
			}

			const uploadZipFile = async () => {
				const directory = ModService.modDirectory.value;

				try {
					const [ chosenZipFile ] = await showOpenFilePicker({
						accepts: [
							{
								extensions: ['.zip']
							}
						],
					});

					const zipFile = await chosenZipFile.getFile();

					await getWritePermission(directory.handle);

					const directoryToCreate = await ZipService.extract(zipFile);

					directoryToCreate.name = zipFile.name.split('.')[0];

					await createDirectory(directory.handle, directoryToCreate);
				} catch (e) {
					console.log(e);
				}
			}

			const getWritePermission = async (directoryHandle): Promise<void> => {
				const testDirectoryName = 'SVMM-write-permission';
				const newDirectoryHandle = await directoryHandle.getDirectory(testDirectoryName, {
					create: true,
				});

				await deleteFolder(directoryHandle, testDirectoryName);
			}

			return {
				getMods,
				uploadZipFile,
				modDirectory: ModService.modDirectory,
			}
		},
	}
</script>

<style lang="scss" scoped>
	.mod-list-bar {
		display: flex;
		align-items: stretch;
		justify-content: flex-start;
		height: 40px;
		border: 1px solid #342e37;
		border-radius: 5px;
		box-shadow: 0 0 2px 1px rgba(0,0,0,0.2);

		* {
			line-height: 40px;
		}

		& > :first-child {
			border: 0;
			border-right: 1px solid #342e37;
			border-radius: 2px 0 0 2px;
		}

		& > :last-child {
			border: 0;
			border-left: 1px solid #342e37;
			border-radius: 0 2px 2px 0;
		}

		button.mod-list-bar-btn {
			flex-shrink: 1;
			background-color: #342e37;
			color: #fbc571;
			padding: 0 0.75rem;
			transition: color .2s ease;

			&.disabled {
				opacity: 0.9;
				background-color: lighten(#342e37, 20%);
				color: rgba(#fbc571, 60%);
				cursor: not-allowed;
			}

			span {
				color: #fbc571;
			}
		}

		.folder-name {
			margin: 0;
			padding: 0 1rem;
			flex-grow: 1;
			background-color: lighten(#342e37, 10%);
			box-shadow: 0 0 0 1px rgba(0,0,0,0.1) inset;
			transition: color background-color .2s ease;

			&:hover {
				span.placeholder {
					color: rgba(#fbc571, 70%);
				}
			}

			span {
				color: #fbc571;
				transition: color .2s ease;

				&.placeholder {
					color: rgba(#fbc571, 60%);
				}
			}
		}
	}
</style>

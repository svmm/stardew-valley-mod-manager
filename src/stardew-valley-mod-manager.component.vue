<template>
	<svmm-header />
	<div class="container">
		<div class="panel">
			<h1>Stardew Valley Mod Manager</h1>
			<mod-list></mod-list>
		</div>
		<!-- <div class="panel">
			<h1>Load Order</h1>
		</div> -->
	</div>
</template>

<script lang="ts">
	// Components
	import ModListComponent from './mod-list/mod-list.component.vue';
	import HeaderComponent from './shared/components/header/header.component.vue';
	import ModalComponent from './shared/components/modal/modal.component.vue';

	// Services
	import { ZipService, ZipContentDirectory } from './core/services/zip.service';
	import { getFolder } from './core/services/file-system.service';
	import { ModService } from './core/services/mod.service';

	import {
		showOpenFilePicker,
	} from 'native-file-system-adapter';

	export default {
		name: 'App',
		setup() {
			const createDirectory = async (parentHandle, directory: ZipContentDirectory) => {
				const newDirectoryHandle = await parentHandle.getDirectory(directory.name, {
					create: true,
				});

				for (const [ fileName, file ] of Object.entries(directory.files)) {
					const fileHandle = await newDirectoryHandle.getFile(fileName, {
						create: true,
					});

					const fileStream = await fileHandle.createWritable({
						keepExistingData: false,
					});

					await fileStream.write(new Blob([file.content]));

					await fileStream.close();
				}

				for (const childDirectory of Object.values(directory.directories)) {
					await createDirectory(newDirectoryHandle, childDirectory);
				}

				newDirectoryHandle.resolve();
			}

			const chooseZipFile = async () => {
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

					const directoryToCreate = await ZipService.extract(zipFile);

					directoryToCreate.name = zipFile.name.split('.')[0];

					await createDirectory(directory.handle, directoryToCreate);

					directory.handle.resolve();
				} catch (e) {
					console.log(e);
				}
			}

			return {
				chooseZipFile,
			}
		},
		components: {
			'mod-list': ModListComponent,
			'svmm-header': HeaderComponent,
		},
	}
</script>

<style lang="scss" scoped>
	.test-modal {
		font-size: 2rem;
	}

	.container {
		padding: 40px 15px 0;
		overflow: initial;
		display: flex;
		align-content: center;
		justify-content: space-between;

		.panel {
			padding: 1rem;
			flex-grow: 1;

			&:first-child {
				//margin-right: 1.5rem;
			}

			h1 {
				font-size: 3rem;
				margin-bottom: 15px;
				text-align: center;
			}

			button {
				margin-bottom: 1rem;
			}
		}

		button i {
			background-image: url('/images/sprites/icons/blue_chicken.png');
		}
	}
</style>

<template>
	<svmm-header />
	<div class="container">
		<div class="panel">
			<h1>Welcome to the Stardew Valley Mod Manager!</h1>
			<p>Hello and welcome farmer! Check out the wiki if you're new here.</p>
		</div>
	</div>
	<div class="container space">
		<div class="panel">
			<mod-list></mod-list>
		</div>
		<div class="panel">
			<h2>Load Order</h2>
		</div>
	</div>
</template>

<script lang="ts">
	// Components
	import ModListComponent from './mod-list/mod-list.component.vue';
	import HeaderComponent from './shared/components/header/header.component.vue';
	import ModalComponent from './shared/components/modal/modal.component.vue';

	// Services
	import { ZipService, ZipContentDirectory } from './core/services/zip.service';
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
		padding: 40px 40px 0;
		overflow: initial;
		display: flex;
		align-content: center;
		justify-content: space-between;

		&:nth-child(2) {
			.panel {
				text-align: left;
			}
		}

		&.space {
			.panel {
				&:first-child {
					margin-right: 1.5rem;
					max-width: 66%;
				}
			}
		}

		.panel {
			padding: 1rem;
			flex-grow: 1;
			text-align: center;

			h1 {
				margin-bottom: 1rem;
			}

			p {
				font-size: 1.5rem;
				margin: 0;
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

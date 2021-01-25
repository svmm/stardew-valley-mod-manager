<template>
	<svmm-header />
	<div class="container">
		<div class="panel" id="town-notice-board">
			<h1>Welcome to the Stardew Valley Mod Manager!</h1>
			<p>Hello farmer! Stay a while and look around!</p>
			<a href="https://github.com/svmm/stardew-valley-mod-manager/wiki" target="_blank">Check out the wiki if you're new here.</a>
		</div>
	</div>
	<div class="container space" id="desktop">
		<div class="panel">
			<h2>Mod list</h2>
			<mod-list></mod-list>
		</div>
		<div class="panel" id="load-order">
			<h2>Load Order</h2>
			<img src="/images/sprites/icons/hat_mouse.png">
			<p>This section is not ready yet, okay poke!</p>
		</div>
	</div>
	<div class="container space" id="mobile">
		<div class="panel">
			<h2>Sorry!</h2>
			<p>This app is not quite ready for mobile yet! It's best viewed on a desktop at the moment!</p>
			<img src="/images/sprites/icons/emote_sad.png" alt="Not ready yet!">
		</div>
	</div>
</template>

<script lang="ts">
	// Components
	import ModListComponent from './mod-list/mod-list.component.vue';
	import HeaderComponent from './shared/components/header/header.component.vue';

	// Services
	import { ZipService, ZipContentDirectory } from './core/services/zip.service';
	import { ModService } from './core/services/mod.service';

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
				max-width: 33%;

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

			h2 {
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

		#town-notice-board {
			text-align: center;

			a {
				color: blue;
				margin-top: 0.5rem;
				display: block;
			}
		}
	}

	.panel#load-order {
		img {
			opacity: 0.7;
			box-shadow: 0 0 5px rgba(0,0,0,0.5);
		}

		p {
			opacity: 0.7;
		}
	}

	#mobile {
		.panel {
			max-width: 100%;
			margin-right: 0;

			img {
				margin-top: 1rem;
			}
		}
	}

	@media screen and (min-width: 100px) {
		#desktop {
			display: none;
		}

		#mobile {
			display: block;

			.panel {
				max-width: 100%;
				margin-right: 0;
			}
		}
	}

	@media screen and (min-width: 768px) {
		#desktop {
			display: flex;
		}

		#mobile {
			display: none;
		}
	}
</style>

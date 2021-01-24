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
			:class="{disabled: !modDirectory || !currentProfileName}"
			:disabled="!modDirectory"
		>
			<i class="btn-icon plus"></i>
			Upload
		</button>
	</div>
</template>

<script lang="ts">
	import { computed } from 'vue';

	// Services
	import { ZipService, ZipContentDirectory } from '../../core/services/zip.service';
	import { FileSystemService } from '../../core/services/file-system.service';
	import { ModService } from '../../core/services/mod.service';
	import { ModListService } from '../mod-list.service';

	export default {
		name: 'mod-list-bar',
		setup() {
			const currentProfile = computed(() => ModService.currentProfile.value);

			const uploadZipFile = async () => {
				const currentProfile = ModService.currentProfile;

				try {
					const [ chosenZipFile ] = await window.showOpenFilePicker({
						// types: [
						// 	{
						// 		description: 'Zip files',
						// 		accept: {
						// 			'zip': ['.zip'],
						// 		},
						// 	},
						// ],
					});

					const zipFile = await chosenZipFile.getFile();

					const zipFolder = await ZipService.extract(zipFile);

					zipFolder.name = zipFile.name.split('.')[0];

					await FileSystemService.populateDirectoryArray(currentProfile.value.directory, zipFolder);

					await ModService.getMods();
				} catch (e) {
					console.log(e);
				}
			}

			return {
				getMods: () => ModService.getMods(),
				uploadZipFile,
				modDirectory: ModService.modDirectory,
				currentProfileName: ModService.currentProfileName,
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
			text-align: left;

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

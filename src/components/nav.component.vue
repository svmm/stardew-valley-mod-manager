<template>
	<nav id="nav">
		<div id="nav-button">
			<button @click="showFolderDialog">Current Directory: None</button>
		</div>
	</nav>
</template>

<script lang="ts">
import Vue from 'vue';
import { remote } from 'electron';

export default Vue.extend({
	methods: {
		showFolderDialog() {
			const dialog = remote.dialog.showOpenDialogSync({
				properties: ['openDirectory'],
			});

			if (dialog) {
				const [ folderPath ] = dialog;

				this.$store.dispatch('setCurrentFolderLocation', folderPath);
			}
		},
	},
})
</script>

<style lang="scss" scoped>
#nav {
	-webkit-app-region: drag;
	text-align: left;
	width: 100%;
	padding: 16px;
	background-color: #e0a100;
	box-shadow: 5px -5px 3px rgba(0,0,0,0.2);
	color: white;
}
</style>

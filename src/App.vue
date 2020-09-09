<template>
	<button @click="click">Click</button>
</template>

<script lang="ts">
export default {
	name: 'App',
	setup() {
		const click = async () => {
			const fileHandle = await window.showDirectoryPicker();

			console.log(fileHandle, fileHandle.getEntries());
		};

		return {
			click,
		}
	},
	components: {
	}
}
</script>

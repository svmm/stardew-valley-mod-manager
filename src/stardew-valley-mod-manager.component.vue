<template>
	<div class="container">
		<h1>Stardew Valley Mod Manager</h1>
		<h2>I'm a h2</h2>
		<mod-list />
	</div>
</template>

<script lang="ts">
	// Components
	import ModListComponent from './mod-list/mod-list.component.vue';

	export default {
		name: 'App',
		components: {
			'mod-list': ModListComponent,
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 0 15px;
	}
</style>

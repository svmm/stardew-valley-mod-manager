<template>
	<div id="app">
		<svmm-nav></svmm-nav>
	</div>
</template>

<script lang="ts">
// import { readdirSync } from 'fs';
// import { remote } from 'electron';
import NavComponent from '@/components/nav.component.vue';

export default {
	name: 'app',
	components: {
		svmmNav: NavComponent,
	},
}
</script>

<style lang="scss">
* {
	box-sizing: border-box;
}

html, body {
		box-sizing: border-box;
		height: 100vh;
		width: 100vw;
		margin: 0;
		padding: 0;
}
</style>

<style lang="scss" scoped>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	background-image: url('assets/sv-background.png');
	background-size: cover;
	background-position: bottom center;
	background-repeat: no-repeat;
	width: 100%;
	height: 100%;
}
</style>

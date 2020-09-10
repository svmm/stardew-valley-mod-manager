<template>
	<button @click="click">Click</button>
</template>

<script lang="ts">
// Services
import { useModsService } from './services/mods.service';

export default {
	name: 'App',
	setup() {
		const { mods, getMods } = useModsService();

		const click = async () => {
			await getMods();

			console.log(mods);
		};

		return {
			click,
		}
	},
	components: {
	}
}
</script>

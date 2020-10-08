<template>
	<div id="profile-select">
		<button
			v-if="modDirectory"
			id="profile-select"
			class="btn"
		>
			Create new profile
		</button>
	</div>
</template>

<script lang="ts">
	// Services
	import { ModService } from '../../../core/services/mod.service';

	export default {
		name: 'profile-select',
		setup() {
			return {
				modDirectory: ModService.modDirectory,
			}
		},
	}
</script>

<style lang="scss" scoped>
	#profile-select {
		.btn {
			background: linear-gradient(rgb(251, 197, 113), rgb(251, 191, 98));
		}
	}
</style>

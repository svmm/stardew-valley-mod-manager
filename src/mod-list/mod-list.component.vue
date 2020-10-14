<template>
	<div class="mod-list-component">
		<mod-list-bar></mod-list-bar>
		<div
			v-if="mods.length"
			class="mod-table"
		>
			<form @submit.prevent>
				<div
					class="mod"
					v-for="mod in mods"
					v-bind:key="mod.name"
				>
					<div class="controls pre-contols">
						<input
							@change.prevent="toggleMod(mod)"
							type="checkbox"
							:value="mod.name"
							:id="mod.name+'check'"
							:checked="mod.active"
						>
					</div>
					<p class="mod-name">
						<label :for="mod.name+'check'">
							{{ mod.name }}
						</label>
					</p>
					<div class="controls post-controls">
						<button
							class="btn delete"
							@click="onDeleteMod(mod)"
						>
							<i class="btn-icon"></i>
							Delete
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, SetupContext, computed, readonly } from 'vue';

	// Services
	import { ModListService } from './mod-list.service';
	import { ModService } from '../core/services/mod.service';
	import { ProfileService } from '../shared/components/profile/profile.service';

	// Web workers
	// import myWorker from '../core/web-workers/file-system.service?worker';

	// Components
	import ModalComponent from '../shared/components/modal/modal.component.vue';
	import ModListBarComponent from './mod-list-bar/mod-list-bar-component.vue';

	// Interfaces
	import { Mod } from '../shared/interfaces/mod.interface';

	export default defineComponent({
		name: 'mod-list',
		components: {
			'mod-list-bar': ModListBarComponent,
		},
		setup() {
			const onDeleteMod = async (mod: Mod) => {
				ModService.deleteMod(mod);
			}

			const modList = computed(() => {
				return Object.values(ModService.mods.mods);
			});

			const toggleMod = async (mod: Mod) => {
				await ProfileService.toggleMod(mod);
			}

			return {
				mods: modList,
				onDeleteMod,
				toggleMod,
				modDirectory: ModService.modDirectory,
			}
		},
	});
</script>

<style lang="scss" scoped>
	.mod-table {
		padding-top: 1rem;

		.mod {
			display: flex;
			align-items: center;
			justify-content: flex-start;

			.controls {
				flex-shrink: 1;
				display: flex;
				align-items: center;
				justify-content: flex-start;
			}

			p.mod-name {
				flex-grow: 1;
				margin: 0;
				padding: 10px;
				font-size: 1.5rem;
				text-align: left;
			}

			.post-controls {
				button.delete {
					background: linear-gradient(to bottom, #fbc571, #fbbf62);

					.btn-icon {
						background-image: url('/images/sprites/icons/bin.png');
						background-size: 24px;
					}
				}
			}
		}
	}
</style>

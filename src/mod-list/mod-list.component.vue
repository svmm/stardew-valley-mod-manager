<template>
	<button @click="click">Choose mod folder</button>
	<ul>
		<li
			v-for="mod in mods"
			v-bind:key="mod.name"
		>
			{{ mod.name }}
			<button @click="onDeleteMod(mod)">Delete</button>
		</li>
	</ul>
	<button @click="showModal('test')">
		Open Modal
		<teleport to="#modals">
			<modal name="test">
				<div class="test-modal">
					Hello and welcome to the Stardew Valley Mod Manager!
				</div>
			</modal>
		</teleport>
	</button>
</template>

<script lang="ts">
	import { defineComponent, SetupContext, computed, readonly } from 'vue';

	// Services
	import { useModsService } from './mod-list.service';
	import { useModalService } from '../shared/components/modal/modal.service';

	// Web workers
	// import myWorker from '../core/web-workers/file-system.service?worker';

	// Components
	import ModalComponent from '../shared/components/modal/modal.component.vue';

	// Interfaces
	import { Mod } from '../shared/interfaces/mod.interface';

	export default defineComponent({
		name: 'mod-list',
		components: {
			'modal': ModalComponent,
		},
		setup() {
			const { mods, getMods, deleteMod } = useModsService();
			const { showModal } = useModalService();

			const click = async () => {
				await getMods();
			};

			const onDeleteMod = async (mod: Mod) => {
				deleteMod(mod);
			}

			const modList = computed(() => {
				return Object.values(mods.mods);
			});

			return {
				click,
				mods: modList,
				onDeleteMod,
				showModal
			}
		},
	});
</script>

<style lang="scss" scoped>
	.test-modal {
		font-size: 2rem;
	}
</style>

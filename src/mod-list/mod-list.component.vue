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
		<section class="section-no-things" id="no-mod-directory" v-if="!modDirectory && !currentProfile">
			<h2>Please choose your mod folder!</h2>
			<p>Choose your mod folder above. This is main folder you want all your mods to be in!</p>
			<img src="/images/sprites/icons/junimo.png" alt="Oops!">
		</section>
		<section class="section-no-things" id="no-profiles" v-if="modDirectory && !currentProfile">
			<h2>Looks like you don't have any profiles yet!</h2>
			<p>You can create a new profile in the navbar 👆</p>
			<img src="/images/sprites/icons/junimo.png" alt="Oops!">
		</section>
		<section class="section-no-things" id="no-mods" v-if="modDirectory && currentProfile && !mods.length">
			<h2>Looks like you don't have any mods installed!</h2>
			<p>You can use the Upload button above to add a new mod!</p>
			<p>Mods will also appear here if you place them into your profile folder.</p>
			<img src="/images/sprites/icons/junimo.png" alt="Oops!">
		</section>
	</div>
</template>

<script lang="ts">
	import { defineComponent, SetupContext, computed, readonly } from 'vue';

	// Services
	import { ModService } from '../core/services/mod.service';
	import { ProfileService } from '../shared/components/profile/profile.service';

	// Web workers
	// import myWorker from '../core/web-workers/file-system.service?worker';

	// Components
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
				if (ModService.currentProfile.value) {
					return Object.values(ModService.currentProfile.value.mods).sort();
				}

				return [];
			});

			const toggleMod = async (mod: Mod) => {
				await ModService.toggleMod(mod);
			}

			const currentProfile = computed(() => {
				return ModService.currentProfile.value;
			});

			return {
				mods: modList,
				onDeleteMod,
				toggleMod,
				currentProfile,
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

	.section-no-things {
		padding-top: 40px;

		h2 {
			font-size: 1.6rem;
		}

		img {
			opacity: 0.5;
		}
	}
</style>

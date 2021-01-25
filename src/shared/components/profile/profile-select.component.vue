<template>
	<div id="profile-select">
		<button
			v-if="modDirectory && !currentProfileName"
			id="profile-select"
			class="btn"
			@click="$modalService.showModal('new-profile')"
		>
			Create new profile
		</button>
		<div
			v-if="modDirectory && currentProfileName"
			class="btn-dropdown"
			:class="{open: dropdownOpen}"
		>
			<button
				id="profile-select"
				class="btn"
			>
				{{ currentProfileName || 'Profile name' }}
			</button>
			<button
				@click="toggleDropdown"
				class="btn toggle"
			>👇</button>
			<div class="dropdown">
				<ul>
					<li
						v-for="profile in profiles"
						v-bind:key="profile.name"
						@click="changeProfile(profile)"
						class="cursor-hover"
					>{{ profile.name }}</li>
					<li
						@click="$modalService.showModal('new-profile')"
						class="cursor-hover"
					>Create new profile</li>
				</ul>
			</div>
		</div>
	</div>
	<teleport to="#modals">
		<modal name="new-profile">
			<div id="new-profile">
				<p>Please choose a name for your new profile</p>
				<input type="text" ref="newProfileName">
				<button class="btn" @click="createProfile($refs.newProfileName.value)">Create profile</button>
			</div>
		</modal>
	</teleport>
</template>

<script lang="ts">
	import { ref, readonly, computed, inject } from 'vue';

	// Services
	import { ModService } from '../../../core/services/mod.service';

	// Interfaces
	import { Profile } from '../../../shared/interfaces/profile.interface';

	export default {
		name: 'profile-select',
		setup() {
			const modalService = inject('modalService');

			// TODO create a dropdown directive or something
			const dropdownOpen = ref(false);

			const showDropdown = () => {
				dropdownOpen.value = true;
			}

			const hideDropdown = () => {
				dropdownOpen.value = false;
			}

			const toggleDropdown = () => {
				if (dropdownOpen.value) {
					return hideDropdown();
				}

				showDropdown();
			}

			const changeProfile = (profile: Profile) => {
				ModService.setActiveProfile(profile);

				hideDropdown();
			}

			const createProfile = async (name: string) => {
				await ModService.createProfile(name);
				modalService.hideModal('new-profile');
			}

			const filteredProfiles = computed(() => {
				return ModService.profiles.value.filter(profile => profile?.name !== ModService.currentProfile.value?.name);
			});

			return {
				modDirectory: ModService.modDirectory,
				currentProfileName: ModService.currentProfileName,
				profiles: filteredProfiles,
				dropdownOpen: readonly(dropdownOpen),
				toggleDropdown,
				changeProfile,
				createProfile: createProfile,
			}
		},
	}
</script>

<style lang="scss" scoped>
	#profile-select {
		height: 100%;
		min-width: 150px;

		.btn {
			background: linear-gradient(rgb(251, 197, 113), rgb(251, 191, 98));
			height: 100%;
		}

		.btn-dropdown {
			display: flex;
			place-items: center;
			height: 100%;
			position: relative;

			&.open {
				.dropdown {
					opacity: 1;
					pointer-events: all;
					max-height: 200px;
				}

				.btn {
					&:first-child {
						border-radius: 3px 0 0 0;
					}

					&:nth-child(2) {
						border-radius: 0 3px 0 0;
					}
				}
			}

			.btn {
				border: none;
				margin: 0;
				box-shadow: none;

				&:first-child {
					border-radius: 3px 0 0 3px;
					border-right: 2px solid darken(#fbc571, 10%);
					pointer-events: none;
					text-align: left;
				}

				&:nth-child(2) {
					border-radius: 0 3px 3px 0;
				}
			}

			.toggle {
				height: 100%;
				font-size: 0.9rem;

				&:hover {
					background: none;
					background-color: darken(#fbc571, 8%);
				}
			}

			.dropdown {
				position: absolute;
				max-height: 0;
				width: 100%;
				top: 100%;
				left: 0;
				opacity: 0;
				pointer-events: none;
				background-color: #fbc571;
				border: none;
				border-radius: 0 0 3px 3px;
				box-shadow: 0 2px 3px rgba(0,0,0,0.2);
				transition: max-height .2s ease;
				overflow: hidden;

				ul {
					list-style: none;
					margin: 0;
					padding: 0;

					li {
						padding: 5px 8px;

						&:hover {
							background-color: darken(#fbc571, 8%);
						}
					}
				}
			}
		}
	}

	#new-profile {
		text-align: center;

		input {
			margin-bottom: 1rem;
			display: inline-block;
			width: 50%;
			margin: 0 auto 1rem;
		}

		button {
			display: block;
			background-color: #fbc571;
			width: 50%;
			margin: 0 auto;
		}
	}
</style>

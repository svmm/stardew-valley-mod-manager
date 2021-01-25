<template>
	<div
		class="overlay"
		:class="{ visible: visible }"
		@click.self="hide"
	>
		<div class="modal" v-if="visible">
			<slot />
		</div>
	</div>
</template>

<script lang="ts">
	import { ref, readonly, inject } from 'vue';

	import { ModalService } from './modal.service';

	export default {
		name: 'modal',
		props: ['name'],
		setup(props: {name: string}) {
			const modalService: ModalService = inject('modalService');

			const visible = ref(false);

			const show: () => void = () => {
				visible.value = true;
			}

			const hide = () => {
				visible.value = false;
			}

			modalService.addModal(props.name, {
				show,
				hide,
			});

			return {
				visible: readonly(visible),
				hide,
			}
		},
	}
</script>

<style lang="scss">
	$modal-content-background-colour: #fbc571;
	$modal-content-background-colour-darkened: darken($modal-content-background-colour, 3%);
	$modal-content-text-colour: #56160c;

	.overlay {
		height: 100vh;
		width: 100vw;
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0,0,0,0.11);
		opacity: 0;
		pointer-events: none;
		z-index: 2;
		transition: opacity 0.2s ease;

		&.visible {
			opacity: 1;
			pointer-events: all;
		}

		.modal {
			position: relative;
			z-index: 3;
			height: auto;
			width: 100%;
			max-height: 90vh;
			overflow: auto;
			border: 10px solid #e6e6e6;
			border-image: url('/images/sprites/modal/modal-border.png') 44 50 repeat;
			border-image-outset: 15px;
			border-image-width: 50px;
			padding: 0.75rem;
			background: linear-gradient(to bottom, $modal-content-background-colour, $modal-content-background-colour-darkened) no-repeat;
			box-shadow: 0 0 1px 6px rgba(0,0,0,0.2) inset;
			margin: 0 2rem;
			scrollbar-width: none;

			&::-webkit-scrollbar {
				display: none;
			}

			@media screen and (min-width: 768px) {
				width: 50%;
				margin: 0;
				padding: 2rem;
			}

			.modal-inner {
				color: $modal-content-text-colour;
				text-shadow: -2px 2px lighten($modal-content-text-colour, 60%);
			}
		}
	}
</style>

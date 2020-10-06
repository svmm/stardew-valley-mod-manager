<template>
	<div class="header">
		<div id="profile">
			Test
		</div>
		<div class="seperator"></div>
		<button class="btn" @click="$modalService.showModal('changelog')">
			v1.0
			<teleport to="#modals">
				<modal name="changelog">
					<h1>Changelog</h1>
					<section id="v1.0">
						<h2>v1.0 (It's a Big World Outside) 🔥</h2>
						<ul>
							<li>Adding mods from a zip file</li>
							<li>Adding mod profiles</li>
							<li>Viewing installed mods</li>
						</ul>
					</section>
				</modal>
			</teleport>
		</button>
		<a href="https://github.com/svmm/stardew-valley-mod-manager" target="_blank" class="github">
			<img src="/images/GitHub-Mark-Light-32px.png">
		</a>
	</div>
</template>

<script lang="ts">
	import { defineComponent } from 'vue';

	// Service
	export default defineComponent({
		name: 'svmm-header',
	});
</script>

<style lang="scss" scoped>
	.header {
		height: 50px;
		width: 100%;
		padding: 5px 15px;
		background: #342E37;
		background-image: url('/images/sprites/header/stars.png');
		box-shadow: 0 2px 0 1px rgba(0,0,0,0.1);
		display: flex;
		align-items: center;
		justify-content: flex-start;
		position: relative;
		z-index: 2;

		.seperator {
			margin-left: auto;
		}

		a.github {
			margin: 0;
			padding: 0;
			height: 32px;
			position: relative;

			&:before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				width: 32px;
				height: 32px;
				background: rgba(#342E37, 0.6);
				border: none;
				border-radius: 50px;
				z-index: 1;
			}

			img {
				position: relative;
				z-index: 2;
			}
		}

		.btn {
			margin-right: 10px;
			background: linear-gradient(to bottom, #fbc571, #fbbf62);
		}
	}

	.btn i.chicken {
		background-image: url('/images/sprites/icons/blue_chicken.png');
	}
</style>

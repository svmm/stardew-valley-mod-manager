import vue from '@vitejs/plugin-vue';

export default {
	plugins: [vue()],
	base: '/stardew-valley-mod-manager/',
	assetsDir: 'assets',
	build: {
		outDir: 'docs',
		target: 'es2018',
	},
}

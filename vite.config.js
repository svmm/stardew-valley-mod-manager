export default {
	base: '/stardew-valley-mod-manager',
	assetsDir: 'assets',
	outDir: 'docs',
	rollupInputOptions: {
		external: [
			'https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.1.0/dist/ponyfill.es2018.mjs',
		],
	}
}

import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import { injectManifest } from 'rollup-plugin-workbox';

const workboxConfig = require('./workbox-config.js')

export default {
	input: './service-worker.js',
	output: {
		file: 'dist/service-worker.js',
		name: 'service-worker.js',
		format: 'umd',
		minifyInternalExports: true,
		compact: true,
		inlineDynamicImports: true,
	},
	plugins: [
		nodeResolve(),
		terser(),
		injectManifest({
			swSrc: workboxConfig.swSrc,
			swDest: workboxConfig.swDest,
			globDirectory: workboxConfig.globDirectory,
			globPatterns: workboxConfig.globPatterns,
			mode: 'production',
		}),
	],
};

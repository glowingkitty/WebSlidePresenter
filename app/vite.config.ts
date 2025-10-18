import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['pdfjs-dist']
	},
	build: {
		commonjsOptions: {
			include: [/pdfjs-dist/, /node_modules/]
		}
	},
	worker: {
		format: 'es'
	}
});

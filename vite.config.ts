import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, precompress: true, strict: true })
		})
	],
	ssr: { noExternal: ['three', '@threlte/core', '@threlte/extras'] },
	// let the dev server answer through an ngrok tunnel for testing on a phone
	server: { allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io'] }
});

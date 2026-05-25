import { wayfinder } from "@laravel/vite-plugin-wayfinder";
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    // server: {
    //     host: '0.0.0.0', // Allow external connections
    //     hmr: {
    //         protocol: 'wss', // Use secure web sockets
    //     },
    // },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            // SSR intentionally disabled — Laravel Cloud's standard build runs
            // `npm run build` (client-only). Re-enable here + switch Cloud to
            // `npm run build:ssr` + run the inertia:start-ssr daemon if SEO
            // ever requires server rendering.
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    // resolve: {
    //     alias: {
    //         'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
    //     },
    // },
});


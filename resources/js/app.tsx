import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import './lib/axios';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const queryClient = new QueryClient();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <GoogleOAuthProvider clientId={googleClientId}>
                <QueryClientProvider client={queryClient}>
                    <App {...props} />
                </QueryClientProvider>
            </GoogleOAuthProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

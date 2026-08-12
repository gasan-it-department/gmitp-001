import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createServer((page) => {
    const queryClient = new QueryClient();

    return createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        setup: ({ App, props }) => (
            <GoogleOAuthProvider clientId={googleClientId}>
                <QueryClientProvider client={queryClient}>
                    <App {...props} />
                </QueryClientProvider>
            </GoogleOAuthProvider>
        ),
    });
});

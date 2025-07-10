import '../css/app.css';

import { SidebarProvider } from '@/components/ui/sidebar'; // Wrap here globally!
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import './pages/MainPage';

// import HomePage from '@/pages/MainPage';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <SidebarProvider defaultOpen={false}>
                <App {...props} />
            </SidebarProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

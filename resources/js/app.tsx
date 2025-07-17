import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
// import { initializeTheme } from './hooks/use-appearance';

import './pages/MainPage';

// import HomePage from '@/pages/MainPage';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);


        // root.render(<BrowserRouter>
        //     <Routes>
        //         <Route path='/' element={<MainPage />} >
        //             <Route index={true} element={<HomePage />} />
        //             <Route path='PrivacyPolicy' element={<PrivacyPolicy />} />
        //             {/* <Route path='services' element={<Services />} />
        //             <Route path='department' element={<Department />} /> */}
        //         </Route>
        //     </Routes>
        // </BrowserRouter>);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
// initializeTheme();

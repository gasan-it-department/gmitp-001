import AppLayout from '@/layouts/App/AppLayout';
import { useState } from 'react';

export default function Interment() {
    // Simple state for demonstration.
    // In production, I recommend using 'react-hook-form' + 'zod' for validation.
    const [loading, setLoading] = useState(false);

    return (
        <AppLayout>
            <h1>hello </h1>
        </AppLayout>
    );
}

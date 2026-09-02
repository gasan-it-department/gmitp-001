import { createClient } from '@supabase/supabase-js';

export function createSupabaseAuthClient(url: string, anonKey: string) {
    return createClient(url, anonKey, {
        auth: {
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: false,
        },
    });
}

export function normalizePhilippinePhoneForSupabase(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (/^09\d{9}$/.test(digits)) {
        return `+63${digits.slice(1)}`;
    }

    if (/^639\d{9}$/.test(digits)) {
        return `+${digits}`;
    }

    throw new Error('Enter a valid Philippine mobile number, such as 09171234567.');
}

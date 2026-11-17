import axios from 'axios';
import { useEffect, useState } from 'react';

export interface HouseholdMemberCandidate {
    key: string;
    full_name: string;
    birth_date: string | null;
    household_id: string;
    household_code: string | null;
    head_name: string | null;
    barangay: string | null;
    membership_status: string;
}

interface Identity {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    birth_date: string;
}

interface Result {
    candidates: HouseholdMemberCandidate[];
    context: string;
}

export function useHouseholdMemberDuplicateCheck(enabled: boolean, storeUrl: string, municipality: string, identity: Identity) {
    const identityKey = JSON.stringify({
        first_name: identity.first_name,
        middle_name: identity.middle_name,
        last_name: identity.last_name,
        suffix: identity.suffix,
        birth_date: identity.birth_date || null,
    });
    const [retry, setRetry] = useState(0);
    const key = JSON.stringify([identityKey, storeUrl, municipality, retry]);
    const [result, setResult] = useState<{ key: string; data?: Result; error?: boolean } | null>(null);
    const [review, setReview] = useState({ context: '', selected: false, reason: '' });
    const complete = Boolean(identity.first_name.trim() && identity.last_name.trim());

    useEffect(() => {
        setResult(null);
        if (!enabled || !complete) return;
        const controller = new AbortController();
        let current = true;
        const timer = setTimeout(async () => {
            try {
                const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
                const response = await axios.post<Result>(`${storeUrl.replace(/\/+$/, '')}/check`, JSON.parse(identityKey), {
                    signal: controller.signal,
                    headers: { Accept: 'application/json', 'X-Municipality-Slug': municipality, ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
                });
                if (!Array.isArray(response.data?.candidates) || typeof response.data.context !== 'string')
                    throw new Error('Invalid registry response');
                if (current) setResult({ key, data: response.data });
            } catch {
                if (current) setResult({ key, error: true });
            }
        }, 500);
        return () => {
            current = false;
            controller.abort();
            clearTimeout(timer);
        };
    }, [enabled, complete, key, storeUrl, municipality, identityKey]);

    const latest = result?.key === key ? result : null;
    const context = latest?.data?.context ?? '';
    const selected = review.context === context && review.selected;
    const reason = review.context === context ? review.reason : '';
    const candidates = latest?.data?.candidates ?? [];
    return {
        visible: enabled && complete,
        loading: enabled && complete && !latest,
        error: Boolean(latest?.error),
        candidates,
        selected,
        reason,
        ready: !enabled || Boolean(latest?.error || (latest?.data && (candidates.length === 0 || (selected && reason.trim().length >= 10)))),
        select: () => setReview({ context, selected: !selected, reason }),
        setReason: (value: string) => setReview({ context, selected, reason: value }),
        refresh: () => setRetry((value) => value + 1),
        payload: {
            duplicate_review_context: context || null,
            confirm_different_person: selected,
            different_person_reason: selected ? reason.trim() : null,
        },
    };
}

export type HouseholdMemberDuplicateCheck = ReturnType<typeof useHouseholdMemberDuplicateCheck>;

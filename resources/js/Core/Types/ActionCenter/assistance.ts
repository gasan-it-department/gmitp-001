/**
 * Frontend mirrors of the App\External\Api\Resources\ActionCenter\* resources.
 * Keep this file in sync with the PHP resources whenever fields change.
 */

export type CooldownType = 'per_request' | 'one_time';
export type CooldownScope = 'per_beneficiary' | 'per_household';

/** Mirrors AssistanceTypeListResource — for the portal card grid. */
export interface AssistanceTypeListItem {
    id: string;
    slug: string;
    name: string;
    description: string;
    is_active: boolean;
    max_amount: number | null;
    cooldown_months: number;
    requirements_count: number;
}

/** Mirrors a single document row inside AssistanceTypeDetailsResource. */
export interface AssistanceDocumentRequirement {
    id: string;
    key: string;
    name: string;
    description: string | null;
    examples: string | null;
    is_required: boolean;
}

/** Mirrors AssistanceTypeDetailsResource — for the Apply page. */
export interface AssistanceTypeDetails {
    id: string;
    slug: string;
    name: string;
    description: string;
    is_active: boolean;
    min_amount: number;
    max_amount: number | null;
    cooldown_months: number;
    cooldown_type: CooldownType;
    cooldown_scope: CooldownScope;
    documents: AssistanceDocumentRequirement[];
}

/** Auto-filled identity block shown on the Apply form (read-only). */
export interface BeneficiarySummary {
    id: string;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string | null;
    birth_date: string | null;
}

/** Auto-filled household address snapshot. */
export interface HouseholdSummary {
    id: string;
    province: string;
    municipality: string;
    barangay: string;
    street: string | null;
}

/**
 * The form payload — note: NO amount field. The citizen does not propose
 * an amount; that is set by the approver at decision time.
 */
export interface ApplyAssistanceFormData {
    description: string;
    privacy_consent: boolean;
    documents: Record<string, File | null>;
    [key: string]: unknown;
}

/** Admin form for creating/updating an assistance type. */
export interface AssistanceTypeFormData {
    name: string;
    slug?: string;
    description?: string;
    is_active: boolean;
    max_amount: number;
    min_amount?: number;
    cooldown_months: number;
    cooldown_type?: CooldownType;
    cooldown_scope?: CooldownScope;
    documents: { id: string; is_required: boolean; name: string }[];
}

/** Legacy alias still used by admin edit screens. */
export interface AssistanceType {
    id: string;
    name: string;
    slug?: string;
    max_amount: number;
    cooldown_months: number;
    description: string | null;
    is_active: boolean;
    documents?: AssistanceDocumentRequirement[];
    created_at: string;
}

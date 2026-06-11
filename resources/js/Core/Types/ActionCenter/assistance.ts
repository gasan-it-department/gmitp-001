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

/**
 * One row of the relationship selector on the Apply form. Mirrors
 * App\Core\ActionCenter\Enums\Relationship::toOptions() exactly — the
 * `requires_legal_age` flag is authoritative for the "Must be 18+" rule.
 */
export interface RelationshipOption {
    value: string;
    label: string;
    requires_legal_age: boolean;
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
    is_verified_dependent: boolean;
}

/**
 * Auto-filled household address shown on the Apply form (read-only).
 * Mirrors HouseholdDetailsResource exactly:
 *   - `municipality` is sourced server-side from the tenant binding, not from
 *     ac_households (the column was dropped).
 *   - `province` is intentionally absent — not stored anywhere; the deployment
 *     is single-province for now.
 */
export interface HouseholdSummary {
    id: string;
    barangay: string;
    barangay_psgc_code?: string | null;
    municipality: string | null;
    street: string | null;
}

/**
 * Mirrors HouseholdMemberOptionResource. One entry per active member of the
 * filer's household — the picker on the Apply form uses these to let the
 * citizen file on behalf of an existing family member without retyping
 * names. `relationship` is one of the Relationship enum values.
 */
export interface HouseholdMemberOption {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    relationship: string | null;
    birth_date: string | null;
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
    max_amount: number | null;
    min_amount: number | null;
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
    max_amount: number | null;
    min_amount?: number | null;
    cooldown_months: number;
    description: string | null;
    is_active: boolean;
    documents?: AssistanceDocumentRequirement[];
    created_at: string;
}

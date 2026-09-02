/**
 * Frontend mirrors of the App\External\Api\Resources\ActionCenter\* resources.
 * Keep this file in sync with the PHP resources whenever fields change.
 */

export type CooldownType = 'per_request' | 'one_time';
export type CooldownScope = 'per_beneficiary' | 'per_household';
export type PhysicalCopyRequirement = 'unspecified' | 'original' | 'certified_true_copy' | 'original_or_certified_true_copy' | 'photocopy';
export type AssistanceRequestFilingMode = 'self_or_on_behalf' | 'on_behalf_only';
export type AssistanceRequestSubjectType = 'person' | 'deceased';
export type AssistanceGeneratedDocument =
    | 'request_intake_sheet'
    | 'certificate_of_eligibility'
    | 'obligation_request'
    | 'disbursement_voucher'
    | 'acknowledgement_receipt';

export interface AssistanceGeneratedDocumentOption {
    value: AssistanceGeneratedDocument;
    label: string;
    description: string;
}

export interface AssistanceRequestFormFieldDefinition {
    key: 'on_behalf_date_of_death';
    label: string;
    type: 'date';
    required: boolean;
    admin_only: boolean;
}

export interface AssistanceRequestFormDefinition {
    filing_mode: AssistanceRequestFilingMode;
    subject_type: AssistanceRequestSubjectType;
    fields: AssistanceRequestFormFieldDefinition[];
}

export const PHYSICAL_COPY_REQUIREMENT_OPTIONS: { value: PhysicalCopyRequirement; label: string }[] = [
    { value: 'unspecified', label: 'Not specified' },
    { value: 'original', label: 'Original' },
    { value: 'certified_true_copy', label: 'Certified True Copy' },
    { value: 'original_or_certified_true_copy', label: 'Original or Certified True Copy' },
    { value: 'photocopy', label: 'Photocopy' },
];

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
    physical_copy_requirement: PhysicalCopyRequirement;
    physical_copy_requirement_label: string;
}

/** Mirrors AssistanceTypeDetailsResource — for the Apply page. */
export interface AssistanceTypeDetails {
    id: string;
    slug: string;
    name: string;
    description: string;
    is_active: boolean;
    min_amount: number | null;
    max_amount: number | null;
    cooldown_months: number;
    cooldown_type: CooldownType;
    cooldown_scope: CooldownScope;
    request_form: AssistanceRequestFormDefinition;
    enabled_generated_documents: AssistanceGeneratedDocument[];
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
    relationship_label: string | null;
    birth_date: string | null;
    is_verified_dependent: boolean;
}

/**
 * The form payload — note: NO amount field. The citizen does not propose
 * an amount; that is set by the approver at decision time.
 */
export interface ApplyAssistanceFormData {
    description: string;
    privacy_consent: boolean;
    [key: string]: unknown;
}

/** Admin form for creating/updating an assistance type. */
export type AssistanceTypeFormData = {
    name: string;
    slug?: string;
    description?: string;
    is_active: boolean;
    max_amount: number | null;
    min_amount: number | null;
    cooldown_months: number;
    cooldown_type?: CooldownType;
    cooldown_scope?: CooldownScope;
    enabled_generated_documents: AssistanceGeneratedDocument[];
    documents: {
        id: string;
        key?: string;
        is_required: boolean;
        name: string;
        physical_copy_requirement: PhysicalCopyRequirement;
        physical_copy_requirement_label?: string;
    }[];
};

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
    enabled_generated_documents?: AssistanceGeneratedDocument[];
    documents?: AssistanceDocumentRequirement[];
    created_at: string;
}

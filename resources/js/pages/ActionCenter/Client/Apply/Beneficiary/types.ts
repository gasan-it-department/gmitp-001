/**
 * Shared types for the Beneficiary profile setup wizard.
 *
 * The form is composed from several section components, each of which
 * receives the same `data` / `setData` / `errors` trio — defined once
 * here as `SectionProps` so the section files can extend it without
 * re-typing the form shape.
 */

/**
 * One household member as the citizen enters them during profile setup.
 * Drafted client-side; persisted to ac_household_members via the same
 * StoreHouseholdMemberAction the inline Apply-form modal uses.
 *
 * Strings (not numbers) for the income field — useForm submits its raw
 * data shape, so we keep the input value as a string and let the backend
 * cast to float at the DTO boundary.
 */
export type HouseholdMemberDraft = {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    relationship: string;
    birth_date: string;
    sex: string;
    civil_status: string;
    educational_attainment: string;
    occupation: string;
    monthly_income: string;
    religion_id: string;
}

/** The exact shape Inertia's useForm hook manages for profile setup. */
export type ProfileSetupFormData = {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;

    sex: string;
    birth_date: string;
    religion_id: string;
    educational_attainment: string;
    identity_id_front?: File | null;
    identity_id_back?: File | null;

    // Civil status / employment / income — paper-form parity.
    civil_status: string;
    occupation: string;
    monthly_income: string;

    // Address. `barangay` is the human-readable name; `barangay_code` is the
    // stable PSGC code stored alongside on ac_households for queries.
    barangay: string;
    barangay_code: string;
    street: string;

    // RA 10173 attestation captured at submit time.
    terms_consent: boolean;

    // ── Household members (optional; admin can collect during interview) ─
    // Persisted server-side via StoreHouseholdMemberAction in the same
    // DB transaction as the beneficiary row. Empty array = citizen
    // chose to skip the household section.
    household_members: HouseholdMemberDraft[];
}

/**
 * Common props every section component receives. Extend this in each
 * section file to add section-specific options (dropdown lists, etc.).
 */
export interface SectionProps {
    data: ProfileSetupFormData;
    setData: <K extends keyof ProfileSetupFormData>(
        key: K,
        value: ProfileSetupFormData[K],
    ) => void;
    errors: Partial<Record<keyof ProfileSetupFormData, string>>;
}

/** Dropdown option for the religion select (sourced from ac_religions). */
export interface ReligionOption {
    id: string;
    name: string;
}

/** Generic dropdown option used by enum-backed selects. */
export interface EnumOption {
    value: string;
    label: string;
}

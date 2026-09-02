<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\UseCase\Assistance\ResolveFinancialDocumentPacketDocumentsAction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class GenerateFinancialDocumentPacketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = [
            'intake_date',
            'obligation_request_number',
            'responsibility_center',
            'account_code',
            'office',
            'fpp',
            'particulars',
            'disbursement_voucher_number',
            'mode_of_payment',
            'tin_employee_number',
            'explanation',
            'mswdo_printed_name',
            'mswdo_position',
            'budget_officer_printed_name',
            'budget_officer_position',
            'accountant_printed_name',
            'accountant_position',
            'treasurer_printed_name',
            'treasurer_position',
            'mayor_printed_name',
            'mayor_position',
        ];

        $normalized = [];

        foreach ($fields as $field) {
            $value = $this->input($field);
            $normalized[$field] = is_string($value) ? trim($value) : $value;
        }

        $this->merge($normalized);
    }

    /** @return array<string, list<\Illuminate\Contracts\Validation\ValidationRule|string>> */
    public function rules(): array
    {
        try {
            $documents = app(ResolveFinancialDocumentPacketDocumentsAction::class)->execute(
                assistanceRequestId: (string) $this->route('assistanceRequestId'),
                municipalId: (string) app('municipal_id'),
            );
        } catch (\DomainException $exception) {
            throw ValidationException::withMessages([
                'request' => $exception->getMessage(),
            ]);
        }

        return self::rulesForDocuments($documents);
    }

    /**
     * @param  array<int, AssistanceGeneratedDocument>  $documents
     * @return array<string, list<\Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public static function rulesForDocuments(array $documents): array
    {
        $hasCertificate = in_array(AssistanceGeneratedDocument::CertificateOfEligibility, $documents, true);
        $hasObligationRequest = in_array(AssistanceGeneratedDocument::ObligationRequest, $documents, true);
        $hasDisbursementVoucher = in_array(AssistanceGeneratedDocument::DisbursementVoucher, $documents, true);

        $requiredWhen = static fn (bool $required): string => $required ? 'required' : 'nullable';

        return [
            'intake_date' => [$requiredWhen($hasCertificate), 'date_format:Y-m-d'],
            'obligation_request_number' => [$requiredWhen($hasObligationRequest || $hasDisbursementVoucher), 'string', 'max:60'],
            'responsibility_center' => [$requiredWhen($hasObligationRequest || $hasDisbursementVoucher), 'string', 'max:80'],
            'account_code' => [$requiredWhen($hasObligationRequest), 'string', 'max:80'],
            'office' => ['nullable', 'string', 'max:150'],
            'fpp' => ['nullable', 'string', 'max:80'],
            'particulars' => [$requiredWhen($hasObligationRequest), 'string', 'max:1000'],
            'disbursement_voucher_number' => ['nullable', 'string', 'max:60'],
            'mode_of_payment' => [$requiredWhen($hasDisbursementVoucher), 'string', Rule::in(['check', 'cash', 'others'])],
            'tin_employee_number' => ['nullable', 'string', 'max:50'],
            'explanation' => [$requiredWhen($hasDisbursementVoucher), 'string', 'max:1000'],
            'mswdo_printed_name' => [$requiredWhen($hasCertificate || $hasObligationRequest), 'string', 'max:150'],
            'mswdo_position' => [$requiredWhen($hasCertificate || $hasObligationRequest), 'string', 'max:150'],
            'budget_officer_printed_name' => [$requiredWhen($hasObligationRequest), 'string', 'max:150'],
            'budget_officer_position' => [$requiredWhen($hasObligationRequest), 'string', 'max:150'],
            'accountant_printed_name' => [$requiredWhen($hasDisbursementVoucher), 'string', 'max:150'],
            'accountant_position' => [$requiredWhen($hasDisbursementVoucher), 'string', 'max:150'],
            'treasurer_printed_name' => [$requiredWhen($hasDisbursementVoucher), 'string', 'max:150'],
            'treasurer_position' => [$requiredWhen($hasDisbursementVoucher), 'string', 'max:150'],
            'mayor_printed_name' => [$requiredWhen($hasCertificate || $hasDisbursementVoucher), 'string', 'max:150'],
            'mayor_position' => [$requiredWhen($hasCertificate || $hasDisbursementVoucher), 'string', 'max:150'],
        ];
    }
}

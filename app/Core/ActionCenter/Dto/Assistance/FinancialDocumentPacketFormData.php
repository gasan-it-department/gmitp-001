<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class FinancialDocumentPacketFormData
{
    public function __construct(
        public string $assistanceRequestId,
        public string $transactionNumber,
        public string $payee,
        public ?string $certificateSubject,
        public string $address,
        public string $assistanceType,
        public float $approvedAmount,
        public string $suggestedParticulars,
        public string $suggestedExplanation,
        /** @var array<int, \App\Core\ActionCenter\Enums\AssistanceGeneratedDocument> */
        public array $includedDocuments,
        /** @var array<string, string> */
        public array $recommendedDefaults,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'assistance_request_id' => $this->assistanceRequestId,
            'transaction_number' => $this->transactionNumber,
            'payee' => $this->payee,
            'certificate_subject' => $this->certificateSubject,
            'address' => $this->address,
            'assistance_type' => $this->assistanceType,
            'approved_amount' => $this->approvedAmount,
            'suggested_particulars' => $this->suggestedParticulars,
            'suggested_explanation' => $this->suggestedExplanation,
            'included_documents' => array_map(
                fn ($document): array => [
                    'key' => $document->value,
                    'label' => $document->label(),
                ],
                $this->includedDocuments,
            ),
            'recommended_defaults' => $this->recommendedDefaults,
        ];
    }
}

<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class CertificateOfEligibilityFormData
{
    public function __construct(
        public string $assistanceRequestId,
        public string $transactionNumber,
        public string $subjectName,
        public ?string $subjectBirthDate,
        public ?string $subjectCivilStatus,
        public string $address,
        public string $assistanceType,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'assistance_request_id' => $this->assistanceRequestId,
            'transaction_number' => $this->transactionNumber,
            'subject_name' => $this->subjectName,
            'subject_birth_date' => $this->subjectBirthDate,
            'subject_civil_status' => $this->subjectCivilStatus,
            'address' => $this->address,
            'assistance_type' => $this->assistanceType,
        ];
    }
}

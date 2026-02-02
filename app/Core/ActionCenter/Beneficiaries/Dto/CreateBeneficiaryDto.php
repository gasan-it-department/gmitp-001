<?php

namespace App\Core\ActionCenter\Beneficiaries\Dto;

use Illuminate\Foundation\Http\FormRequest;

class CreateBeneficiaryDto
{
    public function __construct(
        public readonly string $firstName,
        public readonly string $lastName,
        public readonly ?string $middleName,
        public readonly ?string $suffix,
        public readonly string $birthDate,
        public readonly string $province,
        public readonly string $municipality,
        public readonly string $barangay,
    ) {
    }

    /**
     * Map the validated data from a FormRequest to the DTO.
     */
    public static function fromRequest(FormRequest $request): self
    {
        // $data = $request->validated();
        $data = method_exists($request, 'validated') ? $request->validated() : $request->all();

        return new self(
            firstName: strtoupper($data['first_name']),
            lastName: strtoupper($data['last_name']),
            middleName: strtoupper($data['middle_name'] ?? null),
            suffix: strtoupper($data['suffix'] ?? null),
            birthDate: $data['birth_date'],
            province: strtoupper($data['province']),
            municipality: strtoupper($data['municipality']),
            barangay: strtoupper($data['barangay']),
        );
    }
}
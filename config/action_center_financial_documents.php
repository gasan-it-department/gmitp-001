<?php

return [
    'defaults' => [
        'obligation_request' => [
            'responsibility_center' => '7611',
            'account_code' => '5-02-99-080',
            'office' => '',
            'fpp' => '',
            'mswdo_printed_name' => 'REBECCA S. BISNAR',
            'mswdo_position' => 'Social Welfare Officer III',
            'budget_officer_printed_name' => 'EDDEN M. SAGER',
            'budget_officer_position' => 'Municipal Budget Officer',
        ],
        'disbursement_voucher' => [
            'responsibility_center_office' => '',
            'responsibility_center_code' => '7611',
            'accountant_printed_name' => 'JHEA MAE R. MALAPOTE',
            'accountant_position' => 'MUNICIPAL ACCOUNTANT',
            'treasurer_printed_name' => 'MARIA JESUSA M. GHOSH',
            'treasurer_position' => 'Acting Municipal Treasurer',
            'mayor_printed_name' => 'HON. JAMES MARTY L. LIM',
            'mayor_position' => 'MUNICIPAL MAYOR',
        ],
        'certificate_of_eligibility' => [
            'certified_by_name' => 'REBECCA S. BISNAR',
            'certified_by_position' => 'Social Welfare Officer III',
            'approved_by_name' => 'HON. JAMES MARTY L. LIM',
            'approved_by_position' => 'MUNICIPAL MAYOR',
        ],
    ],

    'municipalities' => [
        '174003000' => [
            'obligation_request' => [
                'responsibility_center' => '7611',
                'account_code' => '5-02-99-080',
                'office' => '',
                'fpp' => '',
                'mswdo_printed_name' => '',
                'mswdo_position' => 'Municipal Social Welfare and Development Officer',
                'budget_officer_printed_name' => '',
                'budget_officer_position' => 'Municipal Budget Officer',
            ],
            'disbursement_voucher' => [
                'responsibility_center_office' => '',
                'responsibility_center_code' => '7611',
                'accountant_printed_name' => '',
                'accountant_position' => 'Municipal Accountant',
                'treasurer_printed_name' => '',
                'treasurer_position' => 'Municipal Treasurer',
                'mayor_printed_name' => '',
                'mayor_position' => 'Municipal Mayor',
            ],
            'certificate_of_eligibility' => [
                'certified_by_name' => '',
                'certified_by_position' => 'Social Welfare Officer III',
                'approved_by_name' => '',
                'approved_by_position' => 'Municipal Mayor',
            ],

            // Add assistance-type slug overrides here when a program uses
            // different accounting or signatory recommendations.
            'assistance_types' => [],
        ],
    ],
];

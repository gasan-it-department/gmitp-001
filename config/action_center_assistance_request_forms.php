<?php

$deceasedRequest = [
    'filing_mode' => 'on_behalf_only',
    'subject_type' => 'deceased',
    'fields' => [
        [
            'key' => 'on_behalf_date_of_death',
            'label' => 'Date of Death',
            'type' => 'date',
            'required' => true,
            'admin_only' => false,
        ],
    ],
];

$gasanRequestForms = [
    'assistance_types' => [
        'burial' => $deceasedRequest,

        // Preserve the deployed slug, including its existing spelling.
        'burial-assisstance-senior-citizen' => $deceasedRequest,
    ],
];

return [
    'defaults' => [
        'filing_mode' => 'self_or_on_behalf',
        'subject_type' => 'person',
        'fields' => [],
    ],

    'municipalities' => [
        // Current 10-digit PSGC code stored in municipalities.municipal_code.
        '1704003000' => $gasanRequestForms,

        // Retain compatibility with records/tests using Gasan's legacy code.
        '174003000' => $gasanRequestForms,
    ],
];

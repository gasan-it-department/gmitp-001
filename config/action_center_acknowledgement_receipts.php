<?php

$seniorCitizenBurial = [
    'assistance_label' => 'Burial Assistance',
    'program_name' => 'ASSISTANCE TO SENIOR CITIZEN',
    'program_qualifier' => 'Family of Deceased Senior Citizen',
    'program_acronym' => null,
];

$gasanAcknowledgementReceipts = [
    'assistance_types' => [
        // Preserve the deployed slug, including its existing spelling.
        'burial-assisstance-senior-citizen' => $seniorCitizenBurial,
    ],
];

return [
    'defaults' => [
        // A null assistance label uses the configured assistance-type name.
        'assistance_label' => null,
        'program_name' => 'ASSISTANCE TO INDIVIDUALS IN CRISIS SITUATIONS',
        'program_qualifier' => null,
        'program_acronym' => 'AICS',
    ],

    'municipalities' => [
        // Current 10-digit PSGC code stored in municipalities.municipal_code.
        '1704003000' => $gasanAcknowledgementReceipts,

        // Retain compatibility with records using Gasan's legacy code.
        '174003000' => $gasanAcknowledgementReceipts,
    ],
];

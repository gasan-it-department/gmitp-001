<?php

$gasanLocations = [
    'treasury' => [
        'label' => 'Municipal Treasurer\'s Office',
        'instructions' => 'Dalhin ang valid ID at transaction number.',
        'office_hours' => 'Monday to Friday, 8:00 AM to 5:00 PM',
    ],
    'mswd' => [
        'label' => 'Municipal Social Welfare and Development Office',
        'instructions' => 'Dalhin ang valid ID at transaction number.',
        'office_hours' => 'Monday to Friday, 8:00 AM to 5:00 PM',
    ],
];

return [
    'defaults' => [
        'claim_locations' => [],
    ],
    'municipalities' => [
        '1704003000' => ['claim_locations' => $gasanLocations],
        '174003000' => ['claim_locations' => $gasanLocations],
    ],
];

<?php

namespace Database\Seeders;

use App\Core\Government\Enums\PositionCategory;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\Seeder;
use App\Core\Government\Models\Position;

class PositionSeeder extends Seeder
{
    public function __construct(
        protected IdGeneratorInterface $idGeneratorInterface,
    ) {
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Initialize the Executive and top Legislative seat
        $positions = [
            [
                'title' => 'Municipal Mayor',
                'sequence' => 1,
                'category' => PositionCategory::EXECUTIVE,
            ],
            [
                'title' => 'Municipal Vice Mayor',
                'sequence' => 2,
                'category' => PositionCategory::LEGISLATIVE,
            ],
        ];

        // 2. Automatically generate the 8 distinct Councilors (Seats 3 through 10)
        for ($i = 1; $i <= 8; $i++) {
            $positions[] = [
                'title' => 'Sangguniang Bayan Member',
                'sequence' => 2 + $i, // Generates 3, 4, 5... up to 10
                'category' => PositionCategory::LEGISLATIVE,
            ];
        }

        // 3. Add the Ex-Officios and Secretariat
        $additionalPositions = [
            [
                'title' => 'ABC President (Liga ng mga Barangay)',
                'sequence' => 11,
                'category' => PositionCategory::EX_OFFICIO,
            ],
            [
                'title' => 'SK Federation President',
                'sequence' => 12,
                'category' => PositionCategory::EX_OFFICIO,
            ],
            [
                'title' => 'IPMR (Indigenous Peoples Mandatory Rep)',
                'sequence' => 13,
                'category' => PositionCategory::EX_OFFICIO,
            ],
            [
                'title' => 'Secretary to the Sangguniang Bayan',
                'sequence' => 14,
                'category' => PositionCategory::SECRETARIAT,
            ],
        ];

        // Merge arrays together
        $allPositions = array_merge($positions, $additionalPositions);

        // 4. Seed the database safely
        foreach ($allPositions as $pos) {
            Position::firstOrCreate(
                // SEARCH CONDITION: Must match BOTH title and sequence
                [
                    'title' => $pos['title'],
                    'sequence' => $pos['sequence'],
                ],
                // CREATION DATA: If not found, use this data to create it
                [
                    'id' => $this->idGeneratorInterface->generate(),
                    'category' => $pos['category'],
                ]
            );
        }
    }
}
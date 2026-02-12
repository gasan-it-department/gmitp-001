<?php

namespace Database\Seeders;

use App\Core\Government\Enums\PositionCategory;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\Seeder;
use App\Core\Government\Models\Position;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

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

        $positions = [
            [
                'title' => 'Municipal Mayor',
                'rank' => 1,
                'category' => PositionCategory::EXECUTIVE,
            ],
            [
                'title' => 'Municipal Vice Mayor',
                'rank' => 2,
                'category' => PositionCategory::LEGISLATIVE, // Presiding Officer
            ],
            [
                'title' => 'Sangguniang Bayan Member',
                'rank' => 3,
                'category' => PositionCategory::LEGISLATIVE, // Presiding Officer
            ],
            [
                'title' => 'SK Federation President',
                'rank' => 4,
                'category' => PositionCategory::EX_OFFICIO, // Presiding Officer
            ],
            [
                'title' => 'ABC President (Liga ng mga Barangay)',
                'rank' => 5,
                'category' => PositionCategory::EX_OFFICIO, // Presiding Officer
            ],
            [
                'title' => 'IPMR (Indigenous Peoples Mandatory Rep)',
                'rank' => 6,
                'category' => PositionCategory::EX_OFFICIO, // Presiding Officer
            ],
            [
                'title' => 'Secretary to the Sangguniang Bayan',
                'rank' => 7,
                'category' => PositionCategory::SECRETARIAT, // Presiding Officer
            ],
        ];

        foreach ($positions as $pos) {

            Position::firstOrCreate(
                ['title' => $pos['title']],
                [
                    'id' => $this->idGeneratorInterface->generate(),
                    'rank' => $pos['rank'],
                    'category' => $pos['category'],
                ]
            );

        }


    }
}

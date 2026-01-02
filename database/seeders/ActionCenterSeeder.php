<?php

namespace Database\Seeders;

use App\Core\Users\Models\User;
use Illuminate\Database\Seeder;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Core\ActionCenter\Beneficiaries\Models\Beneficiary;
use App\Core\ActionCenter\Requests\Models\AssistanceRequest;

class ActionCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get ALL persisted Municipalities from your database
        $municipalities = Municipality::all();

        // 2. Get a User to act as the encoder (or pick random)
        $user = User::first(); // Or User::inRandomOrder()->first();

        if ($municipalities->isEmpty() || !$user) {
            $this->command->error('Please seed Users and Municipalities first!');
            return;
        }

        // 3. Create 50 Fake Entries
        $this->command->info('Seeding Action Center Data...');

        // We loop 50 times to create 50 different requests
        for ($i = 0; $i < 50; $i++) {

            // A. Pick a random municipality from the DB
            $randomMunicipal = $municipalities->random();

            // B. Create a Beneficiary using the Factory
            $beneficiary = Beneficiary::factory()->create([
                // Optional: Make the text address match the ID logic
                'municipality' => $randomMunicipal->name,
            ]);

            // C. Create the Assistance Request linked to them
            AssistanceRequest::factory()->create([
                'user_id' => $user->id,
                'municipal_id' => $randomMunicipal->id, // ✅ USING PERSISTED ID
                'assistance_beneficiary_id' => $beneficiary->id,
            ]);
        }
    }
}

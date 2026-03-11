<?php

namespace Database\Seeders;

use App\Core\Users\Models\User;
use Illuminate\Database\Seeder;
use App\Core\Municipality\Models\Municipality;
use App\Core\BulletinBoard\Events\Models\Event;

class EventsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get the Specific Municipality (Gasan)
        // FIX: Added ->first() to get the Model, not the Builder
        $targetMuni = Municipality::where('name', 'Gasan')->first();

        if (!$targetMuni) {
            $this->command->error("Municipality 'Gasan' not found!");
            return;
        }

        // 2. Validate the User
        // We look for the specific User ID AND make sure their municipal_id matches Gasan

        $targetUser = User::where('municipal_id', $targetMuni->id)
            ->first();

        // Safety Check: If user exists but is NOT in Gasan, this will fail
        if (!$targetUser) {
            $this->command->error("User not found");
            return;
        }

        $this->command->info("Seeding 30 events for Gasan using User: {$targetUser->id}");

        // 3. Create Events (No Loop needed)
        Event::factory()
            ->count(30)
            ->state([
                'municipal_id' => $targetMuni->id,
                'user_id' => $targetUser->id,
                'is_published' => true,
            ])
            ->create();
    }
}
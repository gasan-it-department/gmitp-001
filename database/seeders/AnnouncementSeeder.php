<?php

namespace Database\Seeders;

use App\Core\Users\Models\User;
use Illuminate\Database\Seeder;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Core\BulletinBoard\Announcement\Models\Announcement;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        $municipalities = Municipality::all();

        if (!$user || $municipalities->isEmpty())
            return;

        // Create 10 announcements linked to real data
        foreach ($municipalities as $municipal) {
            Announcement::factory()
                ->count(300)
                ->create([
                    'user_id' => $user->id,          // Override with real User ID
                    'municipal_id' => $municipal->id // Override with real Municipal ID
                ]);
        }

    }
}

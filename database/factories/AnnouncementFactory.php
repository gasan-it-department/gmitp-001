<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use App\Core\Users\Models\User;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Core\BulletinBoard\Announcement\Models\Announcement;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Model>
 */
class AnnouncementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = Announcement::class;
    public function definition(): array
    {
        return [
            // 3. Auto-generate ULID
            'id' => (string) Str::ulid(),

            'title' => fake()->sentence(6),
            'message' => fake()->paragraph(3),

            // 4. Default to creating new relations if none provided
            // (Your seeder will override these with existing IDs)
            'user_id' => User::factory(),
            'municipal_id' => null,

            'is_published' => fake()->boolean(80), // 80% chance of being true
            'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
            'updated_at' => now(),
        ];
    }
}

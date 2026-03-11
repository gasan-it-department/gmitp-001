<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use App\Core\BulletinBoard\Events\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Core\Users\Models\User; // Import your User model

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Core\BulletinBoard\Events\Models\Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $dateScenario = fake()->randomElement(['past', 'today', 'future']);

        $eventDate = match ($dateScenario) {
            'past' => fake()->dateTimeBetween('-1 month', '-1 day'),
            'today' => now(),
            'future' => fake()->dateTimeBetween('+1 day', '+2 months'),
        };

        return [
            'id' => (string) Str::ulid(),            // Create a user if one isn't passed (prevents SQL errors on non-nullable columns)
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(3),
            'event_date' => $eventDate,
            'municipal_id' => null, // We will override this in the Seeder
            'is_published' => fake()->boolean(90), // 90% chance of being published
            'created_at' => fake()->dateTimeBetween('-3 months', 'now'),
            'updated_at' => now(),
        ];
    }
}
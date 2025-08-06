<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Core\Users\Infrastructure\Models\User;
/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;


    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'user_name' => fake()->unique()->userName(),
            'role' => 'admin',
            'phone' => fake()->unique()->phoneNumber(),
            'phone_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'admin',
        ]);
    }
}

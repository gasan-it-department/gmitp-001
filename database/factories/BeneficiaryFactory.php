<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Core\ActionCenter\Beneficiaries\Models\Beneficiary;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Model>
 */
class BeneficiaryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = Beneficiary::class;

    public function definition(): array
    {
        return [
            'id' => Str::ulid(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'middle_name' => fake()->lastName(), // Optional
            'suffix' => fake()->randomElement(['', 'Jr.', 'Sr.', 'III']),
            'birth_date' => fake()->date('Y-m-d', '-18 years'), // Adults only
            'contact_number' => '09' . fake()->numerify('#########'), // PH Format
            'province' => 'Marinduque', // Hardcoded context
            'municipality' => fake()->randomElement(['Boac', 'Gasan', 'Mogpog', 'Torrijos', 'Buenavista', 'Santa Cruz']),
            'barangay' => 'Barangay ' . fake()->word(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}

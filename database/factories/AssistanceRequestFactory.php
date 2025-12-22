<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Core\ActionCenter\Requests\Models\AssistanceRequest;
use App\Core\ActionCenter\Requests\Services\TransactionNumberGenerator;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Model>
 */
class AssistanceRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = AssistanceRequest::class;

    public function definition(): array
    {

        $trnGenerator = app(TransactionNumberGenerator::class);

        return [
            'id' => Str::ulid(),
            'assistance_type' => fake()->randomElement(['Medical', 'Burial', 'Financial', 'Educational']),
            'description' => fake()->sentence(10),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            // We leave user_id, municipal_id, and beneficiary_id null here
            // because we will assign them in the Seeder
            'transaction_number' => $trnGenerator->generate(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}

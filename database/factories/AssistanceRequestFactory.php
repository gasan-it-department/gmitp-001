<?php

namespace Database\Factories;

use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AssistanceRequest>
 */
class AssistanceRequestFactory extends Factory
{
    protected $model = AssistanceRequest::class;

    public function definition(): array
    {
        return [
            'transaction_number' => sprintf(
                'REQ-%s-%s',
                now()->year,
                Str::upper(Str::random(8)),
            ),
            'status' => 'pending',
            'description' => fake()->sentence(10),
            'amount_approved' => null,
            'metadata' => null,
            'privacy_consented_at' => now(),
            'privacy_notice_version' => 'v1.0',
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (AssistanceRequest $request) {
            if ($request->snapshot()->exists()) {
                return;
            }

            $request->snapshot()->create([
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'birth_date' => fake()->dateTimeBetween('-80 years', '-18 years')->format('Y-m-d'),
                'barangay' => fake()->city(),
                'street' => fake()->streetAddress(),
                'monthly_income' => fake()->randomFloat(2, 0, 30000),
                'household_total_income' => fake()->randomFloat(2, 0, 60000),
            ]);
        });
    }
}

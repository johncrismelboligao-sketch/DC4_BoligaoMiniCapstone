<?php

namespace Database\Factories;

use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RegistrationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'training_session_id' => TrainingSession::factory(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'cancelled']),
            'attended' => null,
            'remarks' => fake()->optional()->sentence(),
        ];
    }
}

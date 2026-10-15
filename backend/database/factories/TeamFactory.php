<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TeamFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'division' => fake()->randomElement(['Under 10', 'Under 12', 'Under 15', 'Under 18']),
            'description' => fake()->sentence(),
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DrillFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'category' => fake()->randomElement(['passing', 'dribbling', 'shooting', 'fitness', 'defending']),
            'description' => fake()->sentence(),
            'default_minutes' => fake()->numberBetween(8, 25),
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class VenueFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->city().' Training Ground',
            'address' => fake()->streetAddress(),
            'capacity' => fake()->numberBetween(30, 120),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}

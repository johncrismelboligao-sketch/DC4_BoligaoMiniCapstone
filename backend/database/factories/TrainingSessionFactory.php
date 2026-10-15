<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->randomElement(['Ball Mastery', 'Finishing Practice', 'Build-up Play', 'Defensive Shape', 'Speed and Agility']),
            'description' => fake()->sentence(),
            'session_date' => fake()->dateTimeBetween('today', '+4 weeks')->format('Y-m-d'),
            'start_time' => '09:00:00',
            'end_time' => '10:30:00',
            'status' => 'scheduled',
            'max_players' => 24,
            'coach_id' => User::factory()->state(['role' => 'coach']),
            'venue_id' => Venue::factory(),
            'team_id' => Team::factory(),
        ];
    }
}

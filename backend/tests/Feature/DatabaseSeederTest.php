<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_accounts_and_sample_records_are_seeded(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['email' => 'admin@gmail.com', 'role' => 'admin']);
        $this->assertDatabaseHas('users', ['email' => 'player@gmail.com', 'role' => 'player']);
        $this->assertSame(2, User::where('role', 'coach')->count());
        $this->assertSame(24, User::where('role', 'player')->count());
        $this->assertDatabaseCount('teams', 4);
        $this->assertDatabaseCount('venues', 3);
        $this->assertDatabaseCount('drills', 15);
        $this->assertDatabaseCount('training_sessions', 25);
        $this->assertDatabaseCount('drill_training_session', 75);
        $this->assertDatabaseCount('registrations', 100);
    }
}

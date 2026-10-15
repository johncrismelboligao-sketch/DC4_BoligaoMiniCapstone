<?php

namespace Tests\Feature;

use App\Models\Drill;
use App\Models\Team;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResourceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_player_can_read_only_their_team_sessions_and_pagination_is_returned(): void
    {
        $team = Team::factory()->create();
        $otherTeam = Team::factory()->create();
        $coach = User::factory()->create(['role' => 'coach', 'team_id' => $team->id]);
        $venue = Venue::factory()->create();
        $player = User::factory()->create(['role' => 'player', 'team_id' => $team->id]);

        TrainingSession::factory()->count(11)->create([
            'team_id' => $team->id,
            'coach_id' => $coach->id,
            'venue_id' => $venue->id,
            'session_date' => now()->addDay()->toDateString(),
        ]);
        TrainingSession::factory()->create([
            'team_id' => $otherTeam->id,
            'coach_id' => $coach->id,
            'venue_id' => $venue->id,
            'session_date' => now()->addDay()->toDateString(),
        ]);

        $response = $this->actingAs($player, 'sanctum')->getJson('/api/sessions');
        $response->assertOk()->assertJsonPath('meta.total', 11)->assertJsonCount(10, 'data');
    }

    public function test_coach_can_create_a_session_and_player_cannot(): void
    {
        $team = Team::factory()->create();
        $coach = User::factory()->create(['role' => 'coach', 'team_id' => $team->id]);
        $player = User::factory()->create(['role' => 'player', 'team_id' => $team->id]);
        $venue = Venue::factory()->create();
        $drill = Drill::factory()->create();
        $payload = [
            'title' => 'U12 Passing Practice',
            'session_date' => now()->addDay()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:30',
            'max_players' => 18,
            'venue_id' => $venue->id,
            'team_id' => $team->id,
            'drills' => [$drill->id],
        ];

        $this->actingAs($player, 'sanctum')->postJson('/api/sessions', $payload)->assertForbidden();
        $this->actingAs($coach, 'sanctum')->postJson('/api/sessions', $payload)->assertCreated();

        $this->assertDatabaseHas('training_sessions', ['title' => 'U12 Passing Practice', 'coach_id' => $coach->id]);
        $this->assertDatabaseHas('drill_training_session', ['drill_id' => $drill->id, 'sort_order' => 1]);
    }

    public function test_only_admin_can_manage_user_roles_and_active_state(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $player = User::factory()->create(['role' => 'player']);
        $coach = User::factory()->create(['role' => 'coach']);

        $this->actingAs($player, 'sanctum')->getJson('/api/users')->assertForbidden();
        $this->actingAs($admin, 'sanctum')->getJson('/api/users')->assertOk();
        $this->patchJson("/api/users/{$coach->id}", ['is_active' => false])
            ->assertOk()->assertJsonPath('data.is_active', false);
    }

    public function test_partial_session_update_compares_end_time_with_saved_start_time(): void
    {
        $team = Team::factory()->create();
        $coach = User::factory()->create(['role' => 'coach', 'team_id' => $team->id]);
        $session = TrainingSession::factory()->create([
            'team_id' => $team->id,
            'coach_id' => $coach->id,
            'venue_id' => Venue::factory()->create()->id,
            'start_time' => '09:00',
            'end_time' => '10:30',
        ]);

        $this->actingAs($coach, 'sanctum')->patchJson("/api/sessions/{$session->id}", ['end_time' => '08:30'])
            ->assertUnprocessable()->assertJsonValidationErrors('end_time');
        $this->patchJson("/api/sessions/{$session->id}", ['end_time' => '11:00'])
            ->assertOk()->assertJsonPath('data.end_time', '11:00');
    }
}

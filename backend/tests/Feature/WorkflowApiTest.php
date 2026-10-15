<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\Team;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkflowApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_capacity_approval_attendance_and_session_status_workflow(): void
    {
        $team = Team::factory()->create();
        $venue = Venue::factory()->create();
        $coach = User::factory()->create(['role' => 'coach', 'team_id' => $team->id]);
        $player = User::factory()->create(['role' => 'player', 'team_id' => $team->id]);
        $otherPlayer = User::factory()->create(['role' => 'player', 'team_id' => $team->id]);
        $session = TrainingSession::factory()->create([
            'team_id' => $team->id,
            'venue_id' => $venue->id,
            'coach_id' => $coach->id,
            'session_date' => now()->addDay()->toDateString(),
            'max_players' => 1,
        ]);

        $registered = $this->actingAs($player, 'sanctum')->postJson("/api/sessions/{$session->id}/register")
            ->assertCreated()->assertJsonPath('data.status', 'pending');
        $registrationId = $registered->json('data.id');

        $this->postJson("/api/sessions/{$session->id}/register")->assertUnprocessable();
        $this->actingAs($otherPlayer, 'sanctum')->postJson("/api/sessions/{$session->id}/register")->assertUnprocessable();

        $this->actingAs($coach, 'sanctum')->patchJson("/api/registrations/{$registrationId}/status", ['status' => 'approved'])
            ->assertOk()->assertJsonPath('data.status', 'approved');
        $this->patchJson("/api/registrations/{$registrationId}/attendance", ['attended' => true])
            ->assertOk()->assertJsonPath('data.attended', true);

        $this->patchJson("/api/sessions/{$session->id}/status", ['status' => 'ongoing'])
            ->assertOk()->assertJsonPath('data.status', 'ongoing');
        $this->patchJson("/api/sessions/{$session->id}/status", ['status' => 'completed'])
            ->assertOk()->assertJsonPath('data.status', 'completed');
        $this->patchJson("/api/sessions/{$session->id}/status", ['status' => 'cancelled'])
            ->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->assertDatabaseHas('registrations', ['id' => $registrationId, 'status' => 'approved', 'attended' => true]);
    }

    public function test_registration_list_and_dashboard_are_scoped_for_players(): void
    {
        $team = Team::factory()->create();
        $venue = Venue::factory()->create();
        $coach = User::factory()->create(['role' => 'coach', 'team_id' => $team->id]);
        $player = User::factory()->create(['role' => 'player', 'team_id' => $team->id]);
        $otherPlayer = User::factory()->create(['role' => 'player', 'team_id' => $team->id]);
        $session = TrainingSession::factory()->create([
            'team_id' => $team->id,
            'venue_id' => $venue->id,
            'coach_id' => $coach->id,
            'session_date' => now()->addDay()->toDateString(),
        ]);
        Registration::factory()->create(['user_id' => $player->id, 'training_session_id' => $session->id, 'status' => 'pending']);
        Registration::factory()->create(['user_id' => $otherPlayer->id, 'training_session_id' => $session->id, 'status' => 'pending']);

        $this->actingAs($player, 'sanctum')->getJson('/api/registrations')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.user.id', $player->id);
        $this->getJson('/api/dashboard')->assertOk()->assertJsonPath('pending_registrations', 1)
            ->assertJsonCount(6, 'attendance_per_week');
    }
}

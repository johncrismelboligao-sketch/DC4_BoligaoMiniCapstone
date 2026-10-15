<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_a_player_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ari Santos',
            'email' => 'ari@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'player')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', ['email' => 'ari@example.test', 'role' => 'player']);
    }

    public function test_login_rejects_bad_credentials_and_allows_token_logout(): void
    {
        User::factory()->create(['email' => 'coach@example.test', 'password' => 'password123', 'role' => 'coach']);

        $this->postJson('/api/login', ['email' => 'coach@example.test', 'password' => 'incorrect'])
            ->assertUnauthorized();

        $login = $this->postJson('/api/login', ['email' => 'coach@example.test', 'password' => 'password123'])
            ->assertOk();

        $token = $login->json('token');
        $this->withToken($token)->getJson('/api/user')->assertOk()->assertJsonPath('data.role', 'coach');
        $this->withToken($token)->postJson('/api/logout')->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_register_returns_field_validation_errors(): void
    {
        $this->postJson('/api/register', ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }
}

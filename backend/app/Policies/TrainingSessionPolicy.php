<?php

namespace App\Policies;

use App\Models\TrainingSession;
use App\Models\User;

class TrainingSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, TrainingSession $session): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'coach' && $session->coach_id === $user->id)
            || ($user->role === 'player' && $session->team_id === $user->team_id && $session->coach_id === $user->coach_id);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'coach'], true) && $user->is_active;
    }

    public function update(User $user, TrainingSession $session): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'coach' && $session->coach_id === $user->id);
    }

    public function delete(User $user, TrainingSession $session): bool
    {
        return $user->role === 'admin';
    }

    public function register(User $user, TrainingSession $session): bool
    {
        return $user->role === 'player'
            && $user->is_active
            && $user->coach_id !== null
            && $user->team_id === $session->team_id
            && $session->coach_id === $user->coach_id;
    }

    public function updateStatus(User $user, TrainingSession $session): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'coach' && $session->coach_id === $user->id);
    }
}

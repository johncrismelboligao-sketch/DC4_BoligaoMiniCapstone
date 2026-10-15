<?php

namespace App\Policies;

use App\Models\Drill;
use App\Models\User;

class DrillPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Drill $drill): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Drill $drill): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Drill $drill): bool
    {
        return $user->role === 'admin';
    }
}

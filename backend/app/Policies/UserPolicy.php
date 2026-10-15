<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, User $managedUser): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, User $managedUser): bool
    {
        return $user->role === 'admin';
    }
}

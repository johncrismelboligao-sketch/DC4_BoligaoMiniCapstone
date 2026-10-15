<?php

namespace App\Policies;

use App\Models\Registration;
use App\Models\User;

class RegistrationPolicy
{
    public function updateStatus(User $user, Registration $registration): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'coach' && $registration->trainingSession?->coach_id === $user->id);
    }

    public function updateAttendance(User $user, Registration $registration): bool
    {
        return $this->updateStatus($user, $registration);
    }
}

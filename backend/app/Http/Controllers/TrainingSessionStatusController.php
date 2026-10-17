<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTrainingSessionStatusRequest;
use App\Http\Resources\TrainingSessionResource;
use App\Models\TrainingSession;
use Illuminate\Validation\ValidationException;

class TrainingSessionStatusController extends Controller
{
    public function __invoke(UpdateTrainingSessionStatusRequest $request, TrainingSession $session)
    {
        $this->authorize('updateStatus', $session);

        $nextStatus = $request->validated('status');
        $allowedTransitions = [
            'scheduled' => ['ongoing', 'cancelled'],
            'ongoing' => ['completed'],
        ];

        if (! in_array($nextStatus, $allowedTransitions[$session->status] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => "Invalid status transition from {$session->status} to {$nextStatus}.",
            ]);
        }

        $session->update(['status' => $nextStatus]);

        return new TrainingSessionResource($session->refresh()->load(['coach', 'venue', 'team', 'drills'])->loadCount([
            'registrations' => fn ($query) => $query->whereIn('status', ['pending', 'approved']),
        ]));
    }
}

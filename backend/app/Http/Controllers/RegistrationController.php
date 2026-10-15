<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterForSessionRequest;
use App\Http\Requests\UpdateRegistrationAttendanceRequest;
use App\Http\Requests\UpdateRegistrationStatusRequest;
use App\Http\Resources\RegistrationResource;
use App\Models\Registration;
use App\Models\TrainingSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegistrationController extends Controller
{
    public function index(Request $request)
    {
        $query = Registration::query()->with(['user.team', 'trainingSession.coach', 'trainingSession.venue', 'trainingSession.team', 'trainingSession.drills']);
        $user = $request->user();

        if ($user->role === 'coach') {
            $query->whereHas('trainingSession', fn ($sessions) => $sessions->where('coach_id', $user->id));
        } elseif ($user->role === 'player') {
            $query->where('user_id', $user->id);
        }

        $query->when($request->filled('status'), fn ($query) => $query->where('status', $request->query('status')));

        return RegistrationResource::collection($query->latest()->paginate(10)->withQueryString());
    }

    public function register(RegisterForSessionRequest $request, TrainingSession $session)
    {
        $this->authorize('register', $session);
        $user = $request->user();

        $registration = DB::transaction(function () use ($request, $session, $user) {
            $session = TrainingSession::query()->lockForUpdate()->findOrFail($session->id);

            if ($session->status !== 'scheduled') {
                throw ValidationException::withMessages(['session' => 'Registration is only available for scheduled sessions.']);
            }

            if ($session->session_date->lt(today())) {
                throw ValidationException::withMessages(['session' => 'You cannot register for a session in the past.']);
            }

            if (Registration::where('user_id', $user->id)->where('training_session_id', $session->id)->exists()) {
                throw ValidationException::withMessages(['session' => 'You are already registered for this session.']);
            }

            $reserved = $session->registrations()->whereIn('status', ['pending', 'approved'])->count();
            if ($reserved >= $session->max_players) {
                throw ValidationException::withMessages(['session' => 'This training session has reached its player limit.']);
            }

            return Registration::create([
                'user_id' => $user->id,
                'training_session_id' => $session->id,
                'status' => 'pending',
                'remarks' => $request->validated('remarks'),
            ]);
        });

        return (new RegistrationResource($registration->load(['user.team', 'trainingSession.coach', 'trainingSession.venue', 'trainingSession.team', 'trainingSession.drills'])))
            ->response()->setStatusCode(201);
    }

    public function cancel(Request $request, TrainingSession $session)
    {
        $registration = Registration::where('user_id', $request->user()->id)
            ->where('training_session_id', $session->id)
            ->firstOrFail();

        if ($registration->status !== 'pending') {
            throw ValidationException::withMessages(['registration' => 'Only pending registrations can be cancelled.']);
        }

        $registration->delete();

        return response()->json([], 204);
    }

    public function updateStatus(UpdateRegistrationStatusRequest $request, Registration $registration)
    {
        $this->authorize('updateStatus', $registration);

        if ($registration->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'Only pending registrations can be approved or rejected.']);
        }

        $registration->update(['status' => $request->validated('status')]);

        return new RegistrationResource($registration->refresh()->load(['user.team', 'trainingSession.coach', 'trainingSession.venue', 'trainingSession.team', 'trainingSession.drills']));
    }

    public function updateAttendance(UpdateRegistrationAttendanceRequest $request, Registration $registration)
    {
        $this->authorize('updateAttendance', $registration);

        if ($registration->status !== 'approved') {
            throw ValidationException::withMessages(['attended' => 'Attendance can only be recorded for approved registrations.']);
        }

        $registration->update(['attended' => $request->validated('attended')]);

        return new RegistrationResource($registration->refresh()->load(['user.team', 'trainingSession.coach', 'trainingSession.venue', 'trainingSession.team', 'trainingSession.drills']));
    }
}

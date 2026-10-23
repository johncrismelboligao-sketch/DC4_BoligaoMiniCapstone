<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplyToCoachRequest;
use App\Http\Requests\UpdateCoachApplicationStatusRequest;
use App\Http\Resources\CoachApplicationResource;
use App\Models\CoachApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CoachApplicationController extends Controller
{
    public function coaches()
    {
        return User::query()->where('role', 'coach')->where('is_active', true)->with('team')
            ->orderBy('name')->get(['id', 'name', 'team_id'])
            ->map(fn (User $coach) => ['id' => $coach->id, 'name' => $coach->name, 'team' => $coach->team?->name]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = CoachApplication::query()->with(['player.team', 'coach.team'])->latest();

        if ($user->role === 'player') {
            $query->where('player_id', $user->id);
        } elseif ($user->role === 'coach') {
            $query->where('coach_id', $user->id);
        }

        return CoachApplicationResource::collection($query->paginate(10)->withQueryString());
    }

    public function store(ApplyToCoachRequest $request)
    {
        $player = $request->user();
        $coachId = (int) $request->validated('coach_id');

        if ($player->coach_id) {
            throw ValidationException::withMessages(['coach_id' => 'You already have an assigned coach. Contact an admin if you need to change coaches.']);
        }

        $existing = CoachApplication::where('player_id', $player->id)->first();
        if ($existing?->status === 'pending') {
            throw ValidationException::withMessages(['coach_id' => 'Your coach application is already waiting for a decision.']);
        }

        $application = CoachApplication::updateOrCreate(
            ['player_id' => $player->id],
            ['coach_id' => $coachId, 'status' => 'pending'],
        );

        return (new CoachApplicationResource($application->load(['player.team', 'coach.team'])))->response()->setStatusCode(201);
    }

    public function update(UpdateCoachApplicationStatusRequest $request, CoachApplication $coachApplication)
    {
        $user = $request->user();
        abort_unless($user->role === 'admin' || $coachApplication->coach_id === $user->id, 403);

        if ($coachApplication->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'This coach application already has a decision.']);
        }

        $status = $request->validated('status');
        DB::transaction(function () use ($coachApplication, $status) {
            $coachApplication->update(['status' => $status]);
            if ($status === 'approved') {
                User::whereKey($coachApplication->player_id)->update(['coach_id' => $coachApplication->coach_id]);
                CoachApplication::where('player_id', $coachApplication->player_id)
                    ->where('id', '<>', $coachApplication->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'rejected']);
            }
        });

        return new CoachApplicationResource($coachApplication->refresh()->load(['player.team', 'coach.team']));
    }
}

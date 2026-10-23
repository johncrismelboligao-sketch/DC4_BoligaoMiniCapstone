<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTrainingSessionRequest;
use App\Http\Requests\UpdateTrainingSessionRequest;
use App\Http\Resources\TrainingSessionResource;
use App\Models\Drill;
use App\Models\TrainingSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrainingSessionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', TrainingSession::class);

        $query = TrainingSession::query()->with(['coach', 'venue', 'team', 'drills'])->withCount([
            'registrations' => fn ($query) => $query->whereIn('status', ['pending', 'approved']),
        ]);
        $user = $request->user();

        if ($user->role === 'coach') {
            $query->where('coach_id', $user->id);
        } elseif ($user->role === 'player') {
            $query->where('team_id', $user->team_id);
            if ($user->coach_id) {
                $query->where('coach_id', $user->coach_id);
            } else {
                $query->whereRaw('1 = 0');
            }
            $query->with(['registrations' => fn ($registrations) => $registrations->where('user_id', $user->id)->with('requestedDrills')]);
        }

        $query->when($request->filled('search'), fn ($query) => $query->where('title', 'like', '%'.$request->string('search')->toString().'%'))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->query('status')))
            ->when($request->filled('team_id'), fn ($query) => $query->where('team_id', $request->query('team_id')))
            ->when($request->filled('venue_id'), fn ($query) => $query->where('venue_id', $request->query('venue_id')))
            ->when($request->filled('date'), fn ($query) => $query->whereDate('session_date', $request->query('date')));

        return TrainingSessionResource::collection($query->orderBy('session_date')->orderBy('start_time')->paginate(10)->withQueryString());
    }

    public function store(StoreTrainingSessionRequest $request)
    {
        $this->authorize('create', TrainingSession::class);
        $data = $request->validated();
        $drillIds = $data['drills'] ?? [];
        unset($data['drills']);
        $data['coach_id'] = $request->user()->role === 'coach' ? $request->user()->id : $data['coach_id'];

        $session = DB::transaction(function () use ($data, $drillIds) {
            $session = TrainingSession::create($data);
            $this->syncDrills($session, $drillIds);

            return $session;
        });

        return (new TrainingSessionResource($session->load(['coach', 'venue', 'team', 'drills'])->loadCount([
            'registrations' => fn ($query) => $query->whereIn('status', ['pending', 'approved']),
        ])))
            ->response()->setStatusCode(201);
    }

    public function show(TrainingSession $session)
    {
        $this->authorize('view', $session);

        $session->load(['coach', 'venue', 'team', 'drills']);
        if (request()->user()->role === 'player') {
            $session->load(['registrations' => fn ($registrations) => $registrations->where('user_id', request()->user()->id)->with('requestedDrills')]);
        }

        return new TrainingSessionResource($session->loadCount([
            'registrations' => fn ($query) => $query->whereIn('status', ['pending', 'approved']),
        ]));
    }

    public function update(UpdateTrainingSessionRequest $request, TrainingSession $session)
    {
        $this->authorize('update', $session);
        $data = $request->validated();
        $drillIds = $data['drills'] ?? null;
        unset($data['drills']);

        if ($request->user()->role !== 'admin') {
            unset($data['coach_id']);
        }

        DB::transaction(function () use ($session, $data, $drillIds) {
            $session->update($data);
            if ($drillIds !== null) {
                $this->syncDrills($session, $drillIds);
            }
        });

        return new TrainingSessionResource($session->refresh()->load(['coach', 'venue', 'team', 'drills'])->loadCount([
            'registrations' => fn ($query) => $query->whereIn('status', ['pending', 'approved']),
        ]));
    }

    public function destroy(TrainingSession $session)
    {
        $this->authorize('delete', $session);
        $session->delete();

        return response()->json([], 204);
    }

    private function syncDrills(TrainingSession $session, array $drillIds): void
    {
        $drills = Drill::whereIn('id', $drillIds)->get()->keyBy('id');
        $pivot = [];

        foreach ($drillIds as $index => $drillId) {
            $pivot[$drillId] = ['sort_order' => $index + 1, 'minutes' => $drills[$drillId]->default_minutes];
        }

        $session->drills()->sync($pivot);
    }
}

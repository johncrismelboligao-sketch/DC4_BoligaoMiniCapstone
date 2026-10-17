<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Team::class);

        $teams = Team::query()
            ->withCount([
                'users' => fn ($query) => $query->where('role', 'player'),
                'trainingSessions',
            ])
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = '%'.$request->string('search')->toString().'%';
                $query->where(fn ($query) => $query->where('name', 'like', $term)
                    ->orWhere('division', 'like', $term));
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return TeamResource::collection($teams);
    }

    public function store(StoreTeamRequest $request)
    {
        $this->authorize('create', Team::class);

        return (new TeamResource(Team::create($request->validated())))->response()->setStatusCode(201);
    }

    public function show(Team $team)
    {
        $this->authorize('view', $team);

        return new TeamResource($team->loadCount([
            'users' => fn ($query) => $query->where('role', 'player'),
            'trainingSessions',
        ]));
    }

    public function update(UpdateTeamRequest $request, Team $team)
    {
        $this->authorize('update', $team);
        $team->update($request->validated());

        return new TeamResource($team->refresh()->loadCount([
            'users' => fn ($query) => $query->where('role', 'player'),
            'trainingSessions',
        ]));
    }

    public function destroy(Team $team)
    {
        $this->authorize('delete', $team);

        if ($team->trainingSessions()->exists()) {
            return response()->json([
                'message' => 'This team cannot be deleted because it has training sessions.',
            ], 409);
        }

        $team->delete();

        return response()->noContent();
    }
}

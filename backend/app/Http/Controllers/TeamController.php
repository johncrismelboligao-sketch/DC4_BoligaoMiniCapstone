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

        return TeamResource::collection(Team::withCount(['users', 'trainingSessions'])->orderBy('name')->paginate(10)->withQueryString());
    }

    public function store(StoreTeamRequest $request)
    {
        $this->authorize('create', Team::class);

        return (new TeamResource(Team::create($request->validated())))->response()->setStatusCode(201);
    }

    public function show(Team $team)
    {
        $this->authorize('view', $team);

        return new TeamResource($team->loadCount(['users', 'trainingSessions']));
    }

    public function update(UpdateTeamRequest $request, Team $team)
    {
        $this->authorize('update', $team);
        $team->update($request->validated());

        return new TeamResource($team->refresh()->loadCount(['users', 'trainingSessions']));
    }

    public function destroy(Team $team)
    {
        $this->authorize('delete', $team);
        $team->delete();

        return response()->json([], 204);
    }
}

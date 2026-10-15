<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVenueRequest;
use App\Http\Requests\UpdateVenueRequest;
use App\Http\Resources\VenueResource;
use App\Models\Venue;
use Illuminate\Http\Request;

class VenueController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Venue::class);

        return VenueResource::collection(Venue::withCount('trainingSessions')->orderBy('name')->paginate(10)->withQueryString());
    }

    public function store(StoreVenueRequest $request)
    {
        $this->authorize('create', Venue::class);

        return (new VenueResource(Venue::create($request->validated())))->response()->setStatusCode(201);
    }

    public function show(Venue $venue)
    {
        $this->authorize('view', $venue);

        return new VenueResource($venue->loadCount('trainingSessions'));
    }

    public function update(UpdateVenueRequest $request, Venue $venue)
    {
        $this->authorize('update', $venue);
        $venue->update($request->validated());

        return new VenueResource($venue->refresh()->loadCount('trainingSessions'));
    }

    public function destroy(Venue $venue)
    {
        $this->authorize('delete', $venue);
        $venue->delete();

        return response()->json([], 204);
    }
}

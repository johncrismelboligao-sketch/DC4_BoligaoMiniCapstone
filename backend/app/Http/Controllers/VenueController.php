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

        $venues = Venue::query()
            ->withCount('trainingSessions')
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = '%'.$request->string('search')->toString().'%';
                $query->where(fn ($query) => $query->where('name', 'like', $term)
                    ->orWhere('address', 'like', $term));
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return VenueResource::collection($venues);
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

        if ($venue->trainingSessions()->exists()) {
            return response()->json([
                'message' => 'This venue cannot be deleted because it is used by training sessions.',
            ], 409);
        }

        $venue->delete();

        return response()->noContent();
    }
}

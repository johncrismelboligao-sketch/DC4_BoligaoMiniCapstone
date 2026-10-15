<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDrillRequest;
use App\Http\Requests\UpdateDrillRequest;
use App\Http\Resources\DrillResource;
use App\Models\Drill;
use Illuminate\Http\Request;

class DrillController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Drill::class);
        $drills = Drill::query()
            ->when($request->filled('search'), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))
            ->when($request->filled('category'), fn ($query) => $query->where('category', $request->query('category')))
            ->orderBy('category')->orderBy('name')->paginate(10)->withQueryString();

        return DrillResource::collection($drills);
    }

    public function store(StoreDrillRequest $request)
    {
        $this->authorize('create', Drill::class);

        return (new DrillResource(Drill::create($request->validated())))->response()->setStatusCode(201);
    }

    public function show(Drill $drill)
    {
        $this->authorize('view', $drill);

        return new DrillResource($drill);
    }

    public function update(UpdateDrillRequest $request, Drill $drill)
    {
        $this->authorize('update', $drill);
        $drill->update($request->validated());

        return new DrillResource($drill->refresh());
    }

    public function destroy(Drill $drill)
    {
        $this->authorize('delete', $drill);
        $drill->delete();

        return response()->json([], 204);
    }
}

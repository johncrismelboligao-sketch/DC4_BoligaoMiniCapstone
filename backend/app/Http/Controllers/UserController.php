<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateManagedUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()->with('team')
            ->when($request->filled('search'), fn ($query) => $query->where(function ($query) use ($request) {
                $term = '%'.$request->string('search')->toString().'%';
                $query->where('name', 'like', $term)->orWhere('email', 'like', $term);
            }))
            ->when($request->filled('role'), fn ($query) => $query->where('role', $request->query('role')))
            ->when($request->filled('team_id'), fn ($query) => $query->where('team_id', $request->query('team_id')))
            ->when($request->has('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')->paginate(10)->withQueryString();

        return UserResource::collection($users);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return new UserResource($user->load('team'));
    }

    public function update(UpdateManagedUserRequest $request, User $user)
    {
        $this->authorize('update', $user);
        $data = $request->validated();
        $user->update($data);

        if (array_key_exists('is_active', $data) && ! $user->is_active) {
            $user->tokens()->delete();
        }

        return new UserResource($user->refresh()->load('team'));
    }
}

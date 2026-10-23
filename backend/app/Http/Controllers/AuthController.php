<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $role = $request->validated('role') === 'coach' ? 'coach' : 'player';
        $user = User::create([
            ...$request->validated(),
            'role' => $role,
            'is_active' => $role === 'player',
        ]);

        $response = [
            'message' => $role === 'coach'
                ? 'Coach application submitted. An admin must approve your account before you can sign in.'
                : 'Player account created successfully.',
            'status' => $role === 'coach' ? 'pending_approval' : 'active',
            'user' => new UserResource($user->load('team')),
        ];

        if ($role === 'player') {
            $response['token'] = $user->createToken('kickoff-api')->plainTextToken;
        }

        return response()->json($response, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! $user->is_active || ! Hash::check($request->validated('password'), $user->password)) {
            return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
        }

        return response()->json([
            'message' => 'Login successful.',
            'token' => $user->createToken('kickoff-api')->plainTextToken,
            'user' => new UserResource($user->load('team')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([], 204);
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->user()->load(['team', 'coach.team']));
    }
}

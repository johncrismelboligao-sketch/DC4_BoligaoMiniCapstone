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
        $user = User::create([
            ...$request->validated(),
            'role' => 'player',
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Account created successfully.',
            'token' => $user->createToken('kickoff-api')->plainTextToken,
            'user' => new UserResource($user->load('team')),
        ], 201);
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
        return new UserResource($request->user()->load('team'));
    }
}

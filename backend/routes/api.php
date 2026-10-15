<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DrillController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TrainingSessionController;
use App\Http\Controllers\TrainingSessionStatusController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::apiResource('sessions', TrainingSessionController::class)->only(['index', 'show']);
    Route::post('/sessions', [TrainingSessionController::class, 'store'])->middleware('role:admin,coach');
    Route::put('/sessions/{session}', [TrainingSessionController::class, 'update'])->middleware('role:admin,coach');
    Route::patch('/sessions/{session}', [TrainingSessionController::class, 'update'])->middleware('role:admin,coach');
    Route::delete('/sessions/{session}', [TrainingSessionController::class, 'destroy'])->middleware('role:admin');

    Route::apiResource('drills', DrillController::class)->only(['index', 'show']);
    Route::post('/drills', [DrillController::class, 'store'])->middleware('role:admin');
    Route::put('/drills/{drill}', [DrillController::class, 'update'])->middleware('role:admin');
    Route::patch('/drills/{drill}', [DrillController::class, 'update'])->middleware('role:admin');
    Route::delete('/drills/{drill}', [DrillController::class, 'destroy'])->middleware('role:admin');

    Route::apiResource('venues', VenueController::class)->only(['index', 'show']);
    Route::post('/venues', [VenueController::class, 'store'])->middleware('role:admin');
    Route::put('/venues/{venue}', [VenueController::class, 'update'])->middleware('role:admin');
    Route::patch('/venues/{venue}', [VenueController::class, 'update'])->middleware('role:admin');
    Route::delete('/venues/{venue}', [VenueController::class, 'destroy'])->middleware('role:admin');

    Route::apiResource('teams', TeamController::class)->only(['index', 'show']);
    Route::post('/teams', [TeamController::class, 'store'])->middleware('role:admin');
    Route::put('/teams/{team}', [TeamController::class, 'update'])->middleware('role:admin');
    Route::patch('/teams/{team}', [TeamController::class, 'update'])->middleware('role:admin');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->middleware('role:admin');

    Route::get('/users', [UserController::class, 'index'])->middleware('role:admin');
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware('role:admin');
    Route::patch('/users/{user}', [UserController::class, 'update'])->middleware('role:admin');

    Route::get('/registrations', [RegistrationController::class, 'index']);
    Route::post('/sessions/{session}/register', [RegistrationController::class, 'register'])->middleware('role:player');
    Route::delete('/sessions/{session}/register', [RegistrationController::class, 'cancel'])->middleware('role:player');
    Route::patch('/registrations/{registration}/status', [RegistrationController::class, 'updateStatus']);
    Route::patch('/registrations/{registration}/attendance', [RegistrationController::class, 'updateAttendance']);
    Route::patch('/sessions/{session}/status', [TrainingSessionStatusController::class, '__invoke']);
    Route::get('/dashboard', DashboardController::class);
});

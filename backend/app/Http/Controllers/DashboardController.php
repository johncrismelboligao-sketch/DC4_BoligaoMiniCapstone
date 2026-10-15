<?php

namespace App\Http\Controllers;

use App\Http\Resources\TrainingSessionResource;
use App\Models\Registration;
use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $sessions = TrainingSession::query();
        $registrations = Registration::query();

        if ($user->role === 'coach') {
            $sessions->where('coach_id', $user->id);
            $registrations->whereHas('trainingSession', fn ($query) => $query->where('coach_id', $user->id));
            $activePlayers = User::query()->where('role', 'player')->where('is_active', true)
                ->whereHas('trainingSessions', fn ($query) => $query->where('coach_id', $user->id))->distinct()->count('users.id');
        } elseif ($user->role === 'player') {
            $sessions->where('team_id', $user->team_id);
            $registrations->where('user_id', $user->id);
            $activePlayers = User::query()->where('role', 'player')->where('is_active', true)->where('team_id', $user->team_id)->count();
        } else {
            $activePlayers = User::query()->where('role', 'player')->where('is_active', true)->count();
        }

        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();
        $pastSessions = (clone $sessions)->whereDate('session_date', '<=', today())->count();
        $completedSessions = (clone $sessions)->whereDate('session_date', '<=', today())->where('status', 'completed')->count();

        $attendancePerWeek = collect(range(5, 0))->map(function (int $weeksAgo) use ($registrations) {
            $start = Carbon::now()->startOfWeek()->subWeeks($weeksAgo);
            $end = $start->copy()->endOfWeek();
            $weekly = (clone $registrations)->where('status', 'approved')->whereHas('trainingSession', fn ($query) => $query->whereBetween('session_date', [$start->toDateString(), $end->toDateString()]));
            $total = (clone $weekly)->count();

            return [
                'week_start' => $start->toDateString(),
                'attended' => (clone $weekly)->where('attended', true)->count(),
                'registered' => $total,
            ];
        });

        $upcoming = (clone $sessions)->where('status', 'scheduled')->whereDate('session_date', '>=', today())
            ->with(['coach', 'venue', 'team', 'drills'])->orderBy('session_date')->orderBy('start_time')->limit(5)->get();

        return response()->json([
            'sessions_this_week' => (clone $sessions)->whereBetween('session_date', [$weekStart->toDateString(), $weekEnd->toDateString()])->count(),
            'pending_registrations' => (clone $registrations)->where('status', 'pending')->count(),
            'active_players' => $activePlayers,
            'completion_rate' => $pastSessions === 0 ? 0 : round(($completedSessions / $pastSessions) * 100, 1),
            'upcoming_sessions' => TrainingSessionResource::collection($upcoming),
            'attendance_per_week' => $attendancePerWeek,
        ]);
    }
}

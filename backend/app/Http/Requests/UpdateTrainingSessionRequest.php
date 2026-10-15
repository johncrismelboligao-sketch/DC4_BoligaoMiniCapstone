<?php

namespace App\Http\Requests;

use App\Models\TrainingSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTrainingSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $session = $this->route('session');
        $startTimeRule = $this->has('start_time')
            ? 'after:start_time'
            : 'after:'.substr($session instanceof TrainingSession ? $session->start_time : '00:00', 0, 5);

        return [
            'title' => ['sometimes', 'required', 'string', 'max:160'],
            'description' => ['sometimes', 'nullable', 'string'],
            'session_date' => ['sometimes', 'required', 'date'],
            'start_time' => ['sometimes', 'required', 'date_format:H:i'],
            'end_time' => ['sometimes', 'required', 'date_format:H:i', $startTimeRule],
            'max_players' => ['sometimes', 'required', 'integer', 'min:1', 'max:100'],
            'coach_id' => ['sometimes', 'required', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'coach')->where('is_active', true))],
            'venue_id' => ['sometimes', 'required', 'integer', Rule::exists('venues', 'id')],
            'team_id' => ['sometimes', 'required', 'integer', Rule::exists('teams', 'id')],
            'drills' => ['sometimes', 'array'],
            'drills.*' => ['integer', 'distinct', Rule::exists('drills', 'id')],
        ];
    }
}

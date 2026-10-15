<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTrainingSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string'],
            'session_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'max_players' => ['required', 'integer', 'min:1', 'max:100'],
            'coach_id' => [Rule::requiredIf(fn () => $this->user()?->role === 'admin'), 'nullable', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'coach')->where('is_active', true))],
            'venue_id' => ['required', 'integer', Rule::exists('venues', 'id')],
            'team_id' => ['required', 'integer', Rule::exists('teams', 'id')],
            'drills' => ['sometimes', 'array'],
            'drills.*' => ['integer', 'distinct', Rule::exists('drills', 'id')],
        ];
    }
}

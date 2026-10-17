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
        return [
            'title' => ['sometimes', 'required', 'string', 'max:160'],
            'description' => ['sometimes', 'nullable', 'string'],
            'session_date' => ['sometimes', 'required', 'date'],
            'start_time' => ['sometimes', 'required', 'date_format:H:i'],
            'end_time' => ['sometimes', 'required', 'date_format:H:i'],
            'max_players' => ['sometimes', 'required', 'integer', 'min:1', 'max:100'],
            'coach_id' => ['sometimes', 'required', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'coach')->where('is_active', true))],
            'venue_id' => ['sometimes', 'required', 'integer', Rule::exists('venues', 'id')],
            'team_id' => ['sometimes', 'required', 'integer', Rule::exists('teams', 'id')],
            'drills' => ['sometimes', 'array'],
            'drills.*' => ['integer', 'distinct', Rule::exists('drills', 'id')],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $session = $this->route('session');

            if (!$session instanceof TrainingSession) {
                return;
            }

            if (
                $validator->errors()->has('start_time') ||
                $validator->errors()->has('end_time')
            ) {
                return;
            }

            $start = $this->input('start_time', substr($session->start_time, 0, 5));
            $end = $this->input('end_time', substr($session->end_time, 0, 5));

            if ($end <= $start) {
                $validator->errors()->add('end_time', 'End time must be after start time.');
            }
        });
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterForSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $session = $this->route('session');

        return [
            'remarks' => ['nullable', 'string', 'max:1000'],
            'drills' => ['required', 'array', 'min:1', 'max:10'],
            'drills.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('drill_training_session', 'drill_id')
                    ->where(fn ($query) => $query->where('training_session_id', $session->id)),
            ],
        ];
    }
}

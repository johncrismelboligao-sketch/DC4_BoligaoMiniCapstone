<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplyToCoachRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'player';
    }

    public function rules(): array
    {
        return [
            'coach_id' => ['required', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'coach')->where('is_active', true))],
        ];
    }
}

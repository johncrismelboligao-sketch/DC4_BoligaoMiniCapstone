<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateManagedUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'required', Rule::in(['admin', 'coach', 'player'])],
            'team_id' => ['sometimes', 'nullable', 'integer', Rule::exists('teams', 'id')],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ];
    }
}

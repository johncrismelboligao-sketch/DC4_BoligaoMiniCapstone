<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDrillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('drills', 'name')->where(
                    fn ($query) => $query->where('category', $this->input('category'))
                ),
            ],
            'category' => ['required', Rule::in(['passing', 'dribbling', 'shooting', 'fitness', 'defending'])],
            'description' => ['nullable', 'string'],
            'default_minutes' => ['required', 'integer', 'min:1', 'max:180'],
        ];
    }
}

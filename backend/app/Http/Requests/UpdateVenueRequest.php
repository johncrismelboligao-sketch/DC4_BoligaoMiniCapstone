<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVenueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120', Rule::unique('venues', 'name')->ignore($this->route('venue')?->id ?? $this->route('venue'))],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'capacity' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:65535'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDrillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $drillId = $this->route('drill')?->id ?? $this->route('drill');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120', Rule::unique('drills', 'name')->where(fn ($query) => $query->where('category', $this->input('category', $this->route('drill')?->category)))->ignore($drillId)],
            'category' => ['sometimes', 'required', Rule::in(['passing', 'dribbling', 'shooting', 'fitness', 'defending'])],
            'description' => ['sometimes', 'nullable', 'string'],
            'default_minutes' => ['sometimes', 'required', 'integer', 'min:1', 'max:180'],
        ];
    }
}

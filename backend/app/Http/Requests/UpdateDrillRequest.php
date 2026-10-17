<?php

namespace App\Http\Requests;

use App\Models\Drill;
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
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'category' => ['sometimes', 'required', Rule::in(['passing', 'dribbling', 'shooting', 'fitness', 'defending'])],
            'description' => ['sometimes', 'nullable', 'string'],
            'default_minutes' => ['sometimes', 'required', 'integer', 'min:1', 'max:180'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $drill = $this->route('drill');
            if (! $drill instanceof Drill) {
                return;
            }

            $name = $this->input('name', $drill->name);
            $category = $this->input('category', $drill->category);

            $duplicate = Drill::query()
                ->where('name', $name)
                ->where('category', $category)
                ->where('id', '!=', $drill->id)
                ->exists();

            if ($duplicate) {
                $validator->errors()->add(
                    'category',
                    'A drill with this name and category already exists.'
                );
            }
        });
    }
}

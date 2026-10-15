<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80', 'unique:teams,name'],
            'division' => ['nullable', 'string', 'max:30'],
            'description' => ['nullable', 'string'],
        ];
    }
}

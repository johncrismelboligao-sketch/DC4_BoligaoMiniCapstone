<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'position' => $this->position,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'team_id' => $this->team_id,
            'is_active' => $this->is_active,
            'team' => new TeamResource($this->whenLoaded('team')),
        ];
    }
}

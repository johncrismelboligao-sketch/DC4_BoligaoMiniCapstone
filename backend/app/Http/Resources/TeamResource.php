<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'division' => $this->division,
            'description' => $this->description,
            'players_count' => $this->whenCounted('users'),
            'sessions_count' => $this->whenCounted('trainingSessions'),
        ];
    }
}

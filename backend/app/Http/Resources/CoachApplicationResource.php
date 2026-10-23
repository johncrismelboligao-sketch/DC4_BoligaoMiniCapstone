<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoachApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'player' => new UserResource($this->whenLoaded('player')),
            'coach' => new UserResource($this->whenLoaded('coach')),
        ];
    }
}

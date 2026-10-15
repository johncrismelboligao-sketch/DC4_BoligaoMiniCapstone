<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'session_date' => $this->session_date?->toDateString(),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'max_players' => $this->max_players,
            'coach' => new UserResource($this->whenLoaded('coach')),
            'venue' => new VenueResource($this->whenLoaded('venue')),
            'team' => new TeamResource($this->whenLoaded('team')),
            'drills' => DrillResource::collection($this->whenLoaded('drills')),
            'registrations_count' => $this->whenCounted('registrations'),
        ];
    }
}

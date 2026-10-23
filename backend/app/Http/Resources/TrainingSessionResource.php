<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $myRegistration = $this->relationLoaded('registrations') ? $this->registrations->first() : null;
        // Players only reach this resource for sessions assigned to their team and coach.
        // Let them see the coach's planned drills so they can choose from that plan when applying.
        $canViewDrills = true;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'session_date' => $this->session_date?->toDateString(),
            'start_time' => substr((string) $this->start_time, 0, 5),
            'end_time' => substr((string) $this->end_time, 0, 5),
            'status' => $this->status,
            'max_players' => $this->max_players,
            'coach' => new UserResource($this->whenLoaded('coach')),
            'venue' => new VenueResource($this->whenLoaded('venue')),
            'team' => new TeamResource($this->whenLoaded('team')),
            'focus_areas' => $this->whenLoaded('drills', fn ($drills) => $drills->pluck('category')->unique()->values()),
            'drills' => $canViewDrills ? DrillResource::collection($this->whenLoaded('drills')) : [],
            'my_registration' => $this->when($this->relationLoaded('registrations'), $myRegistration ? [
                'id' => $myRegistration->id,
                'status' => $myRegistration->status,
                'requested_drills' => $myRegistration->relationLoaded('requestedDrills')
                    ? $myRegistration->requestedDrills->map(fn ($drill) => [
                        'id' => $drill->id,
                        'name' => $drill->name,
                        'category' => $drill->category,
                        'default_minutes' => $drill->default_minutes,
                    ])->values()
                    : [],
            ] : null),
            'registrations_count' => $this->whenCounted('registrations'),
        ];
    }
}

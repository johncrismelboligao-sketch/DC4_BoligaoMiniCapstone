<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DrillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'default_minutes' => $this->default_minutes,
            'pivot' => $this->whenPivotLoaded('drill_training_session', fn () => [
                'sort_order' => $this->pivot->sort_order,
                'minutes' => $this->pivot->minutes,
            ]),
        ];
    }
}

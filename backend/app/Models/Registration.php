<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'training_session_id', 'status', 'attended', 'remarks'];

    protected function casts(): array
    {
        return ['attended' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trainingSession(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class);
    }

    public function requestedDrills(): BelongsToMany
    {
        return $this->belongsToMany(Drill::class, 'registration_drill_requests')->withTimestamps();
    }
}

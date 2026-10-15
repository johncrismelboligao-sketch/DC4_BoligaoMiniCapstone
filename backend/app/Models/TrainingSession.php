<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'description', 'session_date', 'start_time', 'end_time',
        'status', 'max_players', 'coach_id', 'venue_id', 'team_id',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
            'max_players' => 'integer',
        ];
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function drills(): BelongsToMany
    {
        return $this->belongsToMany(Drill::class)
            ->withPivot(['sort_order', 'minutes'])
            ->withTimestamps();
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'registrations')
            ->withPivot(['status', 'attended', 'remarks'])
            ->withTimestamps();
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }
}

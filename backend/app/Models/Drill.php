<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Drill extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category', 'description', 'default_minutes'];

    protected function casts(): array
    {
        return ['default_minutes' => 'integer'];
    }

    public function trainingSessions(): BelongsToMany
    {
        return $this->belongsToMany(TrainingSession::class)
            ->withPivot(['sort_order', 'minutes'])
            ->withTimestamps();
    }
}

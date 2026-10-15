<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drill_training_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('drill_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->unsignedSmallInteger('minutes')->default(15);
            $table->timestamps();
            $table->unique(['training_session_id', 'drill_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drill_training_session');
    }
};

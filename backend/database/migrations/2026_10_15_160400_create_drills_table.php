<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drills', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->enum('category', ['passing', 'dribbling', 'shooting', 'fitness', 'defending'])->index();
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('default_minutes')->default(15);
            $table->timestamps();
            $table->unique(['name', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drills');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listing_virtual_tour_links', function (Blueprint $table) {
            $table->id();
            // The scene the hotspot is placed IN.
            $table->foreignId('scene_id')->constrained('listing_virtual_tour_scenes')->cascadeOnDelete();
            // The scene it jumps TO when clicked.
            $table->foreignId('target_scene_id')->constrained('listing_virtual_tour_scenes')->cascadeOnDelete();
            // Where on the sphere the hotspot sits, in radians — set by the
            // vendor clicking the exact spot (e.g. a doorway) in the editor.
            $table->float('yaw');
            $table->float('pitch');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_virtual_tour_links');
    }
};

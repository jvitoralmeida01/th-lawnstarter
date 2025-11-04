<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('query_events', function (Blueprint $table) {
            $table->id();
            $table->timestampTz('occurred_at')->default(DB::raw('now()'));
            $table->text('path')->comment('Example: "/films", "/films/1", "/people/3"');
            $table->text('route')->comment('Normalized template, Example: "/films", "/films/:id", "/people/:id"');
            $table->integer('ms')->comment('latency in ms');
            $table->text('source')->default('starwars');
            $table->smallInteger('hour_of_day')->comment('Hour extracted from occurred_at');
        });

        // Create BRIN index for time-series queries
        DB::statement('CREATE INDEX qe_occurred_at_brin ON query_events USING BRIN (occurred_at)');

        // Create B-tree indexes for efficient filtering and grouping
        DB::statement('CREATE INDEX qe_route_btree ON query_events (route)');
        DB::statement('CREATE INDEX qe_hour_btree ON query_events (hour_of_day)');
        DB::statement('CREATE INDEX qe_route_time ON query_events (route, occurred_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('query_events');
    }
};


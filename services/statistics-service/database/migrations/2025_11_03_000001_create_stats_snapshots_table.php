<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stats_snapshots', function (Blueprint $table) {
            $table->id();
            $table->timestampTz('computed_at')->default(DB::raw('now()'));
            $table->timestampTz('window_start')->comment('e.g., now() - interval \'24 hours\' (or whatever window you choose)');
            $table->timestampTz('window_end')->comment('usually now()');
            $table->integer('sample_size')->comment('#events used');
            $table->decimal('avg_ms', 12, 3)->comment('overall avg latency');
            $table->smallInteger('popular_hour')->comment('0..23');
            $table->integer('popular_hour_count')->comment('number of requests in the popular hour');
            $table->jsonb('top_queries')->comment('[{route:"/films", pct:0.34, count:123}, ... up to 5]');
        });

        // Create index for efficient retrieval of latest snapshots
        DB::statement('CREATE INDEX ss_computed_at ON stats_snapshots (computed_at DESC)');
    }

    public function down(): void
    {
        Schema::dropIfExists('stats_snapshots');
    }
};


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatsSnapshot extends Model
{
    protected $table = 'stats_snapshots';

    public $timestamps = false;

    protected $fillable = [
        'computed_at',
        'window_start',
        'window_end',
        'sample_size',
        'avg_ms',
        'popular_hour',
        'popular_hour_count',
        'top_queries',
    ];

    protected $casts = [
        'computed_at' => 'datetime',
        'window_start' => 'datetime',
        'window_end' => 'datetime',
        'sample_size' => 'integer',
        'avg_ms' => 'decimal:3',
        'popular_hour' => 'integer',
        'popular_hour_count' => 'integer',
        'top_queries' => 'array',
    ];

    /**
     * Get the latest snapshot
     */
    public static function latest(): ?self
    {
        return self::orderBy('computed_at', 'desc')->first();
    }
}


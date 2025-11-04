<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueryEvent extends Model
{
    protected $table = 'query_events';

    public $timestamps = false;

    protected $fillable = [
        'occurred_at',
        'path',
        'route',
        'ms',
        'source',
        'hour_of_day',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'ms' => 'integer',
        'hour_of_day' => 'integer',
    ];
}


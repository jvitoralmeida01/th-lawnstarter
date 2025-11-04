<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StatisticsController;

Route::prefix('api')->group(function () {
    Route::get('/top-queries', [StatisticsController::class, 'topQueries']);
    Route::get('/average-request-time', [StatisticsController::class, 'averageRequestTime']);
    Route::get('/popular-time', [StatisticsController::class, 'popularTime']);
});


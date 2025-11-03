<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FilmsController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\StatisticsController;

// Starwars endpoints
Route::prefix('starwars')->group(function () {
    Route::get('/films/{id}', [FilmsController::class, 'show']);
    Route::get('/people/{id}', [PeopleController::class, 'show']);
    Route::get('/search', [SearchController::class, 'search']);
});

// Statistics endpoint
Route::get('/statistics', [StatisticsController::class, 'index']);


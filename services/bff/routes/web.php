<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

$sw = env('STARWARS_BASE');
$stats = env('STATISTICS_BASE');

// Starwars Service
Route::get('/starwars/films', fn() =>
    Cache::remember('bff:films', 30, fn() => Http::get("$sw/films")->json())
);
Route::get('/starwars/films/{id}', fn($id) =>
    Cache::remember("bff:films:$id", 30, fn() => Http::get("$sw/films/$id")->json())
);
Route::get('/starwars/people', fn() =>
    Cache::remember('bff:people', 30, fn() => Http::get("$sw/people")->json())
);
Route::get('/starwars/people/{id}', fn($id) =>
    Cache::remember("bff:people:$id", 30, fn() => Http::get("$sw/people/$id")->json())
);

// Stats Service
Route::get('/stats/top-queries', fn() => Http::get("$stats/top-queries")->json());
Route::get('/stats/average-request-time', fn() => Http::get("$stats/average-request-time")->json());
Route::get('/stats/popular-time', fn() => Http::get("$stats/popular-time")->json());


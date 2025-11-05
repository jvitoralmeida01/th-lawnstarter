<?php

namespace App\Providers;

use App\Application\Ports\CacheRepository;
use App\Application\Ports\StarWarsRepository;
use App\Application\Ports\StatisticsRepository;
use App\Application\UseCases\GetFilmUseCase;
use App\Application\UseCases\GetPersonUseCase;
use App\Application\UseCases\GetStatisticsUseCase;
use App\Application\UseCases\SearchUseCase;
use App\Infrastructure\Repositories\HttpStarWarsRepository;
use App\Infrastructure\Repositories\HttpStatisticsRepository;
use App\Infrastructure\Repositories\RedisCacheRepository;
use App\Services\ResponseTransformer;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind ports to implementations
        $this->app->singleton(CacheRepository::class, RedisCacheRepository::class);
        $this->app->singleton(StarWarsRepository::class, HttpStarWarsRepository::class);
        $this->app->singleton(StatisticsRepository::class, HttpStatisticsRepository::class);

        // Bind use cases
        $this->app->singleton(GetFilmUseCase::class, function ($app) {
            return new GetFilmUseCase(
                $app->make(StarWarsRepository::class),
                $app->make(ResponseTransformer::class)
            );
        });

        $this->app->singleton(GetPersonUseCase::class, function ($app) {
            return new GetPersonUseCase(
                $app->make(StarWarsRepository::class),
                $app->make(ResponseTransformer::class)
            );
        });

        $this->app->singleton(SearchUseCase::class, function ($app) {
            return new SearchUseCase(
                $app->make(StarWarsRepository::class),
                $app->make(ResponseTransformer::class)
            );
        });

        $this->app->singleton(GetStatisticsUseCase::class, function ($app) {
            return new GetStatisticsUseCase(
                $app->make(StatisticsRepository::class),
                $app->make(ResponseTransformer::class)
            );
        });

        // Keep ResponseTransformer as singleton
        $this->app->singleton(ResponseTransformer::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

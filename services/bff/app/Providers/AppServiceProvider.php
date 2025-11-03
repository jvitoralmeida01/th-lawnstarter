<?php

namespace App\Providers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;

// @TODO: Remove this once the upstream services are implemented

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\CacheService::class);
        $this->app->singleton(\App\Services\ResponseTransformer::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Mock upstream HTTP responses
        Http::fake(function ($request) {
            $url = $request->url();

            // Mock /people/1 response
            if (str_contains($url, '/people/1')) {
                return Http::response([
                    'message' => 'Person retrieved successfully',
                    'result' => [
                        'id' => '1',
                        'name' => 'Luke Skywalker',
                        'gender' => 'male',
                        'skinColor' => 'fair',
                        'hairColor' => 'blond',
                        'height' => '172',
                        'eyeColor' => 'blue',
                        'mass' => '77',
                        'homeworld' => 'https://www.swapi.tech/api/planets/1',
                        'birthYear' => '19BBY',
                        'films' => [
                            [
                                'id' => '1',
                                'name' => 'A New Hope'
                            ],
                            [
                                'id' => '2',
                                'name' => 'The Empire Strikes Back'
                            ],
                            [
                                'id' => '3',
                                'name' => 'Return of the Jedi'
                            ]
                        ]
                    ]
                ], 200);
            }

            // Mock /api/films/1 response
            if (str_contains($url, '/api/films/1')) {
                return Http::response([
                    'message' => 'Film retrieved successfully',
                    'result' => [
                        'id' => '1',
                        'title' => 'A New Hope',
                        'openingCrawl' => "It is a period of civil war.\r\nRebel spaceships, striking\r\nfrom a hidden base, have won\r\ntheir first victory against\r\nthe evil Galactic Empire.\r\n\r\nDuring the battle, Rebel\r\nspies managed to steal secret\r\nplans to the Empire's\r\nultimate weapon, the DEATH\r\nSTAR, an armored space\r\nstation with enough power\r\nto destroy an entire planet.\r\n\r\nPursued by the Empire's\r\nsinister agents, Princess\r\nLeia races home aboard her\r\nstarship, custodian of the\r\nstolen plans that can save her\r\npeople and restore\r\nfreedom to the galaxy....",
                        'characters' => [
                            [
                                'id' => '1',
                                'name' => 'Luke Skywalker'
                            ],
                            [
                                'id' => '2',
                                'name' => 'Princess Leia Organa'
                            ],
                            [
                                'id' => '3',
                                'name' => 'Han Solo'
                            ]
                        ]
                    ]
                ], 200);
            }

            // Mock /api/search response (for query=H&entityTypes=people,films)
            if (str_contains($url, '/api/search')) {
                return Http::response([
                    'message' => 'Search results retrieved successfully',
                    'result' => [
                        [
                            'id' => '1',
                            'name' => 'Han Solo',
                            'entityType' => 'people'
                        ],
                        [
                            'id' => '1',
                            'name' => 'A New Hope',
                            'entityType' => 'films'
                        ],
                        [
                            'id' => '2',
                            'name' => 'Chewbacca',
                            'entityType' => 'people'
                        ]
                    ]
                ], 200);
            }

            // Mock /api/top-queries response
            if (str_contains($url, '/api/top-queries')) {
                return Http::response([
                    'message' => 'Top queries retrieved successfully',
                    'result' => [
                        [
                            'query' => 'api/starwars/people/1/',
                            'percentage' => 52
                        ],
                        [
                            'query' => 'api/starwars/people/1/',
                            'percentage' => 23
                        ],
                        [
                            'query' => 'A New Hope',
                            'percentage' => 15
                        ],
                        [
                            'query' => 'The Empire Strikes Back',
                            'percentage' => 8
                        ],
                        [
                            'query' => 'Return of the Jedi',
                            'percentage' => 1
                        ]
                    ]
                ], 200);
            }

            // Mock /api/average-request-time response
            if (str_contains($url, '/api/average-request-time')) {
                return Http::response([
                    'message' => 'Average request time retrieved successfully',
                    'result' => [
                        'averageTimeMs' => 100
                    ]
                ], 200);
            }

            // Mock /api/popular-time response
            if (str_contains($url, '/api/popular-time')) {
                return Http::response([
                    'message' => 'Popular time retrieved successfully',
                    'result' => [
                        'hour' => '12:00',
                        'requestCount' => 100
                    ]
                ], 200);
            }

            // Return null to allow other requests to pass through (or you can return a default response)
            return Http::response(['error' => 'Not mocked'], 404);
        });
    }
}

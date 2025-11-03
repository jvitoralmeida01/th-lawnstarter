<?php

namespace App\Services;

class ResponseTransformer
{
    public function transformFilm(array $film): array
    {
        return [
          'id' => $film['id'],
          'name' => $film['title'],
          'openingCrawl' => $film['openingCrawl'],
          'characters' => $film['characters'],
        ];
    }

    public function transformPerson(array $person): array
    {
        return $person;
    }

    public function transformSearchResults(array $results): array
    {
        return $results;
    }

    public function transformStatistics(array $topQueriesResponse, array $averageRequestTimeResponse, array $popularTimeResponse): array
    {
        return [
            'topQueries' => $topQueriesResponse,
            'averageRequestTime' => $averageRequestTimeResponse,
            'popularTime' => $popularTimeResponse,
        ];
    }
}


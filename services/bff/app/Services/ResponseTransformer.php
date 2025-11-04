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
        // From decimal percentage to integer percentage
        $topQueriesResponse['result'] = array_map(function($query) {
            $query['percentage'] = (string) (int) ($query['percentage'] * 100);
            return $query;
        }, $topQueriesResponse['result']);

        // Remove decimal places from average request time
        $averageRequestTimeResponse['result']['averageTimeMs'] = "≈ ".(int) $averageRequestTimeResponse['result']['averageTimeMs']." ms";

        // Remove decimal places from popular time
        $popularTimeResponse['result']['hour'] = (string) $popularTimeResponse['result']['hour'].":00 to ".($popularTimeResponse['result']['hour'] + 1).":00";
        $popularTimeResponse['result']['requestCount'] = (string) $popularTimeResponse['result']['requestCount'];

        return [
            'topQueries' => $topQueriesResponse,
            'averageRequestTime' => $averageRequestTimeResponse,
            'popularTime' => $popularTimeResponse,
        ];
    }
}


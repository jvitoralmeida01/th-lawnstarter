<?php

namespace App\Http\Controllers;

use App\Application\UseCases\SearchUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(
        private SearchUseCase $searchUseCase
    ) {}

    public function search(Request $request): JsonResponse
    {
        if (empty($request->query('query'))) {
            return response()->json([
                'message' => 'Query is required',
            ], 400);
        }

        if (empty($request->query('entityTypes'))) {
            return response()->json([
                'message' => 'Entity types are required',
            ], 400);
        }

        $query = $request->query('query');
        $entityTypes = is_array($request->query('entityTypes'))
            ? implode(',', $request->query('entityTypes'))
            : $request->query('entityTypes');

        $result = $this->searchUseCase->execute($query, $entityTypes);

        $response = response()->json($result['body']);

        foreach ($result['headers'] as $name => $value) {
            $response->header($name, $value);
        }

        return $response;
    }
}


<?php

namespace App\Http\Controllers;

use App\Application\UseCases\GetStatisticsUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    public function __construct(
        private GetStatisticsUseCase $getStatisticsUseCase
    ) {}

    public function index(Request $request): JsonResponse
    {
        $result = $this->getStatisticsUseCase->execute();

        $response = response()->json($result['body']);

        foreach ($result['headers'] as $name => $value) {
            $response->header($name, $value);
        }

        return $response;
    }
}


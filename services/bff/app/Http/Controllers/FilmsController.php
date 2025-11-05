<?php

namespace App\Http\Controllers;

use App\Application\UseCases\GetFilmUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FilmsController extends Controller
{
    public function __construct(
        private GetFilmUseCase $getFilmUseCase
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        if (empty($id)) {
            return response()->json([
                'message' => 'Film ID is required',
            ], 400);
        }

        $result = $this->getFilmUseCase->execute($id);

        $response = response()->json($result['body']);

        foreach ($result['headers'] as $name => $value) {
            $response->header($name, $value);
        }

        return $response;
    }
}


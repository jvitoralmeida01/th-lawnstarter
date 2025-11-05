<?php

namespace App\Http\Controllers;

use App\Application\UseCases\GetPersonUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeopleController extends Controller
{
    public function __construct(
        private GetPersonUseCase $getPersonUseCase
    ) {}

    public function show(Request $request, string $id): JsonResponse
    {
        if (empty($id)) {
            return response()->json([
                'message' => 'Person ID is required',
            ], 400);
        }

        $result = $this->getPersonUseCase->execute($id);

        $response = response()->json($result['body']);

        foreach ($result['headers'] as $name => $value) {
            $response->header($name, $value);
        }

        return $response;
    }
}


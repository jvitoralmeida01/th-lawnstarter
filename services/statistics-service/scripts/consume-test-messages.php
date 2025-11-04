#!/usr/bin/env php
<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\RabbitMQConsumerService;
use App\Services\StatisticsRollupService;

$consumerService = app(RabbitMQConsumerService::class);
$rollupService = app(StatisticsRollupService::class);

$queueName = config('services.rabbitmq.queue', env('RABBITMQ_QUEUE', 'query-events'));

echo "Consuming events from queue: {$queueName}\n";
echo "Timeout: 5 seconds (for testing)\n\n";

$result = $consumerService->consumeBatch($queueName, 100, 5);

echo "\nConsumed {$result['processed']} events\n";

if ($result['processed'] > 0) {
    echo "\nComputing statistics rollup...\n";
    try {
        $rollupService->rollupStatistics();
        echo "Statistics rollup completed successfully!\n";
    } catch (\Exception $e) {
        echo "Error during rollup: " . $e->getMessage() . "\n";
    }
} else {
    echo "\nNo messages to process. Publish some messages first:\n";
    echo "  docker-compose exec statistics php publish-test-messages.php\n";
}


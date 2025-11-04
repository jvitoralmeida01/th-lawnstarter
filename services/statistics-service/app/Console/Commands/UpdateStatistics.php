<?php

namespace App\Console\Commands;

use App\Services\RabbitMQConsumerService;
use App\Services\StatisticsRollupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateStatistics extends Command
{
    protected $signature = 'statistics:update';
    protected $description = 'Consume query events from RabbitMQ and update the statistics';

    public function handle(RabbitMQConsumerService $consumerService, StatisticsRollupService $rollupService): int
    {
        $this->info('Starting statistics update process...');

        try {
            // First, consume any pending events from RabbitMQ
            $queueName = config('services.rabbitmq.queue', env('RABBITMQ_QUEUE', 'query-events'));

            $this->info("Consuming events from queue: {$queueName}");

            // Consume events in batches and store them (timeout after 4 minutes to leave time for rollup)
            $result = $consumerService->consumeBatch($queueName, 100, 240);

            $this->info("Consumed {$result['processed']} events from RabbitMQ");

            // After consuming events, run the rollup to compute statistics
            $this->info('Computing statistics rollup...');
            $rollupService->rollupStatistics();

            $this->info('Statistics update completed successfully');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error during statistics update: ' . $e->getMessage());
            Log::error('Statistics update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Command::FAILURE;
        }
    }
}


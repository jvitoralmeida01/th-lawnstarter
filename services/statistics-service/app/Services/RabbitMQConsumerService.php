<?php

namespace App\Services;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use App\Models\QueryEvent;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class RabbitMQConsumerService
{
    private ?AMQPStreamConnection $connection = null;
    private $channel = null;

    public function connect(): void
    {
        $host = config('services.rabbitmq.host', env('RABBITMQ_HOST', '127.0.0.1'));
        $port = config('services.rabbitmq.port', env('RABBITMQ_PORT', 5672));
        $user = config('services.rabbitmq.user', env('RABBITMQ_USER', 'guest'));
        $password = config('services.rabbitmq.password', env('RABBITMQ_PASS', 'guest'));
        $vhost = config('services.rabbitmq.vhost', env('RABBITMQ_VHOST', '/'));

        $this->connection = new AMQPStreamConnection($host, $port, $user, $password, $vhost);
        $this->channel = $this->connection->channel();
    }

    public function consume(string $queueName, callable $callback): void
    {
        if (!$this->channel) {
            $this->connect();
        }

        $this->channel->queue_declare($queueName, false, true, false, false);

        $processedCallback = function (AMQPMessage $msg) use ($callback) {
            try {
                $data = json_decode($msg->getBody(), true);

                if (!$data) {
                    Log::warning('Invalid JSON message received from RabbitMQ', ['body' => $msg->getBody()]);
                    $msg->ack();
                    return;
                }

                $callback($data);
                $msg->ack();
            } catch (\Exception $e) {
                Log::error('Error processing RabbitMQ message', [
                    'error' => $e->getMessage(),
                    'body' => $msg->getBody(),
                ]);
                // Acknowledge anyway to prevent infinite retries of bad messages
                $msg->ack();
            }
        };

        $this->channel->basic_qos(null, 1, null);
        $this->channel->basic_consume($queueName, '', false, false, false, false, $processedCallback);

        while ($this->channel->is_consuming()) {
            $this->channel->wait();
        }
    }

    public function consumeBatch(string $queueName, int $batchSize, int $timeoutSeconds = 60): array
    {
        if (!$this->channel) {
            $this->connect();
        }

        $this->channel->queue_declare($queueName, false, true, false, false);

        $batch = [];
        $startTime = time();
        $processedCount = 0;

        $processedCallback = function (AMQPMessage $msg) use (&$batch, &$processedCount, $batchSize) {
            try {
                $data = json_decode($msg->getBody(), true);

                if (!$data) {
                    Log::warning('Invalid JSON message received from RabbitMQ', ['body' => $msg->getBody()]);
                    $msg->ack();
                    return;
                }

                $batch[] = $data;
                $processedCount++;
                $msg->ack();

                if (count($batch) >= $batchSize) {
                    $this->storeQueryEventsBatch($batch);
                    $batch = [];
                }
            } catch (\Exception $e) {
                Log::error('Error processing RabbitMQ message', [
                    'error' => $e->getMessage(),
                    'body' => $msg->getBody(),
                ]);
                $msg->ack();
            }
        };

        $this->channel->basic_qos(null, $batchSize, null);
        $this->channel->basic_consume($queueName, '', false, false, false, false, $processedCallback);

        // Consume messages until timeout or no more messages
        while ($this->channel->is_consuming()) {
            $timeRemaining = $timeoutSeconds - (time() - $startTime);

            if ($timeRemaining <= 0) {
                break;
            }

            try {
                // Wait for messages with timeout
                $this->channel->wait(null, false, min($timeRemaining, 1));
            } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $e) {
                // Timeout is expected when no more messages, break gracefully
                break;
            } catch (\Exception $e) {
                // Other exceptions might indicate connection issues
                Log::warning('Exception during message consumption', ['error' => $e->getMessage()]);
                break;
            }

            // If we've been running for a while and no messages, break
            if (time() - $startTime >= $timeoutSeconds) {
                break;
            }
        }

        // Process any remaining items in batch
        if (!empty($batch)) {
            $this->storeQueryEventsBatch($batch);
        }

        return [
            'processed' => $processedCount,
            'remaining' => !empty($batch) ? count($batch) : 0,
        ];
    }

    public function storeQueryEvent(array $data): void
    {
        $occurredAt = isset($data['occurred_at'])
            ? Carbon::parse($data['occurred_at'])
            : Carbon::now();

        $hourOfDay = (int) $occurredAt->format('H');

        QueryEvent::create([
            'occurred_at' => $occurredAt,
            'path' => $data['path'] ?? '',
            'route' => $data['route'] ?? $this->normalizeRoute($data['path'] ?? ''),
            'ms' => $data['ms'] ?? 0,
            'source' => $data['source'] ?? 'starwars',
            'hour_of_day' => $hourOfDay,
        ]);
    }

    public function storeQueryEventsBatch(array $events): void
    {
        $inserts = [];

        foreach ($events as $data) {
            $occurredAt = isset($data['occurred_at'])
                ? Carbon::parse($data['occurred_at'])
                : Carbon::now();

            $hourOfDay = (int) $occurredAt->format('H');

            $inserts[] = [
                'occurred_at' => $occurredAt,
                'path' => $data['path'] ?? '',
                'route' => $data['route'] ?? $this->normalizeRoute($data['path'] ?? ''),
                'ms' => $data['ms'] ?? 0,
                'source' => $data['source'] ?? 'starwars',
                'hour_of_day' => $hourOfDay,
            ];
        }

        if (!empty($inserts)) {
            QueryEvent::insert($inserts);
        }
    }

    private function normalizeRoute(string $path): string
    {
        // Normalize paths like "/films/1" to "/films/:id"
        $path = trim($path, '/');
        $parts = explode('/', $path);

        if (count($parts) === 2 && is_numeric($parts[1])) {
            return '/' . $parts[0] . '/:id';
        }

        return '/' . $path;
    }

    public function close(): void
    {
        if ($this->channel) {
            $this->channel->close();
        }
        if ($this->connection) {
            $this->connection->close();
        }
    }

    public function __destruct()
    {
        $this->close();
    }
}


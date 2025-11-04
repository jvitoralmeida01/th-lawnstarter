#!/usr/bin/env php
<?php

require __DIR__ . '/../vendor/autoload.php';

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$host = getenv('RABBITMQ_HOST') ?: 'rabbitmq';
$port = (int) (getenv('RABBITMQ_PORT') ?: 5672);
$user = getenv('RABBITMQ_USER') ?: 'guest';
$password = getenv('RABBITMQ_PASS') ?: 'guest';
$vhost = getenv('RABBITMQ_VHOST') ?: '/';
$queue = getenv('RABBITMQ_QUEUE') ?: 'query-events';

$connection = new AMQPStreamConnection($host, $port, $user, $password, $vhost);
$channel = $connection->channel();

// Declare queue
$channel->queue_declare($queue, false, true, false, false);

// Sample messages
$messages = [
    ['path' => '/films', 'route' => '/films', 'ms' => 120, 'source' => 'starwars'],
    ['path' => '/films/1', 'route' => '/films/:id', 'ms' => 150, 'source' => 'starwars'],
    ['path' => '/people', 'route' => '/people', 'ms' => 200, 'source' => 'starwars'],
    ['path' => '/people/3', 'route' => '/people/:id', 'ms' => 180, 'source' => 'starwars'],
    ['path' => '/films/2', 'route' => '/films/:id', 'ms' => 140, 'source' => 'starwars'],
    ['path' => '/films', 'route' => '/films', 'ms' => 110, 'source' => 'starwars'],
    ['path' => '/people/5', 'route' => '/people/:id', 'ms' => 160, 'source' => 'starwars'],
    ['path' => '/films', 'route' => '/films', 'ms' => 130, 'source' => 'starwars'],
];

$count = 0;
foreach ($messages as $data) {
    $msg = new AMQPMessage(
        json_encode($data),
        ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
    );
    $channel->basic_publish($msg, '', $queue);
    $count++;
    echo "Published: {$data['path']} ({$data['ms']}ms)\n";
}

echo "\nPublished {$count} messages to queue '{$queue}'\n";

$channel->close();
$connection->close();


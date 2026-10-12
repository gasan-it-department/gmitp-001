<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$config = config('database.connections.pgsql');
$dsn = 'pgsql:host='.$config['host'].';port='.$config['port'].';dbname=postgres;sslmode='.($config['sslmode'] ?? 'prefer');
$admin = new PDO($dsn, $config['username'], $config['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$database = 'codex_gd_test_'.bin2hex(random_bytes(6));
$admin->exec('CREATE DATABASE "'.$database.'"');

try {
    $process = new Symfony\Component\Process\Process([
        PHP_BINARY, 'vendor/pestphp/pest/bin/pest', '--compact', ...(array_slice($argv, 1) ?: ['tests/Feature/GoodsDistribution']),
    ], base_path(), [
        'APP_ENV' => 'testing', 'DB_CONNECTION' => 'pgsql', 'DB_DATABASE' => $database,
        'DB_HOST' => $config['host'], 'DB_PORT' => $config['port'], 'DB_USERNAME' => $config['username'], 'DB_PASSWORD' => $config['password'],
        'CACHE_STORE' => 'array', 'SESSION_DRIVER' => 'array', 'QUEUE_CONNECTION' => 'sync',
    ], null, 300);
    $code = $process->run(fn ($type, $output) => print $output);
} finally {
    $statement = $admin->prepare('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ? AND pid <> pg_backend_pid()');
    $statement->execute([$database]);
    $admin->exec('DROP DATABASE "'.$database.'"');
    echo "\nDisposable PostgreSQL database removed.\n";
}

exit($code);

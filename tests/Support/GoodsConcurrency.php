<?php

use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;

function competingGoodsCommands(object $test, array $commands): array
{
    $config = config('database.connections.pgsql');
    $processes = [];
    DB::beginTransaction();
    try {
        app(StockLedgerService::class)->lockMunicipality($test->municipalId);
        foreach ($commands as $command) {
            $process = new Process([PHP_BINARY, 'tests/Support/GoodsInventoryWorker.php'], base_path(), [
                'APP_ENV' => 'testing', 'DB_CONNECTION' => 'pgsql', 'DB_DATABASE' => $config['database'],
                'DB_HOST' => $config['host'], 'DB_PORT' => $config['port'], 'DB_USERNAME' => $config['username'], 'DB_PASSWORD' => $config['password'],
                'CACHE_STORE' => 'array', 'SESSION_DRIVER' => 'array',
            ], json_encode(['municipal_id' => $test->municipalId, 'actor_id' => $test->actor->id, ...$command], JSON_THROW_ON_ERROR), 30);
            $process->start();
            $processes[] = $process;
        }
        // Hold the municipality lock until both independent sessions are actually waiting for it.
        $deadline = microtime(true) + 10;
        do {
            $pids = [];
            foreach ($processes as $process) {
                if (preg_match('/READY:(\d+)/', $process->getOutput(), $match)) {
                    $pids[] = (int) $match[1];
                }
            }
            DB::select('SELECT pg_stat_clear_snapshot()');
            $blocked = count($pids) === count($processes) ? DB::table('pg_stat_activity')->whereIn('pid', $pids)->where('wait_event_type', 'Lock')->count() : 0;
            if ($blocked === count($processes)) {
                break;
            }
            usleep(20000);
        } while (microtime(true) < $deadline);
        expect($blocked)->toBe(count($processes));
        DB::commit();

        return array_map(function (Process $process) {
            $process->wait();
            expect($process->getExitCode())->toBe(0, $process->getErrorOutput());
            $lines = explode("\n", trim($process->getOutput()));

            return json_decode(end($lines), true, flags: JSON_THROW_ON_ERROR);
        }, $processes);
    } finally {
        if (DB::transactionLevel()) {
            DB::rollBack();
        }
        foreach ($processes as $process) {
            if ($process->isRunning()) {
                $process->stop();
            }
        }
    }
}

<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (! str_starts_with(Illuminate\Support\Facades\DB::connection()->getDatabaseName(), 'codex_gd_test_')) {
    throw new LogicException('A disposable test database is required.');
}
$input = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
echo 'READY:'.Illuminate\Support\Facades\DB::selectOne('SELECT pg_backend_pid() AS pid')->pid."\n";
flush();
try {
    $request = app(App\Core\ActionCenter\UseCase\Assistance\ReopenCancelledAssistanceRequestAction::class)->execute(new App\Core\ActionCenter\Dto\Assistance\ReopenCancelledAssistanceRequestDto(...$input));
    echo json_encode(['ok' => true, 'id' => $request->id])."\n";
} catch (DomainException $e) {
    echo json_encode(['ok' => false, 'error' => $e->getMessage()])."\n";
}

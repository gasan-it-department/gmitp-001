<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

if (! str_starts_with(Illuminate\Support\Facades\DB::connection()->getDatabaseName(), 'codex_gd_test_')) {
    throw new LogicException('Concurrent stock workers require a disposable database.');
}
$input = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
if (isset($input['test_now'])) {
    Illuminate\Support\Facades\Date::setTestNow($input['test_now']);
}
app()->instance('municipal_id', $input['municipal_id']);
echo 'READY:'.Illuminate\Support\Facades\DB::selectOne('SELECT pg_backend_pid() AS pid')->pid."\n";
flush();

try {
    $dto = new App\Core\GoodsDistribution\Dto\StockAdjustmentDto($input['municipal_id'], $input['actor_id'], $input['key'] ?? '', 'Concurrent stock test', 'CONCURRENT-TEST', $input['quantity'] ?? '0', $input['direction'] ?? 'remove');
    $result = match ($input['command']) {
        'save-receipt' => app(App\Core\GoodsDistribution\Actions\SaveStockReceiptAction::class)->execute(new App\Core\GoodsDistribution\Dto\StockReceiptDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['receipt_id'] ?? null, $input['program_id'] ?? null)),
        'save-distribution' => app(App\Core\GoodsDistribution\Actions\SaveDistributionRequestAction::class)->execute(new App\Core\GoodsDistribution\Dto\DistributionRequestDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['request_id'] ?? null)),
        'apply-requirements' => app(App\Core\GoodsDistribution\Actions\ApplyDistributionRequirementsAction::class)->execute(new App\Core\GoodsDistribution\Dto\DistributionRequestDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['request_id'])),
        'sync-household' => app(App\Core\GoodsDistribution\Actions\SyncDistributionHouseholdAction::class)->execute(new App\Core\GoodsDistribution\Dto\DistributionRequestDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['request_id'])),
        'distribution' => app(App\Core\GoodsDistribution\Actions\TransitionDistributionRequestAction::class)->execute(new App\Core\GoodsDistribution\Dto\DistributionRequestDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['request_id']), $input['transition']),
        'bulk-save' => app(App\Core\GoodsDistribution\Actions\SaveBulkDispatchAction::class)->execute(new App\Core\GoodsDistribution\Dto\BulkDispatchDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['dispatch_id'] ?? null)),
        'bulk-additional' => app(App\Core\GoodsDistribution\Actions\ManageBulkAdditionalIssueAction::class)->execute(new App\Core\GoodsDistribution\Dto\BulkDispatchDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['dispatch_id']), $input['additional_command'], $input['issue_id'] ?? null),
        'bulk-recipient' => app(App\Core\GoodsDistribution\Actions\SaveBulkDispatchRecipientAction::class)->execute(new App\Core\GoodsDistribution\Dto\BulkDispatchRecipientDto($input['municipal_id'], $input['actor_id'], $input['dispatch_id'], $input['data'], $input['recipient_id'] ?? null), $input['recipient_command'] ?? 'create'),
        'bulk-transition' => app(App\Core\GoodsDistribution\Actions\TransitionBulkDispatchAction::class)->execute(new App\Core\GoodsDistribution\Dto\BulkDispatchDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['dispatch_id']), $input['transition']),
        'bulk-reconcile' => app(App\Core\GoodsDistribution\Actions\ReconcileBulkDispatchAction::class)->execute(new App\Core\GoodsDistribution\Dto\BulkDispatchDto($input['municipal_id'], $input['actor_id'], $input['data'], $input['dispatch_id']), $input['reverse'] ?? false),
        'program-item' => app(App\Core\GoodsDistribution\Actions\ManageProgramItemAction::class)->execute(new App\Core\GoodsDistribution\Dto\ProgramItemDto($input['municipal_id'], $input['actor_id'], $input['program_id'], $input['item_id'], $input['is_active'] ?? true)),
        'create-program-item' => app(App\Core\GoodsDistribution\Actions\CreateProgramItemAction::class)->execute($input['program_id'], new App\Core\GoodsDistribution\Dto\CatalogDto($input['municipal_id'], $input['actor_id'], App\Core\GoodsDistribution\Enums\CatalogKind::Items, $input['data'])),
        'item' => app(App\Core\GoodsDistribution\Actions\ManageCatalogAction::class)->execute(new App\Core\GoodsDistribution\Dto\CatalogDto($input['municipal_id'], $input['actor_id'], App\Core\GoodsDistribution\Enums\CatalogKind::Items, $input['data'])),
        'post' => app(App\Core\GoodsDistribution\Actions\PostStockReceiptAction::class)->execute($input['municipal_id'], $input['receipt_id'], $input['actor_id'], $input['fingerprint']),
        'adjust' => app(App\Core\GoodsDistribution\Actions\AdjustStockAction::class)->execute($input['line_id'], $dto),
        'reverse' => app(App\Core\GoodsDistribution\Actions\ReverseStockAdjustmentAction::class)->execute($input['movement_id'], $dto),
        'void' => app(App\Core\GoodsDistribution\Actions\VoidStockReceiptAction::class)->execute($input['municipal_id'], $input['receipt_id'], $input['actor_id'], 'Concurrent receipt correction', true, true),
    };
    echo json_encode(['ok' => true, 'id' => $result->id], JSON_THROW_ON_ERROR)."\n";
} catch (DomainException|Illuminate\Validation\ValidationException $exception) {
    echo json_encode(['ok' => false, 'error' => $exception->getMessage()], JSON_THROW_ON_ERROR)."\n";
}

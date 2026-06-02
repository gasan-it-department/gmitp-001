<?php

$actions = [
    \App\Core\Cemetery\Actions\StoreDecedentAction::class,
    \App\Core\Cemetery\Actions\UpdateDecedentAction::class,
    \App\Core\Cemetery\Actions\GetDecedentProfileAction::class,
    \App\Core\Cemetery\Actions\ListDecedentsAction::class,
    \App\Core\Cemetery\Actions\StorePlotAction::class,
    \App\Core\Cemetery\Actions\ListPlotsAction::class,
    \App\Core\Cemetery\Actions\GetAvailablePlotsAction::class,
    \App\Core\Cemetery\Actions\StoreIntermentAction::class,
    \App\Core\Cemetery\Actions\ListSectionsAction::class,
];

foreach ($actions as $class) {
    $ok = app($class) instanceof $class ? 'OK' : 'FAIL';
    echo "resolve {$class}: {$ok}" . PHP_EOL;
}

$controllers = [
    \App\External\Api\Controllers\Cemetery\Decedent\StoreDecedentController::class,
    \App\External\Api\Controllers\Cemetery\Decedent\UpdateDecedentController::class,
    \App\External\Api\Controllers\Cemetery\Plots\StorePlotController::class,
    \App\External\Api\Controllers\Cemetery\Interments\StoreIntermentController::class,
    \App\External\Web\Controllers\Cemetery\Decedent\IndexDecedentController::class,
    \App\External\Web\Controllers\Cemetery\Decedent\ShowDecedentController::class,
    \App\External\Web\Controllers\Cemetery\Decedent\EditDecedentController::class,
    \App\External\Web\Controllers\Cemetery\Admin\Plots\ListPlotsController::class,
    \App\External\Web\Controllers\Cemetery\Admin\Plots\CreatePlotController::class,
    \App\External\Web\Controllers\Cemetery\Admin\Interments\AssignDecedentToPlotController::class,
];

foreach ($controllers as $class) {
    $ok = app($class) instanceof $class ? 'OK' : 'FAIL';
    echo "resolve {$class}: {$ok}" . PHP_EOL;
}

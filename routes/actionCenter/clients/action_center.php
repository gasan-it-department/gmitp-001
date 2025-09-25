<?php

use App\External\Api\Controllers\ActionCenter\Client\ActionCenterController;

Route::prefix('client/action-center')->middleware('auth:sanctum')->group(function () {

    Route::resource('requests', ActionCenterController::class)
        ->names([
            'index' => 'client.action-center.requests.index',
            'store' => 'client.action-center.requests.store',
            'show' => 'client.action-center.requests.show',
            'update' => 'client.action-center.requests.update',
            'destroy' => 'client.action-center.requests.destroy',
        ]);
});

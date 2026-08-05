<?php

use App\External\Api\Controllers\V1\Integration\Aga\DeleteAccountController;
use Illuminate\Support\Facades\Route;

Route::prefix('integrations/aga')
    ->middleware(['aga.edge.secret', 'throttle:30,1'])
    ->group(function () {
        Route::delete('/account', DeleteAccountController::class);
    });

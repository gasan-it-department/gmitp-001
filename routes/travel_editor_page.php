<?php

use App\External\Web\Controllers\TravelEditor\TravelEditorPageController;

use Illuminate\Support\Facades\Route;

Route::prefix('{municipality}/travel-editor')
    ->middleware(['municipalityContext', 'admin'])
    ->name('travelEditor.')
    ->controller(TravelEditorPageController::class)
    ->group(function () {

        Route::get('/admin', 'index')->name('page');

    });


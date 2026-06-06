<?php

use App\External\Api\Controllers\Tourism\StoreTourismAssetController;
use App\External\Api\Controllers\Tourism\StoreTourismCategoryController;
use App\External\Web\Controllers\Tourism\Admin\CreateCategoryController;
use App\External\Web\Controllers\Tourism\Admin\CreateTourismAssetController;
use App\External\Web\Controllers\Tourism\Admin\ListTourismAssetController;
use Illuminate\Support\Facades\Route;


Route::prefix('{municipality}/tourism')
    ->middleware(['municipalityContext', 'admin', 'permission:tourism.access'])
    ->name('tourism.admin.')
    ->group(function () {

        Route::get('category', CreateCategoryController::class)->name('category.show');

        Route::get('create/tourism-asset', CreateTourismAssetController::class)->name('asset.create');

        Route::get('tourism-asset/list', ListTourismAssetController::class)->name('asset.list');
    });



Route::prefix('api/tourism')
    ->middleware(['municipalityContext'])
    ->name('tourism.')
    ->group(function () {

        Route::middleware(['admin', 'auth', 'permission:tourism.access'])
            ->group(function () {

                Route::post('create/category', StoreTourismCategoryController::class)->name('category.store');

                Route::post('create/asset', StoreTourismAssetController::class)->name('asset.store');

            });


    });
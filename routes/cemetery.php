<?php

use App\External\Api\Controllers\Cemetery\Decedents\RegisterDecedentController;
use App\External\Web\Controllers\Cemetery\Admin\Decedents\ListDecedentsController;
use App\External\Web\Controllers\Cemetery\Admin\Decedents\RegisterDecedentsController;
use App\External\Web\Controllers\Cemetery\Admin\Decedents\ShowDecedentProfile;
use App\External\Web\Controllers\Cemetery\CemeteryController;
use App\External\Web\Controllers\Cemetery\Interements\CreateIntermentController;
use Illuminate\Support\Facades\Route;

Route::prefix('/{municipality}/cemetery')
    ->middleware(['auth', 'municipalityContext'])
    ->name('cemetery.')
    ->group(function () {

        Route::prefix('/admin')
            ->middleware(['admin'])
            ->name('admin.')
            ->group(function () {

                Route::get('/dashbord', [CemeteryController::class, 'index'])->name('dashboard');


                //interments page routings
                Route::prefix('/interments')
                    ->name('interments.')
                    ->group(function () {

                    Route::get('/create', CreateIntermentController::class)->name('index');

                });

                Route::prefix('/plots')
                    ->name('plots.')
                    ->group(function () {

                    });

                Route::prefix('decedents')
                    ->name('decedents.')
                    ->group(function () {

                        Route::get('/', ListDecedentsController::class)->name('list.page');

                        Route::get('register', RegisterDecedentsController::class)->name('create.page');

                        Route::get('profile/{decedent_id}', ShowDecedentProfile::class)->name('profile.page');

                    });
            });

    });

Route::prefix('api/decedents')
    ->name('decedents.')
    ->group(function () {

        Route::middleware(['municipalityContext', 'admin', 'auth',])
            ->group(function () {

                Route::post('store', RegisterDecedentController::class)->name('store');


            });


    });


//api for interments record
Route::prefix('api/interments')
    ->name('interments.')
    ->group(function () {

        Route::middleware(['municipalityContext', 'admin', 'auth',])
            ->group(function () {




            });


    });




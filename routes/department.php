<?php
use Illuminate\Support\Facades\Route;

use App\External\Api\Controllers\Department\FetchDepartmentOptionsController;

Route::get('departments', FetchDepartmentOptionsController::class)->name('department.list');
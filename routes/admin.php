<?php
use App\Core\BusinessPermit\Interfaces\Controllers\BusinessPermitDashboardContoller;

Route::get('/admin/bplo/dashboard', [BusinessPermitDashboardContoller::class, 'showAdminDashBoard'])->name('admin.bplo.dashboard.show');
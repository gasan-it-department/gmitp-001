<?php

namespace App\External\Web\Controllers\BulletinBoard\Admin;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class AnnouncementAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('BulletinBoard/Admin/AnnouncementPage');
    }
}
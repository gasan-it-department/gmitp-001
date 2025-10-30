<?php

namespace App\External\Web\Controllers\BulletinBoard\Admin;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class EventAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('BulletinBoard/Admin/EventsPage');
    }
}
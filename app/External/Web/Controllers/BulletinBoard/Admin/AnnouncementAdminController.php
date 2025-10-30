<?php

namespace App\External\Web\Controllers\BulletinBoard\Admin;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class AnnouncementAdminController extends Controller
{
    public function index()
    {    //return the all the anouncement admin page
        return Inertia::render('BulletinBoard/Admin/AnnouncementPage');
    }
}
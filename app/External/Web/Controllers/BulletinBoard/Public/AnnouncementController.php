<?php

namespace App\External\Web\Controllers\BulletinBoard\Public;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AnnouncementController extends Controller
{

    public function index(Request $request)
    {

        return Inertia::render('Public/AllAnnouncements/AllAnnouncementsPage');

    }

}

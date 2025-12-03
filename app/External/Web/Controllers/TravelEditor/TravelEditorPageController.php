<?php

namespace App\External\Web\Controllers\TravelEditor;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class TravelEditorPageController extends Controller
{
    public function index()
    {
        return Inertia::render('Promotions/Admin/TravelPage');
    }
}
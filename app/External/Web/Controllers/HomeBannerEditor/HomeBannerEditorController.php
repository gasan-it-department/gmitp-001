<?php

namespace App\External\Web\Controllers\HomeBannerEditor;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class HomeBannerEditorController extends Controller
{
    public function index()
    {
        return Inertia::render('Promotions/Admin/HomeBannerEditorPage');
    }
}
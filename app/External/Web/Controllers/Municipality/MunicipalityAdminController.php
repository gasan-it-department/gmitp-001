<?php

namespace App\External\Web\Controllers\Municipality;

use App\Http\Controllers\Controller;
use inertia\Inertia;

class MunicipalityAdminController extends Controller
{

    public function index()
    {
        return Inertia::render('Promotions/Admin/HomeBannerEditorPage');
    }

}
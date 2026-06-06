<?php

namespace App\External\Web\Controllers\UserManagement\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowUserProfileController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('UserManagement/Profile/UserAccount');
    }
}
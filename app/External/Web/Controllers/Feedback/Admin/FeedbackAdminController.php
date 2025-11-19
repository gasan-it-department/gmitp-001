<?php

namespace App\External\Web\Controllers\Feedback\Admin;

use Inertia\Inertia;

class FeedbackAdminController
{
    public function show()
    {
        return Inertia::render('BulletinBoard/Admin/FeedbackPage');
    }
}
<?php

namespace App\External\Web\Controllers\Feedback\Client;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CreateFeedbackController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Feedback/Client/Create/GiveFeedback');
    }
}

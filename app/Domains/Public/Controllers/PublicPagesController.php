<?php

namespace App\Domains\Public\Controllers;

use Inertia\Inertia;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PublicPagesController extends Controller
{
    public function showHomePage()
    {
        return Inertia::render('Public/Home/HomePage');
    }

    public function showServicePage()
    {
        return Inertia::render('Public/Services/ServicesPage');
    }

    public function showContactUsPage()
    {
        return Inertia::render('Public/ContactUs/ContactUsPage');
    }

    public function showNewsEventsPage()
    {
        return Inertia::render('Public/NewsAndEvents/NewsAndEventsPage');
    }

    public function showGovernmentPage()
    {
        return Inertia::render('Public/Government/GovernmentPage');
    }
}

<?php

namespace App\External\Web\Controllers\Public;

use App\Http\Controllers\Controller;
use inertia\Inertia;
class PublicController extends Controller
{

    public function showMainLandingPage()
    {
        return Inertia::render('Public/MainLandingPage/MainLandingPage');
    }

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

    public function showPrivacyPolicyPage()
    {
        return Inertia::render('Public/PrivacyPolicy/PrivacyPolicyPage');
    }

    public function showMunicipalAdminPage()
    {
        return Inertia::render('Admin/MunicipalAdmin/MunicipalAdminPage');
    }

    public function showActionCenterPage()
    {
        return Inertia::render('Public/ActionCenter/ActionCenterPage');
    }

    public function showActionCenterRequestPage()
    {
        return Inertia::render('Public/ActionCenter/Components/RequestList');
    }

    public function showMyAccountPage(){
        return Inertia::render('Public/Account/UserAccount');
    }

    public function showAdminActionCenterPage(){
        return Inertia::render('Admin/ActionCenter/AdminActionCenterPage');
    }
}

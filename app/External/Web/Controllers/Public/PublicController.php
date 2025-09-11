<?php

namespace App\External\Web\Controllers\Public;

use App\Http\Controllers\Controller;
use inertia\Inertia;
use App\Core\Users\Infrastructure\Models\User;
class PublicController extends Controller
{

    public function showMainLandingPage()
    {
        return Inertia::render('Public/MainLandingPage/MainLandingPage');
    }

    public function showHomePage()
    {
        $users = User::all();
        return Inertia::render('Public/Home/HomePage', [
            'users' => $users
        ]);
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

    public function showMyAccountPage()
    {
        return Inertia::render('Public/Account/UserAccount');
    }

    public function showAdminActionCenterPage()
    {
        return Inertia::render('Admin/ActionCenter/AdminActionCenterPage');
    }
}

<?php

namespace App\External\Web\Controllers\Public;

use App\External\Api\Resources\Municipality\MunicipalBannerResource;
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

        $municipality = app('current_municipality');

        $banners = $municipality->banners()
            ->get();

        return Inertia::render('Public/Home/HomePage', [

            'banners' => (MunicipalBannerResource::collection($banners))->resolve()
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

    public function showTravelPage()
    {
        return Inertia::render('Public/Travels/TravelPage');
    }

    public function showExecutiveOrdersPage()
    {
        return Inertia::render('Public/ExecutiveOrder/ExevutiveOrdersPage');
    }

    // NAME IS MODIFIED - DEC. 2
    public function showAllAnnouncementPage()
    {
        return Inertia::render('Public/AllAnnouncements/AllAnnouncementsPage');
    }

    // NEWLY ADDED FOR SHOWING ALL EVENTS - DEC. 2
    public function showAllEventsPage()
    {
        return Inertia::render('Public/AllEvents/AllEventsPage');
    }

    public function showWeddingPage()
    {
        return Inertia::render('Public/Wedding/WeddingPage');
    }

}

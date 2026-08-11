<?php

namespace App\External\Web\Controllers\Announcement\Admin;

use App\Core\Announcement\Actions\GetAdminAnnouncementsAction;
use App\Core\Announcement\Dto\AdminAnnouncementFiltersDto;
use App\Core\Announcement\Enums\AnnouncementType;
use App\External\Api\Request\Announcement\IndexAnnouncementRequest;
use App\External\Api\Resources\Announcement\AdminAnnouncementListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class IndexAnnouncementController extends Controller
{
    public function __construct(
        private GetAdminAnnouncementsAction $listAnnouncements,
    ) {}

    public function __invoke(IndexAnnouncementRequest $request): Response
    {
        $filters = AdminAnnouncementFiltersDto::fromArray($request->filters());
        $announcements = $this->listAnnouncements->execute(
            municipalId: app('municipal_id'),
            filters: $filters,
        );

        return Inertia::render('Announcement/Admin/Index', [
            'announcements' => AdminAnnouncementListResource::collection($announcements),
            'filters' => $filters->toArray(),
            'type_options' => AnnouncementType::toOptions(),
            'publication_options' => [
                ['value' => AdminAnnouncementFiltersDto::PUBLICATION_PUBLISHED, 'label' => 'Published'],
                ['value' => AdminAnnouncementFiltersDto::PUBLICATION_DRAFT, 'label' => 'Draft'],
            ],
            'sort_options' => [
                ['value' => AdminAnnouncementFiltersDto::SORT_CREATED_DESC, 'label' => 'Newest first'],
                ['value' => AdminAnnouncementFiltersDto::SORT_CREATED_ASC, 'label' => 'Oldest first'],
                ['value' => AdminAnnouncementFiltersDto::SORT_UPDATED_DESC, 'label' => 'Recently updated'],
            ],
        ]);
    }
}

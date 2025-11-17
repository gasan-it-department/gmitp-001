<?php

namespace App\External\Api\Controllers\BulletinBoard;

use Illuminate\Http\Request;
use App\Core\BulletinBoard\Announcement\Models\Announcement;
use App\External\Api\Request\BulletinBoard\AnnouncementRequest;
use App\Core\BulletinBoard\Announcement\Dto\AnnouncementQueryDto;
use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\External\Api\Resources\BulletinBoard\AnnouncementResource;
use App\Core\BulletinBoard\Announcement\Services\GetAnnouncementService;
use App\Core\BulletinBoard\Announcement\Services\CreateAnnouncementService;
use App\Core\BulletinBoard\Announcement\Services\GetPublishedAnnouncements;
use App\Core\BulletinBoard\Announcement\Services\UpdateAnnouncementService;
use App\Core\BulletinBoard\Announcement\Services\PublishAnnouncementService;

class AnnouncementController
{
    public function __construct(
        protected CreateAnnouncementService $announcementService,
        protected PublishAnnouncementService $publishService,
        protected UpdateAnnouncementService $updateService,
        protected GetAnnouncementService $getAnnouncementService,
        protected GetPublishedAnnouncements $getPublishedAnnouncements,
    ) {
    }

    public function store(AnnouncementRequest $request)
    {
        try {

            $validated = $request->validated();

            $userId = $request->user()->id;

            $dto = new CreateAnnouncementDto(
                title: $validated['title'],
                message: $validated['message'],
                userId: $userId
            );

            $announcement = $this->announcementService->execute($dto);

            return response()->json([
                'success' => true,
                'data' => $announcement,
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);

        }
    }

    public function fetch()
    {
        try {

            $announcements = $this->getAnnouncementService->execute();

            return response()->json([
                'success' => true,
                'data' => AnnouncementResource::collection($announcements),
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);

        }
    }

    public function getPublished(Request $request)
    {
        try {

            $municipalId = app('municipal_id');

            $dto = new AnnouncementQueryDto(
                perPage: $request->input('per_page', 10),
                orderBy: $request->input('order_by', 'created_at'),
                direction: $request->input('direction', 'desc'),
            );

            //get the announcement per municipal
            $announcements = $this->getPublishedAnnouncements->execute($municipalId, $dto);

            return response()->json([
                'success' => true,
                'data' => AnnouncementResource::collection($announcements),
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);

        }
    }

    public function show($id)
    {
        //show announcement per id
    }

    public function update(AnnouncementRequest $request, $id)
    {
        try {

            $validated = $request->validated();

            $announcement = $this->updateService->execute($id, [
                'title' => $validated['title'] ?? null,
                'message' => $validated['message'] ?? null,
                'is_published' => $validated['is_published'] ?? false,
            ]);

            return response()->json([
                'success' => true,
                'data' => $announcement,
            ]);

        } catch (\DomainException $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Announcement not found.',
            ], 404);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);

        }
    }


    public function destroy(string $id)
    {
        try {

            $announcement = Announcement::findOrFail($id);

            $announcement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Announcement deleted successfully.',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([
                'success' => false,
                'message' => 'Announcement not found.',
            ], 404);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);

        }
    }

}